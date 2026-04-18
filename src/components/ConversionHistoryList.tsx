import HistoryIcon from '@mui/icons-material/History'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ConversionHistoryEntry } from '../types/conversionHistory'

function formatWhen(ts: number, locale = navigator.language): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts))
}

function formatAmount(amount: number, locale = navigator.language): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(amount)
}

type ConversionHistoryListProps = {
  entries: ConversionHistoryEntry[]
  onSelect: (entry: ConversionHistoryEntry) => void
}

export function ConversionHistoryList({ entries, onSelect }: ConversionHistoryListProps) {
  if (entries.length === 0) {
    return (
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <HistoryIcon color="primary" fontSize="small" aria-hidden />
            <Typography variant="h6" component="h2">
              Recent conversions
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Successful conversions appear here. Click an item to reuse those values.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <HistoryIcon color="primary" fontSize="small" aria-hidden />
          <Typography variant="h6" component="h2">
            Recent conversions
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Last {entries.length} saved on this device. Click a row to fill from, to, and amount.
        </Typography>
        <List dense disablePadding sx={{ borderRadius: 1, overflow: 'hidden' }}>
          {entries.map((entry) => (
            <ListItemButton
              key={entry.id}
              onClick={() => onSelect(entry)}
              aria-label={`Apply conversion ${entry.from} to ${entry.to}, amount ${formatAmount(entry.amount)}`}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,0.02)',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {`${entry.from} → ${entry.to} · ${formatAmount(entry.amount)}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatWhen(entry.createdAt)}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
