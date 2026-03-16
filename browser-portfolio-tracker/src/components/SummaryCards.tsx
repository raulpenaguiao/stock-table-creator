import type { Portfolio } from '@/types'

interface Props {
  portfolio: Portfolio
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

interface CardProps {
  label: string
  value: string
  sub?: string
  subColor?: string
}

function Card({ label, value, sub, subColor = 'text-gray-500 dark:text-gray-400' }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
        {value}
      </p>
      {sub && <p className={`mt-0.5 text-sm tabular-nums ${subColor}`}>{sub}</p>}
    </div>
  )
}

export function SummaryCards({ portfolio }: Props) {
  const { totalMarketValue, cashBalance, totalUnrealizedPL, totalUnrealizedPLPct } = portfolio

  const plColor = totalUnrealizedPL >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'

  const cashColor = cashBalance < 0
    ? 'text-red-500 dark:text-red-400'
    : 'text-green-600 dark:text-green-400'

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card
        label="Portfolio Value"
        value={`$${fmt(totalMarketValue + Math.max(0, cashBalance))}`}
      />
      <Card
        label="Invested Value"
        value={`$${fmt(totalMarketValue)}`}
        sub={`${portfolio.positions.length} position${portfolio.positions.length !== 1 ? 's' : ''}`}
      />
      <Card
        label="Cash Balance"
        value={`$${fmt(cashBalance)}`}
        sub={cashBalance < 0 ? 'Net outflow' : 'Available'}
        subColor={cashColor}
      />
      <Card
        label="Unrealized P&L"
        value={`${totalUnrealizedPL >= 0 ? '+' : ''}$${fmt(totalUnrealizedPL)}`}
        sub={fmtPct(totalUnrealizedPLPct)}
        subColor={plColor}
      />
    </div>
  )
}
