import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import type { RateAlert, RateAlertDirection } from '../types/rateAlert'
import { formatRate } from '../utils/format'

type RateAlertCardProps = {
  from: string
  to: string
  /** True when both currencies have been explicitly chosen by the user. */
  pairReady: boolean
  /** True when from === to. Alerts are disabled in that case. */
  sameCurrency: boolean
  /** Live rate (`to` per 1 `from`). May be undefined while loading. */
  currentRate: number | undefined
  /** Stored alert for the current pair, if any. */
  alert: RateAlert | undefined
  onSave: (input: { target: number; direction: RateAlertDirection }) => void
  onClear: () => void
}

const TARGET_INPUT_ID = 'rate-alert-target'

export function RateAlertCard({
  from,
  to,
  pairReady,
  sameCurrency,
  currentRate,
  alert,
  onSave,
  onClear,
}: RateAlertCardProps) {
  const [editing, setEditing] = useState(false)
  const [direction, setDirection] = useState<RateAlertDirection>(alert?.direction ?? 'above')
  const [targetText, setTargetText] = useState<string>(
    alert ? String(alert.target) : currentRate !== undefined ? formatPlainNumber(currentRate) : '',
  )
  const [error, setError] = useState<string | undefined>(undefined)
  const targetInputRef = useRef<HTMLInputElement | null>(null)

  // Focus the target field when the user enters edit mode (incl. re-edit).
  useEffect(() => {
    if (!editing) return
    // After the TextField mounts on this render.
    const id = window.requestAnimationFrame(() => {
      targetInputRef.current?.focus()
      targetInputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(id)
  }, [editing])

  // Reset the editor whenever the pair changes.
  useEffect(() => {
    setEditing(false)
    setError(undefined)
  }, [from, to])

  // Keep draft in sync when the underlying alert updates externally
  // (e.g. user picks a different favorite that already has an alert).
  useEffect(() => {
    if (alert) {
      setDirection(alert.direction)
      setTargetText(String(alert.target))
    }
  }, [alert])

  const disabledReason = !pairReady
    ? 'Select From and To first to set a rate alert.'
    : sameCurrency
      ? 'Pick two different currencies to set a rate alert.'
      : undefined

  const startEdit = () => {
    setError(undefined)
    if (!alert && currentRate !== undefined && targetText.trim() === '') {
      setTargetText(formatPlainNumber(currentRate))
    }
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError(undefined)
    if (alert) {
      setDirection(alert.direction)
      setTargetText(String(alert.target))
    }
  }

  const submit = () => {
    const parsed = Number(targetText.replace(',', '.').trim())
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a positive number.')
      return
    }
    onSave({ target: parsed, direction })
    setEditing(false)
    setError(undefined)
  }

  const headerIcon = !alert ? (
    <NotificationsNoneOutlinedIcon fontSize="small" color="action" />
  ) : alert.armed ? (
    <NotificationsActiveOutlinedIcon fontSize="small" color="primary" />
  ) : (
    <NotificationsOffOutlinedIcon fontSize="small" color="disabled" />
  )

  const header = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      {headerIcon}
      <Typography variant="subtitle2">Rate alert</Typography>
      {alert ? (
        <Chip
          size="small"
          variant="outlined"
          label={alert.armed ? 'Armed' : 'Triggered — waiting to re-arm'}
          color={alert.armed ? 'primary' : 'default'}
          sx={{ height: 22 }}
        />
      ) : null}
    </Stack>
  )

  if (disabledReason) {
    return (
      <Box>
        <Stack spacing={0.75}>
          {header}
          <Typography variant="body2" color="text.secondary">
            {disabledReason}
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (editing) {
    return (
      <Box>
        <Stack spacing={1.25}>
          {header}
          <Typography variant="body2" color="text.secondary">
            Notify me when 1 {from} is{' '}
            <strong>{direction === 'above' ? 'at or above' : 'at or below'}</strong> the target rate in {to}.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'flex-end' } }}>
            <ToggleButtonGroup
              value={direction}
              exclusive
              size="small"
              onChange={(_, next) => {
                if (next) setDirection(next as RateAlertDirection)
              }}
              aria-label="Alert direction"
            >
              <ToggleButton value="above" aria-label="Above or equal to target">
                ≥ Above
              </ToggleButton>
              <ToggleButton value="below" aria-label="Below or equal to target">
                ≤ Below
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              id={TARGET_INPUT_ID}
              label={`Target rate (${to} per 1 ${from})`}
              value={targetText}
              onChange={(event) => {
                setTargetText(event.target.value)
                if (error) setError(undefined)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  submit()
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelEdit()
                }
              }}
              size="small"
              type="text"
              inputMode="decimal"
              fullWidth
              inputRef={targetInputRef}
              error={Boolean(error)}
              helperText={
                error ??
                (currentRate !== undefined
                  ? `Current: ${formatRate(currentRate)} ${to} · press Esc to cancel`
                  : 'Press Enter to save, Esc to cancel')
              }
            />

            <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}>
              <Button onClick={cancelEdit} size="small">
                Cancel
              </Button>
              <Button onClick={submit} variant="contained" size="small">
                Save alert
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    )
  }

  if (alert) {
    return (
      <Box>
        <Stack spacing={0.75}>
          {header}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1 }}
          >
            <Typography variant="body2">
              Notify when 1 {alert.from} {alert.direction === 'above' ? '≥' : '≤'}{' '}
              <strong>{formatRate(alert.target)}</strong> {alert.to}
              {currentRate !== undefined ? (
                <Typography component="span" variant="body2" color="text.secondary">
                  {' · current '}
                  {formatRate(currentRate)} {alert.to}
                </Typography>
              ) : null}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Button size="small" onClick={startEdit}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={onClear}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={0.75}>
        {header}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Get a popup the moment 1 {from} reaches a target value in {to}. Rates are checked on every refresh.
          </Typography>
          <Button size="small" variant="outlined" onClick={startEdit}>
            Set alert
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

function formatPlainNumber(value: number): string {
  if (!Number.isFinite(value)) return ''
  // Up to 6 significant digits, no thousands separators (input fields don't like them).
  return Number(value.toPrecision(6)).toString()
}
