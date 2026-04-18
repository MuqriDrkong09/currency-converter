import { EXCHANGE_RATE_HOST_BASE, getExchangeRateHostAccessKey } from '../config'
import type {
  CurrencyOption,
  ExchangeHostConvertResponse,
  ExchangeHostListResponse,
} from '../types/exchange'

export class ExchangeRateHostError extends Error {
  constructor(
    message: string,
    public readonly kind: 'network' | 'api' | 'config',
    public readonly apiCode?: number,
  ) {
    super(message)
    this.name = 'ExchangeRateHostError'
  }
}

function assertAccessKey(): string {
  const key = getExchangeRateHostAccessKey()
  if (!key) {
    throw new ExchangeRateHostError(
      'Missing exchangerate.host access key. Set VITE_EXCHANGERATE_HOST_ACCESS_KEY in a .env file.',
      'config',
    )
  }
  return key
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readApiErrorMessage(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined
  if (body.success !== false) return undefined
  const err = body.error
  if (!isRecord(err)) return undefined
  const info = err.info
  return typeof info === 'string' ? info : undefined
}

export async function fetchSupportedCurrencies(): Promise<CurrencyOption[]> {
  const accessKey = assertAccessKey()
  const url = `${EXCHANGE_RATE_HOST_BASE}/list?${new URLSearchParams({ access_key: accessKey })}`
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new ExchangeRateHostError(
      'Unable to reach exchangerate.host. Check your network connection.',
      'network',
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ExchangeRateHostError('Received an invalid response from exchangerate.host.', 'api')
  }

  const message = readApiErrorMessage(body)
  if (message) {
    const code =
      isRecord(body) && isRecord(body.error) && typeof body.error.code === 'number'
        ? body.error.code
        : undefined
    throw new ExchangeRateHostError(message, 'api', code)
  }

  const parsed = body as ExchangeHostListResponse
  if (!parsed.success || !parsed.currencies) {
    throw new ExchangeRateHostError('Unexpected currency list response from exchangerate.host.', 'api')
  }

  return Object.entries(parsed.currencies)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export async function fetchConversion(params: {
  from: string
  to: string
  amount: number
}): Promise<{ result: number; rate: number; timestamp: number }> {
  const accessKey = assertAccessKey()
  const search = new URLSearchParams({
    access_key: accessKey,
    from: params.from,
    to: params.to,
    amount: String(params.amount),
  })
  const url = `${EXCHANGE_RATE_HOST_BASE}/convert?${search}`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new ExchangeRateHostError(
      'Unable to reach exchangerate.host. Check your network connection.',
      'network',
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ExchangeRateHostError('Received an invalid response from exchangerate.host.', 'api')
  }

  const message = readApiErrorMessage(body)
  if (message) {
    const code =
      isRecord(body) && isRecord(body.error) && typeof body.error.code === 'number'
        ? body.error.code
        : undefined
    throw new ExchangeRateHostError(message, 'api', code)
  }

  const parsed = body as ExchangeHostConvertResponse
  if (!parsed.success || typeof parsed.result !== 'number' || !isRecord(parsed.info)) {
    throw new ExchangeRateHostError('Unexpected conversion response from exchangerate.host.', 'api')
  }

  const rate = parsed.info.rate
  const timestamp = parsed.info.timestamp
  if (typeof rate !== 'number' || typeof timestamp !== 'number') {
    throw new ExchangeRateHostError('Unexpected conversion response from exchangerate.host.', 'api')
  }

  return { result: parsed.result, rate, timestamp }
}
