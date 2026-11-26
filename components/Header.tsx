"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export { Logo };

const nav = [
  { href: "/", label: "Home" },
  { href: "/#fleet", label: "Vehicles" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About Us" },
  { href: "/#contact", label: "Contact Us" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function isNavActive(href: string) {
    if (href === "/") {
      return pathname === "/" && !activeHash;
    }
    if (href.startsWith("/#")) {
      return pathname === "/" && activeHash === href.slice(1);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleNavClick(href: string) {
    if (href.startsWith("/#")) {
      setActiveHash(href.slice(1));
    } else {
      setActiveHash("");
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/15 bg-ink/95 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md"
          : "border-b border-white/10 bg-ink/85 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo inverted />

        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-white/85 lg:flex">
          {nav.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-brand after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100 ${
                  active ? "font-semibold text-white after:scale-x-100" : "after:scale-x-0"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center lg:flex">
          <Link
            href="/book"
            className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.99] ${
              pathname === "/book"
                ? "bg-brand-dark ring-2 ring-white/40"
                : "bg-brand hover:bg-brand-dark"
            }`}
          >
            Book Now
          </Link>
        </div>

        {/* Mobile / tablet hamburger menu */}
        <details className="group relative lg:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:border-white/40 [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
              <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/15 bg-charcoal p-3 shadow-2xl">
            {nav.map((item) => {
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-l-2 border-brand bg-white/10 font-semibold text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={site.phoneHref}
              className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              Call {site.phone}
            </a>
            <Link
              href="/book"
              className="mt-2 block rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Book Now
            </Link>
          </div>
        </details>
      </div>
    </motion.header>
  );
}
