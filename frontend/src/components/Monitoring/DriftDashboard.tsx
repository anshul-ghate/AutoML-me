// AutoML-me/frontend/src/components/Monitoring/DriftDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Refresh,
  Timeline
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

interface DriftMetrics {
  drift_detected: boolean;
  drifted_features: string[];
  drift_score: number;
  timestamp: string;
}

interface DriftDashboardProps {
  sessionId: string;
}

export const DriftDashboard: React.FC<DriftDashboardProps> = ({ sessionId }) => {
  const [driftData, setDriftData] = useState<DriftMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ time: string; score: number }>>([]);

  const fetchDriftMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8301/api/monitoring/drift/status/${sessionId}`);
      const data = response.data;
      setDriftData(data);
      
      // Update history
      setHistory(prev => [
        ...prev.slice(-19),
        { time: new Date().toLocaleTimeString(), score: data.drift_score }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drift metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriftMetrics();
    const interval = setInterval(fetchDriftMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  const getDriftSeverity = (score: number) => {
    if (score < 0.1) return { level: 'low', color: 'success', icon: <CheckCircle /> };
    if (score < 0.3) return { level: 'medium', color: 'warning', icon: <Warning /> };
    return { level: 'high', color: 'error', icon: <Warning /> };
  };

  const severity = driftData ? getDriftSeverity(driftData.drift_score) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          📊 Model Drift Monitoring
        </Typography>
        <Tooltip title="Refresh metrics">
          <IconButton onClick={fetchDriftMetrics} disabled={loading}>
            <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !driftData && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Drift Status Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: severity?.color === 'error' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'white' }}>
                {severity?.icon}
                <Typography variant="h6" sx={{ color: 'white' }}>Drift Status</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                {driftData ? (driftData.drift_score * 100).toFixed(1) : '—'}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {driftData?.drift_detected ? 'Drift Detected' : 'No Drift Detected'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Drifted Features */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              🔍 Drifted Features
            </Typography>
            {driftData?.drifted_features.length ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {driftData.drifted_features.map((feature, idx) => (
                  <Chip
                    key={idx}
                    label={feature}
                    color="warning"
                    icon={<TrendingUp />}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            ) : (
              <Alert severity="success" icon={<CheckCircle />}>
                All features are stable - no drift detected
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Drift History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline /> Drift Score Over Time
            </Typography>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                Collecting drift metrics... Check back in 30 seconds
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recommendations */}
        {driftData?.drift_detected && (
          <Grid item xs={12}>
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Action Required
              </Typography>
              <Typography variant="body2">
                • Investigate drifted features: {driftData.drifted_features.join(', ')}
                <br />
                • Consider retraining your model with recent data
                <br />
                • Review data pipeline for any changes in data collection
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DriftDashboard;
