import Link from "next/link";
import { CATS, TOOLS, SITE } from "@/lib/data";
import Newsletter from "@/components/Newsletter";
export default function Home() {
  const ld = { "@context": "https://schema.org", "@type": "WebSite", name: "QQ", url: SITE, description: "Curated AI tool directory and rankings by use case." };
  const list = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE}/tools/${t.slug}` })) };
  return (<main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, list]) }} />
    <h1>QQ — find the right AI tool</h1>
    <p>A curated directory of {TOOLS.length} well-known AI tools, organised by what you want to do.</p>
    <h2>Browse by use case</h2>
    {CATS.map((c) => <div className="card" key={c.slug}><Link href={`/best/${c.slug}`}><b>{c.title}</b></Link><div>{c.blurb}</div></div>)}
    <p><Link href="/new">New releases</Link> · <Link href="/sponsor">Sponsor us</Link></p>
    <Newsletter />
  </main>);
}
