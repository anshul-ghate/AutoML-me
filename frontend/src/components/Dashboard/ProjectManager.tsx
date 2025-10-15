import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  Paper,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayArrow  as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  DataUsage as DataUsageIcon,
  ModelTraining as ModelTrainingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

interface Project {
  id: number;
  name: string;
  status: 'completed' | 'training' | 'analyzing' | 'failed' | 'paused';
  accuracy?: number;
  progress?: number;
  createdAt: string;
  dataset: string;
  modelType: string;
  lastActivity: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onView: (project: Project) => void;
}

export const EnhancedProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onView
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'training': return theme.palette.primary.main;
      case 'analyzing': return theme.palette.info.main;
      case 'failed': return theme.palette.error.main;
      case 'paused': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'training': return <ModelTrainingIcon />;
      case 'analyzing': return <DataUsageIcon />;
      case 'failed': return <ErrorIcon />;
      case 'paused': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        border: `2px solid transparent`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          border: `2px solid ${alpha(getStatusColor(project.status), 0.3)}`
        }
      }}
    >
      {/* Priority Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: getStatusColor(project.status),
          borderRadius: '4px 4px 0 0'
        }}
      />

      <CardContent sx={{ pt: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                bgcolor: alpha(getStatusColor(project.status), 0.1),
                color: getStatusColor(project.status),
                mr: 2
              }}
            >
              {getStatusIcon(project.status)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.dataset} • {project.modelType}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Tags & Priority */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          <Chip
            label={project.priority}
            color={getPriorityColor(project.priority) as any}
            size="small"
            variant="outlined"
          />
          {project.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }}
            />
          ))}
        </Box>

        {/* Progress & Stats */}
        {project.status === 'training' && project.progress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Training Progress
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
          </Box>
        )}

        {project.accuracy && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Model Performance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                {project.accuracy}% Accuracy
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {project.lastActivity}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => onView(project)}
              sx={{ borderRadius: 2 }}
            >
              View
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => onView(project)}
              sx={{ borderRadius: 2 }}
            >
              Analyze
            </Button>
          </Stack>
        </Box>
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 }
        }}
      >
        <MenuItem onClick={() => { onEdit(project); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Export
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ShareIcon sx={{ mr: 1, fontSize: 20 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { onDelete(project.id); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

// Main Project Management Component
interface ProjectManagerProps {
  projects: Project[];
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (projectId: number) => {
    // Implementation for project deletion
    console.log('Delete project:', projectId);
  };

  const handleViewProject = (project: Project) => {
    // Navigate to project detail view
    console.log('View project:', project);
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => filterStatus === 'all' || project.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'accuracy') {
        return (b.accuracy || 0) - (a.accuracy || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <Box>
      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            Project Dashboard
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="training">Training</MenuItem>
              <MenuItem value="analyzing">Analyzing</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="recent">Recent</MenuItem>
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            sx={{ borderRadius: 2 }}
          >
            New Project
          </Button>
        </Stack>
      </Paper>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} sm={6} lg={4} key={project.id}>
            <EnhancedProjectCard
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onView={handleViewProject}
            />
          </Grid>
        ))}
      </Grid>

      {filteredProjects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DataUsageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by creating your first AutoML project
          </Typography>
          <Button variant="contained" startIcon={<PlayIcon />}>
            Create New Project
          </Button>
        </Box>
      )}

      {/* Edit Project Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Project Name"
                defaultValue={selectedProject.name}
                fullWidth
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select defaultValue={selectedProject.priority}>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;