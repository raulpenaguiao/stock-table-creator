/**
 * Pure portfolio computation engine.
 * No side effects — takes trades + prices and returns derived state.
 */

import type { Trade, Position, Portfolio, PriceMap } from '@/types'

interface PositionAccumulator {
  shares: number
  totalCost: number // weighted-average cost basis (shares * avgCost)
}

/**
 * Aggregates an ordered list of trades into open positions using
 * weighted-average cost basis (WAVG). Sells reduce shares proportionally.
 */
function aggregateTrades(trades: Trade[]): Map<string, PositionAccumulator> {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const acc = new Map<string, PositionAccumulator>()

  for (const trade of sorted) {
    const { ticker, type, shares, price, fee } = trade
    if (!acc.has(ticker)) acc.set(ticker, { shares: 0, totalCost: 0 })
    const pos = acc.get(ticker)!

    if (type === 'buy') {
      pos.totalCost += shares * price + fee
      pos.shares += shares
    } else {
      // sell: reduce shares; cost basis reduces at existing avg cost
      const avgCost = pos.shares > 0 ? pos.totalCost / pos.shares : 0
      const soldShares = Math.min(shares, pos.shares)
      pos.totalCost -= avgCost * soldShares
      pos.shares = Math.max(0, pos.shares - soldShares)
    }
  }

  return acc
}

/** Compute cash balance from trades relative to a starting cash amount. */
function computeCashBalance(trades: Trade[], startingCash: number): number {
  return trades.reduce((cash, { type, shares, price, fee }) => {
    if (type === 'buy') return cash - shares * price - fee
    return cash + shares * price - fee
  }, startingCash)
}

/** Build the full portfolio from trades and current prices. */
export function computePortfolio(
  trades: Trade[],
  prices: PriceMap,
  startingCash: number
): Portfolio {
  const accMap = aggregateTrades(trades)

  const positions: Position[] = []

  for (const [ticker, { shares, totalCost }] of accMap.entries()) {
    if (shares <= 0.0001) continue // ignore dust

    const avgCost = totalCost / shares
    const currentPrice = prices[ticker] ?? 0
    const marketValue = shares * currentPrice
    const costBasis = shares * avgCost
    const unrealizedPL = currentPrice > 0 ? marketValue - costBasis : 0
    const unrealizedPLPct =
      costBasis > 0 && currentPrice > 0 ? (unrealizedPL / costBasis) * 100 : 0

    positions.push({
      ticker,
      shares,
      avgCost,
      currentPrice,
      marketValue,
      costBasis,
      unrealizedPL,
      unrealizedPLPct,
    })
  }

  // Sort by market value descending
  positions.sort((a, b) => b.marketValue - a.marketValue)

  const totalMarketValue = positions.reduce((s, p) => s + p.marketValue, 0)
  const totalCostBasis = positions.reduce((s, p) => s + p.costBasis, 0)
  const totalUnrealizedPL = totalMarketValue - totalCostBasis
  const totalUnrealizedPLPct =
    totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0
  const cashBalance = computeCashBalance(trades, startingCash)

  return {
    positions,
    totalMarketValue,
    totalCostBasis,
    totalUnrealizedPL,
    totalUnrealizedPLPct,
    cashBalance,
  }
}

/** Extract unique tickers from an open position set. */
export function getActiveTickers(trades: Trade[]): string[] {
  const acc = aggregateTrades(trades)
  return [...acc.entries()]
    .filter(([, pos]) => pos.shares > 0.0001)
    .map(([ticker]) => ticker)
}
