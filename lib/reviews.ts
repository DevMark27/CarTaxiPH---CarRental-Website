export type GoogleReviewItem = {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
};

/**
 * Fetches Google Reviews when GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are configured.
 * Returns null when not configured so the UI never displays fabricated reviews.
 */
export async function fetchGoogleReviews(): Promise<{
  rating?: number;
  totalRatings?: number;
  reviews: GoogleReviewItem[];
} | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId,
    )}&fields=rating,user_ratings_total,reviews&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.result;
    if (!result || !Array.isArray(result.reviews)) return null;

    return {
      rating: typeof result.rating === "number" ? result.rating : undefined,
      totalRatings: typeof result.user_ratings_total === "number" ? result.user_ratings_total : undefined,
      reviews: result.reviews.slice(0, 6).map((r: Record<string, unknown>) => ({
        authorName: String(r.author_name ?? "Customer"),
        rating: Number(r.rating ?? 5),
        text: String(r.text ?? ""),
        relativeTimeDescription: String(r.relative_time_description ?? ""),
      })),
    };
  } catch {
    return null;
  }
}
