"use client";
import { useState } from "react";
import { hitTpBeforeSlProbability } from "@/lib/hitTpProbability";

export default function ContractCalculatorClient() {
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
  const tpNum = parseFloat(takeProfitPrice);
  const slNum = parseFloat(stopLossPrice);
  const hasTpSlAttempt =
    takeProfitPrice.trim() !== "" || stopLossPrice.trim() !== "";
  const hitTpResult =
    takeProfitPrice.trim() !== "" && stopLossPrice.trim() !== ""
      ? hitTpBeforeSlProbability(direction, entryNum, tpNum, slNum)
      : null;

  const hitTpReasonLabel = (reason: "invalid" | "wrong_side" | "zero_distance") => {
    if (reason === "wrong_side") {
      return direction === "long"
        ? "做多時止盈須高於開倉價、止損須低於開倉價"
        : "做空時止盈須低於開倉價、止損須高於開倉價";
    }
    if (reason === "zero_distance") {
      return "止盈或止損與開倉價距離不可為 0";
    }
    return "請輸入有效的開倉價、止盈與止損";
  };

  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>計算參數</h2>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>方向 Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as "long" | "short")} style={{ width: "100%", padding: "8px", fontSize: "16px" }}>
            <option value="long">做多 Long</option>
            <option value="short">做空 Short</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>開倉價格 Entry Price (USDT)</label>
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
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>保證金 Margin (USDT)</label>
            <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="例: 1000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>倉位大小 Position Size (USDT)</label>
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
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>目標價格 Target Price (USDT, 選填)</label>
          <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="例: 55000" style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>止盈價 Take-Profit (USDT, 選填)</label>
          <input type="number" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} placeholder={direction === "long" ? "例: 52000" : "例: 48000"} style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>止損價 Stop-Loss (USDT, 選填)</label>
          <input type="number" value={stopLossPrice} onChange={(e) => setStopLossPrice(e.target.value)} placeholder={direction === "long" ? "例: 49000" : "例: 51000"} style={{ width: "100%", padding: "8px", fontSize: "16px" }} />
        </div>
      </div>

      {result && (
        <div className="card" style={{ background: "#e7f5ff", borderColor: "#339af0" }}>
          <h2 style={{ marginTop: 0 }}>計算結果</h2>
          <p><strong>預估強平價 Liquidation Price:</strong> {result.liquidationPrice.toFixed(2)} USDT</p>
          <p><strong>倉位大小 Position Size:</strong> {result.positionSize.toFixed(2)} USDT</p>
          <p><strong>保證金 Margin:</strong> {result.margin.toFixed(2)} USDT</p>
          <p><strong>預估手續費 Fee (開+平):</strong> {result.totalFee.toFixed(2)} USDT</p>
          {result.pnl !== null && (
            <>
              <p><strong>目標盈虧 PnL (含手續費):</strong> <span style={{ color: result.pnl >= 0 ? "green" : "red" }}>{result.pnl.toFixed(2)} USDT</span></p>
              <p><strong>報酬率 ROE:</strong> <span style={{ color: result.roe! >= 0 ? "green" : "red" }}>{result.roe!.toFixed(2)}%</span></p>
            </>
          )}
          {hitTpResult?.ok && (
            <>
              <p>
                <strong>進場勝率 / 先到止盈機率:</strong>{" "}
                <span style={{ color: "#1864ab", fontWeight: 600 }}>
                  {(hitTpResult.probability * 100).toFixed(2)}%
                </span>
              </p>
              <p style={{ fontSize: "0.9em", color: "#495057", marginTop: "-8px" }}>
                風險距離 R={hitTpResult.riskDistance.toFixed(2)} · 報酬距離 G={hitTpResult.rewardDistance.toFixed(2)} · 公式 R/(R+G)（隨機漫步假設）
              </p>
            </>
          )}
          {hitTpResult && !hitTpResult.ok && hasTpSlAttempt && (
            <p style={{ color: "#c92a2a" }}>
              <strong>進場勝率 / 先到止盈機率:</strong> {hitTpReasonLabel(hitTpResult.reason)}
            </p>
          )}
        </div>
      )}

      {!result && hitTpResult?.ok && (
        <div className="card" style={{ background: "#e7f5ff", borderColor: "#339af0" }}>
          <h2 style={{ marginTop: 0 }}>進場勝率</h2>
          <p>
            <strong>進場勝率 / 先到止盈機率:</strong>{" "}
            <span style={{ color: "#1864ab", fontWeight: 600 }}>
              {(hitTpResult.probability * 100).toFixed(2)}%
            </span>
          </p>
          <p style={{ fontSize: "0.9em", color: "#495057" }}>
            風險距離 R={hitTpResult.riskDistance.toFixed(2)} · 報酬距離 G={hitTpResult.rewardDistance.toFixed(2)} · 公式 R/(R+G)（隨機漫步假設）
          </p>
          <p style={{ fontSize: "0.85em", color: "#868e96", marginBottom: 0 }}>
            僅依開倉價與止盈/止損計算；填入保證金與槓桿後可一併查看強平價與盈虧。
          </p>
        </div>
      )}

      {!result && hitTpResult && !hitTpResult.ok && hasTpSlAttempt && (
        <div className="card" style={{ background: "#fff5f5", borderColor: "#fa5252" }}>
          <p style={{ margin: 0, color: "#c92a2a" }}>
            <strong>進場勝率 / 先到止盈機率:</strong> {hitTpReasonLabel(hitTpResult.reason)}
          </p>
        </div>
      )}
    </>
  );
}
