import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { useStore } from './store/useStore'
import './index.css'

// 1. Apply dark class synchronously before React renders (prevents flash)
const html = document.documentElement
if (localStorage.getItem('portfolio_tracker_dark') === '1') {
  html.classList.add('dark')
} else {
  html.classList.remove('dark')
}

// 2. Keep <html> in sync whenever the store changes (outside React)
useStore.subscribe((state) => {
  if (state.darkMode) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
