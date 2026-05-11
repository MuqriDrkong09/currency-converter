import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { FavoriteCurrencyPair } from '../types/favoritePair'

type FavoritePairsBarProps = {
  favorites: FavoriteCurrencyPair[]
  activeFrom: string
  activeTo: string
  onApply: (pair: FavoriteCurrencyPair) => void
  onRemove: (pair: FavoriteCurrencyPair) => void
}

export function FavoritePairsBar({
  favorites,
  activeFrom,
  activeTo,
  onApply,
  onRemove,
}: FavoritePairsBarProps) {
  if (favorites.length === 0) return null

  return (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        ⭐ Favorite pairs · click to apply, × to remove
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {favorites.map((p) => {
          const selected = p.from === activeFrom && p.to === activeTo
          return (
            <Chip
              key={`${p.from}-${p.to}`}
              label={`${p.from} → ${p.to}`}
              size="small"
              variant={selected ? 'filled' : 'outlined'}
              color={selected ? 'primary' : 'default'}
              onClick={() => onApply(p)}
              onDelete={() => onRemove(p)}
              aria-label={`Apply favorite pair ${p.from} to ${p.to}`}
            />
          )
        })}
      </Stack>
    </Box>
  )
}
