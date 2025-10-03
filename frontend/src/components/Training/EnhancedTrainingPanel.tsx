import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, StepContent,
  Button, CircularProgress, Alert, Card, CardContent,
  Switch, FormControlLabel, Chip, TextField, Divider, List, ListItem,
  ListItemText, IconButton, Slider, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Stack
} from '@mui/material';
import { Grid } from '@mui/material'; // Use standard Grid, not Grid2
import {
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  BuildCircle as BuildCircleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

interface DataProfile {
  shape: [number, number];
  missing_values: Record<string, number>;
  data_quality_score: number;
  recommendations: string[];
  statistical_summary: any;
  feature_importance_estimate: any;
}

interface TrainingConfig {
  targetColumn: string;
  autoEngineer: boolean;
  testSize: number;
  cvFolds: number;
}

interface ModelResult {
  cv_mean_accuracy: number;
  cv_std_accuracy: number;
  test_accuracy: number;
  test_precision: number;
  test_recall: number;
  test_f1: number;
  training_time_seconds: number;
}

export const EnhancedTrainingPanel: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    targetColumn: 'target',
    autoEngineer: true,
    testSize: 0.2,
    cvFolds: 5
  });
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [featureEngineering, setFeatureEngineering] = useState<any>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((files: File[]) => {
      setFile(files[0]);
      setActiveStep(1);
      setError('');
      setResults(null);
      setDataProfile(null);
    }, []),
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  });

  const analyzeData = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/training/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDataProfile(response.data.profile);
      setActiveStep(2);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to analyze dataset');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runFeatureEngineering = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(
        `/api/training/feature-engineer?target_col=${trainingConfig.targetColumn}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setFeatureEngineering(response.data);
      setActiveStep(3);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to engineer features');
    }
  };

  const startTraining = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_column', trainingConfig.targetColumn);
      formData.append('test_size', trainingConfig.testSize.toString());
      formData.append('cv_folds', trainingConfig.cvFolds.toString());
      formData.append('auto_feature_engineering', trainingConfig.autoEngineer.toString());
      
      const response = await api.post('/api/training/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResults(response.data);
      setActiveStep(4);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to start training');
    }
  };

  const pollTrainingProgress = async (id: string) => {
    try {
      const progressResponse = await api.get(`/api/training/progress/${id}`);
      setTrainingProgress(progressResponse.data);
      
      if (progressResponse.data.status === 'completed') {
        const resultsResponse = await api.get(`/api/training/results/${id}`);
        setResults(resultsResponse.data);
        setActiveStep(5);
      } else if (progressResponse.data.status === 'failed') {
        setError(progressResponse.data.error || 'Training failed');
      } else {
        setTimeout(() => pollTrainingProgress(id), 2000);
      }
    } catch (error: any) {
      setError('Failed to get training progress');
    }
  };

  const resetWorkflow = () => {
    setActiveStep(0);
    setFile(null);
    setDataProfile(null);
    setFeatureEngineering(null);
    setResults(null);
    setTrainingProgress(null);
    setError('');
    setSessionId('');
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        🚀 Advanced ML Training Platform
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
          action={
            <IconButton size="small" onClick={resetWorkflow}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Upload Dataset */}
        <Step>
          <StepLabel>
            <CloudUploadIcon sx={{ mr: 1 }} />
            Upload Dataset
          </StepLabel>
          <StepContent>
            <Box
              {...getRootProps()}
              sx={{
                border: '3px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.light' : 'background.default',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" gutterBottom>
                {file ? `✅ ${file.name}` : 'Drop your CSV file here or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum file size: 50MB • Supported format: CSV
              </Typography>
              {file && (
                <Chip
                  label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={!file}
                startIcon={<AnalyticsIcon />}
              >
                Next: Analyze Data
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 2: Analyze Data */}
        <Step>
          <StepLabel>
            <AnalyticsIcon sx={{ mr: 1 }} />
            Analyze Data
          </StepLabel>
          <StepContent>
            <Button
              variant="contained"
              onClick={analyzeData}
              disabled={isAnalyzing || !file}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AnalyticsIcon />}
              sx={{ mb: 3 }}
            >
              {isAnalyzing ? 'Analyzing Dataset...' : 'Analyze Dataset'}
            </Button>

            {dataProfile && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        📊 Dataset Overview
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Rows"
                            secondary={dataProfile.shape[0].toLocaleString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Columns"
                            secondary={dataProfile.shape[1]}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Data Quality Score"
                            secondary={
                              <Box display="flex" alignItems="center" mt={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={dataProfile.data_quality_score}
                                  color={getQualityColor(dataProfile.data_quality_score)}
                                  sx={{ flexGrow: 1, mr: 1 }}
                                />
                                <Typography variant="body2">
                                  {dataProfile.data_quality_score.toFixed(1)}%
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </List>
                    </Grid>

                    <Grid xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        🎯 Recommendations
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {dataProfile.recommendations.slice(0, 3).map((rec, idx) => (
                          <Chip
                            key={idx}
                            label={rec}
                            size="small"
                            sx={{ maxWidth: '100%' }}
                            color="info"
                          />
                        ))}
                        {dataProfile.recommendations.length > 3 && (
                          <Chip
                            label={`+${dataProfile.recommendations.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              disabled={!dataProfile}
            >
              Next: Feature Engineering
            </Button>
          </StepContent>
        </Step>

        {/* Step 3: Feature Engineering */}
        <Step>
          <StepLabel>
            <BuildCircleIcon sx={{ mr: 1 }} />
            Feature Engineering
          </StepLabel>
          <StepContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Column Name"
                  value={trainingConfig.targetColumn}
                  onChange={(e) => setTrainingConfig(prev => ({...prev, targetColumn: e.target.value}))}
                  helperText="The column you want to predict"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={trainingConfig.autoEngineer}
                      onChange={(e) => setTrainingConfig(prev => ({...prev, autoEngineer: e.target.checked}))}
                    />
                  }
                  label="🔧 Enable Automatic Feature Engineering"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={runFeatureEngineering}
              sx={{ mt: 2, mb: 2 }}
              startIcon={<BuildCircleIcon />}
            >
              Run Feature Engineering
            </Button>

            {featureEngineering && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ⚡ Feature Engineering Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Original Features
                    </Typography>
                    <Typography variant="h6">
                      {featureEngineering.original_shape[1]}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Engineered Features
                    </Typography>
                    <Typography variant="h6">
                      {featureEngineering.engineered_shape[1]}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Added {featureEngineering.features_added} new features
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={() => setActiveStep(3)}
            >
              Next: Configure Training
            </Button>
          </StepContent>
        </Step>

        {/* Step 4: Configure Training */}
        <Step>
          <StepLabel>
            <PsychologyIcon sx={{ mr: 1 }} />
            Configure Training
          </StepLabel>
          <StepContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Typography gutterBottom>Test Set Size: {(trainingConfig.testSize * 100).toFixed(0)}%</Typography>
                <Slider
                  value={trainingConfig.testSize}
                  onChange={(_, value) => setTrainingConfig(prev => ({...prev, testSize: value as number}))}
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  marks={[
                    { value: 0.1, label: '10%' },
                    { value: 0.2, label: '20%' },
                    { value: 0.3, label: '30%' },
                    { value: 0.4, label: '40%' },
                    { value: 0.5, label: '50%' }
                  ]}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Cross-Validation Folds</InputLabel>
                  <Select
                    value={trainingConfig.cvFolds}
                    onChange={(e) => setTrainingConfig(prev => ({...prev, cvFolds: e.target.value as number}))}
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(fold => (
                      <MenuItem key={fold} value={fold}>
                        {fold} Folds
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={startTraining}
              startIcon={<PsychologyIcon />}
              size="large"
              sx={{ mt: 3 }}
            >
              Start Training
            </Button>
          </StepContent>
        </Step>

        {/* Step 5: Train Models */}
        <Step>
          <StepLabel>
            <AssessmentIcon sx={{ mr: 1 }} />
            Train Models
          </StepLabel>
          <StepContent>
            {trainingProgress && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={trainingProgress.progress || 0}
                  size={60}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="body1">
                    {trainingProgress.stage || 'Processing...'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={trainingProgress.progress || 0}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {trainingProgress.progress || 0}% Complete
                  </Typography>
                </Box>
              </Box>
            )}
          </StepContent>
        </Step>

        {/* Step 6: Review Results */}
        <Step>
          <StepLabel>
            <AssessmentIcon sx={{ mr: 1 }} />
            Review Results
          </StepLabel>
          <StepContent>
            {results && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    🏆 Training Results Summary
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Models Trained</Typography>
                      <Typography variant="h6">{results.training_config?.models_trained || 0}</Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Successful</Typography>
                      <Typography variant="h6" color="success.main">
                        {results.training_config?.successful_models || 0}
                      </Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Features Used</Typography>
                      <Typography variant="h6">{results.feature_engineering?.final_features || 0}</Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Data Quality</Typography>
                      <Typography variant="h6">{results.data_profile?.data_quality_score?.toFixed(1) || 0}%</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    📊 Model Performance Comparison
                  </Typography>
                  
                  {results.model_results && Object.keys(results.model_results).length > 0 ? (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Model</strong></TableCell>
                          <TableCell><strong>Test Accuracy</strong></TableCell>
                          <TableCell><strong>CV Score</strong></TableCell>
                          <TableCell><strong>F1 Score</strong></TableCell>
                          <TableCell><strong>Training Time</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(results.model_results)
                          .sort(([,a], [,b]) => ((b as ModelResult)?.test_accuracy || 0) - ((a as ModelResult)?.test_accuracy || 0))
                          .map(([model, metrics]: [string, any]) => (
                            <TableRow key={model}>
                              <TableCell>
                                <Chip
                                  label={model.replace('_', ' ').toUpperCase()}
                                  size="small"
                                  color={(metrics?.test_accuracy || 0) > 0.8 ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <strong>{((metrics?.test_accuracy || 0) * 100).toFixed(2)}%</strong>
                              </TableCell>
                              <TableCell>
                                {((metrics?.cv_mean_accuracy || 0) * 100).toFixed(2)}% ± {((metrics?.cv_std_accuracy || 0) * 100).toFixed(2)}%
                              </TableCell>
                              <TableCell>
                                {((metrics?.test_f1 || 0) * 100).toFixed(2)}%
                              </TableCell>
                              <TableCell>
                                {(metrics?.training_time_seconds || 0).toFixed(2)}s
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography>No model results available</Typography>
                  )}

                  {results.recommendations && results.recommendations.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        💡 Recommendations
                      </Typography>
                      {results.recommendations.map((rec: string, idx: number) => (
                        <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={resetWorkflow}
                      startIcon={<RefreshIcon />}
                    >
                      Start New Training
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                    >
                      Export Results
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
};

// Export both names for compatibility
export const TrainingPanel = EnhancedTrainingPanel;
export default EnhancedTrainingPanel;
