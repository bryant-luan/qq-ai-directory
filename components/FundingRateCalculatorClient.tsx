"use client";
import { useState } from "react";

export default function FundingRateCalculatorClient() {
  const [positionNotional, setPositionNotional] = useState("");
  const [fundingRate, setFundingRate] = useState("");
  const [inputMode, setInputMode] = useState<"hours" | "periods">("periods");
  const [hoursHeld, setHoursHeld] = useState("");
  const [numPeriods, setNumPeriods] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");

  const calculate = () => {
    const notional = parseFloat(positionNotional);
    const rate = parseFloat(fundingRate) / 100;
    
    if (!notional || isNaN(rate)) return null;

    let periods = 0;
    if (inputMode === "hours") {
      const hours = parseFloat(hoursHeld);
      if (!hours) return null;
      periods = hours / 8;
    } else {
      periods = parseFloat(numPeriods);
      if (!periods) return null;
    }

    const perPeriod = notional * rate;
    const total = perPeriod * periods;
    const perDay = perPeriod * 3;
    const annualized = (rate * 3 * 365) * 100;

    const finalPerPeriod = direction === "long" ? -perPeriod : perPeriod;
    const finalTotal = direction === "long" ? -total : total;
    const finalPerDay = direction === "long" ? -perDay : perDay;

    return {
      perPeriod: finalPerPeriod,
      total: finalTotal,
      perDay: finalPerDay,
      annualized,
      periods,
    };
  };

  const result = calculate();

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>計算參數</h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>倉位名義價值 Position Notional (USDT)</label>
          <input type="number" value={positionNotional} onChange={(e) => setPositionNotional(e.target.value)} placeholder="例: 10000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
          <small style={{ color: "#666" }}>倉位名義價值 = 保證金 × 槓桿倍數</small>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>資金費率 Funding Rate (% per 8h)</label>
          <input type="number" step="0.001" value={fundingRate} onChange={(e) => setFundingRate(e.target.value)} placeholder="例: 0.01" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
          <small style={{ color: "#666" }}>正值表示多方支付給空方,負值反之</small>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>計算方式</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value as "hours" | "periods")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="periods">結算次數 Number of Periods</option>
            <option value="hours">持倉時數 Hours Held</option>
          </select>
        </div>

        {inputMode === "hours" ? (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>持倉時數 Hours Held</label>
            <input type="number" value={hoursHeld} onChange={(e) => setHoursHeld(e.target.value)} placeholder="例: 24" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
            <small style={{ color: "#666" }}>系統會自動換算為結算次數 (每8小時1次)</small>
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>結算次數 Number of Funding Periods</label>
            <input type="number" value={numPeriods} onChange={(e) => setNumPeriods(e.target.value)} placeholder="例: 3" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
            <small style={{ color: "#666" }}>每日通常3次結算 (每8小時)</small>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>持倉方向 Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "long" | "short")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="long">做多 Long (支付正費率)</option>
            <option value="short">做空 Short (收取正費率)</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="card" style={{ background: "#e7f5ff", borderColor: "#339af0" }}>
          <h2 style={{ marginTop: 0 }}>計算結果</h2>
          <p><strong>單期費用 Per Period (8h):</strong> <span style={{ color: result.perPeriod >= 0 ? "green" : "red" }}>{result.perPeriod >= 0 ? "+" : ""}{result.perPeriod.toFixed(4)} USDT</span></p>
          <p><strong>每日費用 Per Day (24h):</strong> <span style={{ color: result.perDay >= 0 ? "green" : "red" }}>{result.perDay >= 0 ? "+" : ""}{result.perDay.toFixed(4)} USDT</span></p>
          <p><strong>總費用 Total ({result.periods.toFixed(2)} 次結算):</strong> <span style={{ color: result.total >= 0 ? "green" : "red" }}>{result.total >= 0 ? "+" : ""}{result.total.toFixed(4)} USDT</span></p>
          <p><strong>年化費率 Annualized:</strong> {result.annualized >= 0 ? "+" : ""}{result.annualized.toFixed(2)}%</p>
          <p style={{ fontSize: "0.9em", color: "#666", marginTop: "12px" }}>
            {result.perPeriod < 0 ? "負值表示你支付費用(成本)" : "正值表示你收取費用(收入)"}。綠色為收入,紅色為支出。
          </p>
        </div>
      )}
    </>
  );
}
