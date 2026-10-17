import { MetadataRoute } from "next";
import { TOOLS, CATS, SITE } from "@/lib/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const p = ["", "/new", "/sponsor"].concat(CATS.map((c) => `/best/${c.slug}`), TOOLS.map((t) => `/tools/${t.slug}`));
  return p.map((u) => ({ url: SITE + u }));
}
