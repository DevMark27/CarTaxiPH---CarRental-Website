import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Reservations",
  description: "Review reservations, verify identification documents, and assign drivers.",
};

export default function AdminPage() {
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Administration</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Reservation Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Review pending bookings, verify uploaded identification documents, assign drivers, and send payment
            instructions.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <AdminDashboardClient />
      </div>
    </>
  );
}
