"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ContractPair } from "@/lib/binanceUsdtmPairs";

type Props = {
  pairs: ContractPair[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  statusNote?: string;
};

export default function PairCombobox({
  pairs,
  value,
  onChange,
  disabled,
  loading,
  statusNote,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = pairs.find((p) => p.id === value) ?? pairs[0];

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase().replace(/[/\s-]/g, "");
    if (!q) return pairs;
    return pairs.filter(
      (p) =>
        p.id.includes(q) ||
        p.base.toUpperCase().includes(q) ||
        `${p.base}${p.quote}`.includes(q)
    );
  }, [pairs, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const display = open ? query : selected ? `${selected.base}/${selected.quote} (${selected.id})` : value;

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setQuery("");
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered[highlight];
      if (hit) pick(hit.id);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled || loading}
        value={display}
        placeholder={loading ? "載入幣安交易對…" : "搜尋例如 BTC、ETHUSDT"}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onKeyDown={onKeyDown}
        style={{ width: "100%", padding: "8px", fontSize: "16px", boxSizing: "border-box" }}
      />
      {statusNote && (
        <p style={{ margin: "6px 0 0", fontSize: "0.85em", color: "#868e96" }}>{statusNote}</p>
      )}
      {open && !loading && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 20,
            left: 0,
            right: 0,
            margin: "4px 0 0",
            padding: 0,
            listStyle: "none",
            maxHeight: 260,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #ced4da",
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: "10px 12px", color: "#868e96" }}>無符合的交易對</li>
          ) : (
            filtered.slice(0, 200).map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={p.id === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p.id);
                }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  background: i === highlight ? "#e7f5ff" : p.id === value ? "#f1f3f5" : "#fff",
                }}
              >
                <strong>{p.base}/{p.quote}</strong>
                <span style={{ color: "#868e96", marginLeft: 8 }}>{p.id}</span>
              </li>
            ))
          )}
          {filtered.length > 200 && (
            <li style={{ padding: "8px 12px", fontSize: "0.85em", color: "#868e96" }}>
              僅顯示前 200 筆，請繼續輸入縮小範圍（共 {filtered.length}）
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
