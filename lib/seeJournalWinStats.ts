import type { TradeDirection } from "@/lib/hitTpProbability";
import stats from "@/data/see-journal-win-stats.json";

export type JournalWinScope =
  | "symbol_direction"
  | "direction_rr"
  | "direction"
  | "overall";

export type JournalWinMatch = {
  /** Mean model `win` from SEE journal, 0–100. */
  meanWin: number;
  medianWin: number;
  n: number;
  scope: JournalWinScope;
  /** Short Traditional Chinese label for the match scope. */
  labelZh: string;
  /** Reward/risk bucket id when applicable (e.g. rr_1_0). */
  rrBucket?: string;
  rrLabelZh?: string;
  /** True when calculator RR differs from journal-heavy ~1R:1R. */
  rrMismatchNote?: string;
};

type Bucket = { n: number; meanWin: number; medianWin: number };

type RrBucket = Bucket & { rrBucket?: string; rrLabelZh?: string };

type SeeJournalWinStats = {
  nWinRows?: number;
  nApprox1to1RR?: number;
  minSymbolSamples?: number;
  minDirectionRrSamples?: number;
  minDirectionSamples?: number;
  disclaimerZh?: string;
  overall?: Bucket;
  byDirection?: Record<string, Bucket>;
  byDirectionRr?: Record<string, RrBucket>;
  bySymbolDirection?: Record<string, Bucket>;
};

const data = stats as SeeJournalWinStats;

const RR_LABEL_ZH: Record<string, string> = {
  rr_lt_0_75: "<0.75R",
  rr_1_0: "約 1R:1R",
  rr_1_5: "約 1:1.5",
  rr_2_0: "約 1:2",
  rr_3_0: "約 1:3",
  rr_gt_3_5: ">3.5R",
};

/** Map reward/risk (G/R) to the same buckets used when aggregating the journal. */
export function rewardRiskBucket(rewardOverRisk: number): string {
  if (!Number.isFinite(rewardOverRisk) || rewardOverRisk <= 0) return "rr_1_0";
  if (rewardOverRisk < 0.75) return "rr_lt_0_75";
  if (rewardOverRisk < 1.25) return "rr_1_0";
  if (rewardOverRisk < 1.75) return "rr_1_5";
  if (rewardOverRisk < 2.5) return "rr_2_0";
  if (rewardOverRisk < 3.5) return "rr_3_0";
  return "rr_gt_3_5";
}

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
 * Lookup journal-informed win%.
 * Prefer symbol|direction (n≥5) → direction|RR bucket (n≥10) → direction (n≥20) → overall.
 * Returns null when no bucket meets the trust floor (hide rather than mislead).
 */
export function lookupSeeJournalWin(
  symbolId: string,
  direction: TradeDirection,
  rewardOverRisk?: number
): JournalWinMatch | null {
  const symbol = symbolId.trim().toUpperCase();
  const dir = direction;
  const minSym = data.minSymbolSamples ?? 5;
  const minDirRr = data.minDirectionRrSamples ?? 10;
  const minDir = data.minDirectionSamples ?? 20;

  const rrBucket =
    rewardOverRisk != null && Number.isFinite(rewardOverRisk) && rewardOverRisk > 0
      ? rewardRiskBucket(rewardOverRisk)
      : undefined;
  const rrLabelZh = rrBucket ? RR_LABEL_ZH[rrBucket] ?? rrBucket : undefined;

  const bySym = data.bySymbolDirection ?? {};
  const symKey = `${symbol}|${dir}`;
  const symBucket = bySym[symKey];
  if (symBucket && symBucket.n >= minSym) {
    return {
      meanWin: symBucket.meanWin,
      medianWin: symBucket.medianWin,
      n: symBucket.n,
      scope: "symbol_direction",
      labelZh: `${symbol} ${dir === "long" ? "做多" : "做空"}`,
      rrBucket,
      rrLabelZh,
      rrMismatchNote:
        rrBucket && rrBucket !== "rr_1_0"
          ? "此幣種樣本多為約 1R:1R，與目前報酬風險比不同，僅供方向參考"
          : undefined,
    };
  }

  if (rrBucket) {
    const dirRr = data.byDirectionRr?.[`${dir}|${rrBucket}`];
    if (dirRr && dirRr.n >= minDirRr) {
      return {
        meanWin: dirRr.meanWin,
        medianWin: dirRr.medianWin,
        n: dirRr.n,
        scope: "direction_rr",
        labelZh: `${dir === "long" ? "做多" : "做空"} · ${dirRr.rrLabelZh ?? rrLabelZh}`,
        rrBucket: dirRr.rrBucket ?? rrBucket,
        rrLabelZh: dirRr.rrLabelZh ?? rrLabelZh,
      };
    }
  }

  const dirBucket = data.byDirection?.[dir];
  if (dirBucket && dirBucket.n >= minDir) {
    return {
      meanWin: dirBucket.meanWin,
      medianWin: dirBucket.medianWin,
      n: dirBucket.n,
      scope: "direction",
      labelZh: dir === "long" ? "做多整體" : "做空整體",
      rrBucket,
      rrLabelZh,
      rrMismatchNote:
        rrBucket && rrBucket !== "rr_1_0"
          ? `目前約 ${rrLabelZh}，journal 同桶樣本不足，改用方向整體（多為 1R:1R）`
          : undefined,
    };
  }

  const overall = data.overall;
  if (overall && overall.n >= minDir) {
    return {
      meanWin: overall.meanWin,
      medianWin: overall.medianWin,
      n: overall.n,
      scope: "overall",
      labelZh: "全樣本",
      rrBucket,
      rrLabelZh,
    };
  }

  return null;
}
