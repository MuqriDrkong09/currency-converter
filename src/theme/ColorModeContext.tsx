import type { PaletteMode } from '@mui/material'
import { createContext, useContext } from 'react'

export type ColorModeContextValue = {
  mode: PaletteMode
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext)
  if (!ctx) {
    throw new Error('useColorMode must be used within ColorModeContext.Provider')
  }
  return ctx
}
