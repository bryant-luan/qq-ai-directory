import Link from "next/link";
import CryptoAffiliate from "@/components/CryptoAffiliate";
import ContractCalculatorClient from "@/components/ContractCalculatorClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "合約計算機 / 爆倉價(強平價)計算 | 加密貨幣合約交易工具",
  description: "免費線上加密貨幣合約交易計算機,快速計算預估強平價(爆倉價)、盈虧、報酬率與手續費。支援做多/做空、逐倉/全倉、自訂維持保證金率。繁體中文、無需註冊、客戶端運算。",
  alternates: { canonical: "/tools/contract-calculator" },
  openGraph: {
    title: "合約計算機 / 爆倉價(強平價)計算",
    description: "免費線上加密貨幣合約計算工具,計算強平價、盈虧、ROE。無需註冊,客戶端運算。",
    type: "website",
  },
};

export default function ContractCalculatorPage() {
  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "什麼是強平價(爆倉價)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "強平價(Liquidation Price)是指當倉位虧損達到維持保證金要求時,交易所會自動平倉的價格,俗稱爆倉價。逐倉模式下只影響該筆倉位,全倉模式則可能清算所有倉位。",
        },
      },
      {
        "@type": "Question",
        name: "逐倉與全倉有什麼差別?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "逐倉(Isolated)模式下每個倉位的保證金獨立,爆倉只損失該倉位保證金。全倉(Cross)模式所有倉位共用保證金,風險更高但可互相支撐。",
        },
      },
      {
        "@type": "Question",
        name: "維持保證金率(MMR)是什麼?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "維持保證金率(Maintenance Margin Rate)是交易所要求的最低保證金比例,低於此比例就會強平。各交易所與槓桿倍數會有不同,通常0.4%~1%之間。",
        },
      },
      {
        "@type": "Question",
        name: "為什麼實際強平價與計算結果不同?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "本工具採簡化公式估算,實際強平價受資金費率、未實現盈虧、交易手續費、保險基金扣款等因素影響,各交易所計算方式略有差異,請以交易所顯示為準。",
        },
      },
      {
        "@type": "Question",
        name: "如何降低爆倉風險?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "降低槓桿倍數、增加保證金、設定止損、避免滿倉操作、注意市場波動,都能有效降低爆倉風險。新手建議從低槓桿開始練習。",
        },
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }} />
      <h1>合約計算機 / 爆倉價(強平價)計算</h1>
      <p>快速計算加密貨幣合約交易的預估強平價、盈虧、報酬率與手續費。可搜尋幣安 USDT-M 永續交易對、支援做多/做空、逐倉/全倉模式。</p>

      <div className="card" style={{ background: "#fff3cd", borderColor: "#ffc107", marginBottom: "20px" }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: "1.6" }}>
          <strong>⚠️ 重要提醒:</strong> 本工具為簡化估算,與各交易所實際強平價可能不同,非投資建議,加密貨幣交易風險高,可能損失全部本金。
        </p>
      </div>

      <ContractCalculatorClient />

      <div className="card">
        <h2>計算公式說明 (白話)</h2>
        <p><strong>倉位大小:</strong> 保證金 × 槓桿倍數</p>
        <p><strong>逐倉做多強平價:</strong> 開倉價 × (1 - 1/槓桿 + 維持保證金率)</p>
        <p><strong>逐倉做空強平價:</strong> 開倉價 × (1 + 1/槓桿 - 維持保證金率)</p>
        <p><strong>盈虧 (做多):</strong> (目標價 - 開倉價) / 開倉價 × 倉位大小 - 手續費</p>
        <p><strong>盈虧 (做空):</strong> (開倉價 - 目標價) / 開倉價 × 倉位大小 - 手續費</p>
        <p><strong>報酬率 ROE:</strong> 盈虧 / 保證金 × 100%</p>
        <p><strong>公式勝率 / 先到止盈機率:</strong> 風險距離 R = |開倉價 − 止損|; 報酬距離 G = |止盈 − 開倉價|; 機率 = R / (R + G)（平坦障礙、隨機漫步 / 賭徒破產假設; 做多止盈高於開倉、止損低於開倉; 做空相反）</p>
        <p><strong>SEE journal 參考勝率:</strong> 自 SEE／SEE ONE 交易日誌中具 <code>win</code> 欄位的樣本，依交易對+方向（不足則方向／全樣本）取平均；多為模型預測勝率、設定約 1R:1R，非實盤保證。</p>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "12px" }}>
          實際強平價會受資金費率、未實現盈虧、保險基金等因素影響,各交易所略有不同,請以交易所顯示為準。先到止盈機率為理論估算,不考慮趨勢、滑點與手續費。
        </p>
      </div>

      <div className="card">
        <h2>常見問題 FAQ</h2>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>什麼是強平價(爆倉價)?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>強平價(Liquidation Price)是指當倉位虧損達到維持保證金要求時,交易所會自動平倉的價格,俗稱爆倉價。逐倉模式下只影響該筆倉位,全倉模式則可能清算所有倉位。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>逐倉與全倉有什麼差別?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>逐倉(Isolated)模式下每個倉位的保證金獨立,爆倉只損失該倉位保證金。全倉(Cross)模式所有倉位共用保證金,風險更高但可互相支撐。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>維持保證金率(MMR)是什麼?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>維持保證金率(Maintenance Margin Rate)是交易所要求的最低保證金比例,低於此比例就會強平。各交易所與槓桿倍數會有不同,通常0.4%~1%之間。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>為什麼實際強平價與計算結果不同?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>本工具採簡化公式估算,實際強平價受資金費率、未實現盈虧、交易手續費、保險基金扣款等因素影響,各交易所計算方式略有差異,請以交易所顯示為準。</p>
        </details>
        <details style={{ marginBottom: "12px" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>如何降低爆倉風險?</summary>
          <p style={{ marginTop: "8px", marginLeft: "16px" }}>降低槓桿倍數、增加保證金、設定止損、避免滿倉操作、注意市場波動,都能有效降低爆倉風險。新手建議從低槓桿開始練習。</p>
        </details>
      </div>

      <CryptoAffiliate />

      <div style={{ marginTop: "20px", fontSize: "0.95em" }}>
        <p>
          <Link href="/tools">← 回到工具列表</Link> · <Link href="/tools/funding-rate-calculator">資金費率計算 →</Link>
        </p>
        <p>
          相關資源: <Link href="/best/crypto-trading">加密貨幣交易工具</Link>
        </p>
      </div>
    </main>
  );
}
