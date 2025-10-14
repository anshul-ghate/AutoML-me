import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  SmartToy as AIIcon,
  Assessment as AssessmentIcon,
  DataUsage as DataUsageIcon,
  ModelTraining as ModelTrainingIcon,
  Insights as InsightsIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

// Import our dashboard components
import ModernAutoMLDashboard from './ModernAutoMLDashboard';
import ProjectManager from './ProjectManager';
import GenAIAssistant from './GenAIAssistant';

const drawerWidth = 280;

interface NavigationItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    id: 'projects',
    text: 'My Projects',
    icon: <HistoryIcon />,
    path: '/projects',
    badge: 3
  },
  {
    id: 'training',
    text: 'Model Training',
    icon: <ModelTrainingIcon />,
    path: '/training'
  },
  {
    id: 'analytics',
    text: 'Analytics & Insights',
    icon: <AnalyticsIcon />,
    path: '/analytics'
  },
  {
    id: 'explainability',
    text: 'Model Explainability',
    icon: <InsightsIcon />,
    path: '/explainability'
  },
  {
    id: 'ai-assistant',
    text: 'AI Assistant',
    icon: <AIIcon />,
    path: '/ai-assistant',
    badge: 2
  }
];

const quickActions: NavigationItem[] = [
  {
    id: 'quick-train',
    text: 'Quick Training',
    icon: <AutoAwesomeIcon />,
    path: '/quick-train'
  },
  {
    id: 'market-analysis',
    text: 'Market Analysis',
    icon: <TrendingUpIcon />,
    path: '/market-analysis'
  },
  {
    id: 'data-profiling',
    text: 'Data Profiling',
    icon: <DataUsageIcon />,
    path: '/data-profiling'
  }
];

export const EnhancedNavigation: React.FC = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const renderBreadcrumb = () => {
    const breadcrumbMap: Record<string, string[]> = {
      'dashboard': ['Dashboard'],
      'projects': ['Projects', 'My Projects'],
      'training': ['Training', 'Model Training'],
      'analytics': ['Analytics', 'Insights'],
      'explainability': ['Analysis', 'Model Explainability'],
      'ai-assistant': ['AI Assistant']
    };

    const breadcrumbs = breadcrumbMap[activeView] || ['Dashboard'];

    return (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover">
          AutoML Studio
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <Typography key={index} color="text.primary" sx={{ fontWeight: 600 }}>
            {crumb}
          </Typography>
        ))}
      </Breadcrumbs>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <PsychologyIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              AutoML Studio
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI-Powered Platform
            </Typography>
          </Box>
        </Box>
        
        <Chip
          label="✨ Pro Plan"
          color="primary"
          size="small"
          sx={{ borderRadius: 2 }}
        />
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, pt: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => setActiveView(item.id)}
                selected={activeView === item.id}
                disabled={item.disabled}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main'
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: activeView === item.id ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 2 }} />

        {/* Quick Actions */}
        <Box sx={{ px: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}
          >
            Quick Actions
          </Typography>
          <List>
            {quickActions.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.85rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* User Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
            AS
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Anshul Ghate
            </Typography>
            <Typography variant="caption" color="text.secondary">
              anshul@automl.com
            </Typography>
          </Box>
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Brightness4Icon sx={{ mr: 1, fontSize: 16 }} /> : <Brightness7Icon sx={{ mr: 1, fontSize: 16 }} />}
              <Typography variant="caption">Dark Mode</Typography>
            </Box>
          }
          sx={{ m: 0 }}
        />
      </Box>
    </Box>
  );

  const renderMainContent = () => {
    const mockProjects = [
      {
        id: 1,
        name: "Customer Churn Prediction",
        status: "completed" as const,
        accuracy: 94.2,
        createdAt: "2025-10-10",
        dataset: "customer_data.csv",
        modelType: "Random Forest",
        lastActivity: "2 hours ago",
        tags: ["classification", "production"],
        priority: "high" as const
      },
      {
        id: 2,
        name: "Sales Forecasting Q4",
        status: "training" as const,
        accuracy: 87.5,
        progress: 75,
        createdAt: "2025-10-11",
        dataset: "sales_historical.csv",
        modelType: "XGBoost",
        lastActivity: "Active now",
        tags: ["regression", "time-series"],
        priority: "medium" as const
      }
    ];

    switch (activeView) {
      case 'dashboard':
        return <ModernAutoMLDashboard />;
      case 'projects':
        return <ProjectManager projects={mockProjects} />;
      case 'ai-assistant':
        return <GenAIAssistant />;
      case 'training':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Model Training
            </Typography>
            <Typography color="text.secondary">
              Advanced training interface coming soon...
            </Typography>
          </Box>
        );
      case 'analytics':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Analytics & Insights
            </Typography>
            <Typography color="text.secondary">
              Comprehensive analytics dashboard coming soon...
            </Typography>
          </Box>
        );
      case 'explainability':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Model Explainability
            </Typography>
            <Typography color="text.secondary">
              SHAP and LIME explanations coming soon...
            </Typography>
          </Box>
        );
      default:
        return <ModernAutoMLDashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            {renderBreadcrumb()}
          </Box>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Search">
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {renderMainContent()}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><HelpIcon /></ListItemIcon>
          Help
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem>
          <ListItemIcon><AutoAwesomeIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="Model training completed"
            secondary="Customer churn model achieved 94.2% accuracy"
          />
        </MenuItem>
        <MenuItem>
          <ListItemIcon><TrendingUpIcon color="warning" /></ListItemIcon>
          <ListItemText 
            primary="Performance alert"
            secondary="Sales model showing data drift"
          />
        </MenuItem>
        <MenuItem>
          <ListItemIcon><AIIcon color="info" /></ListItemIcon>
          <ListItemText 
            primary="AI recommendation"
            secondary="New optimization strategy available"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EnhancedNavigation;