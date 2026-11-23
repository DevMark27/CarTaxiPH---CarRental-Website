"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CarIcon,
  ClockIcon,
  ShieldIcon,
} from "@/components/Icons";
import { type Vehicle } from "@/lib/vehicles";

const ease = [0.22, 1, 0.36, 1] as const;

const heroFeatures = [
  {
    icon: ClockIcon,
    title: "Available 24/7",
    description:
      "Send booking requests and inquiries anytime through our website. Plan your next trip whenever it is convenient for you.",
  },
  {
    icon: ShieldIcon,
    title: "Easy to Contact",
    description:
      "Have questions? Reach us through our available contact channels for booking assistance.",
  },
  {
    icon: CalendarIcon,
    title: "Quick Response",
    description:
      "We aim to respond promptly to your inquiries and help you with your reservation.",
  },
  {
    icon: CarIcon,
    title: "Trips Made Simple",
    description:
      "An easy and convenient booking experience for family vacations, group trips, business travel, and more.",
  },
];

export function HeroShowcase({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const vehicle = vehicles[selectedIndex] ?? vehicles[0];

  useEffect(() => {
    if (vehicles.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [vehicles.length, paused]);

  // Subtle desktop cursor parallax for the hero vehicle
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const carX = useSpring(rawX, { stiffness: 120, damping: 24 });
  const carY = useSpring(rawY, { stiffness: 120, damping: 24 });

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(nx * 12);
    rawY.set(ny * 6);
  }

  function handleMouseLeave() {
    setPaused(false);
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-white text-charcoal"
    >
      {/* Upper Hero Stage with Scenic Background & Overlapping Bottom SVG Wave */}
      <div className="relative overflow-hidden">
        {/* Bright scenic backdrop fading cleanly into white on the left */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-mist/70 to-white" />
          <div className="absolute inset-y-0 right-0 w-full opacity-20 lg:w-[68%] lg:opacity-30">
            <Image
              src="/images/scenes/hero.jpg"
              alt=""
              fill
              loading="eager"
              sizes="70vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/75" />
          </div>
          {/* Subtle brand red ambient glow behind vehicle */}
          <div className="absolute right-[18%] top-[22%] h-72 w-96 rounded-full bg-brand/10 blur-[110px]" />
        </div>

        {/* Main Hero Content (z-10 stays above the SVG wave) */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Eyebrow, 2-Line Headline, Subtitle, CTAs */}
          <div className="lg:col-span-5">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
            >
              Premium Car Rental Service
            </motion.p>

            <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl xl:text-[3.4rem]">
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.06, ease }}
                className="block"
              >
                Wherever Life Takes You,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14, ease }}
                className="block text-brand"
              >
                We&apos;re Ready to Go.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease }}
              className="mt-5 max-w-md text-base leading-7 text-muted sm:text-[17px]"
            >
              From family vacations and weekend getaways to group adventures and business trips, enjoy comfortable rides
              and a booking experience made simple.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href={`/book?vehicle=${vehicle.slug}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-10px_rgba(227,24,36,0.55)] transition-all duration-200 hover:scale-[1.03] hover:bg-brand-dark active:scale-[0.99]"
              >
                Book Your Ride
                <ArrowRightIcon width={16} height={16} />
              </Link>

              <Link
                href="/#fleet"
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-white/80 px-6 py-3.5 text-sm font-semibold text-charcoal transition-all duration-200 hover:border-ink hover:bg-white"
              >
                Explore Vehicles
              </Link>
            </motion.div>

            {/* Compact Model Switcher Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38, ease }}
              className="mt-9"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Featured Fleet · {vehicle.year} {vehicle.category}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5" role="tablist" aria-label="Featured hero vehicle">
                {vehicles.map((v, i) => {
                  const active = i === selectedIndex;
                  return (
                    <button
                      key={v.slug}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedIndex(i)}
                      className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-all duration-200 ${
                        active
                          ? "border-ink bg-ink text-white shadow-sm"
                          : "border-line bg-white/80 text-charcoal hover:border-charcoal/40 hover:bg-mist"
                      }`}
                    >
                      {v.make} {v.model}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Prominent Vehicle */}
          <div className="relative lg:col-span-7">
            <div className="relative flex flex-col items-center">
              {/* Ground shadow under the vehicle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[8%] left-[12%] right-[12%] hidden h-8 rounded-full bg-ink/25 blur-xl lg:block"
              />

              {/* Hero Vehicle */}
              <motion.div
                style={{ x: carX, y: carY }}
                className="relative z-10 mx-auto w-full max-w-2xl"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={vehicle.slug}
                    initial={{ opacity: 0, x: 32, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.98 }}
                    transition={{ duration: 0.5, ease }}
                    className="relative aspect-[4/3] w-full"
                  >
                    <Image
                      src={`/images/vehicles/${vehicle.slug}-hero.png`}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}, front three-quarter view`}
                      fill
                      preload
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="object-contain drop-shadow-[0_22px_35px_rgba(8,8,8,0.24)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
        </div>

        {/* Custom Asymmetrical SVG Wave Transition (above hero background, below interactive content) */}
        <motion.div
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.75, delay: 0.15, ease }}
          className="pointer-events-none absolute -bottom-px left-0 z-[5] w-full"
        >
          {/* Mobile: gentle, simplified asymmetrical wave */}
          <svg
            viewBox="0 0 600 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="block h-10 w-full sm:hidden"
          >
            <path
              d="M0 28C160 52 340 48 600 18V60H0V28Z"
              fill="#171717"
            />
          </svg>

          {/* Tablet & Desktop: smooth asymmetrical flowing Bézier wave */}
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="hidden h-14 w-full sm:block sm:h-16 md:h-20 lg:h-24"
          >
            <path
              d="M0 46C240 86 460 92 720 58C960 26 1180 14 1440 34V100H0V46Z"
              fill="#171717"
            />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Black Benefits Section (#171717) seamlessly connected to the SVG wave */}
      <div className="relative z-10 bg-[#171717] pb-12 pt-4 text-white sm:pb-14 sm:pt-6">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
            {heroFeatures.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease }}
                className="flex flex-col items-start lg:px-8 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-brand">
                  <Icon width={20} height={20} />
                </span>
                <h2 className="mt-4 text-base font-semibold tracking-tight text-white">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-light">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
