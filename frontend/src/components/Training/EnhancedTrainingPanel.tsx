// src/components/Training/EnhancedTrainingPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, StepContent,
  Button, CircularProgress, Alert, Accordion, AccordionSummary,
  AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow,
  Switch, FormControlLabel, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

export const EnhancedTrainingPanel: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File|null>(null);
  const [dataProfile, setDataProfile] = useState<any>(null);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [autoEngineer, setAutoEngineer] = useState(true);
  const [results, setResults] = useState<any>(null);

  const steps = ['Upload Data', 'Analyze Dataset', 'Configure Training', 'Train Models', 'Review Results'];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      setFile(files[0]);
      setActiveStep(1);
    },
    accept: { 'text/csv': ['.csv'] }
  });

  const analyzeData = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/training/analyze', formData);
    setDataProfile(response.data);
    setActiveStep(2);
  };

  const startTraining = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_col', 'target');
    formData.append('auto_engineer', autoEngineer.toString());
    
    const response = await api.post('/api/training/train-advanced', formData);
    const sessionId = response.data.session_id;
    
    // Poll for progress
    const pollProgress = async () => {
      const progressResponse = await api.get(`/api/training/progress/${sessionId}`);
      setTrainingProgress(progressResponse.data);
      
      if (progressResponse.data.status === 'completed') {
        setResults(progressResponse.data.results);
        setActiveStep(4);
      } else if (progressResponse.data.status !== 'failed') {
        setTimeout(pollProgress, 1000);
      }
    };
    
    setActiveStep(3);
    pollProgress();
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>🧠 Advanced Model Training</Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Upload Data</StepLabel>
          <StepContent>
            <Box {...getRootProps()} sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              p: 4, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.light' : 'transparent'
            }}>
              <input {...getInputProps()} />
              <Typography>
                {file ? `✅ ${file.name}` : 'Drag & drop CSV file or click to select'}
              </Typography>
            </Box>
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Analyze Dataset</StepLabel>
          <StepContent>
            <Button variant="contained" onClick={analyzeData} disabled={!file}>
              Analyze Data Profile
            </Button>
            
            {dataProfile && (
              <Box sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>📊 Data Summary ({dataProfile.shape[0]} rows, {dataProfile.shape[1]} columns)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="h6">Recommendations:</Typography>
                    {dataProfile.recommendations.map((rec: string, idx: number) => (
                      <Chip key={idx} label={rec} sx={{ m: 0.5 }} />
                    ))}
                  </AccordionDetails>
                </Accordion>
                <Button variant="outlined" onClick={() => setActiveStep(2)} sx={{ mt: 2 }}>
                  Configure Training
                </Button>
              </Box>
            )}
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Configure Training</StepLabel>
          <StepContent>
            <FormControlLabel
              control={<Switch checked={autoEngineer} onChange={(e) => setAutoEngineer(e.target.checked)} />}
              label="🔧 Auto Feature Engineering"
            />
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={startTraining}>
                🚀 Start Training
              </Button>
            </Box>
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Train Models</StepLabel>
          <StepContent>
            {trainingProgress && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress variant="determinate" value={trainingProgress.progress || 0} />
                <Typography>{trainingProgress.status}</Typography>
              </Box>
            )}
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Review Results</StepLabel>
          <StepContent>
            {results && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell>CV Accuracy</TableCell>
                    <TableCell>Train Accuracy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(results).map(([model, metrics]: [string, any]) => (
                    <TableRow key={model}>
                      <TableCell>{model}</TableCell>
                      <TableCell>{(metrics.cv_mean_accuracy * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(metrics.train_accuracy * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </StepContent>
        </Step>
      </Stepper>
    </Paper>
  );
};
