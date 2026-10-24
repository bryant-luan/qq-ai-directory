#!/usr/bin/env node
/**
 * Refresh data/binance-usdtm-pairs.json from Binance USDT-M exchangeInfo.
 * Usage: node scripts/refresh-binance-usdtm-pairs.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINTS = [
  "https://www.binance.com/fapi/v1/exchangeInfo",
  "https://fapi.binance.com/fapi/v1/exchangeInfo",
];

const ALLOWED = new Set(["PERPETUAL", "TRADIFI_PERPETUAL"]);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "data", "binance-usdtm-pairs.json");

async function load() {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "qq-ai-directory-refresh/1.0" },
      });
      if (!res.ok) {
        console.warn(`skip ${url}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (!Array.isArray(data.symbols)) continue;
      const pairs = data.symbols
        .filter(
          (s) =>
            s.quoteAsset === "USDT" &&
            s.status === "TRADING" &&
            ALLOWED.has(s.contractType)
        )
        .map((s) => ({ id: s.symbol, base: s.baseAsset, quote: "USDT" }))
        .sort((a, b) => a.id.localeCompare(b.id));
      if (pairs.length === 0) continue;
      const body = {
        generatedAt: new Date().toISOString(),
        source: url,
        filter: "USDT quote, TRADING, PERPETUAL|TRADIFI_PERPETUAL",
        count: pairs.length,
        pairs,
      };
      writeFileSync(outPath, `${JSON.stringify(body, null, 2)}\n`);
      console.log(`Wrote ${pairs.length} pairs → ${outPath} (from ${url})`);
      return;
    } catch (err) {
      console.warn(`skip ${url}:`, err?.message ?? err);
    }
  }
  console.error("Failed to refresh pairs from all endpoints.");
  process.exit(1);
}

await load();
