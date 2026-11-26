"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon, CalendarIcon, CarIcon, PhoneIcon, ShieldIcon, SunIcon } from "@/components/Icons";
import { services } from "@/lib/services";
import { vehicleName, vehicles } from "@/lib/vehicles";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    icon: CarIcon,
    title: "Reliable Vehicles",
    description:
      "Well-maintained Toyota and Mitsubishi models regularly inspected for city traffic and long provincial drives.",
  },
  {
    icon: ShieldIcon,
    title: "Transparent Rental Quotes",
    description:
      "Clear peso quotes confirmed upfront based on your route and schedule, with no surprise fees when you pick up your unit.",
  },
  {
    icon: CalendarIcon,
    title: "Flexible Booking",
    description:
      "Choose one-way or round-trip service with convenient pick-up and drop-off points across Metro Manila, Clark, and Cebu.",
  },
  {
    icon: PhoneIcon,
    title: "Customer Support",
    description:
      "Speak directly with our local team by phone or email daily from 6:00 AM to 10:00 PM for itinerary updates or assistance.",
  },
];

const recommendedSlugs: Record<string, string[]> = {
  "Airport Transfers": ["toyota-innova", "toyota-avanza"],
  "Family Vacations": ["toyota-innova", "mitsubishi-xpander"],
  "Out-of-Town Trips": ["toyota-fortuner", "mitsubishi-montero-sport"],
  "Business Transportation": ["toyota-vios", "toyota-fortuner"],
  "Group Tours": ["toyota-hiace-commuter", "toyota-innova"],
  "Special Occasions": ["toyota-fortuner", "toyota-innova"],
};

export function WhyChooseSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentService = services[activeIdx] ?? services[0];
  const recommended = vehicles.filter((v) =>
    (recommendedSlugs[currentService.title] ?? ["toyota-innova", "toyota-vios"]).includes(v.slug),
  );

  return (
    <section id="about" className="scroll-mt-16 bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-2xl"
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="inline-block h-0.5 w-6 bg-brand" />
            Why Choose CarTaxi PH?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Travel With Comfort. Arrive With Confidence.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Built for Filipino families, balikbayans, corporate travellers, and out-of-town road trips.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="group rounded-2xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-charcoal/30 hover:shadow-[0_20px_50px_-24px_rgba(17,17,17,0.18)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-charcoal text-white transition-colors duration-300 group-hover:bg-brand">
                <Icon width={22} height={22} />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-charcoal">{title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-muted">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Interactive Philippine Trip Recommender */}
        <div className="mt-16 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Trip Recommender
              </p>
              <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-charcoal">
                Match a vehicle to your Philippine trip
              </h3>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select trip scenario">
              {services.map((s, idx) => {
                const selected = idx === activeIdx;
                return (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveIdx(idx)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      selected
                        ? "bg-brand text-white shadow-sm"
                        : "border border-line bg-mist text-charcoal hover:border-charcoal/40"
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentService.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-charcoal lg:col-span-5">
                {currentService.image ? (
                  <Image
                    src={currentService.image}
                    alt={currentService.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-end bg-gradient-to-br from-charcoal to-ink p-6 text-white">
                    <SunIcon width={32} height={32} className="text-charcoal" />
                    <p className="mt-2 text-sm text-white/75">Boracay · El Nido · Siargao · Bohol</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7">
                <h4 className="text-xl font-bold text-charcoal">{currentService.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">{currentService.description}</p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                  Recommended Units
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {recommended.map((rv) => (
                    <Link
                      key={rv.slug}
                      href={`/fleet/${rv.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-mist/60 p-4 transition-all hover:border-charcoal/40 hover:bg-white"
                    >
                      <div>
                        <p className="font-semibold text-charcoal group-hover:text-ink">
                          {vehicleName(rv)}
                        </p>
                        <p className="text-xs text-muted">
                          {rv.passengers} seats · {rv.transmission}
                        </p>
                      </div>
                      <ArrowRightIcon
                        width={16}
                        height={16}
                        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
