// ─── Domain Models ───────────────────────────────────────────────────────────

export interface Trade {
  id: string
  ticker: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  fee: number
  date: string // ISO 8601
}

export interface Position {
  ticker: string
  shares: number
  avgCost: number
  currentPrice: number
  marketValue: number
  costBasis: number
  unrealizedPL: number
  unrealizedPLPct: number
}

export interface Portfolio {
  positions: Position[]
  totalMarketValue: number
  totalCostBasis: number
  totalUnrealizedPL: number
  totalUnrealizedPLPct: number
  cashBalance: number
}

// ─── Finnhub API ─────────────────────────────────────────────────────────────

export interface FinnhubQuote {
  c: number  // current price
  d: number  // change
  dp: number // change percent
  h: number  // high
  l: number  // low
  o: number  // open
  pc: number // previous close
}

export interface FinnhubSearchResult {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

export interface FinnhubSearchResponse {
  count: number
  result: FinnhubSearchResult[]
}

// ─── App State ────────────────────────────────────────────────────────────────

export type AppTab = 'dashboard' | 'trade' | 'history'

export type PriceMap = Record<string, number>

export interface AppSettings {
  apiKey: string
  startingCash: number
  tradingFeePercent: number
}
