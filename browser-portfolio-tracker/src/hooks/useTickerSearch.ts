/**
 * Debounced ticker search hook.
 */

import { useState, useEffect, useRef } from 'react'
import { searchTickers } from '@/services/finnhub'
import type { FinnhubSearchResult } from '@/types'

const DEBOUNCE_MS = 350

export function useTickerSearch(query: string) {
  const [results, setResults] = useState<FinnhubSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      setError(null)
      try {
        const data = await searchTickers(query)
        setResults(data)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Search failed')
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return { results, loading, error }
}
