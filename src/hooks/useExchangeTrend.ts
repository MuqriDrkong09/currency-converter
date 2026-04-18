import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchFrankfurterExchangeTrend } from '../api/frankfurter'

export type TrendRangeDays = 30 | 90 | 180

export function useExchangeTrend(from: string, to: string, rangeDays: TrendRangeDays) {
  const { startDate, endDate } = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setUTCDate(start.getUTCDate() - rangeDays)
    return {
      endDate: end.toISOString().slice(0, 10),
      startDate: start.toISOString().slice(0, 10),
    }
  }, [rangeDays])

  return useQuery({
    queryKey: ['exchangeTrend', 'frankfurter', from, to, startDate, endDate],
    queryFn: () => fetchFrankfurterExchangeTrend({ from, to, startDate, endDate }),
    enabled: Boolean(from && to && from !== to),
    staleTime: 1000 * 60 * 60,
  })
}
