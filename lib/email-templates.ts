import { site } from "@/lib/site";
import type { BookingEmailSummary } from "@/lib/email-tokens";

export function escapeHtml(value: string | number | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapEmailLayout(params: {
  eyebrow: string;
  eyebrowColor: string;
  heading: string;
  referenceNumber: string;
  bodyHtml: string;
}): string {
  return `
  <div style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
      <div style="background:#151515;color:#ffffff;padding:24px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${params.eyebrowColor};font-weight:700;">
          ${escapeHtml(params.eyebrow)}
        </p>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">
          ${escapeHtml(params.heading)}
        </h1>
        <p style="margin:6px 0 0;font-size:13px;color:#d4d4d8;">
          Reference: <strong>${escapeHtml(params.referenceNumber)}</strong>
        </p>
      </div>

      <div style="padding:24px 28px;">
        ${params.bodyHtml}
      </div>

      <div style="padding:16px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;line-height:1.5;">
        <strong style="color:#18181b;">${escapeHtml(site.name)}</strong> · ${escapeHtml(site.address)}<br/>
        Phone: ${escapeHtml(site.phone)} · ${escapeHtml(site.hours)}
      </div>
    </div>
  </div>`;
}

export function buildOwnerBookingRequestEmail(params: {
  booking: BookingEmailSummary;
  acceptUrl: string;
  rejectUrl: string;
  adminUrl: string;
}): { subject: string; html: string } {
  const { booking, acceptUrl, rejectUrl, adminUrl } = params;

  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#27272a;">
      A client submitted a new reservation request. Review the details below and choose an action to automatically update the booking and notify the client.
    </p>

    <div style="margin:20px 0 26px;text-align:center;">
      <a href="${escapeHtml(acceptUrl)}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:999px;margin:4px 6px;">
        Accept Booking
      </a>
      <a href="${escapeHtml(rejectUrl)}" style="display:inline-block;background:#DC2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:999px;margin:4px 6px;">
        Reject Booking
      </a>
    </div>

    <h2 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;border-bottom:1px solid #e4e4e7;padding-bottom:6px;">Trip Details</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr><td style="padding:6px 0;color:#71717a;width:155px;">Vehicle</td><td style="padding:6px 0;font-weight:600;color:#18181b;">${escapeHtml(booking.vehicleName)} (${escapeHtml(booking.vehicleCategory)})</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Arrangement</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.arrangement)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Pick-up Location</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.pickupLocation)}</td></tr>
      ${booking.pickupAddress ? `<tr><td style="padding:6px 0;color:#71717a;">Exact Pick-up Address</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.pickupAddress)}</td></tr>` : ""}
      <tr><td style="padding:6px 0;color:#71717a;">Drop-off Location</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.dropoffLocation)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Pick-up Schedule</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.pickupDate)} at ${escapeHtml(booking.pickupTime)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Return Schedule</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.returnDate)} at ${escapeHtml(booking.returnTime)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Passengers</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.passengers)}</td></tr>
      ${booking.tripNotes ? `<tr><td style="padding:6px 0;color:#71717a;">Trip Notes</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.tripNotes)}</td></tr>` : ""}
    </table>

    <h2 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#52525b;border-bottom:1px solid #e4e4e7;padding-bottom:6px;">Client Information</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr><td style="padding:6px 0;color:#71717a;width:155px;">Full Name</td><td style="padding:6px 0;font-weight:600;color:#18181b;">${escapeHtml(booking.customer.fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(booking.customer.email)}" style="color:#2563EB;text-decoration:underline;">${escapeHtml(booking.customer.email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Mobile</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.customer.mobile)}</td></tr>
      <tr><td style="padding:6px 0;color:#71717a;">Address</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.customer.address)}</td></tr>
      ${booking.customer.emergencyContactName ? `<tr><td style="padding:6px 0;color:#71717a;">Emergency Contact</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.customer.emergencyContactName)} (${escapeHtml(booking.customer.emergencyContactNumber)})</td></tr>` : ""}
      <tr><td style="padding:6px 0;color:#71717a;">ID Provided</td><td style="padding:6px 0;color:#18181b;">${escapeHtml(booking.identification.idType)}${booking.identification.idNumber ? ` (${escapeHtml(booking.identification.idNumber)})` : ""}</td></tr>
    </table>

    <p style="margin:0 0 10px;font-size:13px;color:#52525b;">
      <a href="${escapeHtml(adminUrl)}" style="color:#2563EB;font-weight:600;text-decoration:underline;">View Booking Details in Admin Dashboard</a>
    </p>
    <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">
      If the buttons do not work, open the approval link directly:<br/>
      <a href="${escapeHtml(acceptUrl)}" style="color:#2563EB;word-break:break-all;">${escapeHtml(acceptUrl)}</a>
    </p>`;

  return {
    subject: `New Booking Request: ${booking.referenceNumber} — ${booking.vehicleName}`,
    html: wrapEmailLayout({
      eyebrow: "New Booking Request",
      eyebrowColor: "#a1a1aa",
      heading: booking.vehicleName,
      referenceNumber: booking.referenceNumber,
      bodyHtml,
    }),
  };
}

export function buildClientBookingReceivedEmail(params: {
  referenceNumber: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <div style="margin:0 0 16px;">
      <span style="display:inline-block;background:#FEF3C7;color:#B45309;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;letter-spacing:0.04em;text-transform:uppercase;">
        Status: Pending Confirmation
      </span>
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#27272a;">
      Hi <strong>${escapeHtml(params.customerName)}</strong>,<br/><br/>
      We have received your booking request with <strong>${escapeHtml(site.name)}</strong>. Our team is reviewing availability and will send you another email as soon as your reservation is approved.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
      <tr><td style="padding:10px 14px;color:#71717a;width:145px;">Vehicle</td><td style="padding:10px 14px;font-weight:600;color:#18181b;">${escapeHtml(params.vehicleName)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.pickupLocation)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Drop-off</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.dropoffLocation)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up Schedule</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.pickupDate)} at ${escapeHtml(params.pickupTime)}</td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">
      Questions before confirmation? Reach us at <strong>${escapeHtml(site.phone)}</strong> or
      <a href="${escapeHtml(site.whatsappHref)}" style="color:#2563EB;text-decoration:underline;">message us on WhatsApp</a>.
    </p>`;

  return {
    subject: `Booking Request Received: ${params.referenceNumber} — ${site.name}`,
    html: wrapEmailLayout({
      eyebrow: "Reservation Request Received",
      eyebrowColor: "#a1a1aa",
      heading: "We received your booking request",
      referenceNumber: params.referenceNumber,
      bodyHtml,
    }),
  };
}

export function buildClientBookingApprovedEmail(params: {
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
}): { subject: string; html: string } {
  const bodyHtml = `
    <div style="margin:0 0 16px;">
      <span style="display:inline-block;background:#DCFCE7;color:#16A34A;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;letter-spacing:0.04em;text-transform:uppercase;">
        Status: Confirmed
      </span>
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#27272a;">
      Hi <strong>${escapeHtml(params.customerName)}</strong>,<br/><br/>
      Great news! Your booking request with <strong>${escapeHtml(site.name)}</strong> has been <strong style="color:#16A34A;">approved</strong>. Below are your confirmed trip details:
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
      <tr><td style="padding:10px 14px;color:#71717a;width:145px;">Vehicle</td><td style="padding:10px 14px;font-weight:600;color:#18181b;">${escapeHtml(params.vehicleName)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.pickupLocation)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Drop-off</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.dropoffLocation)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Pick-up Schedule</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.pickupDate)} at ${escapeHtml(params.pickupTime)}</td></tr>
      <tr><td style="padding:10px 14px;color:#71717a;border-top:1px solid #e4e4e7;">Return Schedule</td><td style="padding:10px 14px;border-top:1px solid #e4e4e7;color:#18181b;">${escapeHtml(params.returnDate)} at ${escapeHtml(params.returnTime)}</td></tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#27272a;">
      Our team will reach out shortly with your assigned driver details. If you need any updates, call <strong>${escapeHtml(site.phone)}</strong> or
      <a href="${escapeHtml(site.whatsappHref)}" style="color:#2563EB;text-decoration:underline;">contact us on WhatsApp</a>.
    </p>`;

  return {
    subject: `Booking Approved: ${params.referenceNumber} — ${site.name}`,
    html: wrapEmailLayout({
      eyebrow: "Booking Approved",
      eyebrowColor: "#16A34A",
      heading: "Your reservation is confirmed!",
      referenceNumber: params.referenceNumber,
      bodyHtml,
    }),
  };
}

export function buildClientBookingRejectedEmail(params: {
  referenceNumber: string;
  vehicleName: string;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  siteUrl: string;
}): { subject: string; html: string } {
  const bookUrl = `${params.siteUrl.replace(/\/+$/, "")}/book`;
  const bodyHtml = `
    <div style="margin:0 0 16px;">
      <span style="display:inline-block;background:#FEE2E2;color:#DC2626;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;letter-spacing:0.04em;text-transform:uppercase;">
        Status: Unavailable / Declined
      </span>
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#27272a;">
      Hi <strong>${escapeHtml(params.customerName)}</strong>,<br/><br/>
      Thank you for choosing <strong>${escapeHtml(site.name)}</strong>. Unfortunately, your request for the <strong>${escapeHtml(params.vehicleName)}</strong> on <strong>${escapeHtml(params.pickupDate)} at ${escapeHtml(params.pickupTime)}</strong> could not be accommodated.
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#27272a;">
      You can select another vehicle or schedule on our website, or message us directly so we can recommend an available unit for your trip.
    </p>
    <div style="margin:20px 0;">
      <a href="${escapeHtml(bookUrl)}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:999px;">
        Choose Another Vehicle
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#52525b;">
      Need assistance? Call <strong>${escapeHtml(site.phone)}</strong> or
      <a href="${escapeHtml(site.whatsappHref)}" style="color:#2563EB;text-decoration:underline;">chat with us on WhatsApp</a>.
    </p>`;

  return {
    subject: `Booking Update: ${params.referenceNumber} — ${site.name}`,
    html: wrapEmailLayout({
      eyebrow: "Booking Status Update",
      eyebrowColor: "#DC2626",
      heading: "Unable to confirm this schedule",
      referenceNumber: params.referenceNumber,
      bodyHtml,
    }),
  };
}
