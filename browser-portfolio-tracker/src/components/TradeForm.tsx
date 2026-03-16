import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { fetchQuote } from '@/services/finnhub'
import { computePortfolio } from '@/engine/portfolio'
import { TickerSearch } from './TickerSearch'
import { ErrorBanner } from './ErrorBanner'
import { LoadingSpinner } from './LoadingSpinner'

interface FormState {
  ticker: string
  type: 'buy' | 'sell'
  shares: string
}

const EMPTY: FormState = { ticker: '', type: 'buy', shares: '' }

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TradeForm() {
  const addTrade = useStore((s) => s.addTrade)
  const trades = useStore((s) => s.trades)
  const prices = useStore((s) => s.prices)
  const startingCash = useStore((s) => s.settings.startingCash)
  const tradingFeePercent = useStore((s) => s.settings.tradingFeePercent)

  const [form, setForm] = useState<FormState>(EMPTY)
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null)
  const [priceFetching, setPriceFetching] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Live portfolio state — cash balance and open positions
  const portfolio = useMemo(
    () => computePortfolio(trades, prices, startingCash),
    [trades, prices, startingCash]
  )
  const { cashBalance } = portfolio

  // Current position for the selected ticker (for sell validation)
  const currentPosition = useMemo(
    () => portfolio.positions.find((p) => p.ticker === form.ticker.toUpperCase()) ?? null,
    [portfolio.positions, form.ticker]
  )

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
    setError(null)
  }

  function handleTickerChange(ticker: string) {
    setField('ticker', ticker)
    setFetchedPrice(null)
    setPriceError(null)
  }

  async function handleFetchPrice() {
    if (!form.ticker.trim()) {
      setPriceError('Enter a ticker symbol first.')
      return
    }
    setPriceFetching(true)
    setPriceError(null)
    try {
      const price = await fetchQuote(form.ticker.toUpperCase())
      setFetchedPrice(price)
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : 'Failed to fetch price.')
      setFetchedPrice(null)
    } finally {
      setPriceFetching(false)
    }
  }

  // Derived trade values
  const shares = parseFloat(form.shares) || 0
  const price = fetchedPrice ?? 0
  const subtotal = shares * price
  const fee = subtotal * (tradingFeePercent / 100)
  const totalCost = subtotal + fee      // cash out for a buy
  const totalProceeds = subtotal - fee  // cash in for a sell

  // Affordability checks (computed live so the UI reacts as the user types)
  const insufficientCash = form.type === 'buy' && shares > 0 && price > 0 && totalCost > cashBalance
  const insufficientShares =
    form.type === 'sell' &&
    shares > 0 &&
    (currentPosition === null || shares > currentPosition.shares)

  const cannotSubmit = insufficientCash || insufficientShares

  function validate(): string | null {
    if (!form.ticker.trim()) return 'Ticker is required.'
    if (!fetchedPrice) return 'Fetch the current price before submitting.'
    if (isNaN(shares) || shares <= 0) return 'Shares must be a positive number.'
    if (insufficientCash)
      return `Insufficient cash. Available: $${fmt(cashBalance)}, Required: $${fmt(totalCost)}.`
    if (insufficientShares) {
      const held = currentPosition?.shares ?? 0
      return `Insufficient shares. You hold ${fmt(held)} ${form.ticker.toUpperCase()}, tried to sell ${fmt(shares)}.`
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setSubmitting(true)
    setError(null)
    try {
      await addTrade({
        ticker: form.ticker.toUpperCase(),
        type: form.type,
        shares,
        price: fetchedPrice!,
        fee,
      })
      setForm(EMPTY)
      setFetchedPrice(null)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Record Trade</h2>
        {/* Live cash balance indicator */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Cash available:{' '}
          <span className={`font-semibold tabular-nums ${
            cashBalance >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            ${fmt(cashBalance)}
          </span>
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        {/* Ticker */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ticker Symbol
          </label>
          <TickerSearch value={form.ticker} onChange={handleTickerChange} />
          {/* Show held shares when selling */}
          {form.type === 'sell' && currentPosition && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Holding{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {fmt(currentPosition.shares)}
              </span>{' '}
              shares at avg cost{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                ${fmt(currentPosition.avgCost)}
              </span>
            </p>
          )}
          {form.type === 'sell' && form.ticker && !currentPosition && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              No open position for {form.ticker.toUpperCase()}.
            </p>
          )}
        </div>

        {/* Buy / Sell toggle */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Trade Type
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            {(['buy', 'sell'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                  form.type === t
                    ? t === 'buy'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Shares */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Shares
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={form.shares}
            onChange={(e) => setField('shares', e.target.value)}
            placeholder="100"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        {/* Price — fetched from API */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price per Share
          </label>
          <div className="flex gap-2">
            <div className={`flex flex-1 items-center rounded-lg border px-3 py-2 text-sm tabular-nums ${
              fetchedPrice
                ? 'border-green-400 bg-green-50 font-semibold text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300'
                : 'border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
            }`}>
              {fetchedPrice
                ? `$${fmt(fetchedPrice)}`
                : <span className="italic">No price fetched</span>}
            </div>
            <button
              type="button"
              onClick={handleFetchPrice}
              disabled={priceFetching || !form.ticker.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
              title="Fetch current market price"
            >
              {priceFetching ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {priceFetching ? 'Fetching…' : 'Get Price'}
            </button>
          </div>
          {priceError && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{priceError}</p>
          )}
        </div>

        {/* Trade summary */}
        {fetchedPrice && shares > 0 && (
          <div className={`rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-800 ${
            cannotSubmit
              ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({fmt(shares)} × ${fmt(price)})</span>
                <span className="tabular-nums">${fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-500">
                <span>Fee ({tradingFeePercent}%)</span>
                <span className="tabular-nums">
                  {form.type === 'buy' ? '+' : '−'}${fmt(fee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
                <span>Total {form.type === 'buy' ? 'Cost' : 'Proceeds'}</span>
                <span className="tabular-nums">
                  {form.type === 'buy' ? '−' : '+'}${fmt(form.type === 'buy' ? totalCost : totalProceeds)}
                </span>
              </div>

              {/* Insufficient funds warning */}
              {insufficientCash && (
                <div className="mt-2 flex items-start gap-1.5 rounded bg-red-100 px-2 py-1.5 text-xs text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  <span className="shrink-0">✕</span>
                  <span>
                    Insufficient cash — need ${fmt(totalCost)}, have ${fmt(cashBalance)}.
                    Shortfall: ${fmt(totalCost - cashBalance)}.
                  </span>
                </div>
              )}

              {/* Insufficient shares warning */}
              {insufficientShares && (
                <div className="mt-2 flex items-start gap-1.5 rounded bg-red-100 px-2 py-1.5 text-xs text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  <span className="shrink-0">✕</span>
                  <span>
                    Insufficient shares — trying to sell {fmt(shares)}, holding{' '}
                    {fmt(currentPosition?.shares ?? 0)} {form.ticker.toUpperCase()}.
                  </span>
                </div>
              )}

              {/* After-trade cash preview */}
              {!cannotSubmit && (
                <div className="flex justify-between pt-1 text-xs text-gray-400 dark:text-gray-500">
                  <span>Cash after trade</span>
                  <span className="tabular-nums">
                    ${fmt(form.type === 'buy' ? cashBalance - totalCost : cashBalance + totalProceeds)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            Trade recorded successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || cannotSubmit}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitting
            ? 'Saving…'
            : insufficientCash
            ? 'Insufficient Cash'
            : insufficientShares
            ? 'Insufficient Shares'
            : 'Submit Trade'}
        </button>
      </form>
    </div>
  )
}
