"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { categories, isVehicleAvailable, vehicles } from "@/lib/vehicles";
import { ArrowRightIcon, CalendarIcon, ClockIcon, PinIcon } from "./Icons";

const fieldCls =
  "mt-2 h-[46px] w-full rounded-xl border border-line bg-mist/35 px-3.5 text-sm text-charcoal placeholder:text-muted/70 outline-none transition-all duration-200 hover:border-charcoal/40 hover:bg-white focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10";

export function QuickBookingBar() {
  const router = useRouter();
  const [pickup, setPickup] = useState<string>(site.pickupLocations[0]);
  const [dropoff, setDropoff] = useState<string>(site.pickupLocations[0]);
  const [tripType, setTripType] = useState<"One-way" | "Round trip">("Round trip");
  const [category, setCategory] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("09:00");
  const [error, setError] = useState<string>("");

  const matchingCount = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          isVehicleAvailable(v) &&
          v.arrangements.includes(tripType) &&
          (!category || v.category === category),
      ).length,
    [category, tripType],
  );

  function swapLocations() {
    setPickup(dropoff);
    setDropoff(pickup);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pickup.trim()) {
      setError("Please enter a pick-up location.");
      return;
    }
    if (!dropoff.trim()) {
      setError("Please enter a drop-off location.");
      return;
    }
    if (!pickupTime.trim()) {
      setError("Please select a pick-up time.");
      return;
    }

    setError("");
    const params = new URLSearchParams();
    params.set("pickup", pickup.trim());
    params.set("dropoff", dropoff.trim());
    params.set("arrangement", tripType);
    if (category) params.set("category", category);
    if (pickupDate) params.set("start", pickupDate);
    if (pickupTime) params.set("startTime", pickupTime);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_70px_-24px_rgba(8,8,8,0.16)] sm:p-8"
    >
      {/* Top Header Row */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">Quick Reservation</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Search available vehicles for your route
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-muted">
            {matchingCount} {matchingCount === 1 ? "model" : "models"} available
          </span>
          <div className="inline-flex rounded-full border border-line bg-mist p-1" role="group" aria-label="Trip type">
            {(["One-way", "Round trip"] as const).map((t) => {
              const active = tripType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTripType(t)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active ? "bg-brand text-white shadow-sm" : "text-charcoal hover:text-brand"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Quick Pills */}
      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Category:</span>
        {["", ...categories].map((cat) => {
          const selected = category === cat;
          const label = cat === "" ? "Any" : cat === "Passenger Van" ? "Van" : cat;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={selected}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                selected
                  ? "border-brand bg-brand text-white shadow-sm"
                  : "border-line bg-white text-charcoal hover:border-charcoal/40 hover:bg-mist/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Aligned Single-Row Search Inputs + CTA */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        {/* Pick-up + Swap + Drop-off */}
        <div className="sm:col-span-2 lg:col-span-5">
          <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                <PinIcon width={14} height={14} className="text-brand" /> Pick-up Location
              </span>
              <input
                type="text"
                name="pickup"
                list="ph-pickup-locations"
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. NAIA Terminal 3"
                autoComplete="off"
                className={fieldCls}
              />
            </label>

            <div className="flex justify-center sm:pb-[5px]">
              <button
                type="button"
                onClick={swapLocations}
                aria-label="Swap pick-up and drop-off locations"
                title="Swap locations"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-xs font-bold text-charcoal shadow-xs transition-all duration-200 hover:scale-105 hover:border-brand hover:text-brand"
              >
                ⇄
              </button>
            </div>

            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                <PinIcon width={14} height={14} className="text-muted" /> Drop-off Location
              </span>
              <input
                type="text"
                name="dropoff"
                list="ph-pickup-locations"
                value={dropoff}
                onChange={(e) => {
                  setDropoff(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Same as pick-up"
                autoComplete="off"
                className={fieldCls}
              />
            </label>
          </div>
        </div>

        <label className="block lg:col-span-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
            <CalendarIcon width={14} height={14} className="text-brand" /> Pick-up Date
          </span>
          <input
            type="date"
            name="start"
            value={pickupDate}
            onChange={(e) => {
              setPickupDate(e.target.value);
              if (error) setError("");
            }}
            className={fieldCls}
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal">
            <ClockIcon width={14} height={14} className="text-brand" /> Pick-up Time
          </span>
          <input
            type="time"
            name="startTime"
            value={pickupTime}
            onChange={(e) => {
              setPickupTime(e.target.value);
              if (error) setError("");
            }}
            className={fieldCls}
          />
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="inline-flex h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(227,24,36,0.65)] transition-all duration-200 hover:bg-brand-dark active:scale-[0.99]"
          >
            <span>Search Available Vehicles</span>
            <ArrowRightIcon width={15} height={15} className="shrink-0" />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-xs font-medium text-brand">
          {error}
        </p>
      )}

      <datalist id="ph-pickup-locations">
        {site.pickupLocations.map((loc) => (
          <option key={loc} value={loc} />
        ))}
        <option value="Tagaytay City" />
        <option value="BGC, Taguig" />
        <option value="Alabang, Muntinlupa" />
      </datalist>
    </form>
  );
}
