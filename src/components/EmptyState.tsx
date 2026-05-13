import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: ReactNode
  action?: ReactNode
  /** Visible role for SR users — defaults to 'region' but pages can override. */
  role?: string
}

/**
 * Centered, friendly empty state used wherever a list / chart / view has no
 * content to show. Keeps the visual language consistent across the app
 * (history, chart, multi-currency view).
 */
export function EmptyState({ icon, title, description, action, role = 'region' }: EmptyStateProps) {
  return (
    <Box
      role={role}
      sx={{
        textAlign: 'center',
        py: 3,
        px: 1,
        color: 'text.secondary',
      }}
    >
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          aria-hidden
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
            color: 'text.secondary',
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
        {action ? <Box sx={{ mt: 0.5 }}>{action}</Box> : null}
      </Stack>
    </Box>
  )
}
