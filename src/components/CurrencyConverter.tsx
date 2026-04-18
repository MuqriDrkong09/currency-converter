import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrencyRatesSource } from '../api/currencyRates'
import { getExchangeRateHostAccessKey } from '../config'
import { useConversion } from '../hooks/useConversion'
import { useGeoSuggestedCurrency } from '../hooks/useGeoSuggestedCurrency'
import { useSupportedCurrencies } from '../hooks/useSupportedCurrencies'
import type { ConversionHistoryEntry } from '../types/conversionHistory'
import {
  appendConversionHistory,
  clearConversionHistory,
  readConversionHistory,
  removeConversionHistoryEntry,
} from '../utils/conversionHistory'
import { parsePositiveAmount } from '../utils/amount'
import { AmountInput } from './AmountInput'
import { ConversionHistoryList } from './ConversionHistoryList'
import { ConversionOutput } from './ConversionOutput'
import { CurrencySelect } from './CurrencySelect'
import { SwapCurrenciesButton } from './SwapCurrenciesButton'

const ExchangeTrendCard = lazy(async () => {
  const m = await import('./ExchangeTrendCard')
  return { default: m.ExchangeTrendCard }
})

const SIGNUP_URL = 'https://exchangerate.host/pricing'

type CurrencyPair = { from: string; to: string }

export function CurrencyConverter() {
  const accessKeyConfigured = Boolean(getExchangeRateHostAccessKey())
  const ratesSource = getCurrencyRatesSource()
  const currenciesQuery = useSupportedCurrencies()
  const currencies = currenciesQuery.data ?? []
  const geoSuggestedCurrency = useGeoSuggestedCurrency()
  const geoDefaultAppliedRef = useRef(false)

  const [currencyPair, setCurrencyPair] = useState<CurrencyPair>({ from: 'USD', to: 'EUR' })
  const { from, to } = currencyPair

  const setFrom = useCallback((code: string) => {
    setCurrencyPair((p) => ({ ...p, from: code }))
  }, [])

  const setTo = useCallback((code: string) => {
    setCurrencyPair((p) => ({ ...p, to: code }))
  }, [])

  const [amount, setAmount] = useState('1')
  const [history, setHistory] = useState(() => readConversionHistory())

  const deferredAmount = useDeferredValue(amount)
  const parsedAmount = useMemo(() => parsePositiveAmount(deferredAmount), [deferredAmount])

  useEffect(() => {
    if (!currencies.length) return
    const codes = new Set(currencies.map((c) => c.code))
    setCurrencyPair((p) => (codes.has(p.from) ? p : { ...p, from: currencies[0].code }))
  }, [currencies, from])

  useEffect(() => {
    if (!currencies.length) return
    const codes = new Set(currencies.map((c) => c.code))
    setCurrencyPair((p) => {
      if (codes.has(p.to)) return p
      const fallback = currencies.find((c) => c.code !== p.from) ?? currencies[0]
      return { ...p, to: fallback.code }
    })
  }, [currencies, to, from])

  useEffect(() => {
    if (geoDefaultAppliedRef.current) return
    if (!currencies.length) return
    if (geoSuggestedCurrency.isLoading) return

    geoDefaultAppliedRef.current = true

    const preferred = geoSuggestedCurrency.data
    const codes = new Set(currencies.map((c) => c.code))
    if (!preferred || !codes.has(preferred)) return

    setCurrencyPair((p) => {
      if (preferred === p.from) {
        const alt = currencies.find((c) => c.code !== p.from)?.code
        return { ...p, to: alt ?? p.to }
      }
      return { ...p, to: preferred }
    })
  }, [currencies, geoSuggestedCurrency.isLoading, geoSuggestedCurrency.data, from])

  const sameCurrency = from === to
  const conversion = useConversion({ from, to, amount: parsedAmount })

  const amountError =
    deferredAmount.trim() === ''
      ? undefined
      : parsedAmount === undefined
        ? 'Enter a valid non-negative number.'
        : undefined

  const conversionResult = useMemo(() => {
    if (sameCurrency && parsedAmount !== undefined) {
      return { result: parsedAmount, rate: 1, timestamp: Math.floor(Date.now() / 1000) }
    }
    if (!conversion.data) return undefined
    return conversion.data
  }, [sameCurrency, parsedAmount, conversion.data])

  const refreshHistory = useCallback(() => setHistory(readConversionHistory()), [])

  useEffect(() => {
    if (parsedAmount === undefined || parsedAmount <= 0) return
    if (!sameCurrency && (!conversion.isSuccess || !conversion.data)) return

    const t = window.setTimeout(() => {
      appendConversionHistory({ from, to, amount: parsedAmount })
      refreshHistory()
    }, 900)

    return () => window.clearTimeout(t)
  }, [
    from,
    to,
    parsedAmount,
    sameCurrency,
    conversion.isSuccess,
    conversion.data,
    conversion.dataUpdatedAt,
    refreshHistory,
  ])

  const applyHistoryEntry = (entry: ConversionHistoryEntry) => {
    setCurrencyPair({ from: entry.from, to: entry.to })
    setAmount(String(entry.amount))
  }

  const handleSwapCurrencies = useCallback(() => {
    setCurrencyPair((p) => ({ from: p.to, to: p.from }))
  }, [])

  const removeHistoryEntry = (id: string) => {
    removeConversionHistoryEntry(id)
    refreshHistory()
  }

  const clearAllHistory = () => {
    clearConversionHistory()
    refreshHistory()
  }

  const isIdle = parsedAmount === undefined || parsedAmount <= 0

  const subtitle =
    ratesSource === 'exchangerateHost'
      ? 'Live conversions via exchangerate.host.'
      : 'Live conversions via Frankfurter (ECB reference rates). Add an exchangerate.host key to switch providers.'

  const showLocalChip =
    geoSuggestedCurrency.isSuccess && typeof geoSuggestedCurrency.data === 'string'

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h4" component="h1">
            Currency converter
          </Typography>
          {showLocalChip ? (
            <Chip
              label={`Local ${geoSuggestedCurrency.data} 🌍`}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>

      {!accessKeyConfigured ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>No exchangerate.host key detected</AlertTitle>
          You can keep using the app with the free Frankfurter API (fewer currencies than exchangerate.host). To use
          exchangerate.host instead, add{' '}
          <Typography component="span" variant="body2" sx={{ fontFamily: 'ui-monospace, monospace' }}>
            VITE_EXCHANGERATE_HOST_ACCESS_KEY
          </Typography>{' '}
          to a <Typography component="span" variant="body2">.env</Typography> file, restart the dev server, and reload.
          Keys are available from{' '}
          <Link href={SIGNUP_URL} target="_blank" rel="noreferrer">
            exchangerate.host
          </Link>
          .
        </Alert>
      ) : null}

      {currenciesQuery.isError ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => currenciesQuery.refetch()}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Could not load currencies</AlertTitle>
          {currenciesQuery.error instanceof Error
            ? currenciesQuery.error.message
            : 'Unexpected error while loading currencies.'}
        </Alert>
      ) : null}

      <Stack spacing={2.5}>
        <Card elevation={0}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <CurrencySelect
                label="From"
                options={currencies}
                value={from}
                onChange={setFrom}
                loading={currenciesQuery.isLoading}
                disabled={currenciesQuery.isError}
                errorText={undefined}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <SwapCurrenciesButton
                  onSwap={handleSwapCurrencies}
                  disabled={currenciesQuery.isLoading || currenciesQuery.isError || !currencies.length}
                />
              </Box>

              <CurrencySelect
                label="To"
                options={currencies}
                value={to}
                onChange={setTo}
                loading={currenciesQuery.isLoading}
                disabled={currenciesQuery.isError}
              />

              <Divider />

              <AmountInput
                value={amount}
                onChange={setAmount}
                currencyCode={from}
                disabled={currenciesQuery.isError}
                errorText={amountError}
              />

              <Divider />

              <ConversionOutput
                from={from}
                to={to}
                amount={parsedAmount}
                sameCurrency={sameCurrency}
                isIdle={isIdle}
                isLoading={conversion.isLoading}
                isFetching={conversion.isFetching}
                error={conversion.error}
                resultAmount={conversionResult?.result}
                rate={sameCurrency ? 1 : conversionResult?.rate}
                timestamp={conversionResult?.timestamp}
                onRetry={() => conversion.refetch()}
              />
            </Stack>
          </CardContent>
        </Card>

        <ConversionHistoryList
          entries={history}
          onSelect={applyHistoryEntry}
          onRemoveEntry={removeHistoryEntry}
          onClearAll={clearAllHistory}
        />

        <Suspense fallback={<Skeleton variant="rounded" height={360} sx={{ width: '100%' }} />}>
          <ExchangeTrendCard from={from} to={to} />
        </Suspense>
      </Stack>
    </Container>
  )
}
