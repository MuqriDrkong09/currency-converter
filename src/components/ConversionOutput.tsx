import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { formatErrorMessage } from '../utils/errorMessages'
import { formatMoney, formatRate, formatRateTimestamp } from '../utils/format'

type ConversionOutputProps = {
  from: string
  to: string
  /** User has explicitly chosen both currencies (dropdowns, swap, favorite, or history). */
  pairReady: boolean
  amount: number | undefined
  sameCurrency: boolean
  isIdle: boolean
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  resultAmount: number | undefined
  rate: number | undefined
  timestamp: number | undefined
  onRetry: () => void
}

export function ConversionOutput({
  from,
  to,
  pairReady,
  amount,
  sameCurrency,
  isIdle,
  isLoading,
  isFetching,
  error,
  resultAmount,
  rate,
  timestamp,
  onRetry,
}: ConversionOutputProps) {
  if (!pairReady) {
    return (
      <Box role="status" aria-live="polite">
        <Typography variant="body2" color="text.secondary">
          Select <strong>From</strong> and <strong>To</strong> using the dropdowns (or use swap, a favorite, or a
          history row). Then enter an amount to see the conversion.
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        severity="error"
        role="alert"
        action={
          <Button color="inherit" size="small" onClick={onRetry} aria-label="Retry conversion">
            Retry
          </Button>
        }
      >
        <AlertTitle>Conversion failed</AlertTitle>
        {formatErrorMessage(error, 'Conversion failed for an unknown reason.')}
      </Alert>
    )
  }

  if (sameCurrency && amount !== undefined) {
    return (
      <Stack spacing={0.5} role="status" aria-live="polite">
        <Typography variant="overline" color="text.secondary">
          Result
        </Typography>
        <Typography variant="h5" component="p">
          {formatMoney(amount, to)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          From and to currencies are identical, so the amount stays the same.
        </Typography>
      </Stack>
    )
  }

  if (isIdle) {
    return (
      <Box role="status" aria-live="polite">
        <Typography variant="body2" color="text.secondary">
          Enter an amount above to see the converted value.
        </Typography>
      </Box>
    )
  }

  if (isLoading && resultAmount === undefined) {
    return (
      <Stack spacing={1} aria-busy="true" aria-label="Loading conversion">
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="text" width="70%" />
      </Stack>
    )
  }

  if (resultAmount === undefined) {
    return null
  }

  return (
    <Stack spacing={1.25} role="status" aria-live="polite">
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
      >
        <Typography variant="overline" color="text.secondary">
          Result
        </Typography>
        {isFetching ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <AutorenewIcon
              fontSize="inherit"
              sx={{
                fontSize: 14,
                animation: 'spin 1.2s linear infinite',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
              aria-hidden
            />
            <Typography variant="caption">Updating…</Typography>
          </Stack>
        ) : null}
      </Stack>

      <Typography variant="h4" component="p" sx={{ wordBreak: 'break-word' }}>
        {formatMoney(resultAmount, to)}
      </Typography>

      {rate !== undefined && timestamp !== undefined ? (
        <Box>
          <Typography variant="body2" color="text.secondary">
            1 {from} ≈ {formatRate(rate)} {to}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Rate time: {formatRateTimestamp(timestamp)}
          </Typography>
          {!sameCurrency ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
            >
              🔄 Rates update automatically every 60 seconds and when you return to this tab.
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  )
}
