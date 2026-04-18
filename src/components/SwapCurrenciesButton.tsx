import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

type SwapCurrenciesButtonProps = {
  onSwap: () => void
  disabled?: boolean
}

export function SwapCurrenciesButton({ onSwap, disabled }: SwapCurrenciesButtonProps) {
  return (
    <Tooltip title="Swap currencies">
      <span>
        <IconButton
          color="primary"
          onClick={onSwap}
          disabled={disabled}
          aria-label="Swap from and to currencies"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.04)',
          }}
        >
          <SwapHorizIcon />
        </IconButton>
      </span>
    </Tooltip>
  )
}
