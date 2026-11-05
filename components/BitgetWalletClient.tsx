"use client";
import { useState } from "react";

const CODE = "iCLnZD7K";

const stepStyle = {
  background: "#f8f9fa",
  border: "2px solid #dee2e6",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const btnStyle = {
  display: "block",
  textAlign: "center" as const,
  padding: "16px 24px",
  marginTop: "12px",
  borderRadius: "12px",
  fontSize: "1.15em",
  fontWeight: 700,
  textDecoration: "none",
  background: "#00c2d1",
  color: "#fff",
  border: "2px solid #00a3b0",
};

export default function BitgetWalletClient() {
  const [copied, setCopied] = useState(false);
  
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
    } catch {
      const t = document.createElement("textarea");
      t.value = CODE;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8em", marginBottom: "8px" }}>
        Bitget Wallet Card 開卡教學
      </h1>
      <p style={{ color: "#666", marginTop: 0, fontSize: "1.05em" }}>
        邀請碼 <strong style={{ color: "#0096a3" }}>{CODE}</strong>｜活動期間 2024/10/29–11/30 前 1,000 名開卡享 15 USDT 回饋
      </p>

      <div className="card" style={{ background: "#e7f6f8", borderColor: "#00c2d1", marginTop: "20px" }}>
        <h2 style={{ fontSize: "1.4em", marginTop: 0 }}>🎯 開卡 2 步驟</h2>
        
        <div style={stepStyle}>
          <div style={{ fontSize: "1.3em", fontWeight: 700, marginBottom: "8px" }}>
            ① 先在幣託 BitoPro 用台幣買 USDT
          </div>
          <p style={{ margin: "8px 0", lineHeight: 1.7 }}>
            BitoPro 是台灣合法合規的加密貨幣交易所，支援新台幣入金，方便購買 USDT 後轉入 Bitget Wallet。
          </p>
          <a href="/go/bitopro?src=linktree" target="_blank" rel="noopener" style={btnStyle}>
            前往 BitoPro 註冊
          </a>
        </div>

        <div style={stepStyle}>
          <div style={{ fontSize: "1.3em", fontWeight: 700, marginBottom: "8px" }}>
            ② 點邀請連結開卡（已自動帶入邀請碼 {CODE}）
          </div>
          <p style={{ margin: "8px 0", lineHeight: 1.7 }}>
            直接點擊下方連結，系統會自動帶入邀請碼，完成開卡即可享優惠。
          </p>
          <a href="/go/bgw?src=linktree" target="_blank" rel="noopener" style={{ ...btnStyle, background: "#111", border: "2px solid #111", fontSize: "1.25em" }}>
            🎁 點此開卡（邀請碼已帶入）
          </a>
        </div>
      </div>

      <div className="card" style={{ textAlign: "center", margin: "20px 0" }}>
        <div style={{ color: "#666", fontSize: "0.95em" }}>備用：手動輸入邀請碼</div>
        <div style={{ fontSize: "2em", fontWeight: 800, letterSpacing: 2, color: "#0096a3", margin: "8px 0" }}>
          {CODE}
        </div>
        <button
          onClick={copy}
          className="btn"
          style={{
            fontSize: "1em",
            cursor: "pointer",
            padding: "10px 20px",
            borderRadius: "8px",
            background: copied ? "#28a745" : "#6c757d",
            color: "#fff",
            border: "none",
          }}
        >
          {copied ? "✓ 已複製" : "複製邀請碼"}
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.3em" }}>💳 Bitget Wallet Card 特色</h2>
        <ul style={{ lineHeight: 1.9, paddingLeft: 20, margin: "12px 0" }}>
          <li>台灣可申請虛擬卡與實體卡</li>
          <li>消費回饋 2%–3%（依會員等級與活動）</li>
          <li>無月費年費、儲值免費</li>
          <li>支援全球 Mastercard 通路</li>
        </ul>
        <p style={{ fontSize: "0.9em", margin: "12px 0 0" }}>
          <a href="https://web3.bitget.com/helpCenter/867" target="_blank" rel="noopener">
            📖 官方回饋規則
          </a>
        </p>
      </div>

      <div className="card" style={{ background: "#fff3cd", borderColor: "#ffc107", marginTop: 20 }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: 1.7 }}>
          <strong>⚠️ 風險提醒：</strong>加密貨幣價格波動劇烈，可能損失全部本金。本頁含邀請連結，僅供資訊參考，非投資建議。活動期間、獎勵金額與資格條件以 Bitget Wallet 官方公告為準（2024/10/29–11/30 前 1,000 名開卡享 15 USDT）。請自行評估風險並遵守所在地法規。
        </p>
      </div>

      <p style={{ fontSize: "0.85em", color: "#999", textAlign: "center", marginTop: "30px" }}>
        最後更新：2024 年 11 月 5 日
      </p>
    </main>
  );
}
