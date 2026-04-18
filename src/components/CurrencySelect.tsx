import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { CurrencyOption } from '../types/exchange'

type CurrencySelectProps = {
  label: string
  options: CurrencyOption[]
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  loading?: boolean
  errorText?: string
}

export function CurrencySelect({
  label,
  options,
  value,
  onChange,
  disabled,
  loading,
  errorText,
}: CurrencySelectProps) {
  const selected = options.find((c) => c.code === value)

  return (
    <Autocomplete
      value={selected}
      onChange={(_, next) => {
        if (next) onChange(next.code)
      }}
      options={options}
      loading={loading}
      disabled={disabled || loading}
      disableClearable
      getOptionLabel={(option) => `${option.code} — ${option.name}`}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label={label}
          error={Boolean(errorText)}
          helperText={errorText}
        />
      )}
    />
  )
}
