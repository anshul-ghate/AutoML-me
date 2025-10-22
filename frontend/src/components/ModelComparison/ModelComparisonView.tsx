// AutoML-me/frontend/src/components/ModelComparison/ModelComparisonView.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { EmojiEvents, TrendingUp, Speed } from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ModelMetrics {
  id: string;
  name: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_time: number;
}

const sampleModels: ModelMetrics[] = [
  {
    id: '1',
    name: 'Random Forest v1',
    algorithm: 'Random Forest',
    accuracy: 0.94,
    precision: 0.92,
    recall: 0.89,
    f1_score: 0.905,
    training_time: 45
  },
  {
    id: '2',
    name: 'XGBoost v1',
    algorithm: 'XGBoost',
    accuracy: 0.96,
    precision: 0.95,
    recall: 0.94,
    f1_score: 0.945,
    training_time: 120
  },
  {
    id: '3',
    name: 'Neural Network v1',
    algorithm: 'Deep Learning',
    accuracy: 0.93,
    precision: 0.91,
    recall: 0.92,
    f1_score: 0.915,
    training_time: 300
  }
];

export const ModelComparisonView: React.FC = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(['1', '2']);

  const getComparisonData = () => {
    const models = sampleModels.filter(m => selectedModels.includes(m.id));
    return [
      {
        metric: 'Accuracy',
        ...Object.fromEntries(models.map(m => [m.name, m.accuracy * 100]))
      },
      {
        metric: 'Precision',
        ...Object.fromEntries(models.map(m => [m.name, m.precision * 100]))
      },
      {
        metric: 'Recall',
        ...Object.fromEntries(models.map(m => [m.name, m.recall * 100]))
      },
      {
        metric: 'F1 Score',
        ...Object.fromEntries(models.map(m => [m.name, m.f1_score * 100]))
      }
    ];
  };

  const getRadarData = (model: ModelMetrics) => [
    { metric: 'Accuracy', value: model.accuracy * 100 },
    { metric: 'Precision', value: model.precision * 100 },
    { metric: 'Recall', value: model.recall * 100 },
    { metric: 'F1 Score', value: model.f1_score * 100 }
  ];

  const getBestModel = () => {
    return sampleModels.reduce((best, current) => 
      current.f1_score > best.f1_score ? current : best
    );
  };

  const bestModel = getBestModel();
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b'];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          🏆 Model Arena
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Compare and select the best performing model for deployment
        </Typography>
      </motion.div>

      {/* Best Model Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEvents sx={{ fontSize: 48 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recommended Model
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                {bestModel.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label={`${(bestModel.f1_score * 100).toFixed(1)}% F1 Score`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label={bestModel.algorithm} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Box>
            </Box>
            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
              Deploy Model
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Model Selection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Select Models to Compare
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Models</InputLabel>
          <Select
            multiple
            value={selectedModels}
            onChange={(e) => setSelectedModels(e.target.value as string[])}
            renderValue={(selected) => 
              sampleModels
                .filter(m => selected.includes(m.id))
                .map(m => m.name)
                .join(', ')
            }
          >
            {sampleModels.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name} - {model.algorithm}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Comparison Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📊 Metrics Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {sampleModels.filter(m => selectedModels.includes(m.id)).map((model, idx) => (
                  <Bar key={model.id} dataKey={model.name} fill={colors[idx]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              ⚡ Training Time
            </Typography>
            {sampleModels.filter(m => selectedModels.includes(m.id)).map((model, idx) => (
              <Box key={model.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{model.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {model.training_time}s
                  </Typography>
                </Box>
                <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(model.training_time / 300) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    style={{ height: '100%', background: colors[idx] }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Radar Charts for Each Model */}
        {sampleModels.filter(m => selectedModels.includes(m.id)).map((model, idx) => (
          <Grid item xs={12} md={6} key={model.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {model.name}
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={getRadarData(model)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name={model.name} dataKey="value" stroke={colors[idx]} fill={colors[idx]} fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        {/* Detailed Metrics Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📋 Detailed Metrics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Algorithm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Accuracy</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Precision</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Recall</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>F1 Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Training Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleModels.filter(m => selectedModels.includes(m.id)).map((model) => (
                    <TableRow key={model.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{model.name}</TableCell>
                      <TableCell>{model.algorithm}</TableCell>
                      <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.precision * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.recall * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(model.f1_score * 100).toFixed(1)}%`}
                          color={model.id === bestModel.id ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{model.training_time}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModelComparisonView;
