import { useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Portfolio } from '@/types'

ChartJS.register(ArcElement, Tooltip, Legend)

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1',
  '#14b8a6', '#a855f7', '#eab308', '#64748b', '#0ea5e9',
]
const CASH_COLOR = '#6b7280' // gray-500

interface Props {
  portfolio: Portfolio
}

export function AllocationChart({ portfolio }: Props) {
  const { positions, cashBalance } = portfolio

  const data = useMemo(() => {
    const withPrice = positions.filter((p) => p.currentPrice > 0 && p.marketValue > 0)
    const cash = cashBalance > 0 ? cashBalance : 0
    if (withPrice.length === 0 && cash === 0) return null

    const labels = [...withPrice.map((p) => p.ticker), ...(cash > 0 ? ['Cash'] : [])]
    const values = [...withPrice.map((p) => p.marketValue), ...(cash > 0 ? [cash] : [])]
    const colors = [
      ...withPrice.map((_, i) => PALETTE[i % PALETTE.length]),
      ...(cash > 0 ? [CASH_COLOR] : []),
    ]

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    }
  }, [positions, cashBalance])

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
        Price data needed to show allocation.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Portfolio Allocation
      </h3>
      <div className="flex justify-center">
        <div className="h-64 w-full">
          <Pie
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    font: { size: 11 },
                    padding: 10,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    color: 'currentColor',
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
                      const val = ctx.parsed as number
                      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0'
                      return ` $${val.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} (${pct}%)`
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
