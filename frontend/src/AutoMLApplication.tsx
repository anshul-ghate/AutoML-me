// AutoML-me/frontend/src/AutoMLApplication.tsx - FINAL INTEGRATION
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Fab
} from '@mui/material';
import {
  Dashboard,
  CloudUpload,
  Psychology,
  CompareArrows,
  Logout,
  Chat,
  Brightness4,
  Brightness7
} from '@mui/icons-material';

// Import all components
import { ModernDashboard } from './components/Dashboard/ModernDashboard';
import { AIChatInterface } from './components/AI/AIChatInterface'; 
import { DriftDashboard } from './components/Monitoring/DriftDashboard';
import { ModelComparisonView } from './components/ModelComparison/ModelComparisonView';
import EnhancedTrainingPanel from './components/Training/EnhancedTrainingPanel';
import { FileUpload } from './components/Upload/FileUpload';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AutoMLApplicationProps {
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const AutoMLApplication: React.FC<AutoMLApplicationProps> = ({ 
  user, 
  onLogout, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sessionId] = useState('session_' + Date.now());

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, component: <ModernDashboard /> },
    { label: 'Upload Data', icon: <CloudUpload />, component: <FileUpload /> },
    { label: 'Model Training', icon: <Psychology />, component: <EnhancedTrainingPanel /> },
    { label: 'Model Comparison', icon: <CompareArrows />, component: <ModelComparisonView /> },
    { label: 'Drift Monitor', icon: <Psychology />, component: <DriftDashboard sessionId={sessionId} /> }
  ];

  const renderContent = () => {
    return menuItems[currentTab]?.component || <ModernDashboard />;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🤖 AutoML Platform
          </Typography>

          <IconButton color="inherit" onClick={onToggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={onLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: 64,
            borderRight: '1px solid rgba(0,0,0,0.12)'
          }
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuItems.map((item, index) => (
            <ListItem
              button
              key={index}
              selected={currentTab === index}
              onClick={() => setCurrentTab(index)}
              sx={{
                mb: 1,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }}
            >
              <ListItemIcon sx={{ color: currentTab === index ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {renderContent()}
      </Box>

      {/* Floating AI Chat */}
      <Fab
        color="secondary"
        onClick={() => setChatOpen(!chatOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
      >
        <Chat />
      </Fab>

      {/* AI Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{ sx: { width: 450, pt: 8 } }}
      >
        <AIChatInterface sessionId={sessionId} />
      </Drawer>
    </Box>
  );
};

export default AutoMLApplication;
