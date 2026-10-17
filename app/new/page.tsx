import { RELEASES } from "@/lib/data";
export const metadata = { title: "New AI tool releases" };
export default function Page() {
  return (<main><h1>New releases</h1>
    {RELEASES.map((r) => <div className="card" key={r.title}><b>{r.title}</b> <small>{r.date}</small><p>{r.note}</p><a href={r.url} rel="noopener">Source</a></div>)}
  </main>);
}
