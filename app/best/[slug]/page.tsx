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
    {ts.map((t, i) => <ToolCard key={t.slug} t={t} rank={i + 1} />)}
  </main>);
}
