"use client";
import { useState } from "react";
export default function Newsletter() {
  const [s, setS] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setS("Sending…");
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json();
      setS(r.ok ? "Thanks — you're on the list." : j.error || "Something went wrong.");
    } catch { setS("Network error."); }
  }
  return (
    <form onSubmit={submit} className="card">
      <strong>Get new AI tool picks by email</strong><br />
      <input name="email" type="email" required placeholder="you@example.com" /> <button type="submit">Subscribe</button>
      <div>{s}</div>
    </form>
  );
}
