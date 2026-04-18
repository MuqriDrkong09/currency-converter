import { useQuery } from '@tanstack/react-query'
import { fetchGeoCurrencyCode, getCurrencyFromBrowserLocale } from '../api/geoCurrency'

export function useGeoSuggestedCurrency() {
  return useQuery({
    queryKey: ['geoSuggestedCurrency'],
    queryFn: async (): Promise<string | null> => {
      try {
        return await fetchGeoCurrencyCode()
      } catch {
        return getCurrencyFromBrowserLocale() ?? null
      }
    },
    staleTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
