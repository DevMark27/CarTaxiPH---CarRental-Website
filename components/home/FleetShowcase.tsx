"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon, BagIcon, CheckIcon, FuelIcon, GearIcon, UsersIcon } from "@/components/Icons";
import { categories, vehicleName, vehicles, type Category, type Vehicle } from "@/lib/vehicles";

const ease = [0.22, 1, 0.36, 1] as const;

const popularSlugs = new Set([
  "toyota-raize",
  "toyota-veloz",
  "toyota-innova",
  "toyota-vios",
  "mitsubishi-xpander",
  "toyota-fortuner",
]);

type Filter = "Popular" | "All" | Category;
const filters: Filter[] = ["Popular", "All", ...categories];

export function FleetShowcase() {
  const [active, setActive] = useState<Filter>("Popular");
  const [quickView, setQuickView] = useState<Vehicle | null>(null);
  const [quickPhotoIdx, setQuickPhotoIdx] = useState(0);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const visible =
    active === "Popular"
      ? vehicles.filter((v) => popularSlugs.has(v.slug))
      : active === "All"
        ? vehicles
        : vehicles.filter((v) => v.category === active);

  const comparedVehicles = vehicles.filter((v) => compareSlugs.includes(v.slug));

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return [...prev.slice(1), slug];
      return [...prev, slug];
    });
  }

  function openQuickView(v: Vehicle) {
    setQuickPhotoIdx(0);
    setQuickView(v);
  }

  return (
    <section id="fleet" className="scroll-mt-16 bg-white py-20 text-charcoal sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="inline-block h-0.5 w-6 bg-brand" />
              Our Vehicles
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Find the Perfect Ride for Every Journey
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Whether you&apos;re traveling with family, friends, or on your own, find a vehicle that fits your plans.
            </p>
          </div>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 self-start rounded-full border border-charcoal/25 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition-all duration-200 hover:border-ink hover:bg-ink hover:text-white lg:self-auto"
          >
            Reserve Now
            <ArrowRightIcon width={14} height={14} />
          </Link>
        </motion.div>

        {/* Interactive category filter */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter vehicles by category">
          {filters.map((filter) => {
            const selected = active === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  selected
                    ? "bg-brand text-white shadow-sm"
                    : "border border-line bg-mist text-charcoal hover:border-charcoal/40"
                }`}
              >
                {filter === "All" ? `All (${vehicles.length})` : filter}
              </button>
            );
          })}
        </div>

        {/* Vehicle grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((v, i) => {
            const isCompared = compareSlugs.includes(v.slug);
            return (
              <motion.article
                key={`${active}-${v.slug}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.35), ease }}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-24px_rgba(17,17,17,0.18)] ${
                  isCompared ? "border-brand ring-1 ring-brand" : "border-line hover:border-charcoal/30"
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                  <Link href={`/fleet/${v.slug}`} className="relative block h-full w-full">
                    <Image
                      src={v.images[0].src}
                      alt={v.images[0].alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </Link>
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-charcoal/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {v.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(v.slug)}
                    aria-pressed={isCompared}
                    className={`absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      isCompared
                        ? "bg-brand text-white"
                        : "bg-white/95 text-charcoal shadow-sm hover:bg-charcoal hover:text-white"
                    }`}
                  >
                    {isCompared ? <CheckIcon width={12} height={12} /> : "+"}
                    {isCompared ? "Comparing" : "Compare"}
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link href={`/fleet/${v.slug}`} className="text-xl font-semibold tracking-tight text-charcoal hover:text-ink">
                      {vehicleName(v)}
                    </Link>
                    <span className="text-xs font-medium text-muted">{v.year}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{v.variant}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-3.5 text-xs font-medium text-charcoal/85">
                    <span className="flex items-center gap-2">
                      <UsersIcon width={15} height={15} className="text-charcoal/70" />
                      {v.passengers} Passengers
                    </span>
                    <span className="flex items-center gap-2">
                      <GearIcon width={15} height={15} className="text-charcoal/70" />
                      {v.transmission}
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Rental Rate</p>
                      <p className="text-sm font-semibold text-charcoal">Quote on request</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openQuickView(v)}
                        className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal hover:bg-mist"
                      >
                        Quick View
                      </button>
                      <Link
                        href={`/fleet/${v.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-brand"
                      >
                        Details
                        <ArrowRightIcon width={13} height={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Sticky Compare Bar */}
      <AnimatePresence>
        {comparedVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-4 left-1/2 z-40 w-[94vw] max-w-3xl -translate-x-1/2 rounded-2xl border border-white/15 bg-charcoal px-5 py-3.5 text-white shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Compare ({comparedVehicles.length}/3):
                </span>
                {comparedVehicles.map((cv) => (
                  <button
                    key={cv.slug}
                    type="button"
                    onClick={() => toggleCompare(cv.slug)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                  >
                    {cv.model} <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompareSlugs([])}
                  className="px-3 py-1.5 text-xs text-white/70 hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={comparedVehicles.length < 2}
                  onClick={() => setCompareOpen(true)}
                  className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setQuickView(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease }}
              onClick={(e) => e.stopPropagation()}
              className="grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white text-charcoal shadow-2xl md:grid-cols-2"
            >
              <div className="bg-mist p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={(quickView.images[quickPhotoIdx] ?? quickView.images[0]).src}
                    alt={(quickView.images[quickPhotoIdx] ?? quickView.images[0]).alt}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                </div>
                {quickView.images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {quickView.images.map((img, idx) => (
                      <button
                        key={img.src}
                        type="button"
                        onClick={() => setQuickPhotoIdx(idx)}
                        className={`relative aspect-[4/3] w-16 overflow-hidden rounded-lg border-2 ${
                          idx === quickPhotoIdx ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                      {quickView.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickView(null)}
                      aria-label="Close quick view"
                      className="grid h-8 w-8 place-items-center rounded-full bg-mist text-charcoal hover:bg-charcoal hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">{vehicleName(quickView)}</h3>
                  <p className="text-xs text-muted">
                    {quickView.year} · {quickView.variant} · {quickView.color}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-charcoal/80">{quickView.summary}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-line py-4 text-xs">
                    <div className="flex items-center gap-2"><UsersIcon width={14} height={14} className="text-charcoal/70" /> {quickView.passengers} Seats</div>
                    <div className="flex items-center gap-2"><GearIcon width={14} height={14} className="text-charcoal/70" /> {quickView.transmission}</div>
                    <div className="flex items-center gap-2"><FuelIcon width={14} height={14} className="text-charcoal/70" /> {quickView.fuel}</div>
                    <div className="flex items-center gap-2"><BagIcon width={14} height={14} className="text-charcoal/70" /> {quickView.luggage}</div>
                  </dl>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted">Rental Rate</p>
                    <p className="text-base font-semibold text-charcoal">Quote on request</p>
                  </div>
                  <Link
                    href={`/book?vehicle=${quickView.slug}`}
                    className="rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Compare Modal */}
      <AnimatePresence>
        {compareOpen && comparedVehicles.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setCompareOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl overflow-x-auto rounded-3xl bg-white p-6 text-charcoal shadow-2xl sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Compare Vehicles</h3>
                <button
                  type="button"
                  onClick={() => setCompareOpen(false)}
                  aria-label="Close comparison"
                  className="grid h-8 w-8 place-items-center rounded-full bg-mist text-charcoal hover:bg-charcoal hover:text-white"
                >
                  ✕
                </button>
              </div>
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-muted">Spec</th>
                    {comparedVehicles.map((cv) => (
                      <th key={cv.slug} className="pb-3 font-bold text-charcoal">
                        {vehicleName(cv)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-xs sm:text-sm">
                  <tr><td className="py-3 text-muted">Category</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3 font-medium">{cv.category}</td>)}</tr>
                  <tr><td className="py-3 text-muted">Model Year</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3">{cv.year}</td>)}</tr>
                  <tr><td className="py-3 text-muted">Passengers</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3 font-medium">{cv.passengers} seats</td>)}</tr>
                  <tr><td className="py-3 text-muted">Transmission</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3">{cv.transmission}</td>)}</tr>
                  <tr><td className="py-3 text-muted">Fuel</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3">{cv.fuel}</td>)}</tr>
                  <tr><td className="py-3 text-muted">Luggage</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3">{cv.luggage}</td>)}</tr>
                  <tr><td className="py-3 text-muted">Arrangements</td>{comparedVehicles.map((cv) => <td key={cv.slug} className="py-3 font-medium">{cv.arrangements.join(" / ")}</td>)}</tr>
                  <tr>
                    <td className="pt-4" />
                    {comparedVehicles.map((cv) => (
                      <td key={cv.slug} className="pt-4">
                        <Link
                          href={`/book?vehicle=${cv.slug}`}
                          className="inline-block rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                        >
                          Book {cv.model}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
