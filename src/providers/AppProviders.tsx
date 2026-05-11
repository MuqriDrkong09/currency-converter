import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PaletteMode } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { ColorModeContext } from '../theme/ColorModeContext'
import { createAppTheme } from '../theme/appTheme'
import { readColorMode, writeColorMode } from '../utils/colorModeStorage'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mode, setMode] = useState<PaletteMode>(() => readColorMode())

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const toggleColorMode = useCallback(() => {
    setMode((prev) => {
      const next: PaletteMode = prev === 'dark' ? 'light' : 'dark'
      writeColorMode(next)
      return next
    })
  }, [])

  const colorModeValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode])

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorModeValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  )
}
