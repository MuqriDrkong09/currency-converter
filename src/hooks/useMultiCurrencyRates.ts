import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchFrankfurterMultiRates } from '../api/frankfurter'

/**
 * Always sourced from Frankfurter (ECB reference rates). The multi-currency
 * view is a secondary feature; using a single free provider keeps quota
 * predictable regardless of whether the user has an exchangerate.host key.
 */
export function useMultiCurrencyRates(base: string, symbols: string[]) {
  // Stable cache key independent of UI ordering.
  const sortedSymbols = [...symbols].sort()
  const key = sortedSymbols.join(',')

  return useQuery({
    queryKey: ['multiCurrencyRates', 'frankfurter', base, key],
    queryFn: () => fetchFrankfurterMultiRates({ base, symbols: sortedSymbols }),
    enabled: Boolean(base) && sortedSymbols.length > 0,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
