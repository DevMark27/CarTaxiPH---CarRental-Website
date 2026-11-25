"use client";

import { useState, type FormEvent } from "react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings";

const STATUS_BADGE: Record<BookingStatus, string> = {
  "PENDING ADMIN CONFIRMATION": "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-zinc-200 text-zinc-800",
};

export function AdminDashboardClient() {
  const [passcode, setPasscode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selected, setSelected] = useState<BookingRecord | null>(null);

  // Admin edit fields for selected booking
  const [status, setStatus] = useState<BookingStatus>("PENDING ADMIN CONFIRMATION");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setAuthenticated(true);
    } catch {
      setAuthError("Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid administrator passcode.");
        setAuthenticated(false);
        return;
      }
      setPasscode("");
      await fetchBookings();
    } catch {
      setAuthError("Unable to verify passcode.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setBookings([]);
    setSelected(null);
  }

  function openBooking(b: BookingRecord) {
    setSelected(b);
    setStatus(b.status);
    setAssignedDriver(b.assignedDriver ?? "");
    setPaymentInstructions(b.paymentInstructions ?? "");
    setAdminNotes(b.adminNotes ?? "");
    setSaveMessage("");
  }

  async function handleSave(nextStatus?: BookingStatus) {
    if (!selected) return;
    setSaving(true);
    setSaveMessage("");
    const targetStatus = nextStatus ?? status;
    try {
      const res = await fetch(`/api/bookings/${selected.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
          assignedDriver,
          paymentInstructions,
          adminNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMessage(data.error || "Failed to update reservation.");
        return;
      }
      const updated = data.booking as BookingRecord;
      setStatus(updated.status);
      setSelected(updated);
      setBookings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSaveMessage("Reservation updated.");
    } catch {
      setSaveMessage("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (!authenticated) {
    return (
      <form
        onSubmit={handleLogin}
        className="mx-auto max-w-md rounded-3xl border border-line bg-white p-8 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-ink">Administrator Sign In</h2>
        <p className="mt-2 text-sm text-muted">
          Enter the administrator passcode to review reservations, verify uploaded IDs, and assign drivers.
        </p>
        <label className="mt-5 block text-sm font-medium text-ink">
          Passcode
          <input
            type="password"
            required
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter admin passcode"
            className="mt-2 w-full rounded-xl border border-line bg-mist/35 px-4 py-3 text-sm outline-none focus:border-ink focus:bg-white"
          />
        </label>
        {authError && <p className="mt-3 text-xs font-medium text-brand">{authError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Access Reservations"}
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            Submitted Reservations ({bookings.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchBookings()}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink hover:border-ink"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-muted hover:border-brand hover:text-brand"
            >
              Sign Out
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-muted">
            No reservations have been submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const isSelected = selected?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => openBooking(b)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-brand bg-white shadow-sm"
                      : "border-line bg-white hover:border-charcoal/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{b.referenceNumber}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-ink">{b.vehicleName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {b.customer.fullName} · {b.pickupDate} ({b.durationDays}{" "}
                    {b.durationDays === 1 ? "day" : "days"})
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand">
                    {b.pickupLocation} → {b.dropoffLocation}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Reservation Inspector */}
      <div>
        {selected ? (
          <div className="rounded-3xl border border-line bg-white p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <p className="font-mono text-xs font-bold text-muted">{selected.referenceNumber}</p>
                <h3 className="mt-1 text-xl font-bold text-ink">{selected.vehicleName}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${STATUS_BADGE[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <dl className="mt-5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Customer</dt><dd className="font-medium text-ink">{selected.customer.fullName}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd className="text-ink">{selected.customer.email}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Mobile</dt><dd className="text-ink">{selected.customer.mobile}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Address</dt><dd className="text-right text-ink">{selected.customer.address}</dd></div>
              <div className="flex justify-between gap-3 border-t border-line pt-2"><dt className="text-muted">Pick-up</dt><dd className="text-right text-ink">{selected.pickupLocation} · {selected.pickupDate} {selected.pickupTime}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Drop-off & Duration</dt><dd className="text-right text-ink">{selected.dropoffLocation} · {selected.durationDays} {selected.durationDays === 1 ? "day" : "days"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Pricing</dt><dd className="font-semibold text-brand">Distance-based (quote via WhatsApp)</dd></div>
            </dl>

            {/* Uploaded Identification Documents (Admin-only secure links) */}
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Identification ({selected.identification.idType} · {selected.identification.idNumber})
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  { label: "Front ID", doc: selected.identification.frontDoc },
                  { label: "Back ID", doc: selected.identification.backDoc },
                  { label: "Supporting Doc", doc: selected.identification.supportingDoc },
                ]
                  .filter((item): item is { label: string; doc: NonNullable<typeof item.doc> } => Boolean(item.doc))
                  .map(({ label, doc }) => (
                    <a
                      key={doc.id}
                      href={`/api/uploads/${doc.storedName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-line bg-mist/60 px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                    >
                      View {label} ({doc.originalName})
                    </a>
                  ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="mt-6 space-y-4 border-t border-line pt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Reservation Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                >
                  <option value="PENDING ADMIN CONFIRMATION">PENDING ADMIN CONFIRMATION</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Assigned Driver
                <input
                  type="text"
                  value={assignedDriver}
                  onChange={(e) => setAssignedDriver(e.target.value)}
                  placeholder="e.g. Roberto Santos (+63 917 555 0192)"
                  className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Payment Instructions
                <textarea
                  rows={3}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="Bank transfer / GCash details and deposit instructions..."
                  className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
                />
              </label>

              {saveMessage && <p className="text-xs font-semibold text-emerald-700">{saveMessage}</p>}

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("CONFIRMED")}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave("REJECTED")}
                  className="rounded-full border border-brand px-5 py-2.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave()}
                  className="ml-auto rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-white p-10 text-center text-sm text-muted">
            Select a reservation from the list to inspect documents, assign a driver, or update status.
          </div>
        )}
      </div>
    </div>
  );
}
