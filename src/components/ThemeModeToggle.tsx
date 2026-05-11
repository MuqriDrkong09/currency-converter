import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined'
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorMode } from '../theme/ColorModeContext'

export function ThemeModeToggle() {
  const { mode, toggleColorMode } = useColorMode()
  const isDark = mode === 'dark'

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
        edge="end"
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        {isDark ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}
