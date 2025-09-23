import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import { ModalitiesSelector } from './ModalitiesSelector';
import axios from '../../services/api';

export const FileUpload: React.FC = () => {
  const [modality, setModality] = useState('structured');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const url = `/upload/${modality}`;
    await axios.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        setProgress(Math.round((evt.loaded * 100) / (evt.total || 1)));
      }
    });
    alert('Upload successful');
    setFile(null);
    setProgress(0);
  };

  return (
    <Box>
      <ModalitiesSelector value={modality} onChange={setModality} />
      <Box
        {...getRootProps()}
        p={4}
        mb={2}
        textAlign="center"
        border="2px dashed grey"
        bgcolor={isDragActive ? 'grey.200' : 'inherit'}
      >
        <input {...getInputProps()} />
        {file 
          ? <Typography>{file.name}</Typography>
          : <Typography>Drag & drop file here, or click to select</Typography>
        }
      </Box>
      {file && <LinearProgress variant="determinate" value={progress} />}
      <Button 
        variant="contained" 
        color="primary" 
        disabled={!file} 
        onClick={upload}
        sx={{ mt: 2 }}
      >
        Upload
      </Button>
    </Box>
  );
};
