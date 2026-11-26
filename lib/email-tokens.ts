import crypto from "node:crypto";

export type BookingEmailAction = "accept" | "reject";

export type BookingEmailSummary = {
  id: string;
  referenceNumber: string;
  vehicleName: string;
  vehicleCategory: string;
  arrangement: "One-way" | "Round trip";
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  durationDays: number;
  passengers: number;
  estimatedTotal: number;
  tripNotes?: string;
  customer: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
  };
  identification: {
    idType: string;
    idNumber: string;
  };
};

export type ActionTokenPayload = {
  id: string;
  action: BookingEmailAction;
  ref: string;
  vehicle: string;
  pickupLoc: string;
  dropoffLoc: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  days: number;
  name: string;
  email: string;
  exp: number;
};

function getActionSecret(): string {
  const secret =
    process.env.BOOKING_ACTION_SECRET ||
    process.env.ADMIN_PASSCODE ||
    process.env.RESEND_API_KEY;
  if (secret && secret.length >= 8) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing BOOKING_ACTION_SECRET, ADMIN_PASSCODE, or RESEND_API_KEY in production.");
  }
  return "cartaxi-dev-booking-action-secret";
}

export function createBookingActionToken(
  booking: BookingEmailSummary,
  action: BookingEmailAction,
): string {
  const payloadObj: ActionTokenPayload = {
    id: booking.id,
    action,
    ref: booking.referenceNumber,
    vehicle: booking.vehicleName,
    pickupLoc: booking.pickupLocation,
    dropoffLoc: booking.dropoffLocation,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    returnDate: booking.returnDate,
    returnTime: booking.returnTime,
    days: booking.durationDays,
    name: booking.customer.fullName,
    email: booking.customer.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getActionSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyBookingActionToken(
  bookingId: string,
  token: string,
  expectedAction: BookingEmailAction,
): ActionTokenPayload | null {
  if (!token || !bookingId) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  let expectedSig: string;
  try {
    expectedSig = crypto.createHmac("sha256", getActionSecret()).update(encoded).digest("base64url");
  } catch {
    return null;
  }

  const bufA = Buffer.from(sig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ActionTokenPayload;
    if (parsed.id !== bookingId) return null;
    if (parsed.action !== expectedAction) return null;
    if (!Number.isFinite(parsed.exp) || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
