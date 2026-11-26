import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reserve Your Vehicle",
  description: "Complete your car rental reservation with CarTaxi PH — with professional driver included.",
};

export default function BookPage() {
  return (
    <div className="min-h-full bg-mist/40">
      <section className="bg-[#151515] text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-10 sm:px-8 sm:py-12 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Reservation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Let&apos;s get you on the road.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
              Complete your trip details below—our team confirms availability and assigns your professional driver.
            </p>
          </div>
          <p className="text-xs text-white/60">
            Need help?{" "}
            <a href={site.phoneHref} className="font-semibold text-white underline-offset-4 hover:underline">
              {site.phone}
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
          <BookingForm defaultVehicleSlug="toyota-raize" />
        </Suspense>
      </div>
    </div>
  );
}
