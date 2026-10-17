import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/data";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "QQ — AI Tool Directory & Rankings", template: "%s | QQ" },
  description: "A curated directory of well-known AI tools, grouped by use case: vibe coding, video, agents, crypto research, image and writing.",
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <nav><Link href="/"><b>QQ</b></Link> <span style={{marginRight:14}}></span><Link href="/best/vibe-coding">Vibe coding</Link><Link href="/best/video">Video</Link><Link href="/best/agents">Agents</Link><Link href="/best/image">Image</Link><Link href="/best/writing">Writing</Link><Link href="/best/crypto-trading">Crypto</Link><Link href="/new">New</Link><Link href="/sponsor">Sponsor us</Link></nav>
      {children}
      <footer>QQ is an independent directory. Order within lists is editorial and not based on measured benchmarks or user reviews. Descriptions are brief and may be out of date; check each official site. Nothing here is financial advice. <Link href="/llms.txt">llms.txt</Link></footer>
    </body></html>
  );
}
