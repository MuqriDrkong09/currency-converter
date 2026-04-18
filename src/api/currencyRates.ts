import { getExchangeRateHostAccessKey } from '../config'
import type { CurrencyOption } from '../types/exchange'
import { fetchConversion as fetchHostConversion, fetchSupportedCurrencies as fetchHostCurrencies } from './exchangeRateHost'
import { fetchFrankfurterConversion, fetchFrankfurterCurrencies } from './frankfurter'

export type CurrencyRatesSource = 'exchangerateHost' | 'frankfurter'

export function getCurrencyRatesSource(): CurrencyRatesSource {
  return getExchangeRateHostAccessKey() ? 'exchangerateHost' : 'frankfurter'
}

export function fetchSupportedCurrencies(): Promise<CurrencyOption[]> {
  return getCurrencyRatesSource() === 'exchangerateHost' ? fetchHostCurrencies() : fetchFrankfurterCurrencies()
}

export function fetchConversion(params: {
  from: string
  to: string
  amount: number
}): Promise<{ result: number; rate: number; timestamp: number }> {
  return getCurrencyRatesSource() === 'exchangerateHost'
    ? fetchHostConversion(params)
    : fetchFrankfurterConversion(params)
}
