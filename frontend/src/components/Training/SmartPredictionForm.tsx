import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Tooltip,
  IconButton,
  Chip,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Info as InfoIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import * as yup from 'yup';
import api from '../../services/api';

interface SmartPredictionFormProps {
  sessionId: string;
  onResult: (result: any) => void;
}

interface FeatureContribution {
  [key: string]: number;
}

export const SmartPredictionForm: React.FC<SmartPredictionFormProps> = ({ 
  sessionId, 
  onResult 
}) => {
  const [schema, setSchema] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationSchema, setValidationSchema] = useState<yup.ObjectSchema<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  const [featureHelp, setFeatureHelp] = useState<Record<string, string>>({});

  // Load schema and setup validation
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const response = await api.get(`/api/enterprise-training/schema/${sessionId}`);
        const schemaData = response.data;
        setSchema(schemaData);

        // Initialize form data
        const initialData: Record<string, string> = {};
        const helpTexts: Record<string, string> = {};
        
        Object.keys(schemaData.properties.features.properties).forEach(feature => {
          initialData[feature] = '';
          helpTexts[feature] = `Enter a numeric value for ${feature}. This feature contributes to the model's prediction.`;
        });
        
        setFormData(initialData);
        setFeatureHelp(helpTexts);

        // Create Yup validation schema
        const featureValidations: Record<string, any> = {};
        Object.keys(schemaData.properties.features.properties).forEach(feature => {
          featureValidations[feature] = yup
            .number()
            .required(`${feature} is required`)
            .typeError(`${feature} must be a number`);
        });

        const yupSchema = yup.object().shape(featureValidations);
        setValidationSchema(yupSchema);

      } catch (error) {
        console.error('Failed to load prediction schema:', error);
      }
    };

    if (sessionId) {
      loadSchema();
    }
  }, [sessionId]);

  // Real-time validation
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
    validateField(fieldName, value);
  };

  const handlePredict = async () => {
    if (!validationSchema) return;

    setLoading(true);
    try {
      // Validate all fields
      const numericData: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => {
        numericData[key] = Number(value);
      });

      await validationSchema.validate(numericData);

      // Make prediction
      const response = await api.post('/api/enterprise-training/predict', {
        session_id: sessionId,
        features: numericData
      });

      const result = response.data;
      setPredictions(result);
      onResult(result);

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

  const isFormValid = () => {
    return Object.values(formData).every(value => value !== '') && 
           Object.values(errors).every(error => error === '');
  };

  if (!schema) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 1 }}>Loading prediction form...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TrendingUpIcon sx={{ mr: 1 }} />
        Smart Prediction Input
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter values for each feature. The form provides real-time validation and helpful tooltips.
      </Typography>

      <Stack spacing={2}>
        {Object.keys(schema.properties.features.properties).map(feature => (
          <Box key={feature}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                label={feature}
                value={formData[feature]}
                onChange={(e) => handleFieldChange(feature, e.target.value)}
                error={!!errors[feature]}
                helperText={errors[feature]}
                fullWidth
                type="number"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Tooltip title={featureHelp[feature]} arrow>
                      <IconButton size="small">
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Box>
          </Box>
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
          sx={{ mt: 3 }}
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
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1">
                  <strong>Predicted Value:</strong> {predictions.predictions[0]}
                </Typography>
                {predictions.confidence && (
                  <Typography variant="body1">
                    <strong>Confidence:</strong> {(predictions.confidence * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>

              {predictions.probabilities && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Class Probabilities:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {predictions.probabilities[0].map((prob: number, idx: number) => (
                      <Chip
                        key={idx}
                        label={`Class ${idx}: ${(prob * 100).toFixed(1)}%`}
                        color={prob > 0.5 ? 'success' : 'default'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {predictions.feature_contributions && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Feature Contributions Analysis</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      {Object.entries(predictions.feature_contributions as FeatureContribution)
                        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                        .map(([feature, contribution]) => (
                          <Box key={feature} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ minWidth: 120 }}>
                              {feature}:
                            </Typography>
                            <Box sx={{ flex: 1, mx: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.abs(contribution) * 100}
                                color={contribution > 0 ? 'success' : 'warning'}
                                sx={{ height: 8 }}
                              />
                            </Box>
                            <Typography variant="body2" color={contribution > 0 ? 'success.main' : 'warning.main'}>
                              {contribution > 0 ? '+' : ''}{contribution.toFixed(4)}
                            </Typography>
                          </Box>
                        ))
                      }
                    </Stack>
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
