import { NextResponse } from "next/server";
import { fetchGoogleReviews } from "@/lib/reviews";

export async function GET() {
  const data = await fetchGoogleReviews();
  return NextResponse.json({
    configured: Boolean(data),
    rating: data?.rating ?? null,
    totalRatings: data?.totalRatings ?? null,
    reviews: data?.reviews ?? [],
  });
}
