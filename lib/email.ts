import crypto from "node:crypto";
import { site } from "@/lib/site";

export const OWNER_EMAIL = process.env.OWNER_EMAIL || "sanjorjomarkangelo020727@gmail.com";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CarTaxi PH <onboarding@resend.dev>";

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

type AcceptTokenPayload = {
  id: string;
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

function escapeHtml(value: string | number | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

export function createBookingAcceptToken(booking: BookingEmailSummary): string {
  const payloadObj: AcceptTokenPayload = {
    id: booking.id,
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

export function verifyBookingAcceptToken(bookingId: string, token: string): AcceptTokenPayload | null {
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
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AcceptTokenPayload;
    if (parsed.id !== bookingId) return null;
    if (!Number.isFinite(parsed.exp) || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; skipping email send to", params.to);
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", res.status, errText);
      return { ok: false, error: errText };
    }

    return { ok: true };
  } catch (err) {
    console.error("Failed to call Resend API:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

export async function sendOwnerBookingNotification(
  booking: BookingEmailSummary,
  baseUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = createBookingAcceptToken(booking);
  const acceptUrl = `${baseUrl.replace(/\/+$/, "")}/api/bookings/${encodeURIComponent(booking.id)}/accept?token=${encodeURIComponent(token)}`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#18181b;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
    <div style="background:#151515;color:#ffffff;padding:24px 28px;">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#e31824;font-weight:700;">New Booking Request</p>
      <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">${escapeHtml(booking.vehicleName)}</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#d4d4d8;">Reference: <strong>${escapeHtml(booking.referenceNumber)}</strong></p>
    </div>

    <div style="padding:24px 28px;">
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
        A client submitted a new reservation request. Review the details below and click <strong>Accept Booking</strong> to approve and automatically notify the client.
      </p>

      <div style="margin:20px 0 26px;text-align:center;">
        <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:#e31824;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 30px;border-radius:999px;">
          Accept Booking
        </a>
      </div>

      <h2 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;border-bottom:1px solid #e4e4e7;padding-bottom:6px;">Trip Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#71717a;width:160px;">Vehicle</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(booking.vehicleName)} (${escapeHtml(booking.vehicleCategory)})</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Arrangement</td><td style="padding:6px 0;">${escapeHtml(booking.arrangement)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Pick-up Location</td><td style="padding:6px 0;">${escapeHtml(booking.pickupLocation)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Drop-off Location</td><td style="padding:6px 0;">${escapeHtml(booking.dropoffLocation)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Pick-up Schedule</td><td style="padding:6px 0;">${escapeHtml(booking.pickupDate)} at ${escapeHtml(booking.pickupTime)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Return Schedule</td><td style="padding:6px 0;">${escapeHtml(booking.returnDate)} at ${escapeHtml(booking.returnTime)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Duration</td><td style="padding:6px 0;">${escapeHtml(booking.durationDays)} day(s)</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Passengers</td><td style="padding:6px 0;">${escapeHtml(booking.passengers)}</td></tr>
        ${booking.tripNotes ? `<tr><td style="padding:6px 0;color:#71717a;">Trip Notes</td><td style="padding:6px 0;">${escapeHtml(booking.tripNotes)}</td></tr>` : ""}
      </table>

      <h2 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;border-bottom:1px solid #e4e4e7;padding-bottom:6px;">Client Information</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#71717a;width:160px;">Full Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(booking.customer.fullName)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(booking.customer.email)}" style="color:#e31824;">${escapeHtml(booking.customer.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Mobile</td><td style="padding:6px 0;">${escapeHtml(booking.customer.mobile)}</td></tr>
        <tr><td style="padding:6px 0;color:#71717a;">Address</td><td style="padding:6px 0;">${escapeHtml(booking.customer.address)}</td></tr>
        ${booking.customer.emergencyContactName ? `<tr><td style="padding:6px 0;color:#71717a;">Emergency Contact</td><td style="padding:6px 0;">${escapeHtml(booking.customer.emergencyContactName)} (${escapeHtml(booking.customer.emergencyContactNumber)})</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#71717a;">ID Provided</td><td style="padding:6px 0;">${escapeHtml(booking.identification.idType)}${booking.identification.idNumber ? ` (${escapeHtml(booking.identification.idNumber)})` : ""}</td></tr>
      </table>

      <p style="margin:0;font-size:12px;color:#71717a;">
        If the button does not work, open this link:<br/>
        <a href="${escapeHtml(acceptUrl)}" style="color:#e31824;word-break:break-all;">${escapeHtml(acceptUrl)}</a>
      </p>
    </div>
  </div>`;

  return sendResendEmail({
    to: OWNER_EMAIL,
    subject: `New Booking Request: ${booking.referenceNumber} — ${booking.vehicleName}`,
    html,
    replyTo: booking.customer.email,
  });
}

export async function sendClientBookingApprovedEmail(params: {
  referenceNumber: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  durationDays: number;
  customerName: string;
  customerEmail: string;
}): Promise<{ ok: boolean; error?: string }> {
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#18181b;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
    <div style="background:#151515;color:#ffffff;padding:24px 28px;">
      <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#22c55e;font-weight:700;">Booking Approved</p>
      <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">Your reservation is confirmed!</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#d4d4d8;">Reference: <strong>${escapeHtml(params.referenceNumber)}</strong></p>
    </div>

    <div style="padding:24px 28px;">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
        Hi <strong>${escapeHtml(params.customerName)}</strong>,<br/><br/>
        Great news! Your booking request with <strong>${escapeHtml(site.name)}</strong> has been <strong>approved</strong>. Below are your confirmed trip details:
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
        <tr><td style="padding:10px 14px;color:#71717a;width:150px;">Vehicle</td><td style="padding:10px 14px;font-weight:600;">${escapeHtml(params.vehicleName)}</td></tr>
        <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;">${escapeHtml(params.pickupLocation)}</td></tr>
        <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Drop-off</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;">${escapeHtml(params.dropoffLocation)}</td></tr>
        <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up Schedule</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;">${escapeHtml(params.pickupDate)} at ${escapeHtml(params.pickupTime)}</td></tr>
        <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Return Schedule</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;">${escapeHtml(params.returnDate)} at ${escapeHtml(params.returnTime)}</td></tr>
        <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Duration</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;">${escapeHtml(params.durationDays)} day(s)</td></tr>
      </table>

      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">
        Our team will reach out shortly with your assigned driver details. If you need any updates, contact us at
        <strong>${escapeHtml(site.phone)}</strong> or reply to this email.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
        Thank you for choosing ${escapeHtml(site.name)}!
      </p>
    </div>
  </div>`;

  return sendResendEmail({
    to: params.customerEmail,
    subject: `Booking Approved: ${params.referenceNumber} — ${site.name}`,
    html,
    replyTo: OWNER_EMAIL,
  });
}
