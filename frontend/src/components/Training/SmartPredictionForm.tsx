import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Stack, Card, CardContent, 
  CircularProgress, Tooltip, IconButton, LinearProgress, 
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import * as yup from 'yup';
import api from '../../services/api';

export interface SmartPredictionFormProps {
  sessionId: string;
  featureNames: string[];
  onResult: (result: any) => void;
}

interface FeatureContribution {
  [key: string]: number;
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

  // Initialize form data and validation schema
  useEffect(() => {
    if (featureNames && featureNames.length > 0) {
      const initialData: Record<string, string> = {};
      featureNames.forEach(feature => {
        initialData[feature] = '';
      });
      setFormData(initialData);
    }
  }, [featureNames]);

  // Create validation schema
  const validationSchema = React.useMemo(() => {
    if (!featureNames || featureNames.length === 0) return null;
    
    const schemaFields: Record<string, any> = {};
    featureNames.forEach(feature => {
      schemaFields[feature] = yup
        .number()
        .required(`${feature} is required`)
        .typeError(`${feature} must be a number`);
    });
    return yup.object().shape(schemaFields);
  }, [featureNames]);

  // Real-time field validation
  const validateField = async (fieldName: string, value: string) => {
    if (!validationSchema) return;
    
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: Number(value) });
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    } catch (error: any) {
      setErrors(prev => ({ ...prev, [fieldName]: error.message }));
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (value !== '') {
      validateField(fieldName, value);
    }
  };

  const handlePredict = async () => {
    if (!validationSchema) return;
    
    setLoading(true);
    try {
      // Convert string values to numbers
      const numericData: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => {
        numericData[key] = Number(value);
      });

      // Validate all fields
      await validationSchema.validate(numericData);

      // Call prediction API
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
        setErrors({ 
          general: error.response?.data?.detail || 'Prediction failed. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!featureNames || featureNames.length === 0) return false;
    return featureNames.every(f => formData[f] && formData[f] !== '') && 
           Object.values(errors).every(e => !e);
  };

  const getFieldHelperText = (feature: string) => {
    if (errors[feature]) return errors[feature];
    return `Enter numeric value for ${feature}`;
  };

  if (!featureNames || featureNames.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No features available for prediction. Please train a model first.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Smart Prediction Interface
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter values for each feature below. The system will validate your inputs in real-time 
        and provide predictions with confidence scores.
      </Typography>

      <Stack spacing={2}>
        {featureNames.map(feature => (
          <Box key={feature}>
            <TextField
              label={feature}
              value={formData[feature] || ''}
              onChange={(e) => handleFieldChange(feature, e.target.value)}
              error={!!errors[feature]}
              helperText={getFieldHelperText(feature)}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <Tooltip 
                    title={`${feature}: This feature contributes to the model's prediction. Enter a numeric value based on your data.`} 
                    arrow
                  >
                    <IconButton size="small">
                      <HelpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Box>
        ))}
      </Stack>

      {errors.general && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.general}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handlePredict}
        disabled={!isFormValid() || loading}
        size="large"
        startIcon={loading ? <CircularProgress size={20} /> : <TrendingUpIcon />}
        sx={{ mt: 3, width: '100%' }}
      >
        {loading ? 'Generating Prediction...' : '🎯 Get Smart Prediction'}
      </Button>

      {predictions && (
        <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AnalyticsIcon sx={{ mr: 1 }} />
              🎉 Prediction Results
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1">
                  <strong>Predicted Value:</strong> {predictions.predictions?.[0] || 'N/A'}
                </Typography>
                {predictions.confidence && (
                  <Typography variant="body1">
                    <strong>Confidence Score:</strong> {(predictions.confidence * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>

              {predictions.predicted_classes && (
                <Box>
                  <Typography variant="body1">
                    <strong>Predicted Class:</strong> {predictions.predicted_classes[0]}
                  </Typography>
                </Box>
              )}

              {predictions.probabilities && predictions.probabilities[0] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Class Probabilities:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {predictions.probabilities[0].map((prob: number, idx: number) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          bgcolor: 'background.paper',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          border: 1,
                          borderColor: prob > 0.5 ? 'success.main' : 'grey.300'
                        }}
                      >
                        Class {idx}: {(prob * 100).toFixed(1)}%
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}

              {predictions.feature_contributions && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      🔍 Feature Contribution Analysis
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      {Object.entries(predictions.feature_contributions as FeatureContribution)
                        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                        .slice(0, 10) // Show top 10 contributing features
                        .map(([feature, contribution]) => (
                          <Box key={feature} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ minWidth: 150, fontSize: '0.875rem' }}>
                              {feature.length > 20 ? `${feature.substring(0, 17)}...` : feature}
                            </Typography>
                            <Box sx={{ flex: 1, mx: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.abs(contribution) * 100}
                                color={contribution > 0 ? 'success' : 'warning'}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color={contribution > 0 ? 'success.main' : 'warning.main'}
                              sx={{ minWidth: 60, textAlign: 'right' }}
                            >
                              {contribution > 0 ? '+' : ''}{contribution.toFixed(4)}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Positive values increase the prediction, negative values decrease it. 
                      This analysis helps understand which features most influenced the result.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SmartPredictionForm;