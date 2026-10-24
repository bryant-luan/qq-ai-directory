"use client";
import { useEffect, useState, type CSSProperties } from "react";
import PairCombobox from "@/components/PairCombobox";
import {
  FALLBACK_USDTM_PAIRS,
  preferDefaultPair,
  type ContractPair,
} from "@/lib/binanceUsdtmPairs";
import {
  hitTpReasonLabel,
  resolveHitTpWinRate,
} from "@/lib/hitTpProbability";
import {
  lookupSeeJournalWin,
  seeJournalDisclaimer,
  seeJournalMeta,
} from "@/lib/seeJournalWinStats";

export default function ContractCalculatorClient() {
  const [pairs, setPairs] = useState<ContractPair[]>(FALLBACK_USDTM_PAIRS);
  const [pairsLoading, setPairsLoading] = useState(true);
  const [pairsFallback, setPairsFallback] = useState(false);
  const [pairsCount, setPairsCount] = useState(FALLBACK_USDTM_PAIRS.length);
  const [pairId, setPairId] = useState("BTCUSDT");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [leverage, setLeverage] = useState("10");
  const [inputMode, setInputMode] = useState<"margin" | "positionSize">("margin");
  const [margin, setMargin] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [marginMode, setMarginMode] = useState<"isolated" | "cross">("isolated");
  const [mmr, setMmr] = useState("0.5");
  const [takerFee, setTakerFee] = useState("0.05");
  const [targetPrice, setTargetPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/binance-usdtm-pairs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          pairs?: ContractPair[];
          count?: number;
          fallback?: boolean;
        };
        if (cancelled) return;
        const next = Array.isArray(data.pairs) && data.pairs.length > 0 ? data.pairs : FALLBACK_USDTM_PAIRS;
        setPairs(next);
        setPairsCount(data.count ?? next.length);
        setPairsFallback(Boolean(data.fallback));
        setPairId((prev) => preferDefaultPair(next, prev || "BTCUSDT"));
      } catch {
        if (cancelled) return;
        setPairs(FALLBACK_USDTM_PAIRS);
        setPairsCount(FALLBACK_USDTM_PAIRS.length);
        setPairsFallback(true);
        setPairId((prev) => preferDefaultPair(FALLBACK_USDTM_PAIRS, prev || "BTCUSDT"));
      } finally {
        if (!cancelled) setPairsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pair = pairs.find((p) => p.id === pairId) ?? pairs[0] ?? FALLBACK_USDTM_PAIRS[0];
  const quote = pair.quote;
  const pairLabel = pair.id;

  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const lev = parseFloat(leverage);
    const mmRate = parseFloat(mmr) / 100;
    const feeRate = parseFloat(takerFee) / 100;
    const target = parseFloat(targetPrice);

    if (!entry || !lev || isNaN(mmRate)) return null;

    let posSize = 0;
    let marginAmt = 0;

    if (inputMode === "margin") {
      marginAmt = parseFloat(margin);
      if (!marginAmt) return null;
      posSize = marginAmt * lev;
    } else {
      posSize = parseFloat(positionSize);
      if (!posSize) return null;
      marginAmt = posSize / lev;
    }

    const openFee = posSize * feeRate;
    const closeFee = posSize * feeRate;
    const totalFee = openFee + closeFee;

    let liquidationPrice = 0;
    if (marginMode === "isolated") {
      if (direction === "long") {
        liquidationPrice = entry * (1 - 1 / lev + mmRate);
      } else {
        liquidationPrice = entry * (1 + 1 / lev - mmRate);
      }
    } else {
      liquidationPrice = direction === "long" 
        ? entry * (1 - (marginAmt - totalFee) / posSize + mmRate)
        : entry * (1 + (marginAmt - totalFee) / posSize - mmRate);
    }

    let pnl = null;
    let roe = null;
    if (target) {
      if (direction === "long") {
        pnl = ((target - entry) / entry) * posSize - totalFee;
      } else {
        pnl = ((entry - target) / entry) * posSize - totalFee;
      }
      roe = (pnl / marginAmt) * 100;
    }

    return {
      liquidationPrice: liquidationPrice > 0 ? liquidationPrice : 0,
      positionSize: posSize,
      margin: marginAmt,
      totalFee,
      pnl,
      roe,
    };
  };

  const result = calculate();

  const entryNum = parseFloat(entryPrice);
  const hitTpResult = resolveHitTpWinRate({
    direction,
    entry: entryNum,
    takeProfitRaw: takeProfitPrice,
    stopLossRaw: stopLossPrice,
    targetRaw: targetPrice,
  });

  const rewardOverRisk =
    hitTpResult?.ok && hitTpResult.riskDistance > 0
      ? hitTpResult.rewardDistance / hitTpResult.riskDistance
      : undefined;

  const journalWin = lookupSeeJournalWin(pairLabel, direction, rewardOverRisk);
  const journalMeta = seeJournalMeta();

  const formatDist = (n: number) => {
    if (n >= 100) return n.toFixed(2);
    if (n >= 1) return n.toFixed(4);
    if (n >= 0.01) return n.toFixed(6);
    return n.toPrecision(4);
  };

  const formatPriceInput = (n: number) => {
    if (!Number.isFinite(n)) return "";
    if (Math.abs(n) >= 1000) return n.toFixed(2);
    if (Math.abs(n) >= 1) return String(Number(n.toFixed(6)));
    return String(Number(n.toPrecision(8)));
  };

  /** Set TP/SL from entry using reward multiple of risk (1 = 1R:1R, 2 = 1:2). */
  const applyRrPreset = (rewardMultiple: 1 | 2) => {
    const entry = parseFloat(entryPrice);
    if (!Number.isFinite(entry) || entry <= 0) return;

    let risk = 0;
    const existingSl = parseFloat(stopLossPrice);
    if (Number.isFinite(existingSl) && existingSl > 0 && existingSl !== entry) {
      const sideOk =
        direction === "long" ? existingSl < entry : existingSl > entry;
      if (sideOk) risk = Math.abs(entry - existingSl);
    }
    if (risk <= 0) risk = entry * 0.01; // default 1% of entry

    const sl = direction === "long" ? entry - risk : entry + risk;
    const tp =
      direction === "long"
        ? entry + risk * rewardMultiple
        : entry - risk * rewardMultiple;

    setStopLossPrice(formatPriceInput(sl));
    setTakeProfitPrice(formatPriceInput(tp));
    // Keep PnL target in sync with first TP when empty or previously synced-looking
    if (!targetPrice.trim() || targetPrice === takeProfitPrice) {
      setTargetPrice(formatPriceInput(tp));
    }
  };

  const syncTargetFromTp = () => {
    const tp =
      takeProfitPrice.trim() ||
      (hitTpResult?.ok ? formatPriceInput(hitTpResult.takeProfit) : "");
    if (tp) setTargetPrice(tp);
  };

  const syncTpFromTarget = () => {
    if (targetPrice.trim()) setTakeProfitPrice(targetPrice.trim());
  };

  const chipBtn: CSSProperties = {
    padding: "6px 10px",
    fontSize: "14px",
    border: "1px solid #adb5bd",
    borderRadius: 4,
    background: "#f8f9fa",
    cursor: "pointer",
  };

  const renderWinRateBlock = (opts?: { compactNote?: string }) => (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        background: hitTpResult?.ok ? "#f8fbff" : "#fff5f5",
        border: `1px solid ${hitTpResult?.ok ? "#a5d8ff" : "#ffa8a8"}`,
        borderRadius: 6,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: "#212529" }}>
        進場勝率
      </div>
      {hitTpResult?.ok ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: "0.9em", color: "#495057", marginBottom: 2 }}>
              公式勝率（隨機漫步 R/(R+G)）
            </div>
            <div
              style={{
                color: "#1864ab",
                fontWeight: 800,
                fontSize: "1.75em",
                lineHeight: 1.15,
                letterSpacing: "0.02em",
              }}
            >
              {(hitTpResult.probability * 100).toFixed(2)}%
            </div>
            <div style={{ fontSize: "0.88em", color: "#495057", marginTop: 4 }}>
              R={formatDist(hitTpResult.riskDistance)} {quote} · G=
              {formatDist(hitTpResult.rewardDistance)} {quote}
              {rewardOverRisk != null
                ? ` · 報酬風險比 1:${rewardOverRisk.toFixed(2).replace(/\.00$/, "")}`
                : ""}
              {hitTpResult.usedTargetAsTp ? " · 止盈暫以目標價計算" : ""}
            </div>
          </div>

          {journalWin ? (
            <div
              style={{
                borderTop: "1px dashed #ced4da",
                paddingTop: 10,
                marginTop: 4,
              }}
            >
              <div style={{ fontSize: "0.9em", color: "#495057", marginBottom: 2 }}>
                SEE journal 參考（非正式保證）
              </div>
              <div
                style={{
                  color: "#2b8a3e",
                  fontWeight: 700,
                  fontSize: "1.35em",
                  lineHeight: 1.2,
                }}
              >
                {journalWin.meanWin.toFixed(1)}%
              </div>
              <div style={{ fontSize: "0.88em", color: "#495057", marginTop: 4 }}>
                使用樣本：{journalWin.labelZh}
                {journalWin.rrLabelZh && journalWin.scope === "direction_rr"
                  ? ""
                  : journalWin.rrLabelZh
                    ? ` · 目前設定 ${journalWin.rrLabelZh}`
                    : ""}
                {" · "}n={journalWin.n} · 中位數 {journalWin.medianWin.toFixed(1)}%
              </div>
              {journalWin.rrMismatchNote && (
                <div style={{ fontSize: "0.85em", color: "#e67700", marginTop: 4 }}>
                  {journalWin.rrMismatchNote}
                </div>
              )}
              <div style={{ fontSize: "0.8em", color: "#868e96", marginTop: 6 }}>
                {seeJournalDisclaimer()}（{journalMeta.nWinRows} 筆 win 紀錄；約{" "}
                {journalMeta.nApprox1to1RR} 筆為 1R:1R。n&lt;門檻不顯示）
              </div>
            </div>
          ) : (
            <div
              style={{
                borderTop: "1px dashed #ced4da",
                paddingTop: 10,
                marginTop: 4,
                fontSize: "0.88em",
                color: "#868e96",
              }}
            >
              SEE journal：此組合樣本不足，僅顯示公式勝率（不臆造百分比）。
            </div>
          )}

          {opts?.compactNote && (
            <p style={{ fontSize: "0.85em", color: "#868e96", marginBottom: 0, marginTop: 8 }}>
              {opts.compactNote}
            </p>
          )}
        </>
      ) : hitTpResult ? (
        <p style={{ margin: 0, color: "#c92a2a", lineHeight: 1.5 }}>
          {hitTpReasonLabel(direction, hitTpResult.reason)}
        </p>
      ) : null}
    </div>
  );

  const pairStatusNote = pairsLoading
    ? "正在載入幣安 USDT-M 永續交易對…"
    : pairsFallback
      ? `目前使用離線清單（${pairsCount} 個）；即時 exchangeInfo 暫時不可用`
      : `幣安 USDT-M 永續 · 共 ${pairsCount} 個（可搜尋）`;

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>計算參數</h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>幣種 / 交易對 Trading Pair</label>
          <PairCombobox
            pairs={pairs}
            value={pairId}
            onChange={setPairId}
            loading={pairsLoading}
            statusNote={pairStatusNote}
          />
        </div>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>方向 Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "long" | "short")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="long">做多 Long</option>
            <option value="short">做空 Short</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>開倉價格 Entry Price ({quote}) · {pairLabel}</label>
          <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="例: 50000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>槓桿倍數 Leverage</label>
          <input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} placeholder="例: 10" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>輸入方式</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value as "margin" | "positionSize")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="margin">保證金 Margin</option>
            <option value="positionSize">倉位大小 Position Size</option>
          </select>
        </div>

        {inputMode === "margin" ? (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>保證金 Margin ({quote}) · {pairLabel}</label>
            <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="例: 1000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>倉位大小 Position Size ({quote}) · {pairLabel}</label>
            <input type="number" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} placeholder="例: 10000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>保證金模式 Margin Mode</label>
          <select value={marginMode} onChange={(e) => setMarginMode(e.target.value as "isolated" | "cross")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="isolated">逐倉 Isolated</option>
            <option value="cross">全倉 Cross (簡化)</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>維持保證金率 MMR (%)</label>
          <input type="number" step="0.1" value={mmr} onChange={(e) => setMmr(e.target.value)} placeholder="例: 0.5" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>Taker 手續費率 (%)</label>
          <input type="number" step="0.01" value={takerFee} onChange={(e) => setTakerFee(e.target.value)} placeholder="例: 0.05" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>目標價格 Target Price ({quote}, 選填) · {pairLabel}</label>
          <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="例: 55000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>止盈 / 止損快捷（需先填開倉價）</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" style={chipBtn} onClick={() => applyRrPreset(1)} disabled={!entryPrice.trim()}>
              設 1R:1R
            </button>
            <button type="button" style={chipBtn} onClick={() => applyRrPreset(2)} disabled={!entryPrice.trim()}>
              設 1:2
            </button>
            <button type="button" style={chipBtn} onClick={syncTpFromTarget} disabled={!targetPrice.trim()}>
              目標價 → 止盈
            </button>
            <button type="button" style={chipBtn} onClick={syncTargetFromTp} disabled={!takeProfitPrice.trim() && !(hitTpResult?.ok)}>
              止盈 → 目標價
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.85em", color: "#868e96" }}>
            快捷會依現有止損距離設 TP/SL；若尚無止損則預設風險為開倉價的 1%。不影響強平公式。
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>止盈價 Take-Profit ({quote}, 選填) · {pairLabel}</label>
          <input type="number" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} placeholder={direction === "long" ? "例: 52000" : "例: 48000"} style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>止損價 Stop-Loss ({quote}, 選填) · {pairLabel}</label>
          <input type="number" value={stopLossPrice} onChange={(e) => setStopLossPrice(e.target.value)} placeholder={direction === "long" ? "例: 49000" : "例: 51000"} style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>
      </div>

      {result && (
        <div className="card" style={{ background: "#e7f5ff", borderColor: "#339af0" }}>
          <h2 style={{ marginTop: 0 }}>計算結果 · {pair.base}/{pair.quote}</h2>
          <p style={{ fontSize: "0.9em", color: "#495057", marginTop: "-8px" }}>交易對 {pairLabel}（價格與金額單位：{quote}）</p>
          <p><strong>預估強平價 Liquidation Price:</strong> {result.liquidationPrice.toFixed(2)} {quote}</p>
          <p><strong>倉位大小 Position Size:</strong> {result.positionSize.toFixed(2)} {quote}</p>
          <p><strong>保證金 Margin:</strong> {result.margin.toFixed(2)} {quote}</p>
          <p><strong>預估手續費 Fee (開+平):</strong> {result.totalFee.toFixed(2)} {quote}</p>
          {result.pnl !== null && (
            <>
              <p><strong>目標盈虧 PnL (含手續費):</strong> <span style={{ color: result.pnl >= 0 ? "green" : "red" }}>{result.pnl.toFixed(2)} {quote}</span></p>
              <p><strong>報酬率 ROE:</strong> <span style={{ color: result.roe! >= 0 ? "green" : "red" }}>{result.roe!.toFixed(2)}%</span></p>
            </>
          )}
          {renderWinRateBlock()}
        </div>
      )}

      {!result && hitTpResult?.ok && (
        <div className="card" style={{ background: "#e7f5ff", borderColor: "#339af0" }}>
          <h2 style={{ marginTop: 0 }}>進場勝率 · {pair.base}/{pair.quote}</h2>
          <p style={{ fontSize: "0.9em", color: "#495057", marginTop: "-8px" }}>交易對 {pairLabel}</p>
          {renderWinRateBlock({
            compactNote: "僅依開倉價與止盈/止損計算；填入保證金與槓桿後可一併查看強平價與盈虧。",
          })}
        </div>
      )}

      {!result && hitTpResult && !hitTpResult.ok && (
        <div className="card" style={{ background: "#fff5f5", borderColor: "#fa5252" }}>
          {renderWinRateBlock()}
        </div>
      )}
    </>
  );
}
