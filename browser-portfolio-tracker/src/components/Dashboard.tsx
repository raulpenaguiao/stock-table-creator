import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { computePortfolio } from '@/engine/portfolio'
import { SummaryCards } from './SummaryCards'
import { PositionsTable } from './PositionsTable'
import { AllocationChart } from './AllocationChart'
import { ErrorBanner } from './ErrorBanner'
import { LoadingSpinner } from './LoadingSpinner'

export function Dashboard() {
  const trades = useStore((s) => s.trades)
  const prices = useStore((s) => s.prices)
  const startingCash = useStore((s) => s.settings.startingCash)
  const priceLoading = useStore((s) => s.priceLoading)
  const priceError = useStore((s) => s.priceError)
  const lastPriceUpdate = useStore((s) => s.lastPriceUpdate)
  const setPriceError = useStore((s) => s.setPriceError)
  const apiKey = useStore((s) => s.settings.apiKey)
  const setShowSettings = useStore((s) => s.setShowSettings)

  const portfolio = useMemo(
    () => computePortfolio(trades, prices, startingCash),
    [trades, prices, startingCash]
  )

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          {priceLoading && (
            <span className="flex items-center gap-1">
              <LoadingSpinner size="sm" />
              Updating prices…
            </span>
          )}
          {lastPriceUpdate && !priceLoading && (
            <span>Updated {lastPriceUpdate.toLocaleTimeString()}</span>
          )}
          {!apiKey && (
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
            >
              ⚙ Configure API Key
            </button>
          )}
        </div>
      </div>

      {priceError && (
        <ErrorBanner message={priceError} onDismiss={() => setPriceError(null)} />
      )}

      <SummaryCards portfolio={portfolio} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Open Positions
          </h3>
          <PositionsTable positions={portfolio.positions} />
        </div>
        <div>
          <AllocationChart portfolio={portfolio} />
        </div>
      </div>
    </div>
  )
}
