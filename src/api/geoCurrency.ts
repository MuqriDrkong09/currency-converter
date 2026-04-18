import { REGION_TO_CURRENCY } from '../data/regionToCurrency'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function fetchGeoCurrencyCode(): Promise<string> {
  const response = await fetch('https://ipapi.co/json/?fields=currency,error,reason,message')
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Could not read geo location response.')
  }

  if (!isRecord(body)) throw new Error('Invalid geo location response.')

  if (body.error === true) {
    const reason = typeof body.reason === 'string' ? body.reason : 'Geo lookup failed.'
    throw new Error(reason)
  }

  const currency = body.currency
  if (typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency)) {
    return currency.toUpperCase()
  }

  throw new Error('Geo response did not include a currency code.')
}

export function getCurrencyFromBrowserLocale(): string | undefined {
  try {
    const tag = navigator.language
    if (!tag) return undefined
    const locale = new Intl.Locale(tag)
    const region = locale.region
    if (!region) return undefined
    return REGION_TO_CURRENCY[region]
  } catch {
    return undefined
  }
}
