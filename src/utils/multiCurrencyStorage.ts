const STORAGE_KEY = 'currency-converter:multi-targets'
const MAX_TARGETS = 12

const DEFAULT_TARGETS: string[] = ['EUR', 'GBP', 'JPY', 'MYR', 'SGD', 'AUD']

const CODE_PATTERN = /^[A-Z]{3}$/

function sanitize(list: unknown): string[] | undefined {
  if (!Array.isArray(list)) return undefined
  const out: string[] = []
  const seen = new Set<string>()
  for (const value of list) {
    if (typeof value !== 'string') continue
    const code = value.trim().toUpperCase()
    if (!CODE_PATTERN.test(code)) continue
    if (seen.has(code)) continue
    seen.add(code)
    out.push(code)
    if (out.length >= MAX_TARGETS) break
  }
  return out
}

export function readMultiTargets(): string[] {
  if (typeof localStorage === 'undefined') return [...DEFAULT_TARGETS]
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return [...DEFAULT_TARGETS]
  try {
    const parsed = sanitize(JSON.parse(raw))
    return parsed ?? [...DEFAULT_TARGETS]
  } catch {
    return [...DEFAULT_TARGETS]
  }
}

export function writeMultiTargets(targets: string[]): void {
  if (typeof localStorage === 'undefined') return
  const sanitized = sanitize(targets) ?? []
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
}

export function addMultiTarget(code: string): void {
  const upper = code.trim().toUpperCase()
  if (!CODE_PATTERN.test(upper)) return
  const list = readMultiTargets()
  if (list.includes(upper)) return
  if (list.length >= MAX_TARGETS) return
  writeMultiTargets([...list, upper])
}

export function removeMultiTarget(code: string): void {
  const upper = code.trim().toUpperCase()
  writeMultiTargets(readMultiTargets().filter((c) => c !== upper))
}

export const MULTI_TARGETS_MAX = MAX_TARGETS
