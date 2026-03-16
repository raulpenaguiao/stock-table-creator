import { useState, useRef, useEffect } from 'react'
import { useTickerSearch } from '@/hooks/useTickerSearch'
import { LoadingSpinner } from './LoadingSpinner'

interface Props {
  value: string
  onChange: (ticker: string) => void
}

export function TickerSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { results, loading, error } = useTickerSearch(open ? query : '')

  // Sync external value resets (e.g. form clear)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(symbol: string) {
    setQuery(symbol)
    onChange(symbol)
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.toUpperCase()
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="AAPL"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm uppercase text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {open && (results.length > 0 || error) && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {error && (
            <li className="px-3 py-2 text-xs text-red-500 dark:text-red-400">{error}</li>
          )}
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                type="button"
                onMouseDown={() => handleSelect(r.symbol)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <span className="w-20 shrink-0 font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {r.displaySymbol}
                </span>
                <span className="truncate text-gray-600 dark:text-gray-400">{r.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
