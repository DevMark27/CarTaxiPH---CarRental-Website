import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/SearchResultsClient";

export const metadata: Metadata = {
  title: "Available Vehicles",
  description: "Browse and filter available rental cars for your Philippine route and travel dates.",
};

export default function SearchPage() {
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Vehicle Search</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Available vehicles for your trip
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Compare models, filter by capacity or daily rate, and view full specifications before reserving.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-mist" />}>
          <SearchResultsClient />
        </Suspense>
      </div>
    </>
  );
}
