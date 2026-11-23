import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";
import { MotionProvider } from "@/components/MotionProvider";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { FleetShowcase } from "@/components/home/FleetShowcase";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MadeForEveryJourneySection } from "@/components/home/MadeForEveryJourneySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { site } from "@/lib/site";
import { vehicles } from "@/lib/vehicles";

const heroSlugs = [
  "toyota-raize",
  "toyota-veloz",
  "toyota-innova",
  "mitsubishi-xpander",
  "toyota-avanza",
];
const heroVehicles = heroSlugs
  .map((s) => vehicles.find((v) => v.slug === s))
  .filter((v): v is NonNullable<typeof v> => Boolean(v));

export default function Home() {
  return (
    <MotionProvider>
      {/* 1. Light Editorial Hero with Preserved SVG Wave & 4 Service Highlights */}
      <HeroShowcase vehicles={heroVehicles} />

      {/* 2. Find the Perfect Ride for Every Journey */}
      <FleetShowcase />

      {/* 3. Made for Every Journey */}
      <MadeForEveryJourneySection />

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. 5-Stage Guided Reservation Wizard */}
      <section id="reserve" className="relative z-20 scroll-mt-16 border-b border-line bg-mist/40">
        <div className="bg-[#151515] text-white">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-10 sm:px-8 sm:py-12 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Reservation</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Let&apos;s get you on the road.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
                Complete your trip details below—our team confirms availability and assigns your professional driver.
              </p>
            </div>
            <p className="text-xs text-white/60">
              Need help?{" "}
              <a href={site.phoneHref} className="font-semibold text-white underline-offset-4 hover:underline">
                {site.phone}
              </a>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
            <BookingForm defaultVehicleSlug="toyota-raize" />
          </Suspense>
        </div>
      </section>

      {/* 6. Experiences That Keep Us Moving */}
      <TestimonialsSection />

      {/* 7. Frequently Asked Questions */}
      <FaqSection />

      {/* 8. Final Call-to-Action */}
      <FinalCtaSection />
    </MotionProvider>
  );
}
