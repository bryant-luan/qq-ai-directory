import Link from "next/link";
import { SITE } from "@/lib/data";

export const metadata = {
  title: "加密貨幣計算工具 Crypto Calculators",
  description: "免費線上加密貨幣合約交易計算工具:強平價計算、資金費率計算,繁體中文介面,無需註冊,客戶端運算保護隱私。",
  alternates: { canonical: "/tools" },
};

export default function ToolsIndex() {
  const tools = [
    {
      slug: "contract-calculator",
      name: "合約計算機 / 爆倉價計算",
      description: "計算加密貨幣合約交易的預估強平價(爆倉價)、盈虧、報酬率與手續費。支援做多/做空、逐倉/全倉模式。",
      icon: "📊",
    },
    {
      slug: "funding-rate-calculator",
      name: "資金費率計算",
      description: "計算永續合約的資金費用(Funding Fee),了解持倉成本或收入。支援按時數或結算次數計算,顯示單期、每日、總計與年化費率。",
      icon: "💰",
    },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "加密貨幣計算工具",
    description: "免費線上加密貨幣合約交易計算工具集",
    url: `${SITE}/tools`,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1>加密貨幣計算工具 Crypto Calculators</h1>
      <p>免費、無需註冊、客戶端運算的加密貨幣合約交易計算工具。所有計算在你的瀏覽器本地完成,不會上傳任何資料。</p>
      
      <div className="card" style={{ background: "#fff3cd", borderColor: "#ffc107", marginBottom: "20px" }}>
        <p style={{ margin: 0, fontSize: "0.95em", lineHeight: "1.6" }}>
          <strong>⚠️ 風險提醒:</strong> 以下工具為簡化估算,實際結果可能與交易所不同。加密貨幣交易風險極高,可能損失全部本金,請審慎評估。本站工具僅供參考,非投資建議,不保證任何報酬。
        </p>
      </div>

      <h2>可用工具</h2>
      {tools.map((tool) => (
        <div key={tool.slug} className="card" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginTop: 0, fontSize: "1.3em" }}>
            <span style={{ marginRight: "8px" }}>{tool.icon}</span>
            <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
          </h3>
          <p style={{ marginBottom: "12px" }}>{tool.description}</p>
          <Link href={`/tools/${tool.slug}`} className="btn">開始使用 →</Link>
        </div>
      ))}

      <div style={{ marginTop: "32px", padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0 }}>特色</h3>
        <ul style={{ lineHeight: "1.8", marginBottom: 0 }}>
          <li>✓ <strong>完全免費:</strong> 無需註冊或付費</li>
          <li>✓ <strong>隱私保護:</strong> 所有計算在瀏覽器本地完成,不上傳資料</li>
          <li>✓ <strong>繁體中文:</strong> 介面與說明皆為繁體中文</li>
          <li>✓ <strong>公式透明:</strong> 每個工具都詳細說明計算公式</li>
          <li>✓ <strong>FAQ 解答:</strong> 常見問題與術語說明</li>
        </ul>
      </div>

      <div style={{ marginTop: "24px", fontSize: "0.95em" }}>
        <p>
          相關資源: <Link href="/best/crypto-trading">加密貨幣交易研究工具</Link> · <Link href="/">QQ 首頁</Link>
        </p>
      </div>
    </main>
  );
}
