# Browser Portfolio Tracker

A fully client-side stock portfolio tracker built with React, TypeScript, Vite, TailwindCSS, Chart.js, and IndexedDB.

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A free [Finnhub](https://finnhub.io) API key

### 2. Install & run

```bash
cd browser-portfolio-tracker
npm install
npm run dev
```

Then open `http://localhost:5173`.

### 3. Configure your API key

Click the **⚙ gear icon** (top-right) to open Settings and paste your Finnhub API key.
The key is stored only in your browser's `localStorage` — it never leaves your machine.

Optionally set a **Starting Cash Balance** to track available funds.

---

## Features

| Feature | Detail |
|---|---|
| **Dashboard** | Total portfolio value, cash balance, unrealized P&L, positions table |
| **Trade Entry** | Ticker autocomplete (Finnhub search), buy/sell toggle, shares/price/fee fields |
| **Trade History** | Chronological list with per-trade delete (with confirmation) |
| **Live Prices** | Fetched from Finnhub every 60 seconds for all open positions |
| **Allocation Chart** | Pie chart of portfolio allocation by market value |
| **Persistence** | All trades stored in IndexedDB — survives page refresh |
| **Responsive** | Works on desktop and mobile |

---

## Architecture

```
src/
├── types/          # Shared TypeScript interfaces
├── services/
│   ├── finnhub.ts  # Finnhub API client (quote + search)
│   └── db.ts       # IndexedDB CRUD wrapper
├── engine/
│   └── portfolio.ts # Pure portfolio computation (WAVG cost basis, P&L)
├── store/
│   └── useStore.ts  # Zustand global state
├── hooks/
│   ├── usePricePoller.ts  # 60-second price polling
│   └── useTickerSearch.ts # Debounced ticker search
└── components/
    ├── Dashboard.tsx
    ├── SummaryCards.tsx
    ├── PositionsTable.tsx
    ├── AllocationChart.tsx
    ├── TradeForm.tsx
    ├── TickerSearch.tsx
    ├── TradeHistory.tsx
    ├── SettingsModal.tsx
    ├── LoadingSpinner.tsx
    └── ErrorBanner.tsx
```

### Cost Basis Method

Uses **weighted-average cost (WAVG)**:
- **Buy**: `new_avg = (existing_shares × existing_avg + new_shares × price + fee) / (existing_shares + new_shares)`
- **Sell**: shares decrease; cost basis reduces at current average cost

### Data Flow

```
IndexedDB ──► Zustand store ──► computePortfolio() ──► Dashboard
Finnhub API ──► usePricePoller ──► store.prices ──┘
```

---

## Build for production

```bash
npm run build
npm run preview   # preview the dist/ build locally
```

---

## Notes

- The Finnhub free tier allows ~60 API calls/minute. With many positions the poller might hit rate limits; the app shows an error banner and retries on the next interval.
- All data (trades, settings) is stored client-side. Clearing browser data will erase your history.
