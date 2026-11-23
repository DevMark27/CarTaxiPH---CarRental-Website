"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, CalendarIcon, CarIcon, ShieldIcon } from "@/components/Icons";
import { site } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: "01",
    icon: CarIcon,
    title: "Choose Your Vehicle",
    description: "Browse our fleet and select the unit that fits your group and luggage.",
    tip: "Compare sedans, 7-seater MPVs, SUVs, and 15-seater vans by passenger capacity, transmission, and cabin comfort.",
    ctaLabel: "Explore Vehicles",
    ctaHref: "/#fleet",
    external: false,
  },
  {
    num: "02",
    icon: CalendarIcon,
    title: "Complete Your Reservation",
    description: "Share your pick-up schedule, route, and ID in our 5-step guided wizard.",
    tip: "Every rental includes a professional driver. Submit your booking with zero upfront payment required.",
    ctaLabel: "Start Reservation",
    ctaHref: "/#reserve",
    external: false,
  },
  {
    num: "03",
    icon: ShieldIcon,
    title: "Confirm & Hit the Road",
    description: "Our team verifies your booking, assigns your driver, and sends your quote.",
    tip: "Pricing is based on your trip distance and declared directly by the owner via WhatsApp before dispatch.",
    ctaLabel: "Chat on WhatsApp",
    ctaHref: site.whatsappHref,
    external: true,
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileLineRef = useRef<HTMLDivElement>(null);
  const [selectedStep, setSelectedStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setSelectedStep((prev) => (prev + 1) % steps.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (mobileLineRef.current) {
        gsap.fromTo(
          mobileLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const currentTip = steps[selectedStep] ?? steps[0];
  const trackPercent = selectedStep === 0 ? 0 : selectedStep === 1 ? 50 : 100;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="scroll-mt-16 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="inline-block h-0.5 w-6 bg-brand" />
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Your Journey Starts Here
            </h2>
            <p className="mt-3 text-base text-muted">
              Three simple steps from picking your vehicle to riding with a professional driver.
            </p>
          </div>

          {/* Interactive Step Pills */}
          <div className="hidden items-center gap-1.5 rounded-full border border-line bg-mist/60 p-1 md:inline-flex" role="tablist" aria-label="How it works steps">
            {steps.map((s, i) => {
              const active = selectedStep === i;
              return (
                <button
                  key={s.num}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedStep(i)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active ? "bg-brand text-white shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Step {s.num}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Desktop Interactive Route Track & Cards */}
        <div className="relative mt-12 hidden md:block">
          {/* Interactive Progress Track with Gliding Car */}
          <div className="relative mx-auto mb-10 h-10 w-[calc(100%-8rem)]">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line" />
            <motion.div
              initial={false}
              animate={{ scaleX: trackPercent / 100 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease }}
              style={{ originX: 0 }}
              className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-brand"
            />

            {/* Step Waypoint Dots */}
            {[0, 50, 100].map((pos, idx) => (
              <button
                key={pos}
                type="button"
                onClick={() => setSelectedStep(idx)}
                aria-label={`Jump to step ${idx + 1}`}
                style={{ left: `${pos}%` }}
                className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors ${
                  idx <= selectedStep ? "border-brand bg-brand" : "border-line bg-white hover:border-charcoal"
                }`}
              />
            ))}

            {/* Animated Car Marker */}
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{ left: `${trackPercent}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-ink text-white shadow-md"
            >
              {!prefersReducedMotion && (
                <motion.span
                  animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 rounded-full border border-brand"
                />
              )}
              <CarIcon width={18} height={18} />
            </motion.div>
          </div>

          <ol className="grid grid-cols-3 gap-6">
            {steps.map((s, i) => {
              const active = selectedStep === i;
              const Icon = s.icon;
              return (
                <motion.li
                  key={s.num}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setSelectedStep(i)}
                    aria-pressed={active}
                    whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className={`relative flex h-full w-full flex-col rounded-2xl border p-7 text-left transition-colors duration-200 ${
                      active
                        ? "border-brand bg-mist/60 shadow-[0_20px_50px_-24px_rgba(227,24,36,0.28)]"
                        : "border-line bg-white shadow-xs hover:border-charcoal/35"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors ${
                          active ? "bg-brand" : "bg-charcoal"
                        }`}
                      >
                        <Icon width={20} height={20} />
                      </span>
                      <span className={`font-mono text-xs font-bold ${active ? "text-brand" : "text-muted"}`}>
                        {s.num}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-charcoal">{s.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted">{s.description}</p>
                  </motion.button>
                </motion.li>
              );
            })}
          </ol>

          {/* Interactive Step Spotlight Banner */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip.num}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease }}
              className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-mist/60 px-6 py-4 text-sm text-charcoal"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-bold text-white">
                  Step {currentTip.num}
                </span>
                <p className="text-muted">{currentTip.tip}</p>
              </div>
              {currentTip.external ? (
                <a
                  href={currentTip.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  {currentTip.ctaLabel}
                  <ArrowRightIcon width={14} height={14} />
                </a>
              ) : (
                <Link
                  href={currentTip.ctaHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  {currentTip.ctaLabel}
                  <ArrowRightIcon width={14} height={14} />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Interactive Vertical Timeline */}
        <div className="relative mt-10 pl-8 md:hidden">
          <div className="absolute bottom-4 left-3 top-4 w-0.5 rounded-full bg-charcoal/15" />
          <div
            ref={mobileLineRef}
            className="absolute bottom-4 left-3 top-4 w-0.5 origin-top rounded-full bg-brand"
          />
          <ol className="space-y-4">
            {steps.map((s, i) => {
              const active = selectedStep === i;
              return (
                <motion.li
                  key={s.num}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedStep(i)}
                    aria-expanded={active}
                    className={`relative w-full rounded-2xl border p-5 text-left transition-colors ${
                      active ? "border-brand bg-mist/50 shadow-sm" : "border-line bg-white shadow-xs"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[25px] top-6 h-3 w-3 rounded-full border-2 border-white transition-colors ${
                        active ? "bg-brand" : "bg-charcoal"
                      }`}
                    />
                    <span className={`text-xs font-bold uppercase tracking-wider ${active ? "text-brand" : "text-muted"}`}>
                      Step {s.num}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold text-charcoal">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted">{s.description}</p>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.p
                          initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2.5 overflow-hidden border-t border-line pt-2.5 text-xs leading-5 text-ink/80"
                        >
                          {s.tip}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
