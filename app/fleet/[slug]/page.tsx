import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleGallery, type GallerySide } from "@/components/VehicleGallery";
import { VehicleReserveCard } from "@/components/VehicleReserveCard";
import {
  BagIcon,
  CalendarIcon,
  CarIcon,
  CheckIcon,
  FuelIcon,
  GearIcon,
  KeyIcon,
  PaletteIcon,
  SunIcon,
  UsersIcon,
} from "@/components/Icons";
import {
  getVehicle,
  hasAirConditioning,
  vehicleName,
  vehicles,
} from "@/lib/vehicles";

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) return {};
  return {
    title: `${vehicleName(v)} ${v.year} Rental`,
    description: `Rent a ${v.year} ${vehicleName(v)} (${v.category}, ${v.passengers} seats, ${v.transmission}). ${v.arrangements.join(" or ")}.`,
    openGraph: { images: [v.images[0].src] },
  };
}

const inclusions = [
  "Comprehensive insurance",
  "24/7 roadside assistance",
  "Regular preventive maintenance",
  "Sanitised before every trip",
];

const conditions = [
  "Valid driver's license & government ID required",
  "Fuel policy: return with same fuel level",
  "Smoke-free vehicle cabin",
  "Rate confirmed by our team prior to dispatch",
];

export default function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="h-96 animate-pulse rounded-3xl bg-mist" />
        </div>
      }
    >
      <VehicleDetails params={params} />
    </Suspense>
  );
}

async function VehicleDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) notFound();

  const name = vehicleName(v);
  const related = vehicles.filter((o) => o.slug !== v.slug && o.category === v.category);
  const others = related.length > 0 ? related : vehicles.filter((o) => o.slug !== v.slug).slice(0, 4);

  const publicIfExists = (relPath: string) =>
    fs.existsSync(path.join(process.cwd(), "public", relPath)) ? relPath : null;

  const side2 = publicIfExists(`/images/vehicles/${v.slug}-2.jpg`);
  const side3 = publicIfExists(`/images/vehicles/${v.slug}-3.jpg`);
  const side4 =
    publicIfExists(`/images/vehicles/${v.slug}-4.jpg`) ??
    publicIfExists(`/images/vehicles/${v.slug}-hero.png`);

  const galleryImages: GallerySide[] = [
    {
      src: v.images[0].src,
      alt: `${v.year} ${name}, front view`,
      label: "Front View",
    },
    {
      src: side2,
      alt: `${v.year} ${name}, side profile`,
      label: "Side Profile",
    },
    {
      src: side3,
      alt: `${v.year} ${name}, rear view`,
      label: "Rear View",
    },
    {
      src: side4,
      alt: `${v.year} ${name}, 3/4 studio view`,
      label: "3/4 View",
    },
  ];

  const specs = [
    { icon: CarIcon, label: "Category", value: v.category },
    { icon: UsersIcon, label: "Passengers", value: `${v.passengers} seats` },
    { icon: GearIcon, label: "Transmission", value: v.transmission },
    { icon: FuelIcon, label: "Fuel type", value: v.fuel },
    { icon: KeyIcon, label: "Rental arrangement", value: v.arrangements.join(" or ") },
    { icon: CalendarIcon, label: "Model year", value: String(v.year) },
    { icon: BagIcon, label: "Luggage", value: v.luggage },
    { icon: SunIcon, label: "Air conditioning", value: hasAirConditioning(v) ? "Air-conditioned" : "Standard" },
    { icon: PaletteIcon, label: "Color", value: v.color },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/#fleet" className="hover:text-ink">Vehicles</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/#fleet" className="hover:text-ink">{v.category}</Link></li>
            <li aria-hidden>/</li>
            <li className="font-medium text-ink">{name}</li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
        <VehicleGallery images={galleryImages} label={name} />

        <div className="lg:pt-2">
          <span className="inline-block rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            {v.category}
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{name}</h1>
          <p className="mt-2 text-lg text-muted">
            {v.year} · {v.variant}
          </p>

          <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-3xl bg-mist" />}>
            <VehicleReserveCard vehicle={v} />
          </Suspense>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                  <Icon width={15} height={15} /> {label}
                </dt>
                <dd className="mt-1.5 font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">About the {name}</h2>
          <p className="mt-4 text-lg leading-8 text-ink/80">{v.summary}</p>
          <h3 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted">Ideal for</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {v.idealFor.map((use) => (
              <li key={use} className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-ink">{use}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-mist p-7">
            <h3 className="font-semibold text-ink">Rental inclusions</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/80">
              {inclusions.map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand" />
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-white p-7">
            <h3 className="font-semibold text-ink">Rental conditions</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {conditions.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {related.length > 0 ? `More ${v.category} options` : "You may also like"}
            </h2>
            <Link href="/#fleet" className="text-sm font-semibold text-ink hover:text-brand">View all</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {others.map((o) => (
              <VehicleCard key={o.slug} vehicle={o} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
