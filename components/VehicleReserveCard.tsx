"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { type Vehicle } from "@/lib/vehicles";
import { PhoneIcon } from "./Icons";

export function VehicleReserveCard({ vehicle }: { vehicle: Vehicle }) {
  const sp = useSearchParams();

  const pickup = sp.get("pickup") ?? "";
  const dropoff = sp.get("dropoff") ?? "";
  const start = sp.get("start") ?? "";
  const startTime = sp.get("startTime") ?? "";
  const arrangement = sp.get("arrangement") ?? "";

  const reserveParams = new URLSearchParams();
  reserveParams.set("vehicle", vehicle.slug);
  if (pickup) reserveParams.set("pickup", pickup);
  if (dropoff) reserveParams.set("dropoff", dropoff);
  if (start) reserveParams.set("start", start);
  if (startTime) reserveParams.set("startTime", startTime);
  if (arrangement) reserveParams.set("arrangement", arrangement);

  return (
    <div className="mt-8 rounded-3xl border border-line p-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-wider text-muted">Pricing</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Distance-Based Quote
        </p>
        <p className="mt-2 text-sm text-muted">
          Rates depend on your route and distance. The owner will declare your final quote via WhatsApp after reviewing
          your trip details.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/book?${reserveParams.toString()}`}
          className="rounded-full bg-brand px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Reserve This Vehicle
        </Link>
        <a
          href={site.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <PhoneIcon width={16} height={16} /> Quote via WhatsApp
        </a>
      </div>
    </div>
  );
}
