import { readBookings, writeBookings } from "@/lib/bookings";
import { sendClientBookingRejectedEmail, verifyBookingActionToken } from "@/lib/email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtmlPage(title: string, heading: string, message: string, isSuccess = true) {
  const accent = isSuccess ? "#DC2626" : "#DC2626";
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} — CarTaxi PH</title>
</head>
<body style="margin:0;padding:40px 16px;font-family:Arial,Helvetica,sans-serif;background:#f4f4f5;color:#18181b;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
    <div style="background:#151515;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${accent};font-weight:700;">CarTaxi PH Admin Action</p>
      <h1 style="margin:6px 0 0;font-size:20px;">${escapeHtml(heading)}</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(message)}</p>
      <a href="/admin" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:999px;">Go to Admin Dashboard</a>
    </div>
  </div>
</body>
</html>`,
    {
      status: isSuccess ? 200 : 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";

  const verified = verifyBookingActionToken(id, token, "reject");
  if (!verified) {
    return renderHtmlPage(
      "Invalid Link",
      "Invalid or Expired Rejection Link",
      "This booking action link is invalid or has expired. Please review the booking in the Admin Dashboard.",
      false,
    );
  }

  let referenceNumber = verified.ref;
  let vehicleName = verified.vehicle;
  let pickupDate = verified.pickupDate;
  let pickupTime = verified.pickupTime;
  let customerName = verified.name;
  let customerEmail = verified.email;

  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.id === id);

  if (idx !== -1) {
    const current = bookings[idx];
    if (current.status === "REJECTED") {
      return renderHtmlPage(
        "Already Rejected",
        "Booking Already Rejected",
        `Reservation ${current.referenceNumber} for ${current.customer.fullName} was already marked as REJECTED.`,
      );
    }
    if (current.status === "CONFIRMED") {
      return renderHtmlPage(
        "Already Confirmed",
        "Booking Was Already Confirmed",
        `Reservation ${current.referenceNumber} is currently CONFIRMED. Update it in the Admin Dashboard if needed.`,
        false,
      );
    }

    bookings[idx] = {
      ...current,
      status: "REJECTED",
      updatedAt: new Date().toISOString(),
    };
    writeBookings(bookings);

    referenceNumber = current.referenceNumber;
    vehicleName = current.vehicleName;
    pickupDate = current.pickupDate;
    pickupTime = current.pickupTime;
    customerName = current.customer.fullName;
    customerEmail = current.customer.email;
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const emailResult = await sendClientBookingRejectedEmail({
    referenceNumber,
    vehicleName,
    pickupDate,
    pickupTime,
    customerName,
    customerEmail,
    siteUrl: origin,
  });

  if (!emailResult.ok) {
    return renderHtmlPage(
      "Booking Rejected (Email Warning)",
      "Booking Rejected — Client Email Not Sent",
      `Reservation ${referenceNumber} has been marked REJECTED, but the notification email to ${customerEmail} could not be sent (${emailResult.error || "check RESEND_API_KEY / verified sender domain"}).`,
      false,
    );
  }

  return renderHtmlPage(
    "Booking Rejected",
    "Booking Rejected & Client Notified",
    `Reservation ${referenceNumber} for ${customerName} (${vehicleName}) is now REJECTED, and a status update email has been sent to ${customerEmail}.`,
  );
}
