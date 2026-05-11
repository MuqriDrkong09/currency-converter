import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

type SwapCurrenciesButtonProps = {
  onSwap: () => void
  disabled?: boolean
}

export function SwapCurrenciesButton({ onSwap, disabled }: SwapCurrenciesButtonProps) {
  return (
    <Tooltip title="Swap from and to currencies">
      <span>
        <IconButton
          color="primary"
          onClick={onSwap}
          disabled={disabled}
          aria-label="Swap the from and to currencies"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
          }}
        >
          <SwapHorizIcon />
        </IconButton>
      </span>
    </Tooltip>
  )
}
