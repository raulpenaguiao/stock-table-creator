import { useState } from 'react'
import { useStore } from '@/store/useStore'

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500'

export function SettingsModal() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const setShowSettings = useStore((s) => s.setShowSettings)

  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [startingCash, setStartingCash] = useState(String(settings.startingCash))
  const [feePercent, setFeePercent] = useState(String(settings.tradingFeePercent))
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateSettings({
      apiKey: apiKey.trim(),
      startingCash: parseFloat(startingCash) || 0,
      tradingFeePercent: parseFloat(feePercent) || 0,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false) }}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close settings"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Finnhub API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false) }}
              placeholder="Enter your Finnhub API key"
              className={inputCls}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get a free key at{' '}
              <a
                href="https://finnhub.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                finnhub.io
              </a>
              . Stored in your browser only.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Starting Cash Balance ($)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={startingCash}
              onChange={(e) => { setStartingCash(e.target.value); setSaved(false) }}
              placeholder="0.00"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Initial cash deposited, used to calculate available balance.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trading Fee (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={feePercent}
                onChange={(e) => { setFeePercent(e.target.value); setSaved(false) }}
                placeholder="1"
                className={inputCls + ' pr-8'}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Applied automatically as a percentage of each trade subtotal.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}
