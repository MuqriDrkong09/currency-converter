import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

function mapErrorMessage(error: Error): string {
  return error.message || 'Something went wrong.'
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
      <Typography variant="body2" color="text.secondary">
        Select <strong>From</strong> and <strong>To</strong> using the dropdowns (or use swap, a favorite, or a history
        row). Then enter an amount to see the conversion.
      </Typography>
    )
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        <AlertTitle>Conversion failed</AlertTitle>
        {mapErrorMessage(error)}
      </Alert>
    )
  }

  if (sameCurrency && amount !== undefined) {
    return (
      <Stack spacing={0.5}>
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
      <Typography variant="body2" color="text.secondary">
        Enter a valid amount to see the converted value.
      </Typography>
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
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
      >
        <Typography variant="overline" color="text.secondary">
          Result
        </Typography>
        {isFetching ? (
          <Typography variant="caption" color="text.secondary">
            Updating…
          </Typography>
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
        </Box>
      ) : null}
    </Stack>
  )
}
