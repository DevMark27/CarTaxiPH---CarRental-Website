import { readBookings, writeBookings } from "@/lib/bookings";
import { sendClientBookingApprovedEmail, verifyBookingAcceptToken } from "@/lib/email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtmlPage(title: string, heading: string, message: string, isError = false) {
  const accent = isError ? "#DC2626" : "#16A34A";
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
      status: isError ? 400 : 200,
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

  const verified = verifyBookingAcceptToken(id, token);
  if (!verified) {
    return renderHtmlPage(
      "Invalid Link",
      "Invalid or Expired Approval Link",
      "This booking approval link is invalid or has expired. Please review the booking in the Admin Dashboard.",
      true,
    );
  }

  let referenceNumber = verified.ref;
  let vehicleName = verified.vehicle;
  let pickupLocation = verified.pickupLoc;
  let dropoffLocation = verified.dropoffLoc;
  let pickupDate = verified.pickupDate;
  let pickupTime = verified.pickupTime;
  let returnDate = verified.returnDate;
  let returnTime = verified.returnTime;
  let durationDays = verified.days;
  let customerName = verified.name;
  let customerEmail = verified.email;

  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.id === id);

  if (idx !== -1) {
    const current = bookings[idx];
    if (current.status === "CONFIRMED") {
      return renderHtmlPage(
        "Already Accepted",
        "Booking Already Confirmed",
        `Reservation ${current.referenceNumber} for ${current.customer.fullName} was already confirmed.`,
      );
    }
    if (current.status === "REJECTED") {
      return renderHtmlPage(
        "Booking Rejected",
        "Booking Was Previously Rejected",
        `Reservation ${current.referenceNumber} is currently marked as REJECTED. Update it in the Admin Dashboard if needed.`,
        true,
      );
    }

    bookings[idx] = {
      ...current,
      status: "CONFIRMED",
      updatedAt: new Date().toISOString(),
    };
    writeBookings(bookings);

    referenceNumber = current.referenceNumber;
    vehicleName = current.vehicleName;
    pickupLocation = current.pickupLocation;
    dropoffLocation = current.dropoffLocation;
    pickupDate = current.pickupDate;
    pickupTime = current.pickupTime;
    returnDate = current.returnDate;
    returnTime = current.returnTime;
    durationDays = current.durationDays;
    customerName = current.customer.fullName;
    customerEmail = current.customer.email;
  }

  const emailResult = await sendClientBookingApprovedEmail({
    referenceNumber,
    vehicleName,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    durationDays,
    customerName,
    customerEmail,
  });

  if (!emailResult.ok) {
    return renderHtmlPage(
      "Booking Accepted (Email Warning)",
      "Booking Accepted — Client Email Not Sent",
      `Reservation ${referenceNumber} has been accepted, but the confirmation email to ${customerEmail} could not be sent (${emailResult.error || "check RESEND_API_KEY / verified sender domain"}).`,
      true,
    );
  }

  return renderHtmlPage(
    "Booking Accepted",
    "Booking Accepted & Client Notified!",
    `Reservation ${referenceNumber} for ${customerName} (${vehicleName}) is now CONFIRMED, and an approval email has been sent to ${customerEmail}.`,
  );
}
