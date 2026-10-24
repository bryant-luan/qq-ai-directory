export type TradeDirection = "long" | "short";

export type HitTpFailReason =
  | "invalid"
  | "missing_tp"
  | "missing_sl"
  | "wrong_side"
  | "wrong_side_tp"
  | "wrong_side_sl"
  | "zero_distance"
  | "target_not_profitable";

export type HitTpProbabilityResult =
  | {
      ok: true;
      /** 0–1 probability of hitting TP before SL (random-walk / gambler's ruin). */
      probability: number;
      riskDistance: number;
      rewardDistance: number;
      /** True when 止盈 was empty and 目標價 was used as TP. */
      usedTargetAsTp?: boolean;
      takeProfit: number;
      stopLoss: number;
    }
  | { ok: false; reason: HitTpFailReason };

function isProfitableTarget(direction: TradeDirection, entry: number, target: number): boolean {
  return direction === "long" ? target > entry : target < entry;
}

/**
 * P(hit take-profit before stop-loss) under a flat-barrier random walk
 * (gambler's ruin): P = R / (R + G), where R = risk distance |E−SL|,
 * G = reward distance |TP−E|.
 */
export function hitTpBeforeSlProbability(
  direction: TradeDirection,
  entry: number,
  takeProfit: number,
  stopLoss: number
): HitTpProbabilityResult {
  if (
    !Number.isFinite(entry) ||
    !Number.isFinite(takeProfit) ||
    !Number.isFinite(stopLoss) ||
    entry <= 0
  ) {
    return { ok: false, reason: "invalid" };
  }

  const riskDistance = Math.abs(entry - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entry);

  if (riskDistance === 0 || rewardDistance === 0) {
    return { ok: false, reason: "zero_distance" };
  }

  if (direction === "long") {
    if (!(takeProfit > entry)) return { ok: false, reason: "wrong_side_tp" };
    if (!(stopLoss < entry)) return { ok: false, reason: "wrong_side_sl" };
  } else {
    if (!(takeProfit < entry)) return { ok: false, reason: "wrong_side_tp" };
    if (!(stopLoss > entry)) return { ok: false, reason: "wrong_side_sl" };
  }

  return {
    ok: true,
    probability: riskDistance / (riskDistance + rewardDistance),
    riskDistance,
    rewardDistance,
    takeProfit,
    stopLoss,
  };
}

export type ResolveWinRateInput = {
  direction: TradeDirection;
  entry: number;
  /** Raw 止盈 field (may be empty). */
  takeProfitRaw: string;
  /** Raw 止損 field (may be empty). */
  stopLossRaw: string;
  /** Raw 目標價 field — used as TP when 止盈 is empty and target is on the profitable side. */
  targetRaw: string;
};

/**
 * Resolve win-rate inputs: prefer explicit TP; else profitable 目標價 as TP.
 * Surfaces missing-SL / missing-TP before a generic wrong-side message.
 */
export function resolveHitTpWinRate(input: ResolveWinRateInput): HitTpProbabilityResult | null {
  const { direction, entry, takeProfitRaw, stopLossRaw, targetRaw } = input;
  const tpFilled = takeProfitRaw.trim() !== "";
  const slFilled = stopLossRaw.trim() !== "";
  const targetFilled = targetRaw.trim() !== "";

  // Nothing relevant entered — stay silent.
  if (!tpFilled && !slFilled && !targetFilled) return null;
  if (!Number.isFinite(entry) || entry <= 0) {
    if (tpFilled || slFilled || targetFilled) return { ok: false, reason: "invalid" };
    return null;
  }

  let takeProfit = tpFilled ? parseFloat(takeProfitRaw) : NaN;
  let usedTargetAsTp = false;

  if (!tpFilled && targetFilled) {
    const target = parseFloat(targetRaw);
    if (!Number.isFinite(target)) {
      // fall through — may still need SL message
    } else if (isProfitableTarget(direction, entry, target)) {
      takeProfit = target;
      usedTargetAsTp = true;
    } else if (slFilled) {
      // Target present but not usable as TP; SL alone isn't enough.
      return { ok: false, reason: "target_not_profitable" };
    } else {
      // Only unprofitable target — no win-rate attempt.
      return null;
    }
  }

  if (!slFilled) {
    // Have (or could have) a TP side interest but no SL.
    if (tpFilled || usedTargetAsTp || (targetFilled && Number.isFinite(parseFloat(targetRaw)))) {
      return { ok: false, reason: "missing_sl" };
    }
    return null;
  }

  if (!Number.isFinite(takeProfit)) {
    return { ok: false, reason: "missing_tp" };
  }

  const stopLoss = parseFloat(stopLossRaw);
  if (!Number.isFinite(stopLoss)) {
    return { ok: false, reason: "missing_sl" };
  }

  const result = hitTpBeforeSlProbability(direction, entry, takeProfit, stopLoss);
  if (result.ok) {
    return { ...result, usedTargetAsTp };
  }
  // Map legacy wrong_side if any
  if (result.reason === "wrong_side") {
    return result;
  }
  return result;
}

export function hitTpReasonLabel(
  direction: TradeDirection,
  reason: HitTpFailReason
): string {
  switch (reason) {
    case "missing_sl":
      return "還差止損價 — 請填寫止損，或用下方「1R:1R / 1:2」快捷設定";
    case "missing_tp":
      return "還差止盈價 — 請填寫止盈，或填獲利向的目標價（可代算止盈）";
    case "wrong_side_tp":
      return direction === "long"
        ? "止盈方位不對 — 做多時止盈須高於開倉價"
        : "止盈方位不對 — 做空時止盈須低於開倉價";
    case "wrong_side_sl":
      return direction === "long"
        ? "止損方位不對 — 做多時止損須低於開倉價"
        : "止損方位不對 — 做空時止損須高於開倉價";
    case "wrong_side":
      return direction === "long"
        ? "止盈/止損方位不對 — 做多：止盈 > 開倉 > 止損"
        : "止盈/止損方位不對 — 做空：止損 > 開倉 > 止盈";
    case "zero_distance":
      return "距離為 0 — 止盈與止損不可等於開倉價";
    case "target_not_profitable":
      return direction === "long"
        ? "目標價未高於開倉，無法代為止盈 — 請改目標價或直接填止盈"
        : "目標價未低於開倉，無法代為止盈 — 請改目標價或直接填止盈";
    case "invalid":
    default:
      return "請先填有效開倉價，再填止盈與止損";
  }
}
