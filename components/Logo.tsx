import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-bold tracking-tight text-white transition-transform duration-300 group-hover:scale-105">
        CT
      </span>
      <span className={`text-lg font-semibold tracking-tight ${inverted ? "text-white" : "text-charcoal"}`}>
        CarTaxi <span className="text-brand">PH</span>
      </span>
    </Link>
  );
}
