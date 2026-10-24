import { MetadataRoute } from "next";
import { SITE } from "@/lib/data";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/go/"] }, sitemap: `${SITE}/sitemap.xml` }; }
