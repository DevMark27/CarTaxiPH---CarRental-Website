"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@/components/Icons";

const ease = [0.22, 1, 0.36, 1] as const;

const journeys = [
  {
    title: "Family Getaways",
    description: "Make family trips more comfortable with spacious and convenient rides.",
    image: "/images/scenes/airport.jpg",
    alt: "Family travel and airport pick-up",
  },
  {
    title: "Adventures with Friends",
    description: "Enjoy road trips, weekend escapes, and memorable group adventures.",
    image: "/images/scenes/group-tour.jpg",
    alt: "Group road trip adventure",
  },
  {
    title: "Couples and Special Occasions",
    description: "Make every destination part of a memorable experience.",
    image: "/images/scenes/occasion.jpg",
    alt: "Special occasion and weekend travel",
  },
  {
    title: "Business and Personal Travel",
    description: "Get convenient transportation for meetings, appointments, and everyday travel.",
    image: "/images/scenes/business.jpg",
    alt: "Business and city transportation",
  },
];

export function MadeForEveryJourneySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="about" className="scroll-mt-16 bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="inline-block h-0.5 w-6 bg-brand" />
              Made for Every Journey
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
              Comfortable Rides for Every Traveler
            </h2>
            <p className="mt-3 text-base text-muted">
              Whether you&apos;re planning a family vacation, a barkada road trip, or a city appointment, our fleet and
              drivers are ready to welcome you.
            </p>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 self-start rounded-full border border-charcoal/25 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition hover:border-ink hover:bg-ink hover:text-white sm:self-auto"
          >
            Start Booking
            <ArrowRightIcon width={14} height={14} />
          </Link>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journeys.map((item, i) => (
            <motion.article
              key={item.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white transition-colors duration-300 hover:border-charcoal/35 hover:shadow-[0_24px_54px_-24px_rgba(17,17,17,0.22)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-charcoal">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-charcoal transition-colors group-hover:text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
