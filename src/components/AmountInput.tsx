import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  currencyCode: string
  disabled?: boolean
  errorText?: string
}

export function AmountInput({ value, onChange, currencyCode, disabled, errorText }: AmountInputProps) {
  return (
    <TextField
      label="Amount"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      disabled={disabled}
      error={Boolean(errorText)}
      helperText={errorText}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">{currencyCode}</InputAdornment>,
        },
      }}
    />
  )
}
