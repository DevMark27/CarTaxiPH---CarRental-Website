"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@/components/Icons";

const ease = [0.22, 1, 0.36, 1] as const;

export function FinalCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-charcoal py-20 text-white sm:py-24">
      {/* Subtle automotive backdrop */}
      <Image
        src="/images/scenes/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-20"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-ink/85"
      />
      <motion.div
        aria-hidden="true"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease }}
        className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center"
      >
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <span className="inline-block h-0.5 w-6 bg-brand" />
            CarTaxi PH
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Your Next Journey Starts Here.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/75 sm:text-lg">
            Wherever you&apos;re headed, let us help make your journey comfortable and convenient.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-brand-dark"
          >
            Book Your Ride
            <ArrowRightIcon width={16} height={16} />
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
