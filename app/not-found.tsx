import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-4 text-muted">The page or vehicle you&apos;re looking for isn&apos;t available.</p>
      <Link href="/#fleet" className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
        Browse Vehicles
      </Link>
    </section>
  );
}

