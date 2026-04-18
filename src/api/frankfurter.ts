import type { CurrencyOption } from '../types/exchange'

const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v1'

export type FrankfurterTrendPoint = {
  date: string
  rate: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function fetchFrankfurterCurrencies(): Promise<CurrencyOption[]> {
  const url = `${FRANKFURTER_BASE}/currencies`
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Unable to reach Frankfurter (ECB rates). Check your network connection.')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Received an invalid response from Frankfurter.')
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === 'string' ? body.message : `Request failed (${response.status}).`
    throw new Error(message)
  }

  if (!isRecord(body)) {
    throw new Error('Unexpected currency list response from Frankfurter.')
  }

  return Object.entries(body)
    .filter((e): e is [string, string] => typeof e[0] === 'string' && typeof e[1] === 'string')
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export async function fetchFrankfurterConversion(params: {
  from: string
  to: string
  amount: number
}): Promise<{ result: number; rate: number; timestamp: number }> {
  const search = new URLSearchParams({
    amount: String(params.amount),
    from: params.from,
    to: params.to,
  })
  const url = `${FRANKFURTER_BASE}/latest?${search}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Unable to reach Frankfurter (ECB rates). Check your network connection.')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Received an invalid response from Frankfurter.')
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === 'string' ? body.message : `Request failed (${response.status}).`
    throw new Error(message)
  }

  if (!isRecord(body) || typeof body.amount !== 'number' || typeof body.date !== 'string' || !isRecord(body.rates)) {
    throw new Error('Unexpected conversion response from Frankfurter.')
  }

  const rateValue = body.rates[params.to]
  if (typeof rateValue !== 'number') {
    throw new Error(
      `Frankfurter does not publish a rate for ${params.from} → ${params.to}. Try another pair.`,
    )
  }

  const timestamp = Math.floor(Date.parse(`${body.date}T12:00:00Z`) / 1000)
  const result = rateValue
  const rate = params.amount > 0 ? result / params.amount : 0

  return { result, rate, timestamp: Number.isFinite(timestamp) ? timestamp : Math.floor(Date.now() / 1000) }
}

export async function fetchFrankfurterExchangeTrend(params: {
  from: string
  to: string
  startDate: string
  endDate: string
}): Promise<FrankfurterTrendPoint[]> {
  const path = `${params.startDate}..${params.endDate}`
  const search = new URLSearchParams({ from: params.from, to: params.to })
  const url = `${FRANKFURTER_BASE}/${path}?${search}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Unable to reach Frankfurter for trend data. Check your network connection.')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Received an invalid response from Frankfurter.')
  }

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === 'string' ? body.message : `Request failed (${response.status}).`
    throw new Error(message)
  }

  if (!isRecord(body) || !isRecord(body.rates)) {
    throw new Error('Unexpected trend response from Frankfurter.')
  }

  const points: FrankfurterTrendPoint[] = []
  for (const [date, dayRates] of Object.entries(body.rates)) {
    if (!isRecord(dayRates)) continue
    const rate = dayRates[params.to]
    if (typeof rate !== 'number') continue
    points.push({ date, rate })
  }

  return points.sort((a, b) => a.date.localeCompare(b.date))
}
