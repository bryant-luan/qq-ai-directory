import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

// Destination configurations
const DESTINATIONS = {
  toobit: {
    url: "https://www.toobit.com/t/8fUBLg",
    allowedSources: ["fb", "threads", "ig"],
  },
  bitget: {
    url: "https://web3.bitget.com/share/2CWLpy?inviteCode=iCLnZD7K",
    allowedSources: ["fb", "threads", "ig", "square"],
  },
  bgw: {
    url: "https://web3.bitget.com/share/2CWLpy?inviteCode=iCLnZD7K",
    allowedSources: ["fb", "fb_c1", "fb_btn", "fb_dm", "threads", "ig", "linktree", "site", "lp"],
  },
  bitopro: {
    url: "https://www.bitopro.com/users/sign_up?referrer=7276911675",
    allowedSources: ["fb", "fb_c1", "fb_btn", "fb_dm", "threads", "ig", "linktree", "site", "lp"],
  },
};

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

  // Log request (no PII: no IP, no User-Agent)
  console.log(`[REDIRECT] destination=${destination} src=${src}`);

  // Validate destination
  if (!DESTINATIONS[destination as Destination]) {
    return NextResponse.json(
      { error: "Invalid destination" },
      { status: 404 }
    );
  }

  const config = DESTINATIONS[destination as Destination];
  
  // Normalize source - check if src is in the allowed list
  const normalizedSrc = config.allowedSources.includes(src)
    ? src
    : "other";

  console.log(`[REDIRECT] normalized src=${normalizedSrc} (allowed: ${config.allowedSources.join(", ")})`);

  // Track click using waitUntil to ensure it completes after redirect
  waitUntil(trackClick(destination, normalizedSrc));

  // Perform redirect (302 temporary redirect)
  const redirectUrl = config.url.startsWith("http")
    ? config.url
    : new URL(config.url, request.url).toString();

  return NextResponse.redirect(redirectUrl, {
    status: 302,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
