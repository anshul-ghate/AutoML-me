import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Paper,
  Fade,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { apiEndpoints } from '../../services/api';

const DropZone = styled(Paper)<{ isDragActive: boolean }>(({ theme, isDragActive }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  border: `3px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  background: isDragActive
    ? `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.primary.main}10)`
    : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: `linear-gradient(135deg, ${theme.palette.primary.light}05, ${theme.palette.primary.main}05)`,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8]
  }
}));

const UploadButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}));

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
}

export const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    // Handle rejected files
    if (rejected.length > 0) {
      const rejection = rejected[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadMessage('File size exceeds 50MB limit');
        setUploadStatus('error');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setUploadMessage('Only CSV files are supported');
        setUploadStatus('error');
      }
      return;
    }

    if (accepted.length > 0) {
      const selectedFile = accepted[0];
      setFile(selectedFile);
      setUploadStatus('idle');
      setProgress(0);
      setAnalyzeError('');
      setDataProfile(null);
      setUploadMessage('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const upload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    setProgress(0);
    setUploadMessage('');

    try {
      // Use the correct API endpoint for file upload
      const response = await apiEndpoints.upload.structured(file);
      
      setProgress(100);
      setUploadStatus('success');
      setUploadMessage(response.data?.message || `${file.name} uploaded successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (uploadStatus === 'success') {
          setUploadStatus('idle');
          setUploadMessage('');
          setProgress(0);
        }
      }, 3000);

    } catch (error: any) {
      console.error('Upload failed:', error);
      setProgress(0);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Upload failed - please try again');

      // Clear error message after 5 seconds
      setTimeout(() => {
        if (uploadStatus === 'error') {
          setUploadStatus('idle');
          setUploadMessage('');
        }
      }, 5000);
    }
  };

  const analyzeData = async () => {
    if (!file) {
      setAnalyzeError('Please select a CSV file first');
      return;
    }

    setAnalyzing(true);
    setAnalyzeError('');

    try {
      const response = await apiEndpoints.training.analyze(file);

      if (!response.data?.profile) {
        throw new Error('Invalid response from analysis endpoint - missing profile data');
      }

      setDataProfile(response.data.profile);
      
    } catch (error: any) {
      console.error('Analysis failed:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to analyze dataset';
      
      if (error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the server is running on port 8301';
      } else if (error.message.includes('API endpoint not found')) {
        errorMessage = 'Analysis endpoint not found. Please check if the backend API is properly configured';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid file format. Please ensure you uploaded a valid CSV file';
      } else if (error.response?.status === 413) {
        errorMessage = 'File size too large. Please upload a CSV file smaller than 50MB';
      } else {
        errorMessage = error.message || 'Analysis failed - please check your file format and try again';
      }
      
      setAnalyzeError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* File Upload Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CloudUploadIcon sx={{ mr: 1 }} />
          Upload Dataset
        </Typography>

        <DropZone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          
          {file ? (
            <Stack alignItems="center" spacing={2}>
              <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Chip
                icon={<InsertDriveFileIcon />}
                label={file.name}
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.9rem', p: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(file.size)} • Click to change
              </Typography>
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={2}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your CSV file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum file size: 50MB • Supported format: CSV
              </Typography>
            </Stack>
          )}
        </DropZone>

        {/* Upload Progress */}
        {uploadStatus === 'uploading' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {/* Upload Status Messages */}
        {uploadStatus === 'success' && (
          <Fade in>
            <Alert
              icon={<CheckCircleIcon />}
              severity="success"
              sx={{ borderRadius: 2, mt: 2 }}
              onClose={() => {
                setUploadStatus('idle');
                setUploadMessage('');
                setProgress(0);
              }}
            >
              {uploadMessage}
            </Alert>
          </Fade>
        )}

        {uploadStatus === 'error' && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            onClose={() => {
              setUploadStatus('idle');
              setUploadMessage('');
            }}
          >
            {uploadMessage}
          </Alert>
        )}

        {/* Upload Button */}
        {file && uploadStatus !== 'uploading' && (
          <UploadButton
            fullWidth
            size="large"
            onClick={upload}
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            Upload File
          </UploadButton>
        )}
      </Paper>

      {/* Analysis Section */}
      {file && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsIcon sx={{ mr: 1 }} />
            Analyze Dataset
          </Typography>

          <Button
            variant="contained"
            startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
            onClick={analyzeData}
            disabled={analyzing}
            size="large"
            sx={{ mb: 2 }}
          >
            {analyzing ? 'Analyzing Dataset...' : 'Analyze Dataset'}
          </Button>

          {analyzeError && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setAnalyzeError('')}
            >
              {analyzeError}
            </Alert>
          )}
        </Paper>
      )}

      {/* Analysis Results */}
      {dataProfile && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            📊 Dataset Profile
          </Typography>
          
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                  {dataProfile.shape[0].toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">Rows</Typography>
              </Box>
              
              <Box>
                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
                  {dataProfile.shape[1]}
                </Typography>
                <Typography variant="body2" color="text.secondary">Columns</Typography>
              </Box>
              
              <Box>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {dataProfile.data_quality_score.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Data Quality</Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                📈 Column Statistics
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={`${dataProfile.statistical_summary.numeric_columns.length} Numeric`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${dataProfile.statistical_summary.categorical_columns.length} Categorical`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={`${dataProfile.statistical_summary.total_missing} Missing Values`}
                  color={dataProfile.statistical_summary.total_missing > 0 ? "warning" : "success"}
                  variant="outlined"
                />
              </Stack>
            </Box>

            {dataProfile.recommendations.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  💡 Recommendations
                </Typography>
                <Stack spacing={1}>
                  {dataProfile.recommendations.slice(0, 3).map((recommendation, index) => (
                    <Alert key={index} severity="info" sx={{ py: 0.5 }}>
                      <Typography variant="body2">{recommendation}</Typography>
                    </Alert>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};