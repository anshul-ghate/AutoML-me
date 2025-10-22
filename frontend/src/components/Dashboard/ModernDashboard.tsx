// AutoML-me/frontend/src/components/Dashboard/ModernDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Avatar,
  Paper,
  Button
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  CheckCircle,
  Schedule,
  Psychology,
  DataObject,
  Refresh,
  ArrowForward
} from '@mui/icons-material';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  status: string;
  accuracy?: number;
  created_at: string;
}

interface DashboardStats {
  totalProjects: number;
  activeModels: number;
  avgAccuracy: number;
  tasksCompleted: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export const ModernDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeModels: 0,
    avgAccuracy: 0,
    tasksCompleted: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample performance data
  const performanceData = [
    { name: 'Mon', accuracy: 85, models: 3 },
    { name: 'Tue', accuracy: 88, models: 5 },
    { name: 'Wed', accuracy: 91, models: 7 },
    { name: 'Thu', accuracy: 87, models: 6 },
    { name: 'Fri', accuracy: 93, models: 8 },
    { name: 'Sat', accuracy: 90, models: 7 },
    { name: 'Sun', accuracy: 94, models: 9 }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsRes] = await Promise.all([
        axios.get('http://localhost:8301/api/projects')
      ]);

      const projectsData = projectsRes.data;
      setProjects(projectsData);

      // Calculate stats
      const activeModels = projectsData.filter((p: Project) => p.status === 'active').length;
      const avgAcc = projectsData
        .filter((p: Project) => p.accuracy)
        .reduce((sum: number, p: Project) => sum + (p.accuracy || 0), 0) / projectsData.length || 0;

      setStats({
        totalProjects: projectsData.length,
        activeModels,
        avgAccuracy: avgAcc,
        tasksCompleted: projectsData.filter((p: Project) => p.status === 'completed').length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default data for demo
      setStats({
        totalProjects: 12,
        activeModels: 5,
        avgAccuracy: 89.5,
        tasksCompleted: 24
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderLeft: `4px solid ${color}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, my: 1, color }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: color
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's what's happening with your ML projects.
            </Typography>
          </Box>
          <IconButton onClick={fetchDashboardData} sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Refresh />
          </IconButton>
        </Box>
      </motion.div>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={<DataObject />}
              color="#667eea"
              subtitle="+3 this month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Models"
              value={stats.activeModels}
              icon={<Psychology />}
              color="#f093fb"
              subtitle="In production"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Accuracy"
              value={`${stats.avgAccuracy.toFixed(1)}%`}
              icon={<TrendingUp />}
              color="#4facfe"
              subtitle="+2.3% vs last week"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tasks Completed"
              value={stats.tasksCompleted}
              icon={<CheckCircle />}
              color="#43e97b"
              subtitle="This month"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div variants={cardVariants}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  📈 Model Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="accuracy" stroke="#667eea" fillOpacity={1} fill="url(#colorAccuracy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={cardVariants}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  🎯 Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DataObject />}
                    endIcon={<ArrowForward />}
                    fullWidth
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Upload Dataset
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Psychology />}
                    endIcon={<ArrowForward />}
                    fullWidth
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Train New Model
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Speed />}
                    endIcon={<ArrowForward />}
                    fullWidth
                    sx={{ justifyContent: 'space-between' }}
                  >
                    View Analytics
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Projects */}
        <motion.div variants={cardVariants}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📂 Recent Projects
            </Typography>
            <Grid container spacing={2}>
              {projects.slice(0, 6).map((project, idx) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card sx={{ borderLeft: '3px solid #667eea' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {project.name}
                          </Typography>
                          <Chip
                            label={project.status}
                            size="small"
                            color={project.status === 'active' ? 'success' : 'default'}
                          />
                        </Box>
                        {project.accuracy && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <TrendingUp fontSize="small" color="success" />
                            <Typography variant="body2" color="success.main">
                              {project.accuracy}% Accuracy
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          <Schedule fontSize="inherit" /> {new Date(project.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default ModernDashboard;
