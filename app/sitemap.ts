import { MetadataRoute } from "next";
import { TOOLS, CATS, SITE } from "@/lib/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const calculators = ["/tools", "/tools/contract-calculator", "/tools/funding-rate-calculator"];
  const p = ["", "/new", "/sponsor"].concat(CATS.map((c) => `/best/${c.slug}`), TOOLS.map((t) => `/tools/${t.slug}`), calculators);
  return p.map((u) => ({ url: SITE + u }));
}
