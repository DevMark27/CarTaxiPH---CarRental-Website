import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  void inverted;
  return (
    <Link href="/" className="group flex items-center" aria-label={`${site.name} home`}>
      <Image
        src="/images/cartaxiph-logo.png"
        alt={`${site.name} logo`}
        width={180}
        height={112}
        priority
        className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-12"
      />
    </Link>
  );
}
