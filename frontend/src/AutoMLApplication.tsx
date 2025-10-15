import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Fab,
  Drawer
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  SmartToy as AIIcon,
  Timeline as PipelineIcon,
  ModelTraining as TrainingIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Psychology as PsychologyIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as Brightness7Icon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

// Import existing components
import EnhancedTrainingPanel from './components/Training/EnhancedTrainingPanel';
import { FileUpload } from './components/Upload/FileUpload';

// User and project interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  status: 'draft' | 'training' | 'completed' | 'failed';
  accuracy?: number;
  progress?: number;
  createdAt: string;
  lastActivity: string;
  dataset?: string;
  modelType?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

// Enhanced AI Assistant component
const AIAssistantPanel: React.FC = () => {
  const theme = useTheme();
  const [insights] = useState([
    {
      type: 'success',
      title: 'Model Performance',
      message: 'Your latest model achieved 94.2% accuracy - excellent performance!',
      recommendation: 'Consider ensemble methods to boost accuracy by 2-3%.'
    },
    {
      type: 'warning',
      title: 'Data Drift Alert',
      message: 'Potential data drift detected in recent samples.',
      recommendation: 'Model retraining recommended within the next week.'
    },
    {
      type: 'info',
      title: 'Feature Engineering',
      message: 'New categorical features could improve model performance.',
      recommendation: 'Try one-hot encoding for categorical variables.'
    }
  ]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        🤖 AI Assistant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Get intelligent recommendations and insights for your ML projects.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
              Smart Insights
            </Typography>
            <Stack spacing={2}>
              {insights.map((insight, index) => (
                <Alert 
                  key={index}
                  severity={insight.type as any}
                  sx={{ '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                    {insight.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    💡 Recommendation: {insight.recommendation}
                  </Typography>
                </Alert>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>🎯 Quick Actions</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="outlined" startIcon={<AnalyticsIcon />}>
                Analyze Current Model
              </Button>
              <Button variant="outlined" startIcon={<TrainingIcon />}>
                Optimize Hyperparameters
              </Button>
              <Button variant="outlined" startIcon={<CloudUploadIcon />}>
                Upload New Dataset
              </Button>
              <Button variant="outlined" startIcon={<TrendingUpIcon />}>
                Performance Report
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>📈 Model Health</Typography>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overall Performance</Typography>
                  <Typography variant="body2" fontWeight={600}>94.2%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={94.2} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Data Quality</Typography>
                  <Typography variant="body2" fontWeight={600}>87.5%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={87.5} color="warning" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Model Stability</Typography>
                  <Typography variant="body2" fontWeight={600}>91.8%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={91.8} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Dashboard component with project overview
const DashboardPanel: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const theme = useTheme();
  
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    training: projects.filter(p => p.status === 'training').length,
    avgAccuracy: projects
      .filter(p => p.accuracy)
      .reduce((acc, p) => acc + (p.accuracy || 0), 0) / 
      projects.filter(p => p.accuracy).length || 0
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'training': return <TrainingIcon color="primary" />;
      case 'draft': return <ScheduleIcon color="warning" />;
      case 'failed': return <WarningIcon color="error" />;
      default: return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'training': return 'primary';
      case 'draft': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        📊 Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <DashboardIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Completed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {stats.completed}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Avg Accuracy</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {stats.avgAccuracy.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">In Progress</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {stats.training}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrainingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Recent Projects
        </Typography>
        <Stack spacing={2}>
          {projects.map((project) => (
            <Paper
              key={project.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar sx={{ bgcolor: `${getStatusColor(project.status)}.main` }}>
                    {getStatusIcon(project.status)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.dataset && `${project.dataset} • `}
                    {project.modelType && `${project.modelType} • `}
                    {project.lastActivity}
                  </Typography>
                  {project.status === 'training' && project.progress && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {project.progress}% Complete
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status) as any}
                      size="small"
                      variant="outlined"
                    />
                    {project.accuracy && (
                      <Chip
                        label={`${project.accuracy}% ACC`}
                        color="success"
                        size="small"
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

// Main application component
interface AutoMLApplicationProps {
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const AutoMLApplication: React.FC<AutoMLApplicationProps> = ({ user, onLogout, darkMode, onToggleDarkMode }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Customer Churn Analysis',
      status: 'completed',
      accuracy: 94.2,
      createdAt: '2025-10-10',
      lastActivity: '2 hours ago',
      dataset: 'customer_data.csv',
      modelType: 'Random Forest'
    },
    {
      id: '2',
      name: 'Sales Forecasting Q4',
      status: 'training',
      progress: 75,
      createdAt: '2025-10-15',
      lastActivity: 'Active now',
      dataset: 'sales_historical.csv',
      modelType: 'XGBoost'
    },
    {
      id: '3',
      name: 'Fraud Detection Model',
      status: 'draft',
      createdAt: '2025-10-12',
      lastActivity: '1 day ago',
      dataset: 'transactions.csv'
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Model training completed with 94.2% accuracy',
      type: 'success',
      timestamp: '2 hours ago',
      isRead: false
    },
    {
      id: '2',
      message: 'Data drift detected in Sales Forecasting model',
      type: 'warning',
      timestamp: '4 hours ago',
      isRead: false
    },
    {
      id: '3',
      message: 'New dataset uploaded successfully',
      type: 'info',
      timestamp: '1 day ago',
      isRead: true
    }
  ]);

  // Navigation items matching the original design
  const navigationItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, value: 0 },
    { label: 'Data Upload', icon: <CloudUploadIcon />, value: 1 },
    { label: 'AI Assistant', icon: <AIIcon />, value: 2 },
    { label: 'Pipeline Builder', icon: <PipelineIcon />, value: 3 },
    { label: 'Model Training', icon: <TrainingIcon />, value: 4 }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <DashboardPanel projects={projects} />;
      
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              📁 Data Upload & Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Upload your dataset and get comprehensive analysis with data quality insights.
            </Typography>
            <FileUpload />
          </Box>
        );
      
      case 2:
        return <AIAssistantPanel />;
      
      case 3:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              🔗 Pipeline Builder
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The pipeline builder is integrated within the training workflow for seamless ML pipeline creation.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Start from "Data Upload" to access the complete pipeline builder with drag-and-drop functionality.
            </Alert>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>🏗️ Available Pipeline Components</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip label="📥 Data Ingestion" color="primary" />
                <Chip label="🔍 Data Preprocessing" color="secondary" />
                <Chip label="⚙️ Feature Engineering" color="success" />
                <Chip label="🤖 Model Selection" color="warning" />
                <Chip label="🎯 Hyperparameter Tuning" color="info" />
                <Chip label="📊 Model Validation" color="error" />
                <Chip label="🚀 Deployment" />
              </Stack>
            </Paper>
          </Box>
        );
      
      case 4:
        return (
          <Box sx={{ py: 2 }}>
            <EnhancedTrainingPanel />
          </Box>
        );
      
      default:
        return <DashboardPanel projects={projects} />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.95),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <PsychologyIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AutoML Platform
            </Typography>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                color: alpha(theme.palette.primary.contrastText, 0.7),
                '&.Mui-selected': {
                  color: theme.palette.primary.contrastText
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.contrastText
              }
            }}
          >
            {navigationItems.map((item) => (
              <Tab
                key={item.value}
                label={item.label}
                icon={item.icon}
                iconPosition="start"
                sx={{ minHeight: 64, textTransform: 'none' }}
              />
            ))}
          </Tabs>

          {/* User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton color="inherit">
              <HelpIcon />
            </IconButton>

            {/* Dark Mode Toggle */}
            <IconButton color="inherit" onClick={onToggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <DarkModeIcon />}
            </IconButton>

            <Button
              color="inherit"
              startIcon={
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              }
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              {user.name}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          flex: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {renderTabContent()}
      </Container>

      {/* Chat FAB - Always visible */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setChatDrawerOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* AI Chat Drawer */}
      <Drawer
        anchor="right"
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            🤖 AI Assistant Chat
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Chat interface coming soon...
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <AccountIcon sx={{ mr: 2 }} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SettingsIcon sx={{ mr: 2 }} />
          Preferences
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <DarkModeIcon sx={{ mr: 2 }} />
          Dark Mode
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem key={notification.id} sx={{ py: 2, alignItems: 'flex-start' }}>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 0.5,
                  fontWeight: notification.isRead ? 400 : 600 
                }}
              >
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.timestamp}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button 
            size="small" 
            onClick={() => setNotificationAnchor(null)}
          >
            Mark All as Read
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default AutoMLApplication;