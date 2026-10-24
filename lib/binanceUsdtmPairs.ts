export type ContractPair = {
  id: string;
  base: string;
  quote: string;
};

/** Tiny majors-only list if both live fetch and committed snapshot fail. */
export const FALLBACK_USDTM_PAIRS: ContractPair[] = [
  { id: "BTCUSDT", base: "BTC", quote: "USDT" },
  { id: "ETHUSDT", base: "ETH", quote: "USDT" },
  { id: "SOLUSDT", base: "SOL", quote: "USDT" },
  { id: "BNBUSDT", base: "BNB", quote: "USDT" },
  { id: "XRPUSDT", base: "XRP", quote: "USDT" },
  { id: "DOGEUSDT", base: "DOGE", quote: "USDT" },
];

type BinanceSymbol = {
  symbol?: string;
  baseAsset?: string;
  quoteAsset?: string;
  status?: string;
  contractType?: string;
};

type BinanceExchangeInfo = {
  symbols?: BinanceSymbol[];
};

const ALLOWED_CONTRACT_TYPES = new Set(["PERPETUAL", "TRADIFI_PERPETUAL"]);

/** Parse Binance USDT-M `exchangeInfo` into trading perpetual pairs. */
export function parseUsdtmPerpetuals(info: BinanceExchangeInfo): ContractPair[] {
  const symbols = Array.isArray(info?.symbols) ? info.symbols : [];
  const pairs: ContractPair[] = [];

  for (const s of symbols) {
    if (
      s.quoteAsset === "USDT" &&
      s.status === "TRADING" &&
      typeof s.symbol === "string" &&
      typeof s.baseAsset === "string" &&
      ALLOWED_CONTRACT_TYPES.has(s.contractType ?? "")
    ) {
      pairs.push({ id: s.symbol, base: s.baseAsset, quote: "USDT" });
    }
  }

  pairs.sort((a, b) => a.id.localeCompare(b.id));
  return pairs;
}

export function preferDefaultPair(pairs: ContractPair[], preferredId = "BTCUSDT"): string {
  if (pairs.some((p) => p.id === preferredId)) return preferredId;
  return pairs[0]?.id ?? preferredId;
}
