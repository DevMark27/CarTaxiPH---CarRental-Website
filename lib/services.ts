/**
 * Travel scenarios shown across the site. Photos live in /public/images/scenes.
 */

export type Service = {
  title: string;
  description: string;
  image: string | null;
  alt: string;
};
export const services: Service[] = [
  {
    title: "Airport Transfers",
    description:
      "On-time pick-ups and drop-offs at NAIA, Clark and Mactan-Cebu. We track your flight so you never wait.",
    image: "/images/scenes/airport.jpg",
    alt: "Driver loading luggage into a white MPV at a Philippine airport",
  },
  {
    title: "Family Vacations",
    description:
      "Roomy seven-seaters for the whole family - from lola to the kids - plus all the pasalubong.",
    // Add /public/images/scenes/family.jpg and set it here when available.
    image: null,
    alt: "Filipino family on a beach vacation",
  },
  {
    title: "Out-of-Town Trips",
    description:
      "Tagaytay, Baguio, La Union, Batangas or Ilocos. Well-maintained units ready for long drives.",
    image: "/images/scenes/hero.jpg",
    alt: "White MPV on a scenic coastal road in the Philippines",
  },
  {
    title: "Business Transportation",
    description:
      "Professional chauffeured service for executives, clients and corporate events in Makati and BGC.",
    image: "/images/scenes/business.jpg",
    alt: "Businessman stepping out of a black SUV in Makati",
  },
  {
    title: "Group Tours",
    description:
      "15-seater HiAce Commuter vans with experienced drivers for tours, outings and team building.",
    image: "/images/scenes/group-tour.jpg",
    alt: "Tour group at the Chocolate Hills in Bohol with a white van",
  },
  {
    title: "Special Occasions",
    description:
      "Weddings, debuts and celebrations. Clean, elegant vehicles with courteous, well-groomed drivers.",
    image: "/images/scenes/occasion.jpg",
    alt: "Bride and groom beside a decorated white car outside a Spanish-era church",
  },
];
