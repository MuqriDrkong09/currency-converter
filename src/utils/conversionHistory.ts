import type { ConversionHistoryEntry } from '../types/conversionHistory'

const STORAGE_KEY = 'currency-converter:conversion-history'
const MAX_ENTRIES = 10
const DEDUPE_WINDOW_MS = 3500

function parseStored(raw: string | null): ConversionHistoryEntry[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(isValidEntry)
  } catch {
    return []
  }
}

function isValidEntry(value: unknown): value is ConversionHistoryEntry {
  if (typeof value !== 'object' || value === null) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.from === 'string' &&
    typeof o.to === 'string' &&
    typeof o.amount === 'number' &&
    Number.isFinite(o.amount) &&
    typeof o.createdAt === 'number' &&
    Number.isFinite(o.createdAt)
  )
}

export function readConversionHistory(): ConversionHistoryEntry[] {
  if (typeof localStorage === 'undefined') return []
  return parseStored(localStorage.getItem(STORAGE_KEY))
}

function writeConversionHistory(entries: ConversionHistoryEntry[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function appendConversionHistory(entry: { from: string; to: string; amount: number }): void {
  const prev = readConversionHistory()
  const head = prev[0]
  if (
    head &&
    head.from === entry.from &&
    head.to === entry.to &&
    head.amount === entry.amount &&
    Date.now() - head.createdAt < DEDUPE_WINDOW_MS
  ) {
    return
  }

  const next: ConversionHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: Date.now(),
    from: entry.from,
    to: entry.to,
    amount: entry.amount,
  }

  writeConversionHistory([next, ...prev].slice(0, MAX_ENTRIES))
}

export function removeConversionHistoryEntry(id: string): void {
  const prev = readConversionHistory()
  writeConversionHistory(prev.filter((e) => e.id !== id))
}

export function clearConversionHistory(): void {
  writeConversionHistory([])
}
