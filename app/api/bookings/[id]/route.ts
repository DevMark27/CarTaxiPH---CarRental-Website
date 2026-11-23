import { NextResponse } from "next/server";
import {
  isAdminAuthorized,
  readBookings,
  writeBookings,
  type BookingStatus,
} from "@/lib/bookings";

const VALID_STATUSES = new Set<BookingStatus>([
  "PENDING ADMIN CONFIRMATION",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const current = bookings[idx];
  const nextStatus = body.status as BookingStatus | undefined;
  if (nextStatus && !VALID_STATUSES.has(nextStatus)) {
    return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
  }

  const updated = {
    ...current,
    status: nextStatus ?? current.status,
    assignedDriver:
      typeof body.assignedDriver === "string"
        ? body.assignedDriver.trim() || undefined
        : current.assignedDriver,
    paymentInstructions:
      typeof body.paymentInstructions === "string"
        ? body.paymentInstructions.trim() || undefined
        : current.paymentInstructions,
    adminNotes:
      typeof body.adminNotes === "string"
        ? body.adminNotes.trim() || undefined
        : current.adminNotes,
    updatedAt: new Date().toISOString(),
  };

  bookings[idx] = updated;
  writeBookings(bookings);

  return NextResponse.json({ booking: updated });
}
