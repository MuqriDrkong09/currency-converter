import { createTheme, type PaletteMode } from '@mui/material/styles'

const fontStack = '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#7dd3fc' : '#0369a1' },
      secondary: { main: isDark ? '#c4b5fd' : '#6d28d9' },
      background: isDark
        ? { default: '#0b1220', paper: '#111b2e' }
        : { default: '#eef2f7', paper: '#ffffff' },
    },
    typography: {
      fontFamily: fontStack,
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      ...(isDark ? { body2: { color: 'rgba(255,255,255,0.72)' } } : {}),
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: isDark
            ? {
                backgroundImage:
                  'radial-gradient(1200px 600px at 20% -10%, rgba(125,211,252,0.18), transparent), radial-gradient(900px 500px at 100% 0%, rgba(196,181,253,0.16), transparent)',
                minHeight: '100vh',
              }
            : {
                backgroundImage:
                  'radial-gradient(900px 480px at 10% -8%, rgba(3,105,161,0.08), transparent), radial-gradient(700px 400px at 100% 0%, rgba(109,40,217,0.06), transparent)',
                minHeight: '100vh',
              },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: isDark
            ? {
                backgroundImage:
                  'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
              }
            : {
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))',
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: isDark
            ? {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.14)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.22)',
                },
              }
            : {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15,23,42,0.16)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15,23,42,0.28)',
                },
              },
        },
      },
    },
  })
}
