import Link from "next/link";
import { site } from "@/lib/site";
import { categories, vehicles, vehicleName } from "@/lib/vehicles";
import { Logo } from "./Logo";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./Icons";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/#fleet", label: "Vehicles & Pricing" },
  { href: "/#about", label: "Why CarTaxi PH" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/book", label: "Book a Ride" },
];

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-16 border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-6 text-white/65">{site.description}</p>
          <div className="h-0.5 w-12 bg-brand" aria-hidden="true" />
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Categories
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
            {categories.map((c) => (
              <li key={c}>
                <Link
                  href="/#fleet"
                  className="inline-block rounded-full border border-white/15 px-3 py-1 transition-colors hover:border-white/50 hover:text-white"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Our Vehicles
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-white/65">
            {vehicles.map((v) => (
              <li key={v.slug}>
                <Link href={`/fleet/${v.slug}`} className="transition-colors hover:text-white">
                  {vehicleName(v)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Contact Us
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li className="flex gap-3">
              <PhoneIcon width={18} height={18} className="mt-0.5 shrink-0 text-white/70" />
              <a href={site.phoneHref} className="transition-colors hover:text-white">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MailIcon width={18} height={18} className="mt-0.5 shrink-0 text-white/70" />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <PinIcon width={18} height={18} className="mt-0.5 shrink-0 text-white/70" />
              {site.address}
            </li>
            <li className="flex gap-3">
              <ClockIcon width={18} height={18} className="mt-0.5 shrink-0 text-white/70" />
              {site.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {site.copyrightYear} {site.name}. All rights reserved.
          </p>
          <p>Serving travellers across Luzon, Visayas and Mindanao.</p>
        </div>
      </div>
    </footer>
  );
}
