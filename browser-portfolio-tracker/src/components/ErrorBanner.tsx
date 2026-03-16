interface Props {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
      <span className="mt-0.5 shrink-0 text-red-500 dark:text-red-400">⚠</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  )
}
