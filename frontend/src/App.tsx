import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Avatar,
  Divider,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { 
  Psychology as PsychologyIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon 
} from '@mui/icons-material';

// Import our main application
import AutoMLApplication from './AutoMLApplication';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Authentication interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Login/Registration component
const AuthenticationScreen: React.FC<{
  onAuthenticate: (user: User) => void;
}> = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      // Mock successful authentication
      const user: User = {
        id: '1',
        name: formData.name || 'Anshul Ghate',
        email: formData.email,
        avatar: undefined
      };

      onAuthenticate(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2
              }}
            >
              <PsychologyIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              AutoML Platform
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI-powered machine learning for everyone
            </Typography>
          </Box>

          {/* Tab switcher */}
          <Tabs
            value={isLogin ? 0 : 1}
            onChange={(_, value) => setIsLogin(value === 0)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required={!isLogin}
                />
              )}
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              )}

              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={isLogin ? <LoginIcon /> : <SignupIcon />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {/* Demo login */}
              <Divider>or</Divider>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setFormData({
                    name: 'Demo User',
                    email: 'demo@automl.com',
                    password: 'demo123',
                    confirmPassword: 'demo123'
                  });
                }}
              >
                Use Demo Account
              </Button>
            </Stack>
          </Box>

          {/* Features preview */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Platform Features:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ bgcolor: 'primary.50', px: 1.5, py: 0.5, borderRadius: 1 }}>
                🤖 AI-Powered Analysis
              </Typography>
              <Typography variant="caption" sx={{ bgcolor: 'secondary.50', px: 1.5, py: 0.5, borderRadius: 1 }}>
                📊 Advanced Visualization
              </Typography>
              <Typography variant="caption" sx={{ bgcolor: 'success.50', px: 1.5, py: 0.5, borderRadius: 1 }}>
                🚀 One-Click Deployment
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// Main App component with authentication
const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Simulate checking for existing session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check localStorage for saved session
        const savedUser = localStorage.getItem('automl_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setAuthState({
            isAuthenticated: true,
            user,
            isLoading: false
          });
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    checkAuthStatus();
  }, []);

  const handleAuthenticate = (user: User) => {
    // Save user to localStorage
    localStorage.setItem('automl_user', JSON.stringify(user));
    
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('automl_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  // Loading screen
  if (authState.isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <PsychologyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6">Loading AutoML Platform...</Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authState.isAuthenticated && authState.user ? (
        <AutoMLApplication user={authState.user} onLogout={handleLogout} />
      ) : (
        <AuthenticationScreen onAuthenticate={handleAuthenticate} />
      )}
    </ThemeProvider>
  );
};

export default App;