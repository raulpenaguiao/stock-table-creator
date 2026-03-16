# Stock table creator

This is a project that aims to create a stock tracker.
A user buys or sells stocks at a market price, and the program will keep track of all the stocks that were bought and the current balance.

A browser-based stock portfolio tracker that allows users to manually record stock trades (buy/sell) and automatically track portfolio value using live market prices.

The application runs entirely in the browser and stores trade data locally, allowing users to track investments without connecting to their brokerage accounts.

---

# Overview

This project is a lightweight investment tracking tool designed for:

- personal portfolio monitoring
- tracking trades over time
- analyzing profits and losses
- understanding investment performance

The application fetches real-time stock prices from a market data API and calculates the total value of the user's portfolio.

All trade history is stored locally in the browser.

No brokerage integration is required.
Upon start one is prompted with the current cash balance, and this balance will be kept updated as trades are logged.
User can add more cash balance as needed.

---

# Features

## Portfolio Dashboard

The main dashboard displays:

- total portfolio value
- cash balance
- unrealized profit / loss
- individual stock positions
- price changes

Each position shows:

- ticker symbol
- number of shares
- average purchase price
- current market price
- market value
- unrealized gain/loss

---

## Trade Logging

Users can manually log trades:

Buy trade fields:

- ticker
- number of shares
- price per share
- trading fee
- timestamp

Sell trade fields:

- ticker
- shares sold
- price
- trading fee
- timestamp

Trades update the portfolio automatically.

---

## Live Price Updates

The app fetches live stock prices periodically.

Price updates:

- on page load
- every 60 seconds

Prices are used to update portfolio value and profit/loss calculations.

---

## Portfolio Value Calculation

Portfolio value is calculated as:

$$portfolio_value = Σ (shares_i × price_i)$$

Total net worth includes cash balance:

$$net_worth = cash_balance + portfolio_value$$

---

## Profit Calculation

Profit accounts for trading fees.
$$profit = marketvalue − totalcost − totalfees$$

Where:

- totalcost = sum of purchase prices
- totalfees = sum of trade fees

---

# Architecture

The application uses a simple client-side architecture.

```

Browser (React App)
│
│
▼
Local Trade Storage (IndexedDB / LocalStorage)
│
│
▼
Market Price API

```

Key principle:

Trades are stored locally and positions are **computed dynamically**.

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Chart.js (for charts)

Storage

- IndexedDB (via Dexie or idb)

Data APIs

- Finnhub API (ticker search + quotes)

---

# Data Model

Trade

```

id: string
ticker: string
type: "buy" | "sell"
quantity: number
price: number
fee: number
timestamp: number

```

Position (computed)

```

ticker
shares
average_cost
current_price
market_value
unrealized_profit

```

---

# User Interface

Main screens:

Dashboard

- portfolio summary
- list of positions
- P/L indicators

Add Trade

- ticker search
- buy/sell selector
- shares input
- price
- fee
- submit

Trade History

- chronological list of trades

---

# Future Features

Possible improvements:

- portfolio value history
- performance charts
- CSV import from brokers
- strategy tagging
- dividend tracking
- multi-currency support
- cloud sync

---

# Setup

Clone repository

```

git clone <repo>
cd portfolio-tracker

```

Install dependencies

```

npm install

```

Run development server

```

npm run dev

```

---

# API Configuration

Create a `.env` file:

```

VITE_FINNHUB_API_KEY=your_key_here

```

---

# Project Structure

```

src/

components/
PortfolioTable.tsx
TradeForm.tsx
Dashboard.tsx

services/
priceApi.ts
portfolioEngine.ts

storage/
tradesDB.ts

types/
trade.ts
position.ts

```

---

# License

MIT
```

# API Keys You Need

You will need **one market API key**.

The easiest is:

### Finnhub

Signup:

```
https://finnhub.io
```

Free tier includes:

* stock quotes
* ticker search
* enough requests for a personal app

Typical endpoints:

```
/quote
/search
```

---

# Optional APIs (Later)

Better data providers:

* Polygon.io
* Alpha Vantage
* Twelve Data

---
