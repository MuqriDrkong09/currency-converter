import { useQuery } from '@tanstack/react-query'
import { fetchSupportedCurrencies, getCurrencyRatesSource } from '../api/currencyRates'

export function useSupportedCurrencies() {
  const source = getCurrencyRatesSource()

  return useQuery({
    queryKey: ['currencyRates', 'currencies', source],
    queryFn: fetchSupportedCurrencies,
    staleTime: 1000 * 60 * 60 * 24,
  })
}
