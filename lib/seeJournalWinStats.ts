import type { TradeDirection } from "@/lib/hitTpProbability";
import stats from "@/data/see-journal-win-stats.json";

export type JournalWinScope = "symbol_direction" | "direction" | "overall";

export type JournalWinMatch = {
  /** Mean model `win` from SEE journal, 0–100. */
  meanWin: number;
  medianWin: number;
  n: number;
  scope: JournalWinScope;
  /** Short Traditional Chinese label for the match scope. */
  labelZh: string;
};

type Bucket = { n: number; meanWin: number; medianWin: number };

type SeeJournalWinStats = {
  nWinRows?: number;
  nApprox1to1RR?: number;
  disclaimerZh?: string;
  overall?: Bucket;
  byDirection?: Record<string, Bucket>;
  bySymbolDirection?: Record<string, Bucket>;
};

const data = stats as SeeJournalWinStats;

export function seeJournalDisclaimer(): string {
  return (
    data.disclaimerZh ??
    "SEE journal 樣本參考勝率（模型 win 欄位彙總，非保證）"
  );
}

export function seeJournalMeta(): { nWinRows: number; nApprox1to1RR: number } {
  return {
    nWinRows: data.nWinRows ?? 0,
    nApprox1to1RR: data.nApprox1to1RR ?? 0,
  };
}

/**
 * Lookup journal-informed win% for a symbol + direction.
 * Prefer symbol|direction (n≥3 in stats file), else direction, else overall.
 * Returns null only when the compact stats file has no usable buckets.
 */
export function lookupSeeJournalWin(
  symbolId: string,
  direction: TradeDirection
): JournalWinMatch | null {
  const symbol = symbolId.trim().toUpperCase();
  const dir = direction;
  const bySym = data.bySymbolDirection ?? {};
  const key = `${symbol}|${dir}`;
  const symBucket = bySym[key];
  if (symBucket && symBucket.n >= 3) {
    return {
      meanWin: symBucket.meanWin,
      medianWin: symBucket.medianWin,
      n: symBucket.n,
      scope: "symbol_direction",
      labelZh: `${symbol} ${dir === "long" ? "做多" : "做空"}`,
    };
  }

  const dirBucket = data.byDirection?.[dir];
  if (dirBucket && dirBucket.n >= 10) {
    return {
      meanWin: dirBucket.meanWin,
      medianWin: dirBucket.medianWin,
      n: dirBucket.n,
      scope: "direction",
      labelZh: dir === "long" ? "做多整體" : "做空整體",
    };
  }

  const overall = data.overall;
  if (overall && overall.n >= 10) {
    return {
      meanWin: overall.meanWin,
      medianWin: overall.medianWin,
      n: overall.n,
      scope: "overall",
      labelZh: "全樣本",
    };
  }

  return null;
}
