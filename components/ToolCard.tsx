import Link from "next/link";
import type { Tool } from "@/lib/data";
export default function ToolCard({ t, rank }: { t: Tool; rank?: number }) {
  return (
    <div className="card">
      <h3 style={{ margin: 0 }}>{rank ? `${rank}. ` : ""}<Link href={`/tools/${t.slug}`}>{t.name}</Link></h3>
      <p style={{ margin: "6px 0" }}>{t.description}</p>
      <small>{t.pricing} · <a href={t.url} rel="noopener">Official site</a></small>
    </div>
  );
}
