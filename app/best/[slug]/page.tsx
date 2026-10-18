import { notFound } from "next/navigation";
import { CATS, SITE, toolsIn } from "@/lib/data";
import ToolCard from "@/components/ToolCard";
export const dynamicParams = false;
export function generateStaticParams() { return CATS.map((c) => ({ slug: c.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = CATS.find((x) => x.slug === params.slug);
  return c ? { title: c.title, description: c.blurb, alternates: { canonical: `/best/${c.slug}` } } : {};
}
export default function Page({ params }: { params: { slug: string } }) {
  const c = CATS.find((x) => x.slug === params.slug);
  if (!c) notFound();
  const ts = toolsIn(c.slug);
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: c.title, itemListElement: ts.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE}/tools/${t.slug}` })) };
  return (<main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <h1>{c.title}</h1><p>{c.blurb}</p>
    <p><small>Editorial order, not a benchmark. No user reviews or usage stats are shown.</small></p>
    {c.slug === "crypto-trading" && (
      <div className="card" style={{ marginTop: "24px", marginBottom: "24px", background: "#f8f9fa" }}>
        <h2 style={{ fontSize: "1.1em", marginTop: 0 }}>交易所註冊入口 Exchange Sign-Up (推廣連結 / Affiliate)</h2>
        <p style={{ fontSize: "0.95em", lineHeight: "1.6" }}>
          <strong>揭露聲明 / Disclosure:</strong> 本區含推廣連結與邀請碼,若你透過連結註冊,站長可能獲得回饋,對你不增加費用。This section contains affiliate links and referral codes. If you sign up through these links, the site owner may receive a commission at no extra cost to you.
        </p>
        <p style={{ fontSize: "0.95em", lineHeight: "1.6", color: "#d9534f" }}>
          <strong>風險警告 / Risk Warning:</strong> 加密貨幣交易風險高,可能損失全部本金。以上僅為資訊,非投資建議,不保證任何報酬。Cryptocurrency trading carries high risk and you may lose your entire investment. The information above is for informational purposes only, not investment advice, and no returns are guaranteed.
        </p>
        <p style={{ marginBottom: "12px" }}>
          <a href="https://linktr.ee/bryant.luan" className="btn" rel="sponsored nofollow noopener" target="_blank">查看所有註冊連結</a>
        </p>
        <p style={{ fontSize: "0.9em", margin: "8px 0 0 0" }}>
          <strong>邀請碼 / Invite Codes:</strong><br />
          Binance: BRYANTTRADE<br />
          BitoPro: 7276911675<br />
          Toobit: 8fUBLg
        </p>
      </div>
    )}
    {ts.map((t, i) => <ToolCard key={t.slug} t={t} rank={i + 1} />)}
  </main>);
}
