export const EXCHANGE_RATE_HOST_BASE = 'https://api.exchangerate.host'

export function getExchangeRateHostAccessKey(): string | undefined {
  const key = import.meta.env.VITE_EXCHANGERATE_HOST_ACCESS_KEY?.trim()
  return key || undefined
}
