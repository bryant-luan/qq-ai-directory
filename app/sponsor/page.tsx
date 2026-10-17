import { SPONSOR_URL } from "@/lib/data";
export const metadata = { title: "Sponsor us" };
export default function Page() {
  return (<main><h1>Sponsor QQ</h1>
    <p>Sponsorships help keep QQ running. Sponsored placements will always be clearly labelled and do not change editorial order.</p>
    {SPONSOR_URL ? <a className="btn" href={SPONSOR_URL} rel="noopener">Sponsor via Stripe</a> : <p><i>Sponsorship checkout is not yet enabled.</i></p>}
  </main>);
}
