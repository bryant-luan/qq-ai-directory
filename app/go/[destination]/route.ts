import { NextRequest, NextResponse } from "next/server";

// Destination configurations
const DESTINATIONS = {
  toobit: {
    url: "https://www.toobit.com/en-US/register/invite?referralCode=8fUBLg",
    allowedSources: ["fb", "threads", "ig"],
  },
  bitget: {
    url: "/bitget-wallet",
    allowedSources: ["fb", "threads", "ig", "square"],
  },
} as const;

type Destination = keyof typeof DESTINATIONS;

// Tracking function (non-blocking)
async function trackClick(destination: string, source: string) {
  try {
    // Use Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv");
      
      // Get current date in Asia/Taipei timezone
      const date = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Taipei",
      }); // YYYY-MM-DD format
      
      const key = `clicks:${destination}:${source}:${date}`;
      await kv.incr(key);
      
      // Set expiry to 45 days to keep data manageable
      await kv.expire(key, 60 * 60 * 24 * 45);
    } else {
      // Fallback: just log (useful for development)
      console.log(`[CLICK TRACKING] ${destination} <- ${source} at ${new Date().toISOString()}`);
    }
  } catch (error) {
    // Never let tracking errors break the redirect
    console.error("[TRACKING ERROR]", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { destination: string } }
) {
  const { destination } = params;
  const searchParams = request.nextUrl.searchParams;
  const src = searchParams.get("src") || "other";

  // Validate destination
  if (!DESTINATIONS[destination as Destination]) {
    return NextResponse.json(
      { error: "Invalid destination" },
      { status: 404 }
    );
  }

  const config = DESTINATIONS[destination as Destination];
  
  // Normalize source
  const normalizedSrc = config.allowedSources.includes(src as any)
    ? src
    : "other";

  // Track click (non-blocking - fire and forget)
  trackClick(destination, normalizedSrc).catch(() => {
    // Silent fail - tracking errors should never break redirects
  });

  // Perform redirect (302 temporary redirect)
  return NextResponse.redirect(
    config.url.startsWith("http")
      ? config.url
      : new URL(config.url, request.url).toString(),
    { status: 302 }
  );
}
