import Link from "next/link";
import { site } from "@/lib/site";

export function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 print:hidden">
      <Link
        href="/book"
        className="rounded-full bg-brand px-4 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-brand-dark active:scale-95 md:hidden"
      >
        Book Now
      </Link>
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact me on WhatsApp"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-700 active:scale-95"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.78 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.18-4.94-4.38-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.96.3.15.5.22.57.34.07.12.07.7-.17 1.38Z" />
        </svg>
        <span className="hidden sm:inline">Contact me on WhatsApp</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
    </div>
  );
}
