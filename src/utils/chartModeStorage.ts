export type TrendChartMode = 'line' | 'area'

const STORAGE_KEY = 'currency-converter:chart-mode'
const DEFAULT_MODE: TrendChartMode = 'area'

function isMode(value: unknown): value is TrendChartMode {
  return value === 'line' || value === 'area'
}

export function readChartMode(): TrendChartMode {
  if (typeof localStorage === 'undefined') return DEFAULT_MODE
  const raw = localStorage.getItem(STORAGE_KEY)
  return isMode(raw) ? raw : DEFAULT_MODE
}

export function writeChartMode(mode: TrendChartMode): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, mode)
}
