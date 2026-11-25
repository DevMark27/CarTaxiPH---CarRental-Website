import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  checkVehicleAvailabilityForPeriod,
  computeEndDateTime,
  generateBookingReference,
  isAdminAuthorized,
  readBookings,
  writeBookings,
  type BookingRecord,
} from "@/lib/bookings";
import { sendOwnerBookingNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getVehicle, vehicleName } from "@/lib/vehicles";

const SAFE_STORED_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|pdf)$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Public availability check for a specific vehicle & schedule
  if (url.searchParams.get("checkAvailability") === "1") {
    try {
      const vehicleSlug = url.searchParams.get("vehicleSlug") || "";
      const pickupDate = url.searchParams.get("pickupDate") || "";
      const pickupTime = url.searchParams.get("pickupTime") || "09:00";
      const durationDays = Number(url.searchParams.get("durationDays") || "1");

      const result = checkVehicleAvailabilityForPeriod(
        vehicleSlug,
        pickupDate,
        pickupTime,
        durationDays,
      );
      return NextResponse.json(result);
    } catch (error) {
      console.error("Availability check failed:", error);
      return NextResponse.json({ available: true });
    }
  }

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = readBookings().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`booking:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many booking requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json();

    const vehicle = getVehicle(String(body.vehicleSlug || ""));
    if (!vehicle) {
      return NextResponse.json({ error: "Selected vehicle not found." }, { status: 400 });
    }

    const pickupLocation = String(body.pickupLocation || "").trim().slice(0, 160);
    const dropoffLocation = String(body.dropoffLocation || "").trim().slice(0, 160);
    const pickupDate = String(body.pickupDate || "").trim().slice(0, 20);
    const pickupTime = String(body.pickupTime || "").trim().slice(0, 10);
    const durationDays = Math.min(30, Math.max(1, Math.floor(Number(body.durationDays || 1)) || 1));
    const { returnDate, returnTime } = computeEndDateTime(pickupDate, pickupTime, durationDays);
    const passengers = Math.min(vehicle.passengers, Math.max(1, Math.floor(Number(body.passengers || 1)) || 1));
    const arrangement = body.arrangement === "One-way" ? "One-way" : "Round trip";

    const customer = body.customer ?? {};
    const fullName = String(customer.fullName || "").trim().slice(0, 120);
    const email = String(customer.email || "").trim().slice(0, 160);
    const mobile = String(customer.mobile || "").trim().slice(0, 30);
    const address = String(customer.address || "").trim().slice(0, 300);

    const identification = body.identification ?? {};
    const idType = String(identification.idType || "").trim().slice(0, 80);
    const idNumber = String(identification.idNumber || "").trim().slice(0, 60);
    const frontDoc = identification.frontDoc;

    if (!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime) {
      return NextResponse.json({ error: "All trip schedule fields are required." }, { status: 400 });
    }
    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !mobile || !address) {
      return NextResponse.json({ error: "Valid personal information fields are required." }, { status: 400 });
    }
    if (!idType || !frontDoc?.storedName || !SAFE_STORED_NAME.test(String(frontDoc.storedName))) {
      return NextResponse.json({ error: "Valid mandatory front identification document is required." }, { status: 400 });
    }

    // Recheck vehicle availability before saving
    const availability = checkVehicleAvailabilityForPeriod(
      vehicle.slug,
      pickupDate,
      pickupTime,
      durationDays,
    );
    if (!availability.available) {
      return NextResponse.json(
        { error: availability.reason || "Vehicle is not available for the selected schedule." },
        { status: 409 },
      );
    }

    // Prevent duplicate booking submissions (same email, vehicle, and schedule while pending)
    const existing = readBookings();
    const isDuplicate = existing.some(
      (b) =>
        b.status === "PENDING ADMIN CONFIRMATION" &&
        b.vehicleSlug === vehicle.slug &&
        b.customer.email.toLowerCase() === email.toLowerCase() &&
        b.pickupDate === pickupDate,
    );
    if (isDuplicate) {
      return NextResponse.json(
        { error: "A pending reservation for this vehicle and pick-up date already exists for your email." },
        { status: 409 },
      );
    }

    const estimatedSubtotal = vehicle.price * durationDays;
    const additionalCharges = 0;
    const estimatedTotal = estimatedSubtotal + additionalCharges;
    const now = new Date().toISOString();

    const newBooking: BookingRecord = {
      id: crypto.randomUUID(),
      referenceNumber: generateBookingReference(),
      status: "PENDING ADMIN CONFIRMATION",
      createdAt: now,
      updatedAt: now,
      vehicleSlug: vehicle.slug,
      vehicleName: `${vehicle.year} ${vehicleName(vehicle)}`,
      vehicleCategory: vehicle.category,
      dailyRate: vehicle.price,
      arrangement,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      passengers,
      durationDays,
      estimatedSubtotal,
      additionalCharges,
      estimatedTotal,
      tripNotes: String(body.tripNotes || "").trim() || undefined,
      customer: {
        fullName,
        email,
        mobile,
        address,
        emergencyContactName: String(customer.emergencyContactName || "").trim() || undefined,
        emergencyContactNumber: String(customer.emergencyContactNumber || "").trim() || undefined,
      },
      identification: {
        idType,
        idNumber,
        frontDoc,
        backDoc: identification.backDoc || undefined,
        supportingDoc: identification.supportingDoc || undefined,
      },
    };

    existing.push(newBooking);
    writeBookings(existing);

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;
    await sendOwnerBookingNotification(newBooking, origin);

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to process booking submission." }, { status: 500 });
  }
}
