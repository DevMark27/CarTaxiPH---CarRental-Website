"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/Icons";
import { site } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const trustHighlights = [
  {
    title: "With Professional Driver",
    description: "Every reservation includes an experienced, vetted driver assigned by our team.",
  },
  {
    title: "Distance-Based Transparency",
    description: "Clear quotations declared directly by the owner via WhatsApp before payment.",
  },
  {
    title: "Inspected & Clean Units",
    description: "Toyota and Mitsubishi vehicles maintained for city and provincial comfort.",
  },
];

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="border-t border-line bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="inline-block h-0.5 w-6 bg-brand" />
              Customer Trust
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Experiences That Keep Us Moving
            </h2>
            <p className="mt-3 text-base text-muted">
              Verified customer reviews from Google Reviews will appear here once connected. Meanwhile, every trip is
              backed by our core service standards.
            </p>
          </div>

          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-full border border-charcoal/25 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition hover:border-brand hover:bg-brand hover:text-white lg:self-auto"
          >
            Ask Us on WhatsApp
            <ArrowRightIcon width={14} height={14} />
          </a>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {trustHighlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              className="rounded-2xl border border-line bg-mist/40 p-7"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-charcoal text-white">
                {i === 0 ? <ShieldIcon width={19} height={19} /> : <CheckIcon width={19} height={19} />}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-charcoal">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-mist/25 px-6 py-4 text-xs text-muted">
          <span>Google Reviews feed ready to connect when live review integration is enabled.</span>
          <Link href="/#reserve" className="font-semibold text-brand hover:underline">
            Start a reservation →
          </Link>
        </div>
      </div>
    </section>
  );
}
