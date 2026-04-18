import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import type { TrendRangeDays } from '../hooks/useExchangeTrend'
import { useExchangeTrend } from '../hooks/useExchangeTrend'
import { formatRate } from '../utils/format'

type ExchangeTrendCardProps = {
  from: string
  to: string
}

export function ExchangeTrendCard({ from, to }: ExchangeTrendCardProps) {
  const theme = useTheme()
  const [rangeDays, setRangeDays] = useState<TrendRangeDays>(90)
  const trend = useExchangeTrend(from, to, rangeDays)

  const axisColor = theme.palette.text.secondary
  const gridColor = 'rgba(255,255,255,0.08)'
  const lineColor = theme.palette.primary.main

  const handleRange = (_: MouseEvent<HTMLElement>, value: TrendRangeDays | null) => {
    if (value !== null) setRangeDays(value)
  }

  if (from === to) {
    return (
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Exchange rate trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose two different currencies to see how the rate moved over time.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}
          >
            <Box>
              <Typography variant="h6" component="h2">
                Exchange rate trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily ECB reference mid-rate: 1 {from} in {to} (via Frankfurter).
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              value={rangeDays}
              onChange={handleRange}
              size="small"
              aria-label="Trend range in days"
            >
              <ToggleButton value={30}>30d</ToggleButton>
              <ToggleButton value={90}>90d</ToggleButton>
              <ToggleButton value={180}>180d</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {trend.isError ? (
            <Alert severity="error">
              {trend.error instanceof Error ? trend.error.message : 'Could not load trend data.'}
            </Alert>
          ) : null}

          {trend.isLoading ? (
            <Skeleton variant="rounded" height={280} sx={{ width: '100%' }} aria-label="Loading chart" />
          ) : trend.data?.length ? (
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    minTickGap={24}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(`${v}T12:00:00Z`)
                      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)
                    }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    width={56}
                    tickFormatter={(v: number) => formatRate(v)}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const n = typeof value === 'number' ? value : Number(value)
                      if (!Number.isFinite(n)) return []
                      return [`${formatRate(n)} ${to}`, `1 ${from}`]
                    }}
                    labelFormatter={(label) =>
                      new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                      }).format(new Date(`${label}T12:00:00Z`))
                    }
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: theme.palette.text.secondary }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name={`${to} per ${from}`}
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : !trend.isError ? (
            <Typography variant="body2" color="text.secondary">
              No trend points returned for this pair in the selected range.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
