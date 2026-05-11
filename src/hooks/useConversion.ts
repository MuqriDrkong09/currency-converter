import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchConversion, getCurrencyRatesSource } from '../api/currencyRates'

type ConversionArgs = {
  from: string
  to: string
  amount: number | undefined
  /** When false, the query stays idle (no fetch until user has chosen both currencies). */
  pairReady?: boolean
}

export function useConversion({ from, to, amount, pairReady = true }: ConversionArgs) {
  const source = getCurrencyRatesSource()
  const sameCurrency = from === to
  const enabled =
    pairReady &&
    !sameCurrency &&
    amount !== undefined &&
    amount > 0 &&
    Number.isFinite(amount)

  return useQuery({
    queryKey: ['currencyRates', 'convert', source, from, to, amount ?? null],
    queryFn: () => fetchConversion({ from, to, amount: amount as number }),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  })
}
