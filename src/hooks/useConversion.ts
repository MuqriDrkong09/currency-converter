import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchConversion, getCurrencyRatesSource } from '../api/currencyRates'

type ConversionArgs = {
  from: string
  to: string
  amount: number | undefined
}

export function useConversion({ from, to, amount }: ConversionArgs) {
  const source = getCurrencyRatesSource()
  const sameCurrency = from === to
  const enabled =
    !sameCurrency && amount !== undefined && amount > 0 && Number.isFinite(amount)

  return useQuery({
    queryKey: ['currencyRates', 'convert', source, from, to, amount ?? null],
    queryFn: () => fetchConversion({ from, to, amount: amount as number }),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  })
}
