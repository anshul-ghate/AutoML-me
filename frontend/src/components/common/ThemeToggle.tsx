import React from 'react';
import { 
  Fab, 
  Tooltip,
  Box,
  Zoom 
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/material/styles';
import { logUserAction } from '../../services/analytics';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1300,
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
  color: '#ffffff',
  boxShadow: theme.palette.mode === 'light'
    ? '0 8px 25px rgba(102, 126, 234, 0.4)'
    : '0 8px 25px rgba(33, 150, 243, 0.4)',
  '&:hover': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
      : 'linear-gradient(135deg, #1976d2 0%, #0288d1 100%)',
    boxShadow: theme.palette.mode === 'light'
      ? '0 12px 35px rgba(102, 126, 234, 0.6)'
      : '0 12px 35px rgba(33, 150, 243, 0.6)',
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}));

interface ThemeToggleProps {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  const handleToggle = () => {
    logUserAction('theme_toggle', {
      from: mode,
      to: mode === 'light' ? 'dark' : 'light'
    });
    
    onToggle();
  };

  return (
    <Zoom in={true} timeout={500}>
      <Box>
        <Tooltip 
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          placement="left"
          arrow
        >
          <StyledFab 
            size="medium" 
            onClick={handleToggle}
            aria-label="toggle theme"
          >
            {mode === 'light' ? 
              <Brightness4Icon sx={{ fontSize: 24 }} /> : 
              <Brightness7Icon sx={{ fontSize: 24 }} />
            }
          </StyledFab>
        </Tooltip>
      </Box>
    </Zoom>
  );
};
