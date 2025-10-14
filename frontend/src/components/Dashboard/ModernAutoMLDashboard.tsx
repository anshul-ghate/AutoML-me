import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Fab,
  Drawer,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  AppBar,
  Toolbar,
  Container,
  Paper,
  Stack,
  Divider,
  Alert,
  Skeleton
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

// Mock data for demonstration
const mockProjects = [
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
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hi! I'm your AutoML assistant. I can help you optimize your models, suggest improvements, and provide market insights. How can I assist you today?",
      timestamp: new Date(),
      suggestions: ["Analyze my latest model", "Suggest data improvements", "Market trend insights", "Optimize hyperparameters"]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats calculation
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    avgAccuracy: projects.filter(p => p.accuracy).reduce((acc, p) => acc + (p.accuracy || 0), 0) / projects.filter(p => p.accuracy).length,
    activeProjects: projects.filter(p => p.status === 'training' || p.status === 'analyzing').length
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentMessage),
        timestamp: new Date(),
        suggestions: ["Tell me more", "Show model comparison", "Export insights", "Schedule follow-up"]
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Based on your data patterns, I recommend implementing ensemble methods to improve accuracy by 2-5%.",
      "I've analyzed current market trends - your model should include recent economic indicators for better predictions.",
      "Your feature engineering looks solid! Consider adding temporal features to capture seasonality effects.",
      "I notice potential data drift in your recent predictions. Would you like me to suggest corrective measures?",
      "Great question! For this use case, I recommend focusing on recall over precision to minimize false negatives."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
      case 'failed': return <ErrorIcon />;
      default: return <ScheduleIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Modern Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <PsychologyIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              AutoML Studio
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              mr: 2,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            New Project
          </Button>
          <IconButton
            color="inherit"
            onClick={() => setAiDrawerOpen(true)}
          >
            <Badge badgeContent={2} color="error">
              <AIIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Welcome back! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your AI-powered machine learning workspace
          </Typography>
          
          {/* Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Projects
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {stats.totalProjects}
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
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Success Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {((stats.completedProjects / stats.totalProjects) * 100).toFixed(0)}%
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
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Avg Accuracy
                      </Typography>
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
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Active Projects
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {stats.activeProjects}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <SpeedIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* AI Insights Panel */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI Insights & Recommendations
                  </Typography>
                </Box>
                
                <Stack spacing={2}>
                  {mockInsights.map((insight, index) => (
                    <Alert
                      key={index}
                      severity={insight.priority === 'high' ? 'warning' : 'info'}
                      action={
                        <Button size="small" onClick={() => setAiDrawerOpen(true)}>
                          Discuss
                        </Button>
                      }
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2">
                        {insight.message}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  onClick={() => setAiDrawerOpen(true)}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Chat with AI Assistant
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Projects */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Projects
                    </Typography>
                  </Box>
                  <Button variant="text" size="small">
                    View All
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {projects.map((project) => (
                    <Paper
                      key={project.id}
                      sx={{
                        p: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)',
                          borderColor: alpha(theme.palette.primary.main, 0.3)
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
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.dataset} • {project.modelType} • {project.lastActivity}
                          </Typography>
                          
                          {project.status === 'training' && project.progress && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Training Progress: {project.progress}%
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        
                        <Grid item>
                          <Stack direction="row" spacing={1} alignItems="center">
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* AI Assistant Drawer */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 400 },
            bgcolor: 'background.default'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Paper sx={{ p: 2, borderRadius: 0, boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AIIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    AI Assistant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Online • Ready to help
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setAiDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      border: message.type === 'assistant' ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                    
                    {message.suggestions && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.suggestions.map((suggestion, idx) => (
                          <Chip
                            key={idx}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => setCurrentMessage(suggestion)}
                            sx={{ 
                              fontSize: '0.75rem',
                              height: 24,
                              borderColor: alpha(theme.palette.primary.main, 0.3)
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1}>
                      <Skeleton variant="circular" width={8} height={8} />
                      <Skeleton variant="circular" width={8} height={8} />
                      <Skeleton variant="circular" width={8} height={8} />
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Chat Input */}
          <Paper sx={{ p: 2, borderRadius: 0, boxShadow: 'none', borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="Ask me anything about your models..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                size="small"
                multiline
                maxRows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || loading}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      </Drawer>

      {/* Floating AI Assistant Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: theme.shadows[8]
        }}
        onClick={() => setAiDrawerOpen(true)}
      >
        <Badge badgeContent={2} color="error">
          <LightbulbIcon />
        </Badge>
      </Fab>
    </Box>
  );
};

export default ModernAutoMLDashboard;