import Link from "next/link";
import CryptoAffiliate from "@/components/CryptoAffiliate";
import FundingRateCalculatorClient from "@/components/FundingRateCalculatorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "資金費率計算 Funding Rate Calculator | 永續合約資金費用計算工具",
  description: "免費線上永續合約資金費率計算工具,快速計算資金費用成本或收入。支援按持倉時數或結算次數計算,顯示單期、每日、總計與年化費率。繁體中文、無需註冊、客戶端運算。",
  alternates: { canonical: "/tools/funding-rate-calculator" },
  openGraph: {
    title: "資金費率計算 Funding Rate Calculator",
    description: "免費線上永續合約資金費率計算,了解持倉成本與收入。無需註冊,客戶端運算。",
    type: "website",
  },
};

export default function FundingRateCalculatorPage() {
  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "什麼是資金費率?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "資金費率(Funding Rate)是永續合約的機制,用於維持合約價格與現貨價格接近。每8小時結算一次,多方支付給空方(正費率)或空方支付給多方(負費率),不經過交易所。",
        },
      },
      {
        "@type": "Question",
        name: "資金費率多久結算一次?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "多數交易所每8小時結算一次,通常在UTC 0:00、8:00、16:00。部分交易所可能採用4小時或其他週期,請查看各交易所規則。",
        },
      },
      {
        "@type": "Question",
        name: "資金費率正負值是什麼意思?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "正費率(+):合約價高於現貨,多方(Long)支付給空方(Short)。負費率(-):合約價低於現貨,空方支付給多方。費率越大代表市場情緒越極端。",
        },
      },
      {
        "@type": "Question",
        name: "如何避免支付資金費用?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "在結算時間前平倉即可避免該期費用。若要長期持倉,可觀察費率變化選擇低費率或負費率時段開倉,或考慮現貨、交割合約等其他交易方式。",
        },
      },
      {
        "@type": "Question",
        name: "年化資金費率怎麼算?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "單期費率 × 每日3期 × 365天 = 年化費率。例如0.01%(每8小時)的年化約10.95%。但實際費率會波動,年化僅供參考,不代表真實年度成本。",
        },
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }} />
      <h1>資金費率計算 Funding Rate Calculator</h1>
      <p>計算永續合約的資金費用(Funding Fee),了解持倉成本或收入,支援按持倉時數或結算次數計算。</p>

      <div className="card" style={{ background: "#fff3cd", borderColor: "#ffc107", marginBottom: "20px" }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: "1.6" }}>
          <strong>⚠️ 重要提醒:</strong> 本工具為簡化估算,與各交易所實際強平價可能不同,非投資建議,加密貨幣交易風險高,可能損失全部本金。
        </p>
      </div>

      <FundingRateCalculatorClient />

      <div className="card">
        <h2>計算公式說明 (白話)</h2>
        <p><strong>單期費用:</strong> 倉位名義價值 × 資金費率</p>
        <p><strong>每日費用:</strong> 單期費用 × 3 (每日3次結算)</p>
        <p><strong>總費用:</strong> 單期費用 × 結算次數</p>
        <p><strong>年化費率:</strong> 單期費率 × 3 × 365 天</p>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "12px" }}>
          <strong>費用方向:</strong><br />
          • 資金費率為正時:做多方支付給做空方<br />
          • 資金費率為負時:做空方支付給做多方<br />
          • 費用不經過交易所,直接在倉位持有者之間轉移
        </p>
      </div>

      <div className="card">
        <h2>常見問題 FAQ</h2>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>什麼是資金費率?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>資金費率(Funding Rate)是永續合約的機制,用於維持合約價格與現貨價格接近。每8小時結算一次,多方支付給空方(正費率)或空方支付給多方(負費率),不經過交易所。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>資金費率多久結算一次?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>多數交易所每8小時結算一次,通常在UTC 0:00、8:00、16:00。部分交易所可能採用4小時或其他週期,請查看各交易所規則。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>資金費率正負值是什麼意思?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>正費率(+):合約價高於現貨,多方(Long)支付給空方(Short)。負費率(-):合約價低於現貨,空方支付給多方。費率越大代表市場情緒越極端。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>如何避免支付資金費用?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>在結算時間前平倉即可避免該期費用。若要長期持倉,可觀察費率變化選擇低費率或負費率時段開倉,或考慮現貨、交割合約等其他交易方式。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>年化資金費率怎麼算?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>單期費率 × 每日3期 × 365天 = 年化費率。例如0.01%(每8小時)的年化約10.95%。但實際費率會波動,年化僅供參考,不代表真實年度成本。</p>
        </details>
      </div>

      <CryptoAffiliate />

      <div style={{ marginTop: "20px", fontSize: "0.95em" }}>
        <p>
          <Link href="/tools">← 回到工具列表</Link> · <Link href="/tools/contract-calculator">← 合約計算機</Link>
        </p>
        <p>
          相關資源: <Link href="/best/crypto-trading">加密貨幣交易工具</Link>
        </p>
      </div>
    </main>
  );
}
