import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254)
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  const key = process.env.RESEND_API_KEY, aud = process.env.RESEND_AUDIENCE_ID;
  if (!key) return NextResponse.json({ error: "Newsletter not configured yet." }, { status: 503 });
  const url = aud ? `https://api.resend.com/audiences/${aud}/contacts` : "https://api.resend.com/contacts";
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ email, unsubscribed: false }) });
  if (!r.ok) return NextResponse.json({ error: "Could not subscribe." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
