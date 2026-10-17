import { notFound } from "next/navigation";
import Link from "next/link";
import { TOOLS, CATS, SITE } from "@/lib/data";
export const dynamicParams = false;
export function generateStaticParams() { return TOOLS.map((t) => ({ slug: t.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const t = TOOLS.find((x) => x.slug === params.slug);
  return t ? { title: t.name, description: t.description, alternates: { canonical: `/tools/${t.slug}` } } : {};
}
export default function Page({ params }: { params: { slug: string } }) {
  const t = TOOLS.find((x) => x.slug === params.slug);
  if (!t) notFound();
  const ld = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: t.name, url: t.url, description: t.description, applicationCategory: "AI tool" };
  return (<main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <h1>{t.name}</h1><p>{t.description}</p>
    <p><b>Pricing:</b> {t.pricing}</p>
    <p><b>Categories:</b> {t.category.map((c) => { const k = CATS.find((x) => x.slug === c)!; return <Link key={c} href={`/best/${c}`} style={{ marginRight: 8 }}>{k.name}</Link>; })}</p>
    <a className="btn" href={t.url} rel="noopener">Visit {t.name}</a>
    <p><small>Listing is editorial; details may change. Verify on the official site. {SITE ? "" : ""}</small></p>
  </main>);
}
