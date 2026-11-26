"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import {
  categories,
  hasAirConditioning,
  isVehicleAvailable,
  vehicleName,
  vehicles,
  type Category,
  type RentalArrangement,
} from "@/lib/vehicles";
import {
  ArrowRightIcon,
  CalendarIcon,
  GearIcon,
  PinIcon,
  SunIcon,
  UsersIcon,
} from "./Icons";

const controlCls =
  "mt-1.5 h-[44px] w-full rounded-xl border border-line bg-mist/35 px-3.5 text-sm text-ink outline-none transition-all duration-200 hover:border-charcoal/40 hover:bg-white focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10";

export function SearchResultsClient() {
  const router = useRouter();
  const params = useSearchParams();

  const pickup = params.get("pickup") || site.pickupLocations[0];
  const dropoff = params.get("dropoff") || pickup;
  const start = params.get("start") || "";
  const startTime = params.get("startTime") || "09:00";
  const arrangementParam = params.get("arrangement");
  const arrangement: RentalArrangement =
    arrangementParam === "One-way" || arrangementParam === "Round trip" ? arrangementParam : "Round trip";
  const initialCategory = params.get("category") || "";

  // Inline Edit Search state
  const [editing, setEditing] = useState(false);
  const [editPickup, setEditPickup] = useState(pickup);
  const [editDropoff, setEditDropoff] = useState(dropoff);
  const [editStart, setEditStart] = useState(start);
  const [editStartTime, setEditStartTime] = useState(startTime);
  const [editArrangement, setEditArrangement] = useState<RentalArrangement>(arrangement);
  const [editError, setEditError] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [transmission, setTransmission] = useState<string>("all");
  const [minPassengers, setMinPassengers] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available">("all");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (!v.arrangements.includes(arrangement)) return false;
      if (selectedCategory && v.category !== (selectedCategory as Category)) return false;
      if (transmission !== "all" && v.transmission !== transmission) return false;
      if (minPassengers > 0 && v.passengers < minPassengers) return false;
      if (availabilityFilter === "available" && !isVehicleAvailable(v)) return false;
      return true;
    });
  }, [arrangement, selectedCategory, transmission, minPassengers, availabilityFilter]);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    transmission !== "all" ||
    minPassengers > 0 ||
    availabilityFilter !== "all";

  function resetFilters() {
    setSelectedCategory("");
    setTransmission("all");
    setMinPassengers(0);
    setAvailabilityFilter("all");
  }

  function handleUpdateSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editPickup.trim() || !editDropoff.trim()) {
      setEditError("Please enter both pick-up and drop-off locations.");
      return;
    }
    setEditError("");
    const next = new URLSearchParams();
    next.set("pickup", editPickup.trim());
    next.set("dropoff", editDropoff.trim());
    next.set("arrangement", editArrangement);
    if (selectedCategory) next.set("category", selectedCategory);
    if (editStart) next.set("start", editStart);
    if (editStartTime) next.set("startTime", editStartTime);
    router.push(`/search?${next.toString()}`);
    setEditing(false);
  }

  function buildVehicleQuery() {
    const q = new URLSearchParams();
    q.set("pickup", pickup);
    q.set("dropoff", dropoff);
    q.set("arrangement", arrangement);
    if (start) q.set("start", start);
    if (startTime) q.set("startTime", startTime);
    return q.toString();
  }

  const queryStr = buildVehicleQuery();

  return (
    <div className="space-y-8">
      {/* Compact Search Summary */}
      <div className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-8">
            <div className="flex items-start gap-2.5">
              <PinIcon width={17} height={17} className="mt-0.5 shrink-0 text-charcoal/70" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pick-up Location</p>
                <p className="text-sm font-semibold text-ink">{pickup}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <PinIcon width={17} height={17} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Drop-off Location</p>
                <p className="text-sm font-semibold text-ink">{dropoff}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarIcon width={17} height={17} className="mt-0.5 shrink-0 text-charcoal/70" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pick-up Date & Time</p>
                <p className="text-sm font-semibold text-ink">
                  {start ? `${start} · ${startTime}` : `Flexible · ${startTime}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-charcoal">
              {arrangement}
            </span>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-full border border-charcoal/25 px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-ink hover:text-ink"
            >
              {editing ? "Close" : "Edit Search"}
            </button>
          </div>
        </div>

        {/* Inline Edit Search Form */}
        {editing && (
          <form onSubmit={handleUpdateSearch} className="mt-6 border-t border-line pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {(["One-way", "Round trip"] as RentalArrangement[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEditArrangement(t)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    editArrangement === t ? "bg-brand text-white" : "border border-line bg-mist text-charcoal"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pick-up</span>
                <input
                  type="text"
                  list="search-locations"
                  value={editPickup}
                  onChange={(e) => setEditPickup(e.target.value)}
                  className={controlCls}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Drop-off</span>
                <input
                  type="text"
                  list="search-locations"
                  value={editDropoff}
                  onChange={(e) => setEditDropoff(e.target.value)}
                  className={controlCls}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pick-up Date</span>
                <input
                  type="date"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className={controlCls}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pick-up Time</span>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className={controlCls}
                />
              </label>
            </div>
            {editError && <p className="mt-3 text-xs font-medium text-error">{editError}</p>}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Update Search
              </button>
            </div>
            <datalist id="search-locations">
              {site.pickupLocations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </form>
        )}
      </div>

      {/* Vehicle Filtering Controls */}
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm font-semibold text-ink">
            Filter Vehicles <span className="ml-1 font-normal text-muted">({filteredVehicles.length} found)</span>
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-ink underline-offset-4 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={controlCls}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Transmission</span>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className={controlCls}
            >
              <option value="all">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Passengers</span>
            <select
              value={minPassengers}
              onChange={(e) => setMinPassengers(Number(e.target.value))}
              className={controlCls}
            >
              <option value={0}>Any Capacity</option>
              <option value={5}>5+ Seats</option>
              <option value={7}>7+ Seats</option>
              <option value={12}>12+ Seats</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Availability</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available")}
              className={controlCls}
            >
              <option value="all">All Vehicles</option>
              <option value="available">Available Only</option>
            </select>
          </label>
        </div>
      </div>

      {/* Results Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-ink">No vehicles match your filters</h2>
          <p className="mt-2 text-sm text-muted">
            Try adjusting your category, passenger capacity, or price range to see more available models.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((v) => {
            const available = isVehicleAvailable(v);
            const ac = hasAirConditioning(v);
            return (
              <article
                key={v.slug}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-[0_24px_60px_-24px_rgba(17,17,17,0.2)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                  <Image
                    src={v.images[0].src}
                    alt={v.images[0].alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-charcoal/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {v.category}
                  </span>
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      available ? "bg-emerald-600 text-white" : "bg-charcoal/80 text-white"
                    }`}
                  >
                    {available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-ink">{vehicleName(v)}</h2>
                    <span className="text-xs font-medium text-muted">{v.year}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{v.variant}</p>

                  <ul className="mt-4 grid grid-cols-2 gap-2.5 border-y border-line py-4 text-xs font-medium text-ink/85">
                    <li className="flex items-center gap-1.5">
                      <GearIcon width={15} height={15} className="shrink-0 text-charcoal/70" />
                      {v.transmission}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <UsersIcon width={15} height={15} className="shrink-0 text-charcoal/70" />
                      {v.passengers} Passengers
                    </li>
                    {ac && (
                      <li className="col-span-2 flex items-center gap-1.5">
                        <SunIcon width={15} height={15} className="shrink-0 text-charcoal/70" />
                        Air-Conditioned Cabin
                      </li>
                    )}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Pricing</p>
                      <p className="text-sm font-semibold text-charcoal">Quote via WhatsApp</p>
                    </div>

                    <Link
                      href={`/fleet/${v.slug}?${queryStr}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand"
                    >
                      View Details
                      <ArrowRightIcon width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
