import { TOOLS, CATS, SITE } from "@/lib/data";
export const dynamic = "force-static";
export function GET() {
  const body = `# QQ
> Curated directory of well-known AI tools by use case. Order is editorial; no invented stats or reviews.

## Categories
${CATS.map((c) => `- [${c.title}](${SITE}/best/${c.slug}): ${c.blurb}`).join("\n")}

## Tools
${TOOLS.map((t) => `- [${t.name}](${SITE}/tools/${t.slug}): ${t.description}`).join("\n")}

## Other
- [New releases](${SITE}/new)
- [Sitemap](${SITE}/sitemap.xml)
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
