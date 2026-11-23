/**
 * Business-wide settings. Edit these values to match your company details.
 */
export const site = {
  name: "CarTaxi PH",
  tagline: "Premium car rental across the Philippines",
  description:
    "Reliable Toyota and Mitsubishi rentals for airport transfers, family vacations, out-of-town trips, business travel, group tours and special occasions. Available for one-way or round trip.",
  phone: "+63 917 000 0000",
  phoneHref: "tel:+639170000000",
  whatsappHref: "https://wa.me/639170000000",
  email: "bookings@cartaxi.ph",
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

