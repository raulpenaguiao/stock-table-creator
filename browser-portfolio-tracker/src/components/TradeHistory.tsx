import { useState } from 'react'
import { useStore } from '@/store/useStore'
import type { Trade } from '@/types'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TradeRow({ trade, onDelete }: { trade: Trade; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
      <td className="py-3 pl-4 pr-2 text-xs text-gray-500 dark:text-gray-400">
        {new Date(trade.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>
      <td className="px-2 py-3 font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
        {trade.ticker}
      </td>
      <td className="px-2 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
            trade.type === 'buy'
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {trade.type}
        </span>
      </td>
      <td className="px-2 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
        {fmt(trade.shares)}
      </td>
      <td className="px-2 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
        ${fmt(trade.price)}
      </td>
      <td className="px-2 py-3 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
        ${fmt(trade.fee)}
      </td>
      <td className="px-2 py-3 text-right text-sm font-medium tabular-nums text-gray-800 dark:text-gray-100">
        ${fmt(trade.shares * trade.price)}
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onDelete(trade.id)}
              className="rounded px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-950 dark:hover:text-red-400"
            aria-label="Delete trade"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  )
}

export function TradeHistory() {
  const trades = useStore((s) => s.trades)
  const deleteTrade = useStore((s) => s.deleteTrade)

  const sorted = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium">No trades recorded yet.</p>
        <p className="mt-1 text-sm">Use the Trade Entry tab to record your first trade.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
        Trade History
        <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
          ({sorted.length} trades)
        </span>
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <th className="py-3 pl-4 pr-2">Date</th>
              <th className="px-2 py-3">Ticker</th>
              <th className="px-2 py-3">Type</th>
              <th className="px-2 py-3 text-right">Shares</th>
              <th className="px-2 py-3 text-right">Price</th>
              <th className="px-2 py-3 text-right">Fee</th>
              <th className="px-2 py-3 text-right">Subtotal</th>
              <th className="py-3 pl-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade) => (
              <TradeRow key={trade.id} trade={trade} onDelete={deleteTrade} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
