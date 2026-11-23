import Image from "next/image";
import Link from "next/link";
import { vehicleName, type Vehicle } from "@/lib/vehicles";
import { ArrowRightIcon, GearIcon, KeyIcon, UsersIcon } from "./Icons";

export function VehicleCard({ vehicle, preload = false }: { vehicle: Vehicle; preload?: boolean }) {
  const cover = vehicle.images[0];
  return (
    <Link
      href={`/fleet/${vehicle.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-[0_24px_60px_-24px_rgba(17,17,17,0.22)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          preload={preload}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-charcoal/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {vehicle.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{vehicleName(vehicle)}</h3>
          <span className="text-xs font-medium text-muted">{vehicle.year}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{vehicle.variant}</p>

        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-line py-3.5 text-xs font-medium text-ink/80">
          <li className="flex items-center gap-1.5">
            <UsersIcon width={15} height={15} className="shrink-0 text-muted" />
            {vehicle.passengers} seats
          </li>
          <li className="flex items-center gap-1.5">
            <GearIcon width={15} height={15} className="shrink-0 text-muted" />
            {vehicle.transmission}
          </li>
          <li className="col-span-2 flex items-center gap-1.5">
            <KeyIcon width={15} height={15} className="shrink-0 text-muted" />
            {vehicle.arrangements.join(" or ")}
          </li>
        </ul>

        <div className="mt-5 flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Rental Rate</p>
            <p className="text-sm font-semibold tracking-tight text-ink">Quote on request</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-brand">
            View Details
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
