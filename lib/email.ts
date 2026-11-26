import {
  createBookingActionToken,
  verifyBookingActionToken,
  type BookingEmailSummary,
} from "@/lib/email-tokens";
import {
  buildClientBookingApprovedEmail,
  buildClientBookingReceivedEmail,
  buildClientBookingRejectedEmail,
  buildOwnerBookingRequestEmail,
} from "@/lib/email-templates";

export const OWNER_EMAIL = process.env.OWNER_EMAIL || "sanjorjomarkangelo020727@gmail.com";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CarTaxi PH <onboarding@resend.dev>";

export { verifyBookingActionToken, type BookingEmailSummary };

export function verifyBookingAcceptToken(bookingId: string, token: string) {
  return verifyBookingActionToken(bookingId, token, "accept");
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
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const acceptToken = createBookingActionToken(booking, "accept");
  const rejectToken = createBookingActionToken(booking, "reject");
  const encodedId = encodeURIComponent(booking.id);

  const acceptUrl = `${cleanBase}/api/bookings/${encodedId}/accept?token=${encodeURIComponent(acceptToken)}`;
  const rejectUrl = `${cleanBase}/api/bookings/${encodedId}/reject?token=${encodeURIComponent(rejectToken)}`;
  const adminUrl = `${cleanBase}/admin`;

  const { subject, html } = buildOwnerBookingRequestEmail({
    booking,
    acceptUrl,
    rejectUrl,
    adminUrl,
  });

  return sendResendEmail({
    to: OWNER_EMAIL,
    subject,
    html,
    replyTo: booking.customer.email,
  });
}

export async function sendClientBookingReceivedEmail(params: {
  referenceNumber: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { subject, html } = buildClientBookingReceivedEmail(params);
  return sendResendEmail({
    to: params.customerEmail,
    subject,
    html,
    replyTo: OWNER_EMAIL,
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
  const { subject, html } = buildClientBookingApprovedEmail(params);
  return sendResendEmail({
    to: params.customerEmail,
    subject,
    html,
    replyTo: OWNER_EMAIL,
  });
}

export async function sendClientBookingRejectedEmail(params: {
  referenceNumber: string;
  vehicleName: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  siteUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { subject, html } = buildClientBookingRejectedEmail(params);
  return sendResendEmail({
    to: params.customerEmail,
    subject,
    html,
    replyTo: OWNER_EMAIL,
  });
}
