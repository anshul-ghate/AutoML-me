import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material'
import { CloudUpload as CloudUploadIcon, Analytics as AnalyticsIcon } from '@mui/icons-material'
import api from '../../services/api'

interface DataProfile {
  shape: [number, number]
  missing_values: Record<string, number>
  data_quality_score: number
  recommendations: string[]
  statistical_summary: {
    numeric_columns: string[]
    categorical_columns: string[]
    total_missing: number
  }
}

interface DataUploadPanelProps {
  onAnalyzed: (profile: DataProfile) => void
}

const DataUploadPanel: React.FC<DataUploadPanelProps> = ({ onAnalyzed }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<DataProfile | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setProfile(null)
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const analyzeData = async () => {
    if (!file) {
      setError('Please select a CSV file first')
      return
    }
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const resp = await api.post('/api/training/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })
      const prof: DataProfile = resp.data.profile
      setProfile(prof)
      onAnalyzed(prof)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Analyze failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload Dataset
        </Typography>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'block', margin: '16px 0' }}
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
          onClick={analyzeData}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Dataset'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {profile && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Dataset Profile
          </Typography>
          <Stack spacing={1}>
            <Typography>Total Rows: {profile.shape[0].toLocaleString()}</Typography>
            <Typography>Total Columns: {profile.shape[1]}</Typography>
            <Typography>Data Quality Score: {profile.data_quality_score.toFixed(1)}%</Typography>
            <Typography>Missing Values: {profile.statistical_summary.total_missing}</Typography>
            <Typography>Numeric Columns: {profile.statistical_summary.numeric_columns.length}</Typography>
            <Typography>Categorical Columns: {profile.statistical_summary.categorical_columns.length}</Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

export default DataUploadPanel
