import { NextRequest, NextResponse } from "next/server";

const STATS_SECRET = process.env.GO_STATS_SECRET || "change-me-in-production";

interface ClickStats {
  destination: string;
  source: string;
  date: string;
  clicks: number;
}

export async function GET(request: NextRequest) {
  // Check authentication via query parameter
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (token !== STATS_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid ?token=<secret>" },
      { status: 401 }
    );
  }

  try {
    // Check if KV is available
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        error: "Vercel KV not configured. Please set up KV storage.",
        note: "See README for setup instructions.",
        fallback: "Check server logs for click tracking data in development mode.",
      });
    }

    const { kv } = await import("@vercel/kv");

    // Get all keys matching our pattern
    const allKeys = await kv.keys("clicks:*");
    
    const stats: ClickStats[] = [];
    
    // Fetch all values
    for (const key of allKeys) {
      const count = await kv.get<number>(key);
      if (count) {
        // Parse key: clicks:destination:source:date
        const parts = key.split(":");
        if (parts.length === 4) {
          stats.push({
            destination: parts[1],
            source: parts[2],
            date: parts[3],
            clicks: count,
          });
        }
      }
    }

    // Filter to last 30 days and sort by date descending
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

    const filtered = stats
      .filter((s) => s.date >= cutoffDate)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Calculate totals
    const totals = {
      totalClicks: filtered.reduce((sum, s) => sum + s.clicks, 0),
      byDestination: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    filtered.forEach((s) => {
      totals.byDestination[s.destination] =
        (totals.byDestination[s.destination] || 0) + s.clicks;
      totals.bySource[s.source] = (totals.bySource[s.source] || 0) + s.clicks;
    });

    return NextResponse.json({
      period: "last 30 days",
      generatedAt: new Date().toISOString(),
      totals,
      stats: filtered,
    });
  } catch (error) {
    console.error("[STATS ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
