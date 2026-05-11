import type { PaletteMode } from '@mui/material'

const STORAGE_KEY = 'currency-converter:color-mode'

function isPaletteMode(value: unknown): value is PaletteMode {
  return value === 'light' || value === 'dark'
}

export function readColorMode(): PaletteMode {
  if (typeof localStorage === 'undefined') return 'dark'
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw && isPaletteMode(raw) ? raw : 'dark'
  } catch {
    return 'dark'
  }
}

export function writeColorMode(mode: PaletteMode): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore quota / private mode */
  }
}
