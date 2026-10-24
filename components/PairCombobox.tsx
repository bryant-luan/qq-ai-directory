"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ContractPair } from "@/lib/binanceUsdtmPairs";
import { filterAndRankPairs, matchSegments } from "@/lib/pairSearch";

type Props = {
  pairs: ContractPair[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
  statusNote?: string;
};

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = matchSegments(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            style={{
              background: "#fff3bf",
              color: "inherit",
              padding: 0,
              borderRadius: 2,
            }}
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = pairs.find((p) => p.id === value) ?? pairs[0];

  const filtered = useMemo(
    () => filterAndRankPairs(pairs, open ? query : "", 80),
    [pairs, query, open]
  );

  const totalMatchHint = useMemo(() => {
    if (!open || !query.trim()) return null;
    // Cheap count for status: ranked list already capped; show "顯示 N"
    return filtered.length;
  }, [open, query, filtered.length]);

  useEffect(() => {
    // Prefer currently selected item when opening with empty query
    if (!open) return;
    if (!query.trim() && value) {
      const idx = filtered.findIndex((p) => p.id === value);
      setHighlight(idx >= 0 ? idx : 0);
    } else {
      setHighlight(0);
    }
  }, [query, open, filtered, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const el = optionRefs.current[highlight];
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open, filtered]);

  const display = open
    ? query
    : selected
      ? `${selected.base}/${selected.quote} (${selected.id})`
      : value;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (id: string) => {
    onChange(id);
    close();
    inputRef.current?.blur();
  };

  const openList = (clearQuery: boolean) => {
    setOpen(true);
    if (clearQuery) setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }

    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      e.preventDefault();
      openList(true);
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(Math.max(filtered.length - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered[highlight];
      if (hit) pick(hit.id);
    } else if (e.key === "Tab") {
      close();
    }
  };

  const activeOptionId =
    open && filtered[highlight] ? `${listId}-opt-${filtered[highlight].id}` : undefined;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="search"
          enterKeyHint="search"
          disabled={disabled || loading}
          value={display}
          placeholder={loading ? "載入幣安交易對…" : "搜尋 BTC、ETH/USDT、SOLUSDT…"}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => openList(true)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            padding: "10px 36px 10px 10px",
            fontSize: "16px",
            lineHeight: 1.4,
            boxSizing: "border-box",
            borderRadius: 4,
            border: "1px solid #ced4da",
          }}
        />
        {open && query && (
          <button
            type="button"
            aria-label="清除搜尋"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "#868e96",
              fontSize: 18,
              lineHeight: 1,
              padding: "6px 8px",
              cursor: "pointer",
              minWidth: 36,
              minHeight: 36,
            }}
          >
            ×
          </button>
        )}
      </div>
      {statusNote && (
        <p style={{ margin: "6px 0 0", fontSize: "0.85em", color: "#868e96" }}>
          {statusNote}
          {totalMatchHint !== null && query.trim()
            ? ` · 顯示 ${totalMatchHint} 筆`
            : open && !query.trim()
              ? " · ↑↓ 選擇 · Enter 確認 · Esc 關閉"
              : ""}
        </p>
      )}
      {open && !loading && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 30,
            left: 0,
            right: 0,
            margin: "4px 0 0",
            padding: 0,
            listStyle: "none",
            maxHeight: "min(320px, 50dvh)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            background: "#fff",
            border: "1px solid #ced4da",
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: "12px 14px", color: "#868e96" }}>
              無符合的交易對，試著輸入 BTC 或 ETHUSDT
            </li>
          ) : (
            filtered.map((p, i) => {
              const isActive = i === highlight;
              const isSelected = p.id === value;
              return (
                <li
                  key={p.id}
                  id={`${listId}-opt-${p.id}`}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(p.id);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    padding: "12px 14px",
                    minHeight: 44,
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    background: isActive ? "#e7f5ff" : isSelected ? "#f1f3f5" : "#fff",
                    borderLeft: isActive ? "3px solid #339af0" : "3px solid transparent",
                  }}
                >
                  <span>
                    <strong style={{ fontSize: "1.02em" }}>
                      <Highlighted text={`${p.base}/${p.quote}`} query={query} />
                    </strong>
                    <span style={{ color: "#868e96", marginLeft: 8, fontSize: "0.92em" }}>
                      <Highlighted text={p.id} query={query} />
                    </span>
                  </span>
                  {isSelected && (
                    <span style={{ color: "#1971c2", fontSize: "0.85em", flexShrink: 0 }}>已選</span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
