import React, { useState, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ThemeToggle } from './components/common/ThemeToggle';
import { getTheme } from './theme/muiTheme';
import { FileUpload } from './components/Upload/FileUpload';
import { ChatWidget } from './components/Chat/ChatWidget';
import { PipelineCanvas } from './components/PipelineBuilder/PipelineCanvas';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  Button,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const { logout, user } = React.useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          mb: 4 
        }}
      >
        <Toolbar>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SmartToyIcon />
            </Avatar>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              AutoML Platform
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mr: 3, opacity: 0.9 }}>
            Welcome, {user?.username || 'User'}
          </Typography>
          <Button 
            color="inherit" 
            onClick={logout} 
            variant="outlined"
            sx={{ 
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="platform tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                fontSize: '1rem',
                fontWeight: 600
              }
            }}
          >
            <Tab 
              icon={<CloudUploadIcon sx={{ fontSize: 28 }} />} 
              label="Data Upload" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<ChatIcon sx={{ fontSize: 28 }} />} 
              label="AI Assistant" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<AccountTreeIcon sx={{ fontSize: 28 }} />} 
              label="Pipeline Builder" 
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Card elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                📁 Upload Your Data
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                Upload your dataset and select the appropriate modality for analysis
              </Typography>
              <FileUpload />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                💬 AI Chat Assistant
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                Chat with our AI assistant to get help with your AutoML workflows
              </Typography>
              <ChatWidget />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card elevation={0} sx={{ borderRadius: 3, border: 1, borderColor: 'divider', minHeight: '80vh' }}>
            <CardContent sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                🔧 Pipeline Builder
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                Design and build your machine learning pipeline visually
              </Typography>
              <Box sx={{ height: 'calc(80vh - 200px)', minHeight: '600px' }}>
                <PipelineCanvas />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </Box>
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
          <ThemeToggle mode={mode} onToggle={toggleTheme} />
          
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
