import type { Position } from '@/types'

interface Props {
  positions: Position[]
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function PLBadge({ value, pct }: { value: number; pct: number }) {
  const positive = value >= 0
  const color = positive
    ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950'
    : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950'
  return (
    <div className={`inline-flex flex-col items-end rounded px-2 py-0.5 tabular-nums ${color}`}>
      <span className="text-sm font-semibold">
        {positive ? '+' : ''}${fmt(Math.abs(value))}
      </span>
      <span className="text-xs">
        {positive ? '+' : ''}{fmt(pct)}%
      </span>
    </div>
  )
}

export function PositionsTable({ positions }: Props) {
  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
        No open positions. Record a buy trade to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <th className="py-3 pl-4 pr-2">Ticker</th>
            <th className="px-2 py-3 text-right">Shares</th>
            <th className="px-2 py-3 text-right">Avg Cost</th>
            <th className="px-2 py-3 text-right">Current Price</th>
            <th className="px-2 py-3 text-right">Market Value</th>
            <th className="py-3 pl-2 pr-4 text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={pos.ticker}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <td className="py-3 pl-4 pr-2">
                <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">
                  {pos.ticker}
                </span>
              </td>
              <td className="px-2 py-3 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                {fmt(pos.shares, pos.shares % 1 === 0 ? 0 : 4)}
              </td>
              <td className="px-2 py-3 text-right text-sm tabular-nums text-gray-600 dark:text-gray-400">
                ${fmt(pos.avgCost)}
              </td>
              <td className="px-2 py-3 text-right text-sm tabular-nums">
                {pos.currentPrice > 0 ? (
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    ${fmt(pos.currentPrice)}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-600">—</span>
                )}
              </td>
              <td className="px-2 py-3 text-right text-sm font-medium tabular-nums text-gray-800 dark:text-gray-100">
                {pos.currentPrice > 0
                  ? `$${fmt(pos.marketValue)}`
                  : <span className="text-gray-400 dark:text-gray-600">—</span>}
              </td>
              <td className="py-3 pl-2 pr-4 text-right">
                {pos.currentPrice > 0 ? (
                  <PLBadge value={pos.unrealizedPL} pct={pos.unrealizedPLPct} />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No price</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
