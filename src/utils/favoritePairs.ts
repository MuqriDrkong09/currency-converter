import type { FavoriteCurrencyPair } from '../types/favoritePair'

const STORAGE_KEY = 'currency-converter:favorite-pairs'
const MAX_PAIRS = 24

export function pairKey(p: FavoriteCurrencyPair): string {
  return `${p.from}>${p.to}`
}

function isValid(value: unknown): value is FavoriteCurrencyPair {
  if (typeof value !== 'object' || value === null) return false
  const o = value as Record<string, unknown>
  return typeof o.from === 'string' && typeof o.to === 'string' && o.from.length > 0 && o.to.length > 0
}

function parseStored(raw: string | null): FavoriteCurrencyPair[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(isValid)
  } catch {
    return []
  }
}

export function readFavoritePairs(): FavoriteCurrencyPair[] {
  if (typeof localStorage === 'undefined') return []
  const list = parseStored(localStorage.getItem(STORAGE_KEY))
  const seen = new Set<string>()
  const uniq: FavoriteCurrencyPair[] = []
  for (const p of list) {
    const k = pairKey(p)
    if (seen.has(k)) continue
    seen.add(k)
    uniq.push(p)
  }
  return uniq
}

export function writeFavoritePairs(pairs: FavoriteCurrencyPair[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs))
}

export function addFavoritePair(pair: FavoriteCurrencyPair): void {
  if (pair.from === pair.to) return
  const next = [
    pair,
    ...readFavoritePairs().filter((x) => pairKey(x) !== pairKey(pair)),
  ].slice(0, MAX_PAIRS)
  writeFavoritePairs(next)
}

export function removeFavoritePair(pair: FavoriteCurrencyPair): void {
  writeFavoritePairs(readFavoritePairs().filter((x) => pairKey(x) !== pairKey(pair)))
}

export function isFavoritePair(pair: FavoriteCurrencyPair): boolean {
  return readFavoritePairs().some((x) => pairKey(x) === pairKey(pair))
}

export function toggleFavoritePair(pair: FavoriteCurrencyPair): boolean {
  if (pair.from === pair.to) return false
  if (isFavoritePair(pair)) {
    removeFavoritePair(pair)
    return false
  }
  addFavoritePair(pair)
  return true
}
