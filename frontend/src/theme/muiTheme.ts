import { createTheme, Theme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9'
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212'
      }
    },
    typography: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
    }
  });
