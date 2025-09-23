import React, { useState, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { getTheme } from './theme/muiTheme';
import { FileUpload } from './components/Upload/FileUpload';
import { ChatWidget } from './components/Chat/ChatWidget';
import { ThemeProvider, CssBaseline, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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
				style={{ position: 'absolute', top: 16, right: 16 }}
			>
				{mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
			</IconButton>
			<Routes>
			  <Route path="/login" element={<Login />} />
			  <Route path="/register" element={<Register />} />
			  <Route path="/upload" element={<FileUpload />} />
			  <Route path="/chat" element={<ChatWidget />} />
			  <Route
				path="/"
				element={
				  token ? (
					<div>Welcome to AutoML Platform</div>
				  ) : (
					<Navigate to="/login" />
				  )
				}
			  />
			</Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
