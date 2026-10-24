import type { ContractPair } from "@/lib/binanceUsdtmPairs";

/** Popular USDT-M bases — float to the top when the query is empty or very short. */
export const MAJOR_PAIR_BASES = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "DOGE",
  "ADA",
  "AVAX",
  "LINK",
  "DOT",
  "TON",
  "SUI",
  "PEPE",
  "WIF",
  "ORDI",
] as const;

const MAJOR_RANK = new Map<string, number>(
  MAJOR_PAIR_BASES.map((b, i) => [b, i])
);

/** Normalize user input: case, spaces, slashes, dashes → compact symbol text. */
export function normalizePairQuery(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[/\s\-_]+/g, "")
    .replace(/USDT$/i, (m) => m.toUpperCase());
}

function majorBoost(base: string): number {
  const rank = MAJOR_RANK.get(base.toUpperCase());
  return rank === undefined ? 500 : rank;
}

/**
 * Rank score (lower is better):
 * 0 exact id / base+USDT · 1 exact base · 2 id prefix · 3 base prefix ·
 * then substring · majors boosted when query is empty/short.
 */
export function scorePairMatch(pair: ContractPair, normalizedQuery: string): number | null {
  const id = pair.id.toUpperCase();
  const base = pair.base.toUpperCase();
  const compact = `${base}${pair.quote}`.toUpperCase();

  if (!normalizedQuery) {
    return majorBoost(base) * 10 + id.charCodeAt(0) * 0.001;
  }

  const q = normalizedQuery;
  const qAsId = q.endsWith("USDT") ? q : `${q}USDT`;

  if (id === q || id === qAsId || compact === q || compact === qAsId) return 0;
  if (base === q) return 1;
  if (id.startsWith(q) || compact.startsWith(q)) return 2;
  if (base.startsWith(q)) return 3;

  const idIdx = id.indexOf(q);
  if (idIdx >= 0) return 10 + idIdx;

  const baseIdx = base.indexOf(q);
  if (baseIdx >= 0) return 20 + baseIdx;

  return null;
}

export function filterAndRankPairs(
  pairs: ContractPair[],
  rawQuery: string,
  limit = 80
): ContractPair[] {
  const q = normalizePairQuery(rawQuery);
  const scored: { pair: ContractPair; score: number }[] = [];

  for (const pair of pairs) {
    const score = scorePairMatch(pair, q);
    if (score === null) continue;
    scored.push({ pair, score });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.pair.id.localeCompare(b.pair.id);
  });

  return scored.slice(0, limit).map((s) => s.pair);
}

/** Split label into plain / match segments for highlight rendering. */
export function matchSegments(
  text: string,
  rawQuery: string
): { text: string; match: boolean }[] {
  const q = normalizePairQuery(rawQuery);
  if (!q) return [{ text, match: false }];

  const upper = text.toUpperCase();
  // Prefer matching against normalized form of the visible text too
  const normText = normalizePairQuery(text);
  let idx = upper.indexOf(q);
  let len = q.length;

  if (idx < 0 && normText.includes(q)) {
    // e.g. label "ETH/USDT" vs query "ETHUSDT" — highlight base when possible
    const baseGuess = q.replace(/USDT$/, "");
    if (baseGuess && upper.includes(baseGuess)) {
      idx = upper.indexOf(baseGuess);
      len = baseGuess.length;
    } else {
      return [{ text, match: false }];
    }
  }

  if (idx < 0) return [{ text, match: false }];

  const before = text.slice(0, idx);
  const mid = text.slice(idx, idx + len);
  const after = text.slice(idx + len);
  const parts: { text: string; match: boolean }[] = [];
  if (before) parts.push({ text: before, match: false });
  if (mid) parts.push({ text: mid, match: true });
  if (after) parts.push({ text: after, match: false });
  return parts.length ? parts : [{ text, match: false }];
}
