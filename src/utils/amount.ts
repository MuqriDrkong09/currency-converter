export function parsePositiveAmount(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const n = Number(trimmed.replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}
