import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7dd3fc' },
    secondary: { main: '#c4b5fd' },
    background: {
      default: '#0b1220',
      paper: '#111b2e',
    },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    body2: { color: 'rgba(255,255,255,0.72)' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1200px 600px at 20% -10%, rgba(125,211,252,0.18), transparent), radial-gradient(900px 500px at 100% 0%, rgba(196,181,253,0.16), transparent)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.14)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.22)',
          },
        },
      },
    },
  },
})
