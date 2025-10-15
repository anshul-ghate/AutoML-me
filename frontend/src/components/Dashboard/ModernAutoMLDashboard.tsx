import React, { useState, useEffect } from 'react';
import {
 Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, LinearProgress, IconButton, Fab, Drawer, TextField, List, ListItem, ListItemText, ListItemAvatar, Badge, AppBar, Toolbar, Container, Paper, Stack, Divider, Alert, Skeleton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  SmartToy as AIIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  DataUsage as DataUsageIcon,
  ModelTraining as ModelTrainingIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import GenAIAssistant from './GenAIAssistant';

interface Project {
  id: number;
  name: string;
  status: 'completed' | 'training' | 'analyzing' | 'failed';
  accuracy?: number;
  progress?: number;
  createdAt: string;
  dataset: string;
  modelType: string;
  lastActivity: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "Customer Churn Prediction",
    status: "completed",
    accuracy: 94.2,
    createdAt: "2025-10-10",
    dataset: "customer_data.csv",
    modelType: "Random Forest",
    lastActivity: "2 hours ago"
  },
  {
    id: 2,
    name: "Sales Forecasting Q4",
    status: "training",
    accuracy: 87.5,
    progress: 75,
    createdAt: "2025-10-11",
    dataset: "sales_historical.csv",
    modelType: "XGBoost",
    lastActivity: "Active now"
  },
  {
    id: 3,
    name: "Fraud Detection Model",
    status: "analyzing",
    progress: 45,
    createdAt: "2025-10-09",
    dataset: "transactions.csv",
    modelType: "Neural Network",
    lastActivity: "30 minutes ago"
  }
];

const mockInsights = [
  {
    type: "recommendation",
    title: "Market Trend Alert",
    message: "Based on current market conditions, consider adding seasonality features to your sales forecasting model.",
    priority: "high",
    timestamp: "2025-10-11T10:30:00Z"
  },
  {
    type: "optimization",
    title: "Model Performance Tip",
    message: "Your customer churn model could benefit from additional feature engineering on behavioral data.",
    priority: "medium",
    timestamp: "2025-10-11T09:15:00Z"
  }
];

interface Project {
  id: number;
  name: string;
  status: 'completed' | 'training' | 'analyzing' | 'failed';
  accuracy?: number;
  progress?: number;
  createdAt: string;
  dataset: string;
  modelType: string;
  lastActivity: string;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const ModernAutoMLDashboard: React.FC = () => {
  const theme = useTheme();
  const [projects] = useState<Project[]>(mockProjects);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    avgAccuracy: projects.filter(p => p.accuracy).reduce((acc, p) => acc + (p.accuracy || 0), 0) / projects.filter(p => p.accuracy).length,
    activeProjects: projects.filter(p => p.status === 'training' || p.status === 'analyzing').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'training': return 'primary';
      case 'analyzing': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'training': return <ModelTrainingIcon />;
      case 'analyzing': return <DataUsageIcon />;
      default: return <DataUsageIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.95) }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <PsychologyIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>AutoML Studio</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mr: 2 }}>New Project</Button>
          <IconButton color="inherit" onClick={() => setAiDrawerOpen(true)}>
            <Badge badgeContent={2} color="error"><AIIcon /></Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back! 👋
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Total Projects</Typography>
                    <Typography variant="h4" color="primary">{stats.totalProjects}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}><DashboardIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Success Rate</Typography>
                    <Typography variant="h4" color="success.main">
                      {((stats.completedProjects / stats.totalProjects) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}><CheckCircleIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Avg Accuracy</Typography>
                    <Typography variant="h4" color="info.main">{stats.avgAccuracy.toFixed(1)}%</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}><TrendingUpIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Active Projects</Typography>
                    <Typography variant="h4" color="warning.main">{stats.activeProjects}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}><SpeedIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Insights</Typography>
                </Box>
                <Stack spacing={2}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2" fontWeight={600}>Market Trend Alert</Typography>
                    <Typography variant="body2">Consider seasonality features for forecasting</Typography>
                  </Alert>
                </Stack>
                <Button fullWidth variant="outlined" startIcon={<ChatIcon />} onClick={() => setAiDrawerOpen(true)} sx={{ mt: 2 }}>
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recent Projects</Typography>
                <Stack spacing={2}>
                  {projects.map((project) => (
                    <Paper key={project.id} sx={{ p: 2, '&:hover': { boxShadow: theme.shadows[4] } }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                          <Avatar sx={{ bgcolor: `${getStatusColor(project.status)}.main` }}>
                            {getStatusIcon(project.status)}
                          </Avatar>
                        </Grid>
                        <Grid item xs>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.dataset} • {project.modelType} • {project.lastActivity}
                          </Typography>
                          {project.progress && (
                            <LinearProgress variant="determinate" value={project.progress} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                          )}
                        </Grid>
                        <Grid item>
                          <Stack direction="row" spacing={1}>
                            <Chip label={project.status} color={getStatusColor(project.status) as any} size="small" variant="outlined" />
                            {project.accuracy && <Chip label={`${project.accuracy}% ACC`} color="success" size="small" />}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Drawer anchor="right" open={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><AIIcon /></Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Assistant</Typography>
                  <Typography variant="caption" color="text.secondary">Online • Ready to help</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setAiDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>
          </Paper>
          <GenAIAssistant/>
        </Box>
      </Drawer>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setAiDrawerOpen(true)}>
        <Badge badgeContent={2} color="error"><LightbulbIcon /></Badge>
      </Fab>
    </Box>
  );
};

export default ModernAutoMLDashboard;