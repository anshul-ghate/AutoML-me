import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, LinearProgress, Stack, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

export const TrainingPanel: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState<File|null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<{ type: 'success'|'error', msg: string }|null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: accepted => setFile(accepted[0])
  });

  const handleTrain = async () => {
    if (!file) return;
    setStatus(null);
    setProgress(0);
    const form = new FormData();
    form.append('file', file);
    try {
      const url = tab === 0 ? '/api/train/structured' : '/api/train/text';
      const resp = await api.post(url, form, {
        onUploadProgress: e => setProgress(Math.round((e.loaded*100)/(e.total||1)))
      });
      setStatus({ type: 'success', msg: `Trained! Params: ${JSON.stringify(resp.data.best_params)}` });
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.response?.data?.detail||'Training failed' });
    }
  };

  return (
    <Paper sx={{ p:4 }}>
      <Typography variant="h5" gutterBottom>Model Training</Typography>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab label="Structured" />
        <Tab label="Text" />
      </Tabs>
      <Box {...getRootProps()} sx={{
        border:'2px dashed', borderColor:isDragActive?'primary.main':'divider',
        p:4, mt:2, textAlign:'center', borderRadius:2, cursor:'pointer'
      }}>
        <input {...getInputProps()} />
        {file ? file.name : 'Drag & drop CSV file here'}
      </Box>
      {progress>0 && <LinearProgress variant="determinate" value={progress} sx={{my:2}} />}
      <Stack spacing={2} sx={{mt:2}}>
        <Button variant="contained" onClick={handleTrain} disabled={!file}>Start Training</Button>
        {status && <Alert severity={status.type}>{status.msg}</Alert>}
      </Stack>
    </Paper>
  );
};
