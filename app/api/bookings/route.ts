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
import { getVehicle, vehicleName } from "@/lib/vehicles";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Public availability check for a specific vehicle & schedule
  if (url.searchParams.get("checkAvailability") === "1") {
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
  try {
    const body = await request.json();

    const vehicle = getVehicle(String(body.vehicleSlug || ""));
    if (!vehicle) {
      return NextResponse.json({ error: "Selected vehicle not found." }, { status: 400 });
    }

    const pickupLocation = String(body.pickupLocation || "").trim();
    const dropoffLocation = String(body.dropoffLocation || "").trim();
    const pickupDate = String(body.pickupDate || "").trim();
    const pickupTime = String(body.pickupTime || "").trim();
    const durationDays = Math.max(1, Math.floor(Number(body.durationDays || 1)) || 1);
    const { returnDate, returnTime } = computeEndDateTime(pickupDate, pickupTime, durationDays);
    const passengers = Number(body.passengers || 1);
    const arrangement = body.arrangement === "One-way" ? "One-way" : "Round trip";

    const customer = body.customer ?? {};
    const fullName = String(customer.fullName || "").trim();
    const email = String(customer.email || "").trim();
    const mobile = String(customer.mobile || "").trim();
    const address = String(customer.address || "").trim();

    const identification = body.identification ?? {};
    const idType = String(identification.idType || "").trim();
    const idNumber = String(identification.idNumber || "").trim();
    const frontDoc = identification.frontDoc;

    if (!pickupLocation || !dropoffLocation || !pickupDate || !pickupTime) {
      return NextResponse.json({ error: "All trip schedule fields are required." }, { status: 400 });
    }
    if (!fullName || !email || !mobile || !address) {
      return NextResponse.json({ error: "All required personal information fields must be filled." }, { status: 400 });
    }
    if (!idType || !frontDoc?.storedName) {
      return NextResponse.json({ error: "Mandatory front identification document is required." }, { status: 400 });
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

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to process booking submission." }, { status: 500 });
  }
}
