/**
 * Polls Finnhub for current prices every 60 seconds.
 * Only fetches prices for tickers that have open positions.
 */

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { fetchQuotes } from '@/services/finnhub'
import { getActiveTickers } from '@/engine/portfolio'

const POLL_INTERVAL_MS = 60_000

export function usePricePoller() {
  const trades = useStore((s) => s.trades)
  const tradesLoaded = useStore((s) => s.tradesLoaded)
  const apiKey = useStore((s) => s.settings.apiKey)
  const updatePrices = useStore((s) => s.updatePrices)
  const setPriceError = useStore((s) => s.setPriceError)
  const setPriceLoading = useStore((s) => s.setPriceLoading)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!tradesLoaded || !apiKey) return

    const tickers = getActiveTickers(trades)
    if (tickers.length === 0) return

    async function poll() {
      setPriceLoading(true)
      try {
        const prices = await fetchQuotes(tickers)
        updatePrices(prices)
      } catch (err) {
        setPriceError(err instanceof Error ? err.message : 'Failed to fetch prices')
      } finally {
        setPriceLoading(false)
      }
    }

    poll()

    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [tradesLoaded, apiKey, trades.length]) // re-run when tickers change
}
