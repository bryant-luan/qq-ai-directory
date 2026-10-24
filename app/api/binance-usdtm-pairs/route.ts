import { NextResponse } from "next/server";
import snapshot from "@/data/binance-usdtm-pairs.json";
import {
  FALLBACK_USDTM_PAIRS,
  parseUsdtmPerpetuals,
  type ContractPair,
} from "@/lib/binanceUsdtmPairs";

export const revalidate = 3600;

const LIVE_ENDPOINTS = [
  "https://www.binance.com/fapi/v1/exchangeInfo",
  "https://fapi.binance.com/fapi/v1/exchangeInfo",
] as const;

type PairsPayload = {
  pairs: ContractPair[];
  count: number;
  fallback: boolean;
  source: string;
  fetchedAt: string;
};

function payload(
  pairs: ContractPair[],
  source: string,
  fallback: boolean
): PairsPayload {
  return {
    pairs,
    count: pairs.length,
    fallback,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

function snapshotPairs(): { pairs: ContractPair[]; source: string } {
  const pairs = Array.isArray(snapshot.pairs) ? (snapshot.pairs as ContractPair[]) : [];
  if (pairs.length > 0) {
    return {
      pairs,
      source: `snapshot:${typeof snapshot.source === "string" ? snapshot.source : "data/binance-usdtm-pairs.json"}`,
    };
  }
  return { pairs: FALLBACK_USDTM_PAIRS, source: "fallback-majors" };
}

async function fetchLivePairs(): Promise<{ pairs: ContractPair[]; source: string } | null> {
  for (const url of LIVE_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/json",
          "User-Agent": "qq-ai-directory-contract-calculator/1.0",
        },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { symbols?: unknown[] };
      if (!data || !Array.isArray(data.symbols)) continue;
      const pairs = parseUsdtmPerpetuals({ symbols: data.symbols as Parameters<typeof parseUsdtmPerpetuals>[0]["symbols"] });
      if (pairs.length > 0) return { pairs, source: url };
    } catch {
      // try next endpoint
    }
  }
  return null;
}

export async function GET() {
  try {
    const live = await fetchLivePairs();
    if (live) {
      return NextResponse.json(payload(live.pairs, live.source, false));
    }
  } catch {
    // fall through to snapshot
  }

  const snap = snapshotPairs();
  return NextResponse.json(payload(snap.pairs, snap.source, true), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
