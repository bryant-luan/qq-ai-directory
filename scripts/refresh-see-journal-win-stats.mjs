#!/usr/bin/env node
/**
 * Build data/see-journal-win-stats.json from SEE journal JSONL.
 *
 * Usage:
 *   node scripts/refresh-see-journal-win-stats.mjs [path/to/see_journal.jsonl]
 *
 * Default input (Project store on agent VMs):
 *   /cursor/stores/self/internal/see-journal/see_journal-2.jsonl
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "data", "see-journal-win-stats.json");
const defaultIn =
  "/cursor/stores/self/internal/see-journal/see_journal-2.jsonl";
const inPath = process.argv[2] || defaultIn;

if (!existsSync(inPath)) {
  console.error(`Input not found: ${inPath}`);
  process.exit(1);
}

function firstTp(o) {
  if (o.tp != null && Number.isFinite(Number(o.tp))) return Number(o.tp);
  if (Array.isArray(o.tp_prices) && o.tp_prices.length) {
    const v = Number(o.tp_prices[0]);
    if (Number.isFinite(v)) return v;
  }
  return null;
}

function pack(ws) {
  const sorted = [...ws].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  return {
    n: sorted.length,
    meanWin: Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 100) / 100,
    medianWin: Math.round(median * 100) / 100,
  };
}

const bySymDir = new Map();
const byDir = new Map();
const all = [];
let nRows = 0;
let n1to1 = 0;

for (const line of readFileSync(inPath, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let o;
  try {
    o = JSON.parse(line);
  } catch {
    continue;
  }
  if (o.win == null) continue;
  const w = Number(o.win);
  if (!Number.isFinite(w) || w < 0 || w > 100) continue;
  const entry = Number(o.entry);
  const sl = Number(o.sl);
  const tp = firstTp(o);
  if (![entry, sl, tp].every(Number.isFinite)) continue;
  const R = Math.abs(entry - sl);
  const G = Math.abs(tp - entry);
  if (R <= 0 || G <= 0) continue;
  const sym = String(o.symbol || "").toUpperCase();
  const d = String(o.direction || "").toLowerCase();
  if (!sym || (d !== "long" && d !== "short")) continue;
  nRows += 1;
  if (Math.abs(G / R - 1) < 0.05) n1to1 += 1;
  all.push(w);
  if (!byDir.has(d)) byDir.set(d, []);
  byDir.get(d).push(w);
  const key = `${sym}|${d}`;
  if (!bySymDir.has(key)) bySymDir.set(key, []);
  bySymDir.get(key).push(w);
}

const bySymbolDirection = {};
for (const [key, ws] of [...bySymDir.entries()].sort((a, b) => b[1].length - a[1].length)) {
  if (ws.length < 3) continue;
  bySymbolDirection[key] = pack(ws);
}

const byDirection = {};
for (const [d, ws] of byDir.entries()) byDirection[d] = pack(ws);

const payload = {
  generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  source: "see_journal-2.jsonl",
  filter: "rows with numeric win 0–100 plus entry/sl/tp",
  nWinRows: nRows,
  nApprox1to1RR: n1to1,
  minSymbolSamples: 3,
  disclaimerZh:
    "SEE journal 樣本參考勝率（多為模型 win 欄位，非保證；journal 設定多為約 1R:1R）",
  overall: pack(all),
  byDirection,
  bySymbolDirection,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Wrote ${outPath} (n=${nRows}, symbolKeys=${Object.keys(bySymbolDirection).length})`
);
