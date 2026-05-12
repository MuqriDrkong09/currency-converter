import type { RateAlert, RateAlertDirection } from '../types/rateAlert'

const STORAGE_KEY = 'currency-converter:rate-alerts'

export function alertId(from: string, to: string): string {
  return `${from}>${to}`
}

function isValid(value: unknown): value is RateAlert {
  if (typeof value !== 'object' || value === null) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.from === 'string' &&
    typeof o.to === 'string' &&
    o.from.length > 0 &&
    o.to.length > 0 &&
    typeof o.target === 'number' &&
    Number.isFinite(o.target) &&
    o.target > 0 &&
    (o.direction === 'above' || o.direction === 'below') &&
    typeof o.createdAt === 'number' &&
    typeof o.armed === 'boolean'
  )
}

function parseStored(raw: string | null): RateAlert[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(isValid)
  } catch {
    return []
  }
}

export function readRateAlerts(): RateAlert[] {
  if (typeof localStorage === 'undefined') return []
  return parseStored(localStorage.getItem(STORAGE_KEY))
}

export function writeRateAlerts(alerts: RateAlert[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function getRateAlertFor(from: string, to: string): RateAlert | undefined {
  const id = alertId(from, to)
  return readRateAlerts().find((a) => a.id === id)
}

type UpsertInput = {
  from: string
  to: string
  target: number
  direction: RateAlertDirection
  /**
   * Current live rate (if known). Used to seed the initial `armed` flag so we
   * don't fire instantly on a condition the rate already satisfies. If the
   * condition is already met at creation, the alert starts disarmed and will
   * re-arm once the rate crosses back.
   */
  currentRate?: number
}

export function upsertRateAlert(input: UpsertInput): RateAlert {
  if (input.from === input.to) {
    throw new Error('Rate alerts are not supported for identical currencies.')
  }
  if (!Number.isFinite(input.target) || input.target <= 0) {
    throw new Error('Target rate must be a positive number.')
  }

  const id = alertId(input.from, input.to)
  const now = Date.now()
  const list = readRateAlerts().filter((a) => a.id !== id)
  const armed = computeArmed(input.direction, input.target, input.currentRate)

  const next: RateAlert = {
    id,
    from: input.from,
    to: input.to,
    target: input.target,
    direction: input.direction,
    createdAt: now,
    armed,
  }
  writeRateAlerts([next, ...list])
  return next
}

export function removeRateAlert(from: string, to: string): void {
  const id = alertId(from, to)
  writeRateAlerts(readRateAlerts().filter((a) => a.id !== id))
}

export function updateRateAlert(updated: RateAlert): void {
  writeRateAlerts(readRateAlerts().map((a) => (a.id === updated.id ? updated : a)))
}

/** Whether the alert condition is currently satisfied by the live rate. */
export function isRateAlertConditionMet(alert: RateAlert, rate: number): boolean {
  return alert.direction === 'above' ? rate >= alert.target : rate <= alert.target
}

function computeArmed(direction: RateAlertDirection, target: number, currentRate: number | undefined): boolean {
  if (currentRate === undefined || !Number.isFinite(currentRate)) return true
  return direction === 'above' ? currentRate < target : currentRate > target
}
