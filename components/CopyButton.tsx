"use client";
import { useState } from "react";
export default function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); } catch { setOk(false); } }}>
      {ok ? "Copied" : "Copy address"}
    </button>
  );
}
