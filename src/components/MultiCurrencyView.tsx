import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined'
import CloseIcon from '@mui/icons-material/Close'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import { useEffect, useMemo, useState } from 'react'
import { useMultiCurrencyRates } from '../hooks/useMultiCurrencyRates'
import type { CurrencyOption } from '../types/exchange'
import { formatMoney, formatRate } from '../utils/format'
import {
  MULTI_TARGETS_MAX,
  addMultiTarget,
  readMultiTargets,
  removeMultiTarget,
} from '../utils/multiCurrencyStorage'

type MultiCurrencyViewProps = {
  base: string
  amount: number | undefined
  currencies: CurrencyOption[]
  /** Called when the user clicks the "Use as To" arrow on a card. */
  onSelectAsTo: (code: string) => void
}

export function MultiCurrencyView({ base, amount, currencies, onSelectAsTo }: MultiCurrencyViewProps) {
  const [targets, setTargets] = useState<string[]>(() => readMultiTargets())
  const [pickerValue, setPickerValue] = useState<CurrencyOption | null>(null)

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'currency-converter:multi-targets') {
        setTargets(readMultiTargets())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const codeToName = useMemo(() => new Map(currencies.map((c) => [c.code, c.name])), [currencies])

  // Filter targets to exclude the base; we never compare USD against USD.
  const filteredTargets = useMemo(() => targets.filter((t) => t !== base), [targets, base])

  const ratesQuery = useMultiCurrencyRates(base, filteredTargets)

  const pickerOptions = useMemo(
    () => currencies.filter((c) => c.code !== base && !targets.includes(c.code)),
    [currencies, targets, base],
  )

  const handleAdd = (option: CurrencyOption | null) => {
    if (!option) return
    if (targets.length >= MULTI_TARGETS_MAX) return
    addMultiTarget(option.code)
    setTargets(readMultiTargets())
    setPickerValue(null)
  }

  const handleRemove = (code: string) => {
    removeMultiTarget(code)
    setTargets(readMultiTargets())
  }

  const atCapacity = targets.length >= MULTI_TARGETS_MAX
  const hasAmount = amount !== undefined && amount > 0 && Number.isFinite(amount)
  const ratesData = ratesQuery.data?.rates ?? {}
  const snapshotDate = ratesQuery.data?.date

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
              <LanguageOutlinedIcon fontSize="small" color="action" />
              <Typography variant="h6" component="h2" sx={{ minWidth: 0 }}>
                Compare with other currencies
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {hasAmount ? (
                <>
                  Showing <strong>{formatMoney(amount, base)}</strong> across {filteredTargets.length}{' '}
                  {filteredTargets.length === 1 ? 'currency' : 'currencies'}
                </>
              ) : (
                <>
                  Showing rates for <strong>1 {base}</strong> across {filteredTargets.length}{' '}
                  {filteredTargets.length === 1 ? 'currency' : 'currencies'}
                </>
              )}
              {snapshotDate ? <> · ECB {snapshotDate}</> : null}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { sm: 'center' }, gap: 1.5 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Autocomplete
                value={pickerValue}
                onChange={(_, next) => handleAdd(next)}
                options={pickerOptions}
                disabled={atCapacity || pickerOptions.length === 0}
                getOptionLabel={(option) => `${option.code} — ${option.name}`}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={atCapacity ? `Maximum of ${MULTI_TARGETS_MAX} reached` : 'Add a currency to compare'}
                    placeholder="Type a currency code or name"
                  />
                )}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {targets.length} / {MULTI_TARGETS_MAX} tracked
            </Typography>
          </Stack>

          {ratesQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => ratesQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              {ratesQuery.error instanceof Error
                ? ratesQuery.error.message
                : 'Could not load multi-currency rates.'}
            </Alert>
          ) : null}

          {filteredTargets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No currencies tracked yet. Use the picker above to add one.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {filteredTargets.map((code) => {
                const rate = ratesData[code]
                const hasRate = typeof rate === 'number' && Number.isFinite(rate)
                const showSkeleton = ratesQuery.isLoading && !hasRate
                return (
                  <Grid key={code} size={{ xs: 12, sm: 6, md: 4 }}>
                    <CompareCard
                      base={base}
                      code={code}
                      name={codeToName.get(code)}
                      rate={hasRate ? rate : undefined}
                      amount={amount}
                      hasAmount={hasAmount}
                      isLoading={showSkeleton}
                      isFetching={ratesQuery.isFetching}
                      onSelectAsTo={() => onSelectAsTo(code)}
                      onRemove={() => handleRemove(code)}
                    />
                  </Grid>
                )
              })}
            </Grid>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Multi-currency rates are sourced from Frankfurter (ECB reference) and refresh automatically every 60 seconds.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

type CompareCardProps = {
  base: string
  code: string
  name: string | undefined
  rate: number | undefined
  amount: number | undefined
  hasAmount: boolean
  isLoading: boolean
  isFetching: boolean
  onSelectAsTo: () => void
  onRemove: () => void
}

function CompareCard({
  base,
  code,
  name,
  rate,
  amount,
  hasAmount,
  isLoading,
  isFetching,
  onSelectAsTo,
  onRemove,
}: CompareCardProps) {
  const converted = hasAmount && rate !== undefined && amount !== undefined ? amount * rate : undefined
  const primaryDisplay = converted !== undefined ? formatMoney(converted, code) : rate !== undefined ? formatRate(rate) : null

  return (
    <Box
      sx={(theme) => ({
        height: '100%',
        p: 1.5,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.025)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {code}
          </Typography>
          {name ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {name}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={0.25}>
          <Tooltip title={`Use ${code} as the To currency`}>
            <span>
              <IconButton
                size="small"
                onClick={onSelectAsTo}
                disabled={rate === undefined}
                aria-label={`Use ${code} as To`}
              >
                <CallMadeOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Remove ${code} from comparison`}>
            <IconButton size="small" onClick={onRemove} aria-label={`Remove ${code}`}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {isLoading ? (
        <Stack spacing={0.75}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="50%" />
        </Stack>
      ) : primaryDisplay === null ? (
        <Chip size="small" label="Rate unavailable" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
      ) : (
        <>
          <Typography
            variant="h6"
            component="p"
            sx={{ wordBreak: 'break-word', opacity: isFetching ? 0.85 : 1, transition: 'opacity 200ms ease' }}
          >
            {primaryDisplay}
            {converted === undefined && rate !== undefined ? (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {code}
              </Typography>
            ) : null}
          </Typography>
          {rate !== undefined ? (
            <Typography variant="caption" color="text.secondary">
              {hasAmount ? (
                <>
                  Rate: 1 {base} ≈ {formatRate(rate)} {code}
                </>
              ) : (
                <>per 1 {base}</>
              )}
            </Typography>
          ) : null}
        </>
      )}
    </Box>
  )
}
