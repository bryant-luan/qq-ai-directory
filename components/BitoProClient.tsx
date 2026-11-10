"use client";
import { useState } from "react";

const REFERRAL_CODE = "7276911675";

const stepCardStyle = {
  background: "#f8f9fa",
  border: "2px solid #dee2e6",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const sectionStyle = {
  background: "#fff",
  border: "2px solid #e3e3e3",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
};

export default function BitoProClient() {
  const [copied, setCopied] = useState(false);
  
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE);
    } catch {
      const t = document.createElement("textarea");
      t.value = REFERRAL_CODE;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: "1.8em", marginBottom: "12px", lineHeight: 1.4 }}>
        幣託 BitoPro 新手註冊教學
      </h1>
      <p style={{ color: "#666", marginTop: 0, fontSize: "1.05em", lineHeight: 1.7 }}>
        台灣合法合規的加密貨幣交易所｜支援台幣入金買 USDT
      </p>

      <div style={{ ...sectionStyle, background: "#e8f5e9", borderColor: "#4caf50" }}>
        <h2 style={{ fontSize: "1.4em", marginTop: 0, color: "#2e7d32" }}>
          🎁 新用戶專屬優惠
        </h2>
        <ul style={{ lineHeight: 1.9, paddingLeft: 20, margin: "12px 0" }}>
          <li>
            <strong>交易手續費 20% 回饋</strong>：使用推薦碼註冊並完成 Level 2 身分驗證，享 180 天交易手續費 20% 回饋，每日結算為 USDT，累積滿 10 USDT 可領取
            <div style={{ fontSize: "0.9em", color: "#555", marginTop: "4px" }}>
              （來源：<a href="https://support.bitopro.com/hc/zh-tw/articles/4461480898073" target="_blank" rel="noopener">BitoPro 官方說明</a>，更新於 2026/07/22）
            </div>
          </li>
          <li style={{ marginTop: "12px" }}>
            <strong>2026 幣託防詐大會考</strong>（2026/08/05–12/31）：完成 Level 2 身分驗證 + 綁定台灣銀行帳戶 + 5 項安全任務 = 確定獲得一次抽獎資格，每月 1,000 個名額
            <div style={{ fontSize: "0.9em", color: "#555", marginTop: "4px" }}>
              （來源：<a href="https://events.bitopro.com/2/anti-fraud-challenge-252" target="_blank" rel="noopener">BitoPro 活動頁面</a>）
            </div>
          </li>
        </ul>
      </div>

      <h2 style={{ fontSize: "1.5em", marginTop: "32px", marginBottom: "16px" }}>
        📝 註冊流程（5 步驟）
      </h2>

      <div style={stepCardStyle}>
        <div style={{ 
          display: "inline-block", 
          background: "#1976d2", 
          color: "#fff", 
          width: "32px", 
          height: "32px", 
          borderRadius: "50%", 
          textAlign: "center", 
          lineHeight: "32px", 
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          1
        </div>
        <h3 style={{ fontSize: "1.25em", marginTop: "8px", marginBottom: "12px" }}>
          點擊註冊按鈕前往 BitoPro
        </h3>
        <p style={{ margin: "12px 0", lineHeight: 1.7, color: "#555" }}>
          使用下方連結註冊，推薦碼會自動帶入，享新用戶優惠。
        </p>
        <a 
          href="/go/bitopro?src=lp" 
          target="_blank" 
          rel="noopener"
          style={{
            display: "block",
            textAlign: "center",
            padding: "16px 24px",
            marginTop: "12px",
            borderRadius: "12px",
            fontSize: "1.15em",
            fontWeight: 700,
            textDecoration: "none",
            background: "#1976d2",
            color: "#fff",
            border: "2px solid #1565c0",
          }}
        >
          👉 前往 BitoPro 註冊
        </a>
      </div>

      <div style={stepCardStyle}>
        <div style={{ 
          display: "inline-block", 
          background: "#1976d2", 
          color: "#fff", 
          width: "32px", 
          height: "32px", 
          borderRadius: "50%", 
          textAlign: "center", 
          lineHeight: "32px", 
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          2
        </div>
        <h3 style={{ fontSize: "1.25em", marginTop: "8px", marginBottom: "12px" }}>
          確認推薦碼已自動帶入
        </h3>
        <p style={{ margin: "12px 0", lineHeight: 1.7, color: "#555" }}>
          註冊時確認推薦碼欄位已填入：
        </p>
        <div style={{ 
          textAlign: "center", 
          background: "#fff", 
          border: "2px dashed #1976d2",
          borderRadius: "8px",
          padding: "16px",
          margin: "12px 0"
        }}>
          <div style={{ fontSize: "2em", fontWeight: 800, letterSpacing: 2, color: "#1976d2" }}>
            {REFERRAL_CODE}
          </div>
          <button
            onClick={copy}
            style={{
              marginTop: "12px",
              fontSize: "1em",
              cursor: "pointer",
              padding: "10px 20px",
              borderRadius: "8px",
              background: copied ? "#28a745" : "#6c757d",
              color: "#fff",
              border: "none",
            }}
          >
            {copied ? "✓ 已複製" : "複製推薦碼"}
          </button>
        </div>
      </div>

      <div style={stepCardStyle}>
        <div style={{ 
          display: "inline-block", 
          background: "#1976d2", 
          color: "#fff", 
          width: "32px", 
          height: "32px", 
          borderRadius: "50%", 
          textAlign: "center", 
          lineHeight: "32px", 
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          3
        </div>
        <h3 style={{ fontSize: "1.25em", marginTop: "8px", marginBottom: "12px" }}>
          驗證手機與電子信箱
        </h3>
        <p style={{ margin: "12px 0", lineHeight: 1.7, color: "#555" }}>
          依照系統指示完成手機號碼與 Email 驗證，這是建立帳戶的基本步驟。
        </p>
      </div>

      <div style={stepCardStyle}>
        <div style={{ 
          display: "inline-block", 
          background: "#1976d2", 
          color: "#fff", 
          width: "32px", 
          height: "32px", 
          borderRadius: "50%", 
          textAlign: "center", 
          lineHeight: "32px", 
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          4
        </div>
        <h3 style={{ fontSize: "1.25em", marginTop: "8px", marginBottom: "12px" }}>
          完成 Level 2 身分驗證（KYC）
        </h3>
        <p style={{ margin: "12px 0", lineHeight: 1.7, color: "#555" }}>
          上傳身分證件與進行人臉辨識，完成 Level 2 驗證後才能使用台幣入金與享受新用戶優惠。
        </p>
      </div>

      <div style={stepCardStyle}>
        <div style={{ 
          display: "inline-block", 
          background: "#1976d2", 
          color: "#fff", 
          width: "32px", 
          height: "32px", 
          borderRadius: "50%", 
          textAlign: "center", 
          lineHeight: "32px", 
          fontWeight: 700,
          marginBottom: "12px"
        }}>
          5
        </div>
        <h3 style={{ fontSize: "1.25em", marginTop: "8px", marginBottom: "12px" }}>
          綁定台灣銀行帳戶
        </h3>
        <p style={{ margin: "12px 0", lineHeight: 1.7, color: "#555" }}>
          連結你的台灣銀行帳戶，就可以用新台幣購買 USDT 等加密貨幣。例如可以直接購買 USDT/TWD 交易對。
        </p>
      </div>

      <div style={{ ...sectionStyle, background: "#fff3cd", borderColor: "#ffc107" }}>
        <h2 style={{ fontSize: "1.4em", marginTop: 0, color: "#856404" }}>
          🛡️ 怎麼分辨假冒幣託？
        </h2>
        <ul style={{ lineHeight: 1.9, paddingLeft: 20, margin: "12px 0" }}>
          <li>
            <strong>官方網址只有 bitopro.com</strong>：注意網址拼字，不要點擊可疑連結
          </li>
          <li>
            <strong>絕不提供密碼或 OTP 驗證碼給任何人</strong>：官方客服不會索取密碼
          </li>
          <li>
            <strong>小心 LINE 投資群組</strong>：許多詐騙會冒充交易所或投資老師，承諾高報酬
          </li>
        </ul>
      </div>

      <div style={{ ...sectionStyle, background: "#ffebee", borderColor: "#f44336" }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: 1.7, color: "#333" }}>
          <strong>⚠️ 風險提醒與免責聲明</strong>
          <br /><br />
          加密貨幣價格波動劇烈，投資具高風險，可能損失全部本金。本頁面含推薦連結，我們可能因此獲得推薦獎勵。本內容僅供資訊參考，不構成投資建議，請自行評估風險並遵守所在地法規。所有活動期間、優惠內容、資格條件以 BitoPro 官方公告為準。
        </p>
      </div>

      <p style={{ fontSize: "0.85em", color: "#999", textAlign: "center", marginTop: "30px", marginBottom: "30px" }}>
        最後更新：2026 年 11 月 10 日
      </p>
    </main>
  );
}
