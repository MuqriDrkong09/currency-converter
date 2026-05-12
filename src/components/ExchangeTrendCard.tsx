import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined'
import StackedLineChartOutlinedIcon from '@mui/icons-material/StackedLineChartOutlined'
import { useTheme } from '@mui/material/styles'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MouseEvent } from 'react'
import { useMemo, useState } from 'react'
import type { FrankfurterTrendPoint } from '../api/frankfurter'
import type { TrendRangeDays } from '../hooks/useExchangeTrend'
import { useExchangeTrend } from '../hooks/useExchangeTrend'
import { formatRate } from '../utils/format'
import type { TrendChartMode } from '../utils/chartModeStorage'
import { readChartMode, writeChartMode } from '../utils/chartModeStorage'

type ExchangeTrendCardProps = {
  from: string
  to: string
}

type Extreme = {
  index: number
  point: FrankfurterTrendPoint
}

const CHART_HEIGHT = 300
const AREA_GRADIENT_ID = 'currencyTrendAreaFill'

export function ExchangeTrendCard({ from, to }: ExchangeTrendCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [rangeDays, setRangeDays] = useState<TrendRangeDays>(90)
  const [chartMode, setChartMode] = useState<TrendChartMode>(() => readChartMode())
  const trend = useExchangeTrend(from, to, rangeDays)

  const data = trend.data ?? []

  const { min, max, change } = useMemo(() => computeStats(data), [data])

  const axisColor = theme.palette.text.secondary
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
  const lineColor = theme.palette.primary.main
  const upColor = theme.palette.success.main
  const downColor = theme.palette.error.main
  const minColor = theme.palette.error.main
  const maxColor = theme.palette.success.main

  const handleRange = (_: MouseEvent<HTMLElement>, value: TrendRangeDays | null) => {
    if (value !== null) setRangeDays(value)
  }

  const handleMode = (_: MouseEvent<HTMLElement>, value: TrendChartMode | null) => {
    if (value === null) return
    setChartMode(value)
    writeChartMode(value)
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
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { sm: 'flex-end' } }}>
              <ToggleButtonGroup
                exclusive
                value={chartMode}
                onChange={handleMode}
                size="small"
                aria-label="Chart style"
              >
                <ToggleButton value="line" aria-label="Line chart">
                  <Tooltip title="Line chart">
                    <ShowChartOutlinedIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="area" aria-label="Area chart">
                  <Tooltip title="Area chart">
                    <StackedLineChartOutlinedIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
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
          </Stack>

          {min && max ? (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                variant="outlined"
                color="success"
                label={`High ${formatRate(max.point.rate)} ${to} · ${formatShortDate(max.point.date)}`}
              />
              <Chip
                size="small"
                variant="outlined"
                color="error"
                label={`Low ${formatRate(min.point.rate)} ${to} · ${formatShortDate(min.point.date)}`}
              />
              {change ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${change.delta >= 0 ? '▲' : '▼'} ${formatRate(Math.abs(change.delta))} ${to} (${change.pct >= 0 ? '+' : ''}${change.pct.toFixed(2)}%) over ${data.length} pts`}
                  sx={{ borderColor: change.delta >= 0 ? upColor : downColor, color: change.delta >= 0 ? upColor : downColor }}
                />
              ) : null}
            </Stack>
          ) : null}

          {trend.isError ? (
            <Alert severity="error">
              {trend.error instanceof Error ? trend.error.message : 'Could not load trend data.'}
            </Alert>
          ) : null}

          {trend.isLoading ? (
            <Skeleton variant="rounded" height={CHART_HEIGHT} sx={{ width: '100%' }} aria-label="Loading chart" />
          ) : data.length ? (
            <Box sx={{ width: '100%', height: CHART_HEIGHT }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'area' ? (
                  <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity={isDark ? 0.45 : 0.32} />
                        <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      minTickGap={24}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      tickFormatter={(v: string) => formatShortDate(v)}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      width={56}
                      tickFormatter={(v: number) => formatRate(v)}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: lineColor, strokeOpacity: 0.4, strokeWidth: 1 }}
                      content={(props) => (
                        <CustomTooltip
                          active={Boolean(props.active)}
                          label={typeof props.label === 'string' ? props.label : undefined}
                          payloadDate={extractPayloadDate(props.payload)}
                          data={data}
                          from={from}
                          to={to}
                          upColor={upColor}
                          downColor={downColor}
                        />
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      name={`${to} per ${from}`}
                      stroke={lineColor}
                      strokeWidth={2}
                      fill={`url(#${AREA_GRADIENT_ID})`}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                    {renderExtremeMarkers({ min, max, axisColor, minColor, maxColor, to })}
                  </AreaChart>
                ) : (
                  <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      minTickGap={24}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      tickFormatter={(v: string) => formatShortDate(v)}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: axisColor, fontSize: 11 }}
                      width={56}
                      tickFormatter={(v: number) => formatRate(v)}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: lineColor, strokeOpacity: 0.4, strokeWidth: 1 }}
                      content={(props) => (
                        <CustomTooltip
                          active={Boolean(props.active)}
                          label={typeof props.label === 'string' ? props.label : undefined}
                          payloadDate={extractPayloadDate(props.payload)}
                          data={data}
                          from={from}
                          to={to}
                          upColor={upColor}
                          downColor={downColor}
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name={`${to} per ${from}`}
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                    {renderExtremeMarkers({ min, max, axisColor, minColor, maxColor, to })}
                  </LineChart>
                )}
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

function computeStats(data: FrankfurterTrendPoint[]) {
  if (!data.length) return { min: undefined, max: undefined, change: undefined }
  let min: Extreme = { index: 0, point: data[0] }
  let max: Extreme = { index: 0, point: data[0] }
  for (let i = 1; i < data.length; i++) {
    const p = data[i]
    if (p.rate < min.point.rate) min = { index: i, point: p }
    if (p.rate > max.point.rate) max = { index: i, point: p }
  }
  const first = data[0]
  const last = data[data.length - 1]
  const delta = last.rate - first.rate
  const pct = first.rate !== 0 ? (delta / first.rate) * 100 : 0
  return { min, max, change: { delta, pct } }
}

function renderExtremeMarkers({
  min,
  max,
  axisColor,
  minColor,
  maxColor,
  to,
}: {
  min: Extreme | undefined
  max: Extreme | undefined
  axisColor: string
  minColor: string
  maxColor: string
  to: string
}) {
  if (!min || !max) return null
  // If the series is flat, both markers collide; show one combined marker.
  if (min.index === max.index) {
    return (
      <ReferenceDot
        key="flat"
        x={max.point.date}
        y={max.point.rate}
        r={5}
        fill={maxColor}
        stroke="#ffffff"
        strokeWidth={1.5}
        ifOverflow="extendDomain"
        label={{
          value: `${formatRate(max.point.rate)} ${to}`,
          position: 'top',
          fill: axisColor,
          fontSize: 11,
        }}
      />
    )
  }
  return [
    <ReferenceDot
      key="max"
      x={max.point.date}
      y={max.point.rate}
      r={5}
      fill={maxColor}
      stroke="#ffffff"
      strokeWidth={1.5}
      ifOverflow="extendDomain"
      label={{
        value: `▲ ${formatRate(max.point.rate)}`,
        position: 'top',
        fill: maxColor,
        fontSize: 11,
        offset: 8,
      }}
    />,
    <ReferenceDot
      key="min"
      x={min.point.date}
      y={min.point.rate}
      r={5}
      fill={minColor}
      stroke="#ffffff"
      strokeWidth={1.5}
      ifOverflow="extendDomain"
      label={{
        value: `▼ ${formatRate(min.point.rate)}`,
        position: 'bottom',
        fill: minColor,
        fontSize: 11,
        offset: 8,
      }}
    />,
  ]
}

type CustomTooltipProps = {
  active: boolean
  label: string | undefined
  payloadDate: string | undefined
  data: FrankfurterTrendPoint[]
  from: string
  to: string
  upColor: string
  downColor: string
}

function extractPayloadDate(payload: unknown): string | undefined {
  if (!Array.isArray(payload) || payload.length === 0) return undefined
  const first = payload[0] as { payload?: { date?: unknown } } | undefined
  const date = first?.payload?.date
  return typeof date === 'string' ? date : undefined
}

function CustomTooltip({ active, label, payloadDate, data, from, to, upColor, downColor }: CustomTooltipProps) {
  if (!active) return null
  const dateKey = label ?? payloadDate
  if (!dateKey) return null

  const idx = data.findIndex((p) => p.date === dateKey)
  if (idx === -1) return null
  const point = data[idx]
  const prev = idx > 0 ? data[idx - 1] : undefined
  const delta = prev ? point.rate - prev.rate : 0
  const pct = prev && prev.rate !== 0 ? (delta / prev.rate) * 100 : 0

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        boxShadow: theme.shadows[3],
        px: 1.25,
        py: 1,
        minWidth: 180,
      })}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {formatLongDate(point.date)}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
        {formatRate(point.rate)} {to}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        per 1 {from}
      </Typography>
      {prev ? (
        <Typography
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            mt: 0.5,
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            color: delta >= 0 ? upColor : downColor,
            border: `1px solid ${delta >= 0 ? upColor : downColor}`,
            fontWeight: 600,
          }}
        >
          {delta >= 0 ? '▲' : '▼'} {formatRate(Math.abs(delta))} ({pct >= 0 ? '+' : ''}
          {pct.toFixed(2)}%) vs prev
        </Typography>
      ) : null}
    </Box>
  )
}

function formatShortDate(value: string): string {
  const d = new Date(`${value}T12:00:00Z`)
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d)
}

function formatLongDate(value: string): string {
  const d = new Date(`${value}T12:00:00Z`)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d)
}
