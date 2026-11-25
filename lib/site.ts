/**
 * Business-wide settings. Edit these values to match your company details.
 */
export const site = {
  name: "CartaxiPH",
  tagline: "Premium car rental across the Philippines",
  description:
    "Reliable Toyota and Mitsubishi rentals for airport transfers, family vacations, out-of-town trips, business travel, group tours and special occasions. Available for one-way or round trip.",
  phone: "+63 914827291",
  phoneHref: "tel:+639850547746",
  whatsappHref: "https://wa.me/639850547746",
  email: "Lestermendones021@gmail.com",
  address: "Pasay City, Metro Manila, Philippines",
  hours: "Open daily, 6:00 AM – 10:00 PM",
  copyrightYear: 2026,
  /** Pick-up points offered in the booking form. */
  pickupLocations: [
    "NAIA Terminal 1",
    "NAIA Terminal 2",
    "NAIA Terminal 3",
    "Makati / BGC",
    "Quezon City",
    "Pasay Office",
    "Mactan-Cebu International Airport",
    "Clark International Airport",
  ],
} as const;

