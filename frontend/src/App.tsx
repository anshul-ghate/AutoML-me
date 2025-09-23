import React, { useState, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { getTheme } from './theme/muiTheme';
import { FileUpload } from './components/Upload/FileUpload';
import { ChatWidget } from './components/Chat/ChatWidget';
import { 
  ThemeProvider, 
  CssBaseline, 
  IconButton, 
  Container, 
  Grid, 
  Typography, 
  AppBar, 
  Toolbar, 
  Button 
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Dashboard = () => {
  const { logout } = React.useContext(AuthContext);
  
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AutoML Platform
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" mb={2}>File Upload</Typography>
          <FileUpload />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" mb={2}>AI Chat Assistant</Typography>
          <ChatWidget />
        </Grid>
      </Grid>
    </Container>
  );
};

export const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1300 }}
          >
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
