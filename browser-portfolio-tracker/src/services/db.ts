/**
 * IndexedDB service for persisting trades.
 * Uses a simple promise-based wrapper around the IDBDatabase API.
 */

import type { Trade } from '@/types'

const DB_NAME = 'portfolio-tracker'
const DB_VERSION = 1
const STORE_NAME = 'trades'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date', { unique: false })
        store.createIndex('ticker', 'ticker', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const store = tx.objectStore(STORE_NAME)
        const req = callback(store)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
        tx.onerror = () => reject(tx.error)
      })
  )
}

export const db = {
  getAllTrades(): Promise<Trade[]> {
    return openDB().then(
      (idb) =>
        new Promise<Trade[]>((resolve, reject) => {
          const tx = idb.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const index = store.index('date')
          const req = index.getAll()
          req.onsuccess = () => resolve(req.result as Trade[])
          req.onerror = () => reject(req.error)
        })
    )
  },

  addTrade(trade: Trade): Promise<string> {
    return withStore('readwrite', (store) => store.add(trade)).then(
      () => trade.id
    )
  },

  deleteTrade(id: string): Promise<void> {
    return withStore('readwrite', (store) => store.delete(id))
  },

  clearAll(): Promise<void> {
    return withStore('readwrite', (store) => store.clear())
  },
}
