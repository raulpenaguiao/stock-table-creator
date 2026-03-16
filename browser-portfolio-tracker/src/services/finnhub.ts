/**
 * Finnhub API service.
 * API key is read from the app settings stored in localStorage.
 */

import type {
  FinnhubQuote,
  FinnhubSearchResponse,
  FinnhubSearchResult,
} from '@/types'

const BASE_URL = 'https://finnhub.io/api/v1'
const SETTINGS_KEY = 'portfolio_tracker_settings'

function getApiKey(): string {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return ''
    return (JSON.parse(raw) as { apiKey?: string }).apiKey ?? ''
  } catch {
    return ''
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('Finnhub API key not configured. Open Settings to add your key.')

  const url = `${BASE_URL}${path}&token=${apiKey}`
  const res = await fetch(url)

  if (res.status === 401 || res.status === 403) {
    throw new Error('Invalid Finnhub API key. Please check your key in Settings.')
  }
  if (res.status === 429) {
    throw new Error('Finnhub rate limit exceeded. Try again in a moment.')
  }
  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

/** Fetch real-time quote for a single ticker. Returns current price (c field). */
export async function fetchQuote(ticker: string): Promise<number> {
  const data = await apiFetch<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(ticker)}`)
  if (data.c === 0 && data.pc === 0) {
    throw new Error(`No price data for ${ticker}. Check the ticker symbol.`)
  }
  return data.c
}

/** Fetch quotes for multiple tickers in parallel. Returns a map of ticker → price. */
export async function fetchQuotes(
  tickers: string[]
): Promise<Record<string, number>> {
  if (tickers.length === 0) return {}

  const results = await Promise.allSettled(
    tickers.map(async (ticker) => ({ ticker, price: await fetchQuote(ticker) }))
  )

  const priceMap: Record<string, number> = {}
  for (const result of results) {
    if (result.status === 'fulfilled') {
      priceMap[result.value.ticker] = result.value.price
    }
  }
  return priceMap
}

/** Search for ticker symbols matching the query. */
export async function searchTickers(query: string): Promise<FinnhubSearchResult[]> {
  if (!query.trim()) return []
  const data = await apiFetch<FinnhubSearchResponse>(
    `/search?q=${encodeURIComponent(query)}`
  )
  // Filter to stocks and ETFs only, limit to 8 results
  return (data.result ?? [])
    .filter((r) => r.type === 'Common Stock' || r.type === 'ETP' || r.type === '')
    .slice(0, 8)
}
