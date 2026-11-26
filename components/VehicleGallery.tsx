"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CarIcon } from "./Icons";

export type GallerySide = {
  src: string | null;
  alt: string;
  label: string;
};

export function VehicleGallery({ images, label }: { images: GallerySide[]; label: string }) {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const current = images[active] ?? images[0];

  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setActive((i) => (i + 1) % images.length);
  }

  return (
    <div>
      {/* Main Studio-Style Vehicle Display */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-mist">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${current.src ?? "placeholder"}`}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="relative h-full w-full"
          >
            {current.src ? (
              <Image
                src={current.src}
                alt={current.alt}
                fill
                preload
                sizes="(min-width: 1024px) 60vw, 100vw"
                className={current.src.endsWith(".png") ? "object-contain p-4 sm:p-8" : "object-cover"}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-white text-muted">
                  <CarIcon width={28} height={28} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{current.label}</p>
                  <p className="mt-1 text-xs text-muted">Photo for this angle is coming soon</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Angle label badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink shadow-xs">
          {current.label}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous vehicle angle"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-brand hover:text-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next vehicle angle"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-brand hover:text-white"
            >
              ›
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* 4-Side Angle Thumbnails Row */}
      <div
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="tablist"
        aria-label={`${label} 4-side exterior views`}
      >
        {images.map((img, i) => {
          const selected = i === active;
          return (
            <button
              key={img.label}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={img.label}
              onClick={() => setActive(i)}
              className={`group overflow-hidden rounded-2xl border-2 bg-mist text-left transition-all ${
                selected ? "border-brand shadow-sm" : "border-line hover:border-charcoal/40"
              }`}
            >
              <div className="relative aspect-[4/3] w-full">
                {img.src ? (
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="180px"
                    className={img.src.endsWith(".png") ? "object-contain p-2" : "object-cover"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <CarIcon width={22} height={22} />
                  </div>
                )}
              </div>
              <span
                className={`block truncate border-t border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold ${
                  selected ? "font-semibold text-ink" : "text-muted group-hover:text-ink"
                }`}
              >
                {img.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
