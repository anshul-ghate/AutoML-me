import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, StepContent,
  Button, CircularProgress, Alert, Card, CardContent,
  Switch, FormControlLabel, Chip, TextField, Divider, List, ListItem,
  ListItemText, IconButton, Slider, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Stack,
  Autocomplete, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  BuildCircle as BuildCircleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Psychology as PredictiveAnalyticsIcon // ✅ Using Psychology icon instead of non-existent PredictiveAnalytics
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

interface DataProfile {
  shape: [number, number];
  missing_values: Record<string, number>;
  data_quality_score: number;
  recommendations: string[];
  statistical_summary: {
    numeric_columns: string[];
    categorical_columns: string[];
    total_missing: number;
  };
  feature_importance_estimate: Record<string, number>;
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

interface StepStatus {
  completed: boolean;
  hasError: boolean;
  canProceed: boolean;
  data?: any;
}

export const EnhancedTrainingPanel: React.FC = () => {
  // Core State
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    targetColumn: '',
    autoEngineer: true,
    testSize: 0.2,
    cvFolds: 5
  });
  const [results, setResults] = useState<any>(null);
  const [sessionId, setSessionId] = useState('');
  const [featureEngineering, setFeatureEngineering] = useState<any>(null);

  // UI State
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepStatus, setStepStatus] = useState<Record<number, StepStatus>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // ✅ NEW: Step 7 state for evaluation and prediction
  const [evalMetrics, setEvalMetrics] = useState<any>(null);
  const [showEvalDialog, setShowEvalDialog] = useState(false);
  const [showPredictDialog, setShowPredictDialog] = useState(false);
  const [predictInputs, setPredictInputs] = useState<Record<string, any>>({});
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Available columns for target selection
  const availableColumns = useMemo(() => {
    if (!dataProfile) return [];
    return [...dataProfile.statistical_summary.numeric_columns, ...dataProfile.statistical_summary.categorical_columns];
  }, [dataProfile]);

  // Calculate workflow progress for the progress bar
  const workflowProgress = useMemo(() => {
    const steps = [
      { key: 'Upload', completed: !!file },
      { key: 'Analyze', completed: !!dataProfile },
      { key: 'Engineer', completed: !!trainingConfig.targetColumn },
      { key: 'Configure', completed: !!trainingConfig.targetColumn },
      { key: 'Train', completed: !!results },
      { key: 'Results', completed: !!results }
    ];
    
    return {
      steps,
      completedCount: steps.filter(step => step.completed).length,
      percentage: (steps.filter(step => step.completed).length / steps.length) * 100
    };
  }, [file, dataProfile, trainingConfig.targetColumn, results]);

  // Reset all steps after a given step
  const resetDownstreamSteps = useCallback((fromStep: number) => {
    const stepsToReset = [1, 2, 3, 4, 5].filter(step => step > fromStep);
    const newStepStatus = { ...stepStatus };
    const newErrors = { ...errors };

    stepsToReset.forEach(step => {
      delete newStepStatus[step];
      delete newErrors[`step${step}`];
    });

    setStepStatus(newStepStatus);
    setErrors(newErrors);

    if (fromStep < 1) {
      setDataProfile(null);
      setTrainingConfig(prev => ({ ...prev, targetColumn: '' }));
    }
    if (fromStep < 2) {
      setFeatureEngineering(null);
    }
    if (fromStep < 4) {
      setResults(null);
      setTrainingProgress(null);
      setSessionId('');
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [stepStatus, errors, pollingInterval]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // File upload with validation
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setErrors({...errors, upload: 'File size exceeds 50MB limit'});
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setErrors({...errors, upload: 'Only CSV files are supported'});
        }
        return;
      }

      const uploadedFile = acceptedFiles[0];
      if (uploadedFile) {
        setFile(uploadedFile);
        setErrors({...errors, upload: ''});
        setStepStatus(prev => ({
          ...prev,
          0: { completed: true, hasError: false, canProceed: true, data: uploadedFile }
        }));
        resetDownstreamSteps(0);
      }
    }, [errors, resetDownstreamSteps]),
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024
  });

  const setOperationLoading = (operation: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  };

  const setStepError = (step: string, error: string) => {
    setErrors(prev => ({ ...prev, [step]: error }));
  };

  // Analyze dataset
  const analyzeData = async () => {
    if (!file) return;
    
    setOperationLoading('analyze', true);
    setStepError('analyze', '');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/training/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      if (!response.data?.profile) {
        throw new Error('Invalid response from analysis endpoint');
      }

      setDataProfile(response.data.profile);
      setStepStatus(prev => ({
        ...prev,
        1: { completed: true, hasError: false, canProceed: true, data: response.data.profile }
      }));
      setActiveStep(1);

      // Auto-suggest target column if possible
      const profile = response.data.profile;
      if (availableColumns.length > 0 && !trainingConfig.targetColumn) {
        const potentialTargets = profile.statistical_summary.categorical_columns.slice(0, 1);
        if (potentialTargets.length > 0) {
          setTrainingConfig(prev => ({ ...prev, targetColumn: potentialTargets[0] }));
        }
      }

    } catch (error: any) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to analyze dataset. Please check your file format.';
      setStepError('analyze', errorMessage);
      setStepStatus(prev => ({
        ...prev,
        1: { completed: false, hasError: true, canProceed: false }
      }));
    } finally {
      setOperationLoading('analyze', false);
    }
  };

  // Run feature engineering
  const runFeatureEngineering = async () => {
    if (!file || !trainingConfig.targetColumn) return;

    setOperationLoading('featureEngineering', true);
    setStepError('featureEngineering', '');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(
        `/api/training/feature-engineer?target_col=${encodeURIComponent(trainingConfig.targetColumn)}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        }
      );

      setFeatureEngineering(response.data);
      setStepStatus(prev => ({
        ...prev,
        2: { completed: true, hasError: false, canProceed: true, data: response.data }
      }));

    } catch (error: any) {
      console.error('Feature engineering failed:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Feature engineering failed. Using original features.';
      setStepError('featureEngineering', errorMessage);
      setStepStatus(prev => ({
        ...prev,
        2: { completed: true, hasError: true, canProceed: true }
      }));
    } finally {
      setOperationLoading('featureEngineering', false);
    }
  };

  // Start model training
  const startTraining = async () => {
    if (!file || !trainingConfig.targetColumn) return;

    setOperationLoading('training', true);
    setStepError('training', '');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_column', trainingConfig.targetColumn);
      formData.append('test_size', trainingConfig.testSize.toString());
      formData.append('cv_folds', trainingConfig.cvFolds.toString());
      formData.append('auto_feature_engineering', trainingConfig.autoEngineer.toString());

      const response = await api.post('/api/training/train', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      });

      setResults(response.data);
      setSessionId(response.data.session_id);
      setStepStatus(prev => ({
        ...prev,
        4: { completed: true, hasError: false, canProceed: true, data: response.data }
      }));
      setActiveStep(5);

    } catch (error: any) {
      console.error('Training failed:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Training failed. Please check your configuration and try again.';
      setStepError('training', errorMessage);
      setStepStatus(prev => ({
        ...prev,
        4: { completed: false, hasError: true, canProceed: false }
      }));
    } finally {
      setOperationLoading('training', false);
    }
  };

  // ✅ NEW: Step 7 functions
  const fetchEvaluation = async () => {
    if (!sessionId) return;
    
    try {
      const response = await api.get(`/api/training/evaluate/${sessionId}`);
      setEvalMetrics(response.data);
      setShowEvalDialog(true);
    } catch (error: any) {
      setStepError('evaluation', error.response?.data?.detail || 'Failed to fetch evaluation metrics');
    }
  };

  const downloadModel = () => {
    if (!sessionId) return;
    window.open(`/api/training/export/model/${sessionId}`, '_blank');
  };

  const handlePredict = async () => {
    if (!sessionId || Object.keys(predictInputs).length === 0) return;
    
    setPredictLoading(true);
    try {
      const response = await api.post('/api/training/predict', {
        session_id: sessionId,
        features: predictInputs
      });
      setPredictResult(response.data);
    } catch (error: any) {
      setStepError('prediction', error.response?.data?.detail || 'Prediction failed');
    } finally {
      setPredictLoading(false);
    }
  };

  const navigateToStep = (stepIndex: number) => {
    if (stepIndex > 0 && !file) {
      setStepError('navigation', 'Please upload a file first');
      return;
    }
    if (stepIndex > 1 && !dataProfile) {
      setStepError('navigation', 'Please analyze the data first');
      return;
    }
    if (stepIndex > 2 && !trainingConfig.targetColumn) {
      setStepError('navigation', 'Please select a target column');
      return;
    }

    setActiveStep(stepIndex);
    setStepError('navigation', '');
  };

  const handleContinueFromAnalysis = () => {
    navigateToStep(2);
  };

  const handleContinueFromFeatureEngineering = () => {
    navigateToStep(3);
  };

  const handleStartTrainingFromConfig = () => {
    setActiveStep(4);
    startTraining();
  };

  const resetWorkflow = () => {
    setShowConfirmDialog(false);
    setActiveStep(0);
    setFile(null);
    setDataProfile(null);
    setFeatureEngineering(null);
    setResults(null);
    setTrainingProgress(null);
    setSessionId('');
    setTrainingConfig({
      targetColumn: '',
      autoEngineer: true,
      testSize: 0.2,
      cvFolds: 5
    });
    setStepStatus({});
    setErrors({});
    setLoading({});
    
    // Reset Step 7 state
    setEvalMetrics(null);
    setShowEvalDialog(false);
    setShowPredictDialog(false);
    setPredictInputs({});
    setPredictResult(null);
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = stepStatus[stepIndex];
    if (loading[`step${stepIndex}`] || loading.analyze || loading.featureEngineering || loading.training) {
      return <CircularProgress size={20} />;
    }
    if (status?.hasError) {
      return <ErrorIcon color="error" />;
    }
    if (status?.completed) {
      return <CheckCircleIcon color="success" />;
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <PsychologyIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        🤖 Advanced ML Training Platform
      </Typography>

      {/* Global Error Display */}
      {errors.navigation && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setStepError('navigation', '')}>
          {errors.navigation}
        </Alert>
      )}

      {/* Progress Overview */}
      <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1 }} />
            Workflow Progress
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            {workflowProgress.steps.map((step, idx) => (
              <Chip
                key={idx}
                label={step.key}
                size="small"
                color={step.completed ? 'success' : activeStep === idx ? 'primary' : 'default'}
                variant={step.completed ? 'filled' : activeStep === idx ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={workflowProgress.percentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {workflowProgress.completedCount} of {workflowProgress.steps.length} steps completed
          </Typography>
        </CardContent>
      </Card>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 0: Upload Dataset */}
          <Step completed={stepStatus[0]?.completed}>
            <StepLabel 
              icon={getStepIcon(0)}
              error={stepStatus[0]?.hasError}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudUploadIcon sx={{ mr: 1 }} />
                Upload Dataset
                {stepStatus[0]?.completed && (
                  <Tooltip title="Edit">
                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => navigateToStep(0)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '3px dashed',
                  borderColor: isDragActive ? 'primary.main' : 
                              errors.upload ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.light' : 
                          errors.upload ? 'error.light' : 'background.default',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: errors.upload ? 'error.main' : 'primary.main',
                    bgcolor: errors.upload ? 'error.light' : 'action.hover'
                  }
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ 
                  fontSize: 48, 
                  color: errors.upload ? 'error.main' : 'primary.main', 
                  mb: 2 
                }} />
                <Typography variant="h6" gutterBottom>
                  {file ? `✅ ${file.name}` : 'Drop your CSV file here or click to browse'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maximum file size: 50MB • Supported format: CSV
                </Typography>
                {file && (
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                    <Chip 
                      label={`${(file.size / 1024 / 1024).toFixed(2)} MB`} 
                      color="primary" 
                      size="small"
                    />
                    <Chip 
                      label={`Modified: ${file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown'}`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                )}
              </Box>

              {errors.upload && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.upload}
                </Alert>
              )}

              {file && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={analyzeData}
                    disabled={loading.analyze}
                    startIcon={loading.analyze ? <CircularProgress size={16} /> : <AnalyticsIcon />}
                    size="large"
                  >
                    {loading.analyze ? 'Analyzing Dataset...' : 'Analyze Dataset'}
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 1: Analyze Data */}
          <Step completed={stepStatus[1]?.completed}>
            <StepLabel 
              icon={getStepIcon(1)}
              error={stepStatus[1]?.hasError}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1 }} />
                Analyze Data
                {stepStatus[1]?.completed && (
                  <Tooltip title="Re-analyze">
                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => analyzeData()}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </StepLabel>
            <StepContent>
              {loading.analyze && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>Analyzing your dataset...</Typography>
                </Box>
              )}

              {errors.analyze && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={analyzeData}>
                      Retry
                    </Button>
                  }
                >
                  {errors.analyze}
                </Alert>
              )}

              {dataProfile && (
                <Box sx={{ mb: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                          📊 Dataset Overview
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Total Rows"
                              secondary={
                                <Typography variant="h6" color="primary">
                                  {dataProfile.shape[0].toLocaleString()}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Total Columns"
                              secondary={
                                <Typography variant="h6" color="primary">
                                  {dataProfile.shape[1]}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Data Quality Score"
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={dataProfile.data_quality_score}
                                    color={getQualityColor(dataProfile.data_quality_score)}
                                    sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }}
                                  />
                                  <Typography variant="h6" color={`${getQualityColor(dataProfile.data_quality_score)}.main`}>
                                    {dataProfile.data_quality_score.toFixed(1)}%
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>

                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                          🎯 Data Insights
                        </Typography>
                        <Stack spacing={1}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Numeric Columns: {dataProfile.statistical_summary.numeric_columns.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Categorical Columns: {dataProfile.statistical_summary.categorical_columns.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Missing Values: {dataProfile.statistical_summary.total_missing}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="body2" fontWeight="medium" gutterBottom>
                              Recommendations:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {dataProfile.recommendations.slice(0, 3).map((rec, idx) => (
                                <Chip
                                  key={idx}
                                  label={rec}
                                  size="small"
                                  color="info"
                                  variant="outlined"
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
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={handleContinueFromAnalysis}
                    startIcon={<BuildCircleIcon />}
                    size="large"
                  >
                    Continue to Feature Engineering
                  </Button>
                </Box>
              )}
            </StepContent>
          </Step>

          {/* Step 2: Feature Engineering */}
          <Step completed={stepStatus[2]?.completed}>
            <StepLabel 
              icon={getStepIcon(2)}
              error={stepStatus[2]?.hasError}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BuildCircleIcon sx={{ mr: 1 }} />
                Feature Engineering
              </Box>
            </StepLabel>
            <StepContent>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔧 Configuration
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Autocomplete
                        options={availableColumns}
                        value={trainingConfig.targetColumn}
                        onChange={(_, newValue) => {
                          setTrainingConfig(prev => ({ ...prev, targetColumn: newValue || '' }));
                          setStepError('targetColumn', '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Target Column *"
                            helperText="Select the column you want to predict"
                            error={!!errors.targetColumn}
                            required
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option === value}
                        noOptionsText="No columns available - please analyze data first"
                      />
                      {errors.targetColumn && (
                        <Typography variant="caption" color="error">
                          {errors.targetColumn}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={trainingConfig.autoEngineer}
                            onChange={(e) => setTrainingConfig(prev => ({
                              ...prev, 
                              autoEngineer: e.target.checked
                            }))}
                          />
                        }
                        label="🚀 Enable Automatic Feature Engineering"
                      />
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (!trainingConfig.targetColumn) {
                          setStepError('targetColumn', 'Please select a target column first');
                          return;
                        }
                        runFeatureEngineering();
                      }}
                      disabled={loading.featureEngineering || !trainingConfig.targetColumn}
                      startIcon={loading.featureEngineering ? <CircularProgress size={16} /> : <BuildCircleIcon />}
                    >
                      {loading.featureEngineering ? 'Engineering Features...' : 'Run Feature Engineering'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleContinueFromFeatureEngineering}
                      disabled={!trainingConfig.targetColumn}
                      startIcon={<ArrowForwardIcon />}
                    >
                      Continue to Training Configuration
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {errors.featureEngineering && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {errors.featureEngineering}
                </Alert>
              )}

              {featureEngineering && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>⚡ Feature Engineering Results</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {featureEngineering.original_shape?.[1] || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Original Features
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {featureEngineering.engineered_shape?.[1] || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Features
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          +{featureEngineering.features_added || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          New Features
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {featureEngineering.transformations_applied && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Applied Transformations:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {featureEngineering.transformations_applied.map((transform: string, idx: number) => (
                            <Chip key={idx} label={transform} size="small" color="success" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </StepContent>
          </Step>

          {/* Step 3: Configure Training */}
          <Step completed={!!trainingConfig.targetColumn}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon sx={{ mr: 1 }} />
                Configure Training
              </Box>
            </StepLabel>
            <StepContent>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚙️ Training Parameters
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography gutterBottom>
                        Test Set Size: {(trainingConfig.testSize * 100).toFixed(0)}%
                      </Typography>
                      <Slider
                        value={trainingConfig.testSize}
                        onChange={(_, value) => setTrainingConfig(prev => ({
                          ...prev, 
                          testSize: value as number
                        }))}
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
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Recommended: 20-30% for most datasets
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel>Cross-Validation Folds</InputLabel>
                        <Select
                          value={trainingConfig.cvFolds}
                          onChange={(e) => setTrainingConfig(prev => ({
                            ...prev, 
                            cvFolds: e.target.value as number
                          }))}
                          label="Cross-Validation Folds"
                        >
                          {[3, 4, 5, 6, 7, 8, 9, 10].map(fold => (
                            <MenuItem key={fold} value={fold}>
                              {fold} Folds
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="text.secondary">
                        More folds = better validation, but slower training
                      </Typography>
                    </Box>
                  </Stack>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Training Overview:</strong><br/>
                      • Dataset will be split into {((1 - trainingConfig.testSize) * 100).toFixed(0)}% training and {(trainingConfig.testSize * 100).toFixed(0)}% testing<br/>
                      • {trainingConfig.cvFolds}-fold cross-validation will be used for model selection<br/>
                      • Multiple algorithms will be trained and compared automatically
                    </Typography>
                  </Alert>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={() => navigateToStep(2)}
                      startIcon={<ArrowBackIcon />}
                    >
                      Back to Feature Engineering
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleStartTrainingFromConfig}
                      disabled={loading.training || !trainingConfig.targetColumn}
                      startIcon={loading.training ? <CircularProgress size={16} /> : <AssessmentIcon />}
                      size="large"
                    >
                      {loading.training ? 'Starting Training...' : 'Start Model Training'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </StepContent>
          </Step>

          {/* Step 4: Training Progress */}
          <Step completed={stepStatus[4]?.completed}>
            <StepLabel 
              icon={getStepIcon(4)}
              error={stepStatus[4]?.hasError}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Model Training
              </Box>
            </StepLabel>
            <StepContent>
              {loading.training && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress size={40} sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          Training Models...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This may take several minutes depending on your dataset size
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Training multiple algorithms and optimizing hyperparameters...
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {errors.training && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={startTraining}>
                      Retry Training
                    </Button>
                  }
                >
                  {errors.training}
                </Alert>
              )}

              {trainingProgress && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Training Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={trainingProgress.progress || 0}
                        size={60}
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
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
                  </CardContent>
                </Card>
              )}
            </StepContent>
          </Step>

          {/* Step 5: Results */}
          <Step completed={!!results}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                Training Results
              </Box>
            </StepLabel>
            <StepContent>
              {results && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    🏆 Training Complete!
                  </Typography>

                  {/* Results Summary */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Card sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {results.training_config?.models_trained || 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Models Trained
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {results.training_config?.successful_models || 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Successful
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {results.feature_engineering?.final_features || results.feature_engineering?.original_features || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Features Used
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {results.data_profile?.data_quality_score?.toFixed(1) || 'N/A'}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data Quality
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Model Performance */}
                  <Typography variant="h6" gutterBottom>
                    📊 Model Performance
                  </Typography>

                  {results.best_model ? (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="success.main">
                          🥇 Best Model: {results.best_model.name}
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                            <Typography variant="h6" color="success.main">
                              {((results.best_model.metrics?.accuracy || 0) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Precision</Typography>
                            <Typography variant="h6">
                              {((results.best_model.metrics?.precision || 0) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Recall</Typography>
                            <Typography variant="h6">
                              {((results.best_model.metrics?.recall || 0) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">F1 Score</Typography>
                            <Typography variant="h6">
                              {((results.best_model.metrics?.f1_score || 0) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert severity="warning">
                      No detailed model results available
                    </Alert>
                  )}

                  {/* Feature Importance */}
                  {results.feature_engineering?.top_features && (
                    <Accordion sx={{ mb: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>🎯 Top Important Features</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {results.feature_engineering.top_features.slice(0, 10).map((feature: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ minWidth: 200 }}>
                                {feature.name}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={feature.importance * 100}
                                sx={{ flex: 1, mx: 2 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {(feature.importance * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* ✅ NEW: Step 7 Action Buttons */}
                  <Card sx={{ mt: 3, bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                        Model Export & Evaluation
                      </Typography>
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={downloadModel}
                          startIcon={<DownloadIcon />}
                          disabled={!sessionId}
                        >
                          Download Model
                        </Button>
                        
                        <Button
                          variant="outlined"
                          onClick={fetchEvaluation}
                          startIcon={<VisibilityIcon />}
                          disabled={!sessionId}
                        >
                          View Detailed Metrics
                        </Button>
                        
                        <Button
                          variant="contained"
                          onClick={() => {
                            if (results.feature_engineering?.feature_names) {
                              // Initialize predict inputs with feature names
                              const initialInputs: Record<string, any> = {};
                              results.feature_engineering.feature_names.forEach((name: string) => {
                                initialInputs[name] = '';
                              });
                              setPredictInputs(initialInputs);
                            }
                            setShowPredictDialog(true);
                          }}
                          startIcon={<PredictiveAnalyticsIcon />}
                          disabled={!sessionId}
                        >
                          Test Prediction
                        </Button>
                      </Stack>

                      {errors.evaluation && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {errors.evaluation}
                        </Alert>
                      )}

                      {errors.prediction && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {errors.prediction}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => navigateToStep(activeStep - 1)}
                startIcon={<ArrowBackIcon />}
              >
                Previous Step
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowConfirmDialog(true)}
              startIcon={<RefreshIcon />}
            >
              Start New Project
            </Button>
            
            {results && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", "training_results.json");
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                Download Results
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* ✅ UPDATED: Evaluation Dialog with Stack/Box instead of Grid */}
      <Dialog open={showEvalDialog} onClose={() => setShowEvalDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Detailed Model Evaluation
          </Box>
        </DialogTitle>
        <DialogContent>
          {evalMetrics && (
            <Box>
              <Typography variant="h6" gutterBottom>Extended Metrics</Typography>
              
              {/* ✅ FIX: Using Stack/Box instead of Grid for better compatibility */}
              <Box sx={{ mb: 3 }}>
                {evalMetrics.roc_auc && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <Card sx={{ flex: 1, minWidth: 200 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {(evalMetrics.roc_auc * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ROC-AUC Score
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    {evalMetrics.confusion_matrix && (
                      <Card sx={{ flex: 2 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Confusion Matrix</Typography>
                          <Paper sx={{ p: 2, overflow: 'auto' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Predicted →</TableCell>
                                  {evalMetrics.class_labels?.map((label: string) => (
                                    <TableCell key={label} align="center">{label}</TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {evalMetrics.confusion_matrix.map((row: number[], rowIdx: number) => (
                                  <TableRow key={rowIdx}>
                                    <TableCell>{evalMetrics.class_labels?.[rowIdx] || `Class ${rowIdx}`}</TableCell>
                                    {row.map((value: number, colIdx: number) => (
                                      <TableCell key={colIdx} align="center">
                                        <Chip 
                                          label={value} 
                                          color={rowIdx === colIdx ? 'success' : 'default'}
                                          size="small"
                                        />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Paper>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                )}
                
                {!evalMetrics.roc_auc && evalMetrics.confusion_matrix && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Confusion Matrix</Typography>
                      <Paper sx={{ p: 2, overflow: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Predicted →</TableCell>
                              {evalMetrics.class_labels?.map((label: string) => (
                                <TableCell key={label} align="center">{label}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {evalMetrics.confusion_matrix.map((row: number[], rowIdx: number) => (
                              <TableRow key={rowIdx}>
                                <TableCell>{evalMetrics.class_labels?.[rowIdx] || `Class ${rowIdx}`}</TableCell>
                                {row.map((value: number, colIdx: number) => (
                                  <TableCell key={colIdx} align="center">
                                    <Chip 
                                      label={value} 
                                      color={rowIdx === colIdx ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    </CardContent>
                  </Card>
                )}
              </Box>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Raw Metrics Data</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box component="pre" sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }}>
                    {JSON.stringify(evalMetrics, null, 2)}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEvalDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ NEW: Prediction Dialog */}
      <Dialog open={showPredictDialog} onClose={() => setShowPredictDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PredictiveAnalyticsIcon sx={{ mr: 1 }} />
            Test Model Prediction
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter values for each feature to get a prediction from your trained model.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {Object.keys(predictInputs).map((feature) => (
              <TextField
                key={feature}
                label={feature}
                value={predictInputs[feature] || ''}
                onChange={(e) => setPredictInputs({ ...predictInputs, [feature]: e.target.value })}
                fullWidth
                margin="normal"
                type="number"
                helperText="Enter numeric value"
              />
            ))}
          </Box>
          
          {predictResult && (
            <Card sx={{ mt: 2, bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Prediction Results
                </Typography>
                <Typography variant="body1">
                  <strong>Predicted Value:</strong> {predictResult.predictions?.[0] || 'N/A'}
                </Typography>
                {predictResult.predicted_classes && (
                  <Typography variant="body1">
                    <strong>Predicted Class:</strong> {predictResult.predicted_classes[0]}
                  </Typography>
                )}
                {predictResult.probabilities && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Class Probabilities:
                    </Typography>
                    {predictResult.probabilities[0].map((prob: number, idx: number) => (
                      <Chip
                        key={idx}
                        label={`Class ${idx}: ${(prob * 100).toFixed(1)}%`}
                        size="small"
                        sx={{ mr: 1, mt: 0.5 }}
                        color={prob > 0.5 ? 'success' : 'default'}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPredictDialog(false)}>Close</Button>
          <Button
            onClick={handlePredict}
            variant="contained"
            disabled={predictLoading || Object.values(predictInputs).some(v => v === '')}
            startIcon={predictLoading ? <CircularProgress size={16} /> : <PredictiveAnalyticsIcon />}
          >
            {predictLoading ? 'Predicting...' : 'Get Prediction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Start New Project?</DialogTitle>
        <DialogContent>
          <Typography>
            This will clear all current progress and uploaded data. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={resetWorkflow} variant="contained" color="warning">
            Yes, Start Over
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export const TrainingPanel = EnhancedTrainingPanel;
export default EnhancedTrainingPanel;
