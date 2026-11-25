"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/Icons";
import type { GoogleReviewItem } from "@/lib/reviews";
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
  const [reviewsData, setReviewsData] = useState<{
    configured: boolean;
    rating: number | null;
    totalRatings: number | null;
    reviews: GoogleReviewItem[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.configured && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsData(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const hasLiveReviews = Boolean(reviewsData?.configured && reviewsData.reviews.length > 0);

  return (
    <section id="reviews" className="scroll-mt-16 border-t border-line bg-white py-20 sm:py-24">
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
            {hasLiveReviews && reviewsData?.rating ? (
              <p className="mt-3 text-base text-muted">
                Rated <strong className="text-ink">{reviewsData.rating.toFixed(1)} / 5</strong> on Google Reviews
                {reviewsData.totalRatings ? ` (${reviewsData.totalRatings} reviews)` : ""}.
              </p>
            ) : (
              <p className="mt-3 text-base text-muted">
                Verified customer reviews from Google Reviews will appear here once connected. Meanwhile, every trip is
                backed by our core service standards.
              </p>
            )}
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

        {hasLiveReviews && reviewsData ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviewsData.reviews.slice(0, 6).map((rev, i) => (
              <motion.figure
                key={`${rev.authorName}-${i}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.06, ease }}
                className="flex flex-col justify-between rounded-2xl border border-line bg-mist/30 p-7 transition-colors hover:border-brand/40 hover:bg-white"
              >
                <div>
                  <p className="text-sm font-bold text-brand" aria-label={`${rev.rating} out of 5 stars`}>
                    {"★".repeat(Math.max(1, Math.min(5, Math.round(rev.rating))))}
                  </p>
                  <blockquote className="mt-3 text-sm leading-6 text-charcoal/85">
                    &ldquo;{rev.text}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <p className="text-sm font-semibold text-charcoal">{rev.authorName}</p>
                  <p className="text-xs text-muted">{rev.relativeTimeDescription}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {trustHighlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease }}
                className="group rounded-2xl border border-line bg-mist/40 p-7 transition-colors duration-300 hover:border-brand/40 hover:bg-white hover:shadow-[0_20px_48px_-24px_rgba(17,17,17,0.18)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-charcoal text-white transition-colors duration-300 group-hover:bg-brand">
                  {i === 0 ? <ShieldIcon width={19} height={19} /> : <CheckIcon width={19} height={19} />}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line bg-mist/25 px-6 py-4 text-xs text-muted">
          <span>
            {hasLiveReviews
              ? "Verified customer feedback powered by Google Reviews."
              : "Google Reviews feed ready to connect when GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are set."}
          </span>
          <Link href="/book" className="font-semibold text-brand hover:underline">
            Start a reservation →
          </Link>
        </div>
      </div>
    </section>
  );
}
