/**
 * VEHICLE CATALOG
 * ---------------------------------------------------------------------------
 * This is the single source of truth for every vehicle on the website.
 * Each vehicle has its OWN specifications - edit them to match the exact
 * units in your fleet (model year, seating, transmission, fuel, arrangement
 * and price). Values below are starting examples and should be confirmed
 * by the business owner before going live.
 *
 * Images live in /public/images/vehicles. Keep all vehicle photos in the
 * same 4:3 landscape proportion so cards and galleries stay consistent.
 */

export const categories = ["Sedan", "MPV", "SUV", "Passenger Van"] as const;
export type Category = (typeof categories)[number];

export const categoryInfo: Record<
  Category,
  { slug: string; blurb: string }
> = {
  Sedan: {
    slug: "sedan",
    blurb: "Fuel-efficient and easy to park. Ideal for city driving and solo or couple travel.",
  },
  MPV: {
    slug: "mpv",
    blurb: "Seven seats and flexible cargo space for families, balikbayans and barkada trips.",
  },
  SUV: {
    slug: "suv",
    blurb: "High ground clearance and strong diesel engines for provincial roads and long drives.",
  },
  "Passenger Van": {
    slug: "passenger-van",
    blurb: "Up to 15 passengers for group tours, company outings and airport shuttles.",
  },
};

export type RentalArrangement = "One-way" | "Round trip";

export type Vehicle = {
  slug: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  category: Category;
  passengers: number;
  transmission: "Automatic" | "Manual";
  fuel: "Gasoline" | "Diesel";
  /** Rental arrangements offered for this unit. */
  arrangements: RentalArrangement[];
  /** Rental price in Philippine pesos. */
  price: number;
  /** What the price covers, e.g. "day" (24 hours) or "12 hours". */
  priceUnit: string;
  /** Optional add-on rate when a driver is requested (per day). */
  driverRate?: number;
  /** Optional note shown under the price, e.g. what the rate includes. */
  priceNote?: string;
  luggage: string;
  color: string;
  idealFor: string[];
  summary: string;
  /** Exterior photos. The first image is used as the card / cover photo. */
  images: { src: string; alt: string }[];
  /** Optional custom hero cutout path (overrides /images/vehicles/<slug>-hero.png). */
  heroImage?: string;
  featured?: boolean;
  /** Whether the unit is currently available for booking (defaults to true). */
  available?: boolean;
  /** Whether the unit is air-conditioned (defaults to true). */
  airConditioned?: boolean;
};

/**
 * Builds an exterior gallery from files named `<slug>-1.jpg`, `<slug>-2.jpg`, ...
 * in /public/images/vehicles. Increase `count` when you add more photos.
 * Recommended order: 1 = front three-quarter, 2 = side profile, 3 = rear three-quarter.
 */
const angleLabels = ["front three-quarter view", "side profile", "rear three-quarter view"];
const gallery = (slug: string, name: string, color: string, count = 1) =>
  Array.from({ length: count }, (_, i) => ({
    src: `/images/vehicles/${slug}-${i + 1}.jpg`,
    alt: `${color} ${name}, ${angleLabels[i] ?? `exterior photo ${i + 1}`}`,
  }));

export const vehicles: Vehicle[] = [
  {
    slug: "toyota-raize",
    make: "Toyota",
    model: "Raize",
    variant: "1.2 G CVT",
    year: 2024,
    category: "Sedan",
    passengers: 5,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 2500,
    priceUnit: "day",
    luggage: "2–3 large bags",
    color: "Silver Metallic",
    idealFor: ["City driving", "Weekend getaways", "Airport transfers"],
    summary:
      "A nimble, fuel-efficient 5-seat crossover SUV built for Metro Manila streets and weekend escapes—easy to park with raised ground clearance.",
    images: [{ src: "/images/vehicles/toyota-raize-silver-1.jpg", alt: "Silver Toyota Raize, front three-quarter view" }],
    heroImage: "/images/vehicles/toyota-raize-silver-hero.png",
    featured: true,
  },
  {
    slug: "toyota-veloz",
    make: "Toyota",
    model: "Veloz",
    variant: "1.5 V CVT",
    year: 2024,
    category: "MPV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 3000,
    priceUnit: "day",
    luggage: "3 large bags",
    color: "Dark Silver Metallic",
    idealFor: ["Family vacations", "Business trips", "Out-of-town trips"],
    summary:
      "A stylish, well-appointed 7-seat MPV with modern cabin tech, comfortable three-row seating, and smooth highway manners.",
    images: gallery("toyota-veloz", "Toyota Veloz", "Dark Silver"),
    featured: true,
  },
  {
    slug: "toyota-innova",
    make: "Toyota",
    model: "Innova",
    variant: "2.8 E Diesel AT",
    year: 2024,
    category: "MPV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    arrangements: ["One-way", "Round trip"],
    price: 3500,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "3–4 large bags",
    color: "Silver Metallic",
    idealFor: ["Family vacations", "Airport transfers", "Out-of-town trips"],
    summary:
      "The Philippines' favourite family MPV. A torquey 2.8L diesel, comfortable captain-style seating and generous luggage space make the Innova the go-to choice for long provincial drives and airport runs.",
    images: gallery("toyota-innova", "Toyota Innova", "Silver"),
    featured: true,
  },
  {
    slug: "toyota-vios",
    make: "Toyota",
    model: "Vios",
    variant: "1.3 XLE CVT",
    year: 2024,
    category: "Sedan",
    passengers: 5,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 2000,
    priceUnit: "day",
    driverRate: 1200,
    luggage: "2 large bags",
    color: "Pearl White",
    idealFor: ["City driving", "Business trips", "Couples"],
    summary:
      "Economical, dependable and easy to drive through Metro Manila traffic. The Vios is a smart, fuel-efficient sedan for errands, meetings and weekend getaways.",
    images: gallery("toyota-vios", "Toyota Vios", "White"),
    featured: true,
  },
  {
    slug: "mitsubishi-xpander",
    make: "Mitsubishi",
    model: "Xpander",
    variant: "GLS 1.5 AT",
    year: 2024,
    category: "MPV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 2800,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "2–3 large bags",
    color: "Graphite Gray",
    idealFor: ["Family vacations", "Barkada trips", "City tours"],
    summary:
      "Modern styling, a smooth ride and a roomy three-row cabin. The Xpander balances fuel economy with space for the whole family.",
    images: gallery("mitsubishi-xpander", "Mitsubishi Xpander", "Gray"),
    featured: true,
  },
  {
    slug: "toyota-avanza",
    make: "Toyota",
    model: "Avanza",
    variant: "1.5 G CVT",
    year: 2024,
    category: "MPV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 2500,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "2–3 large bags",
    color: "Black Metallic",
    idealFor: ["Family outings", "Airport transfers", "Budget group travel"],
    summary:
      "An affordable seven-seater with a practical, easy-to-drive package. The Avanza is perfect for families who want space without the bigger running costs.",
    images: gallery("toyota-avanza", "Toyota Avanza", "Black", 2),
    featured: true,
  },
  {
    slug: "toyota-hiace-commuter",
    make: "Toyota",
    model: "HiAce Commuter",
    variant: "Deluxe 2.8 Diesel MT",
    year: 2024,
    category: "Passenger Van",
    passengers: 15,
    transmission: "Manual",
    fuel: "Diesel",
    arrangements: ["One-way", "Round trip"],
    price: 5500,
    priceUnit: "day",
    priceNote: "Rate includes a professional driver (up to 12 hours). Fuel, tolls and parking not included.",
    luggage: "8–10 large bags",
    color: "White",
    idealFor: ["Group tours", "Company outings", "Airport shuttles"],
    summary:
      "The trusted workhorse for group travel. Seats up to 15 passengers with a professional driver - ideal for tours, team outings, weddings and airport shuttles.",
    images: gallery("toyota-hiace-commuter", "Toyota HiAce Commuter", "White", 2),
  },
  {
    slug: "toyota-fortuner",
    make: "Toyota",
    model: "Fortuner",
    variant: "2.4 G Diesel 4x2 AT",
    year: 2024,
    category: "SUV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    arrangements: ["One-way", "Round trip"],
    price: 4500,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "3 large bags",
    color: "White Pearl",
    idealFor: ["Business transportation", "Out-of-town trips", "Special occasions"],
    summary:
      "Commanding presence and a refined cabin. The Fortuner is a premium seven-seat SUV that handles both executive transport and mountain roads with ease.",
    images: gallery("toyota-fortuner", "Toyota Fortuner", "White", 2),
  },
  {
    slug: "mitsubishi-montero-sport",
    make: "Mitsubishi",
    model: "Montero Sport",
    variant: "GLS 2WD AT",
    year: 2024,
    category: "SUV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    arrangements: ["One-way", "Round trip"],
    price: 4500,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "3 large bags",
    color: "Graphite Gray",
    idealFor: ["Out-of-town trips", "Business travel", "Family road trips"],
    summary:
      "A comfortable, well-equipped diesel SUV with an 8-speed automatic. Great for long drives to Baguio, Batangas or the Ilocos region.",
    images: gallery("mitsubishi-montero-sport", "Mitsubishi Montero Sport", "Gray"),
  },
  {
    slug: "toyota-rush",
    make: "Toyota",
    model: "Rush",
    variant: "1.5 G AT",
    year: 2024,
    category: "SUV",
    passengers: 7,
    transmission: "Automatic",
    fuel: "Gasoline",
    arrangements: ["One-way", "Round trip"],
    price: 2800,
    priceUnit: "day",
    driverRate: 1500,
    luggage: "2 large bags",
    color: "Silver Metallic",
    idealFor: ["Family trips", "City and provincial driving", "Weekend getaways"],
    summary:
      "A compact seven-seat SUV with raised ground clearance - easy to drive in the city and confident on provincial roads.",
    images: gallery("toyota-rush", "Toyota Rush", "Silver"),
  },
];

export const vehicleName = (v: Vehicle) => `${v.make} ${v.model}`;

export const getVehicle = (slug: string) => vehicles.find((v) => v.slug === slug);

export const featuredVehicles = vehicles.filter((v) => v.featured);

export const vehiclesByCategory = (category: Category) =>
  vehicles.filter((v) => v.category === category);

export const isVehicleAvailable = (v: Vehicle) => v.available !== false;

export const hasAirConditioning = (v: Vehicle) => v.airConditioned !== false;

export function calculateRentalDays(start?: string | null, end?: string | null): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;
  const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
