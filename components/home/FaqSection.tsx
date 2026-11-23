"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const faqs = [
  {
    q: "How do I book a vehicle?",
    a: "Choose a vehicle from our Vehicles section, click Book or View Details, and complete the 5-step reservation wizard with your trip schedule, contact details, and identification document.",
  },
  {
    q: "Are your vehicles available for family trips?",
    a: "Yes. We welcome families, barkadas, couples, tourists, and business travelers, with spacious 7-seater MPVs, SUVs, sedans, and 15-seater passenger vans.",
  },
  {
    q: "Do you provide a driver?",
    a: "Yes. All CarTaxi PH rentals are provided with a professional driver only. Our administrator assigns your driver once your booking is confirmed.",
  },
  {
    q: "How can I confirm my reservation?",
    a: "After submitting your request, your reservation starts with a Pending Admin Confirmation status. Our team reviews your schedule and ID, then sends your confirmation.",
  },
  {
    q: "When do I need to make payment?",
    a: "No payment is required during initial booking submission. Because pricing is based on trip distance, the owner will declare your quote and provide payment instructions via WhatsApp or email after confirmation.",
  },
  {
    q: "How can I contact your team?",
    a: "You can reach us through our phone number, email, or WhatsApp link listed in the website header, hero, and footer.",
  },
  {
    q: "Can I submit a booking request anytime?",
    a: "Yes. You can submit online booking requests and inquiries 24/7 through our website, and our team will respond promptly during review.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-16 border-t border-line bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease }}
          className="text-center"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <span className="inline-block h-0.5 w-6 bg-brand" />
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-muted">
            Everything you need to know about booking a ride with CarTaxi PH.
          </p>
        </motion.div>

        <div className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-mist/40"
                >
                  <span className="text-sm font-semibold text-charcoal sm:text-base">{item.q}</span>
                  <motion.span
                    animate={prefersReducedMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease }}
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors ${
                      isOpen
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-mist text-charcoal"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-6 text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
