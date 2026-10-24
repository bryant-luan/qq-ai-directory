"use client";
import { useEffect, useState } from "react";

const CODE = "iCLnZD7K";
const INVITE = "https://web3.bitget.com/share/2CWLpy?inviteCode=iCLnZD7K";
const IOS = "https://apps.apple.com/app/id1395301115";
const ANDROID = "https://play.google.com/store/apps/details?id=com.bitkeep.wallet";

const big = (on: boolean) => ({
  display: "block", textAlign: "center" as const, padding: "16px", margin: "10px 0",
  borderRadius: "12px", fontSize: "1.15em", fontWeight: 700, textDecoration: "none",
  background: on ? "#00c2d1" : "#f1f3f5", color: on ? "#fff" : "#111",
  border: on ? "2px solid #00a3b0" : "2px solid #dee2e6",
});

export default function BitgetWalletClient() {
  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setOs("ios");
    else if (/Android/i.test(ua)) setOs("android");
  }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(CODE); } catch {
      const t = document.createElement("textarea"); t.value = CODE; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const storeIos = <a id="btn-ios" href={IOS} target="_blank" rel="noopener" style={big(os === "ios")}> App Store 下載</a>;
  const storeAnd = <a id="btn-android" href={ANDROID} target="_blank" rel="noopener" style={big(os === "android")}>▶ Google Play 下載</a>;

  return (
    <main style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.6em" }}>Bitget Wallet｜下載錢包、開卡消費最高 3% 回饋</h1>
      <p style={{ color: "#666", marginTop: 0 }}>新卡友完成指定交易最高可領 $20，以官方規則為準</p>
      <img src="/bitget-wallet-invite.jpg" alt="Bitget Wallet 邀請碼 iCLnZD7K" style={{ width: "100%", borderRadius: 16 }} />

      <div className="card" style={{ textAlign: "center", margin: "16px 0" }}>
        <div style={{ color: "#666" }}>我的邀請碼</div>
        <div style={{ fontSize: "2em", fontWeight: 800, letterSpacing: 2, color: "#0096a3" }}>{CODE}</div>
        <button onClick={copy} className="btn" style={{ fontSize: "1em", cursor: "pointer" }}>{copied ? "✓ 已複製" : "複製邀請碼"}</button>
      </div>

      <a id="btn-invite" href={INVITE} target="_blank" rel="noopener" style={{ ...big(true), background: "#111", border: "2px solid #111", fontSize: "1.25em" }}>
        🎁 用邀請連結開始（已帶入邀請碼）
      </a>
      {os === "android" ? <>{storeAnd}{storeIos}</> : <>{storeIos}{storeAnd}</>}

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Bitget Wallet Card 重點</h2>
        <ul style={{ lineHeight: 1.9, paddingLeft: 20, margin: "12px 0" }}>
          <li>台灣可申請虛擬卡與實體卡</li>
          <li>預設 2% 回饋，新卡友或當月消費滿 $200 可升級 3%（當月及下月，有每月上限）</li>
          <li>無月費年費、儲值免費</li>
          <li>新台幣等非美元消費另收 1.7% 外幣手續費</li>
          <li>實體卡申請費 49 USD</li>
        </ul>
        <p style={{ fontSize: "0.9em", margin: "12px 0 0" }}>
          <a href="https://web3.bitget.com/helpCenter/867" target="_blank" rel="noopener">📖 官方回饋規則</a>
        </p>
      </div>

      <h2>3 步驟開始</h2>
      <ol style={{ lineHeight: 1.9, paddingLeft: 20 }}>
        <li><strong>下載 App：</strong>點上方 App Store 或 Google Play 按鈕安裝 Bitget Wallet。</li>
        <li><strong>建立錢包並備份助記詞：</strong>助記詞抄在紙上妥善保存，不要截圖、不要給任何人。</li>
        <li><strong>填邀請碼 {CODE}：</strong>在 App 內邀請／獎勵頁輸入邀請碼完成綁定。</li>
      </ol>

      <div className="card" style={{ background: "#fff3cd", borderColor: "#ffc107", marginTop: 20 }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: 1.6 }}>
          <strong>⚠️ 風險提醒：</strong>加密貨幣價格波動劇烈，可能損失全部本金。本頁含邀請連結，僅供資訊參考，非投資建議；活動獎勵、資格與期限以 Bitget Wallet 官方公告為準。請自行評估風險並遵守所在地法規。
        </p>
      </div>
    </main>
  );
}
