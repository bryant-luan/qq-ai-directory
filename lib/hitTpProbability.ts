export type TradeDirection = "long" | "short";

export type HitTpProbabilityResult =
  | {
      ok: true;
      /** 0–1 probability of hitting TP before SL (random-walk / gambler's ruin). */
      probability: number;
      riskDistance: number;
      rewardDistance: number;
    }
  | { ok: false; reason: "invalid" | "wrong_side" | "zero_distance" };

/**
 * P(hit take-profit before stop-loss) under a flat-barrier random walk
 * (gambler's ruin): P = R / (R + G), where R = risk distance |E−SL|,
 * G = reward distance |TP−E|. Same distances for long and short once
 * TP/SL are on the correct side of entry.
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

  const onCorrectSide =
    direction === "long"
      ? takeProfit > entry && stopLoss < entry
      : takeProfit < entry && stopLoss > entry;

  if (!onCorrectSide) {
    return { ok: false, reason: "wrong_side" };
  }

  return {
    ok: true,
    probability: riskDistance / (riskDistance + rewardDistance),
    riskDistance,
    rewardDistance,
  };
}
