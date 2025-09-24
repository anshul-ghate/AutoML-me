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
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ModalitiesSelector } from './ModalitiesSelector';
import api from '../../services/api';

const DropZone = styled(Paper)(({ theme, isDragActive }: { theme: any, isDragActive: boolean }) => ({
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

export const FileUpload: React.FC = () => {
  const [modality, setModality] = useState('structured');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setUploadStatus('idle');
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.mp3', '.wav']
    }
  });

  const upload = async () => {
    if (!file) return;
    
    setUploadStatus('uploading');
    setProgress(0);
    
    try {
      const form = new FormData();
      form.append('file', file);
      const url = `/upload/${modality}`;
      
      await api.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const percentCompleted = Math.round((evt.loaded * 100) / (evt.total || 1));
          setProgress(percentCompleted);
        }
      });
      
      setUploadStatus('success');
      setUploadMessage(`${file.name} uploaded successfully!`);
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploadStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(error.response?.data?.detail || 'Upload failed');
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
    <Stack spacing={4}>
      <ModalitiesSelector value={modality} onChange={setModality} />
      
      <DropZone {...getRootProps()} isDragActive={isDragActive} elevation={0}>
        <input {...getInputProps()} />
        <Stack spacing={3} alignItems="center">
          <CloudUploadIcon 
            sx={{ 
              fontSize: 64, 
              color: isDragActive ? 'primary.main' : 'text.secondary',
              transition: 'color 0.3s'
            }} 
          />
          {file ? (
            <Stack spacing={2} alignItems="center">
              <Chip
                icon={<InsertDriveFileIcon />}
                label={file.name}
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.9rem', p: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatFileSize(file.size)} • Click to change file
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" color="text.primary">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse your computer
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports CSV, JSON, TXT, Images, Audio files
              </Typography>
            </Stack>
          )}
        </Stack>
      </DropZone>

      {uploadStatus === 'uploading' && (
        <Fade in>
          <Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploading... {progress}%
            </Typography>
          </Box>
        </Fade>
      )}

      {uploadStatus === 'success' && (
        <Fade in>
          <Alert 
            icon={<CheckCircleIcon />} 
            severity="success" 
            sx={{ borderRadius: 2 }}
          >
            {uploadMessage}
          </Alert>
        </Fade>
      )}

      {uploadStatus === 'error' && (
        <Fade in>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {uploadMessage}
          </Alert>
        </Fade>
      )}

      <UploadButton
        variant="contained"
        disabled={!file || uploadStatus === 'uploading'}
        onClick={upload}
        startIcon={uploadStatus === 'uploading' ? undefined : <CloudUploadIcon />}
        fullWidth
        size="large"
      >
        {uploadStatus === 'uploading' ? `Uploading... ${progress}%` : 'Upload File'}
      </UploadButton>
    </Stack>
  );
};
