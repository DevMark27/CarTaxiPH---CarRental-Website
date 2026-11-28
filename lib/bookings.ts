import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getVehicle, isVehicleAvailable } from "./vehicles";

export type BookingStatus =
  | "PENDING ADMIN CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED";

export type UploadedDoc = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type BookingRecord = {
  id: string;
  referenceNumber: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  vehicleSlug: string;
  vehicleName: string;
  vehicleCategory: string;
  dailyRate: number;
  arrangement: "One-way" | "Round trip";
  pickupLocation: string;
  pickupAddress?: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  durationDays: number;
  estimatedSubtotal: number;
  additionalCharges: number;
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
    frontDoc: UploadedDoc;
    backDoc?: UploadedDoc;
    supportingDoc?: UploadedDoc;
  };
  assignedDriver?: string;
  paymentInstructions?: string;
  adminNotes?: string;
};

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "cartaxi-data")
  : path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
export const PRIVATE_UPLOADS_DIR = path.join(DATA_DIR, "uploads");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, "[]", "utf8");
}

export function readBookings(): BookingRecord[] {
  try {
    ensureStorage();
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export function writeBookings(records: BookingRecord[]) {
  ensureStorage();
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export function generateBookingReference(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `CTPH-${y}${m}${d}-${rand}`;
}

export function computeEndDateTime(
  pickupDate: string,
  pickupTime: string,
  durationDays: number,
): { returnDate: string; returnTime: string } {
  const safeDays = Math.max(1, Math.floor(durationDays) || 1);
  const startMs = new Date(`${pickupDate}T${pickupTime || "09:00"}`).getTime();
  if (Number.isNaN(startMs)) {
    return { returnDate: pickupDate, returnTime: pickupTime || "09:00" };
  }
  const endDate = new Date(startMs + safeDays * 24 * 60 * 60 * 1000);
  const y = endDate.getFullYear();
  const m = String(endDate.getMonth() + 1).padStart(2, "0");
  const d = String(endDate.getDate()).padStart(2, "0");
  const hh = String(endDate.getHours()).padStart(2, "0");
  const mm = String(endDate.getMinutes()).padStart(2, "0");
  return { returnDate: `${y}-${m}-${d}`, returnTime: `${hh}:${mm}` };
}

export function checkVehicleAvailabilityForPeriod(
  vehicleSlug: string,
  pickupDate: string,
  pickupTime: string,
  durationDays = 1,
): { available: boolean; reason?: string } {
  const vehicle = getVehicle(vehicleSlug);
  if (!vehicle) return { available: false, reason: "Selected vehicle was not found." };
  if (!isVehicleAvailable(vehicle)) {
    return { available: false, reason: "This vehicle is currently marked unavailable." };
  }

  const reqStart = new Date(`${pickupDate}T${pickupTime || "00:00"}`).getTime();
  const safeDays = Math.max(1, Math.floor(durationDays) || 1);
  const reqEnd = reqStart + safeDays * 24 * 60 * 60 * 1000;
  if (Number.isNaN(reqStart)) {
    return { available: false, reason: "Please select a valid pick-up date and time." };
  }

  const existing = readBookings();
  const hasOverlap = existing.some((b) => {
    if (b.vehicleSlug !== vehicleSlug) return false;
    if (b.status === "REJECTED" || b.status === "COMPLETED") return false;
    const bStart = new Date(`${b.pickupDate}T${b.pickupTime || "00:00"}`).getTime();
    const bEnd = b.returnDate
      ? new Date(`${b.returnDate}T${b.returnTime || "23:59"}`).getTime()
      : bStart + Math.max(1, b.durationDays || 1) * 24 * 60 * 60 * 1000;
    return reqStart < bEnd && reqEnd > bStart;
  });

  if (hasOverlap) {
    return {
      available: false,
      reason: "This vehicle already has an active reservation overlapping your selected schedule.",
    };
  }

  return { available: true };
}

export const ADMIN_COOKIE_NAME = "cartaxi_admin_session";

function getAdminSecret(): string | null {
  const envPass = process.env.ADMIN_PASSCODE;
  if (envPass && envPass.length >= 8) return envPass;
  // Fail closed in production if ADMIN_PASSCODE is not configured
  if (process.env.NODE_ENV === "production") return null;
  return "cartaxi-admin-2026";
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPasscode(passcode: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !passcode) return false;
  return timingSafeEqualStr(passcode, secret);
}

export function createAdminSessionToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  const payload = String(expiresAt);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqualStr(sig, expectedSig);
}

function parseCookie(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export function isAdminAuthorized(request: Request): boolean {
  const cookieToken = parseCookie(request.headers.get("cookie"), ADMIN_COOKIE_NAME);
  if (cookieToken && verifyAdminSessionToken(cookieToken)) {
    return true;
  }
  const headerPass = request.headers.get("x-admin-passcode") || "";
  return verifyAdminPasscode(headerPass);
}
