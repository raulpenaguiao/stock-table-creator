/**
 * Global Zustand store.
 * Manages trades, prices, UI state, settings, and dark mode.
 */

import { create } from 'zustand'
import type { Trade, PriceMap, AppTab, AppSettings } from '@/types'
import { db } from '@/services/db'

const SETTINGS_KEY = 'portfolio_tracker_settings'
const DARK_MODE_KEY = 'portfolio_tracker_dark'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>
      return {
        apiKey: parsed.apiKey ?? '',
        startingCash: parsed.startingCash ?? 0,
        tradingFeePercent: parsed.tradingFeePercent ?? 1,
      }
    }
  } catch {
    // ignore
  }
  return { apiKey: '', startingCash: 0, tradingFeePercent: 1 }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function loadDarkMode(): boolean {
  return localStorage.getItem(DARK_MODE_KEY) === '1'
}

interface StoreState {
  // Data
  trades: Trade[]
  prices: PriceMap
  settings: AppSettings

  // UI
  activeTab: AppTab
  showSettings: boolean
  tradesLoaded: boolean
  darkMode: boolean

  // Async status
  priceError: string | null
  priceLoading: boolean
  lastPriceUpdate: Date | null

  // Actions
  loadTrades: () => Promise<void>
  addTrade: (trade: Omit<Trade, 'id' | 'date'>) => Promise<void>
  deleteTrade: (id: string) => Promise<void>
  updatePrices: (prices: PriceMap) => void
  setPriceError: (error: string | null) => void
  setPriceLoading: (loading: boolean) => void
  setActiveTab: (tab: AppTab) => void
  setShowSettings: (show: boolean) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleDarkMode: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  trades: [],
  prices: {},
  settings: loadSettings(),
  activeTab: 'dashboard',
  showSettings: false,
  tradesLoaded: false,
  darkMode: loadDarkMode(),
  priceError: null,
  priceLoading: false,
  lastPriceUpdate: null,

  loadTrades: async () => {
    const trades = await db.getAllTrades()
    set({ trades, tradesLoaded: true })
  },

  addTrade: async (tradeData) => {
    const trade: Trade = {
      ...tradeData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    }
    await db.addTrade(trade)
    set((state) => ({ trades: [...state.trades, trade] }))
  },

  deleteTrade: async (id) => {
    await db.deleteTrade(id)
    set((state) => ({ trades: state.trades.filter((t) => t.id !== id) }))
  },

  updatePrices: (newPrices) => {
    set((state) => ({
      prices: { ...state.prices, ...newPrices },
      lastPriceUpdate: new Date(),
      priceError: null,
    }))
  },

  setPriceError: (error) => set({ priceError: error }),
  setPriceLoading: (loading) => set({ priceLoading: loading }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowSettings: (show) => set({ showSettings: show }),

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial }
    saveSettings(settings)
    set({ settings })
  },

  toggleDarkMode: () => {
    const next = !get().darkMode
    localStorage.setItem(DARK_MODE_KEY, next ? '1' : '0')
    set({ darkMode: next })
  },
}))
