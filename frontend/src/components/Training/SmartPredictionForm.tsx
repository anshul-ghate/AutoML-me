import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Stack,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import * as yup from 'yup';
import api from '../../services/api';

export interface SmartPredictionFormProps {
  sessionId: string;
  featureNames: string[];
  onResult: (result: any) => void;
}

const SmartPredictionForm: React.FC<SmartPredictionFormProps> = ({ 
  sessionId, 
  featureNames,
  onResult 
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    const initialData: Record<string, string> = {};
    featureNames.forEach(feature => initialData[feature] = '');
    setFormData(initialData);
  }, [featureNames]);

  // Create validation schema
  const validationSchema = React.useMemo(() => {
    const schemaFields: Record<string, any> = {};
    featureNames.forEach(feature => {
      schemaFields[feature] = yup
        .number()
        .required(`${feature} is required`)
        .typeError(`${feature} must be a number`);
    });
    return yup.object().shape(schemaFields);
  }, [featureNames]);

  const validateField = async (fieldName: string, value: string) => {
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: Number(value) });
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    } catch (error: any) {
      setErrors(prev => ({ ...prev, [fieldName]: error.message }));
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (value !== '') validateField(fieldName, value);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const numericData: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => numericData[key] = Number(value));
      await validationSchema.validate(numericData);

      // Call API
      const response = await api.post('/api/training/predict', {
        session_id: sessionId,
        features: numericData
      });
      
      setPredictions(response.data);
      onResult(response.data);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: error.response?.data?.detail || 'Prediction failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => 
    featureNames.every(f => formData[f] !== '') &&
    Object.values(errors).every(e => e === '');

  if (featureNames.length === 0) {
    return (
      <Alert severity="info">
        No features available for prediction. Please train a model first.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TrendingUpIcon sx={{ mr: 1 }} />
        🎯 Smart Prediction Input
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter values for each feature to get a prediction from your trained model.
      </Typography>

      <Stack spacing={2}>
        {featureNames.map(feature => (
          <TextField
            key={feature}
            label={feature}
            value={formData[feature] || ''}
            onChange={e => handleFieldChange(feature, e.target.value)}
            error={!!errors[feature]}
            helperText={errors[feature] || `Enter numeric value for ${feature}`}
            fullWidth
            type="number"
            variant="outlined"
            size="small"
          />
        ))}

        {errors.general && (
          <Alert severity="error">
            {errors.general}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handlePredict}
          disabled={!isFormValid() || loading}
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
          sx={{ mt: 2 }}
        >
          {loading ? 'Predicting...' : 'Get Smart Prediction'}
        </Button>
      </Stack>

      {predictions && (
        <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Prediction Results
            </Typography>
            
            <Stack spacing={1}>
              <Typography variant="body1">
                <strong>Predicted Value:</strong> {predictions.predictions?.[0] || 'N/A'}
              </Typography>
              
              {predictions.confidence && (
                <Typography variant="body1">
                  <strong>Confidence:</strong> {(predictions.confidence * 100).toFixed(1)}%
                </Typography>
              )}

              {predictions.predicted_classes && (
                <Typography variant="body1">
                  <strong>Predicted Class:</strong> {predictions.predicted_classes[0]}
                </Typography>
              )}

              {predictions.probabilities && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Class Probabilities:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {predictions.probabilities[0].map((prob: number, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ 
                        bgcolor: 'background.paper', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        border: 1,
                        borderColor: prob > 0.5 ? 'success.main' : 'grey.300'
                      }}>
                        Class {idx}: {(prob * 100).toFixed(1)}%
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SmartPredictionForm;