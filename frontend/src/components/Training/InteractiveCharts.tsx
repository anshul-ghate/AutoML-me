import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Accordion, AccordionSummary, AccordionDetails, Grid, Alert, Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  DataUsage as DataUsageIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

interface InteractiveChartsProps {
  metrics: {
    roc_auc?: number;
    confusion_matrix?: number[][];
    class_labels?: string[];
    feature_importance?: Record<string, number>;
    per_class_metrics?: {
      class: string;
      precision: number;
      recall: number;
      f1_score: number;
    }[];
    model_comparison?: {
      name: string;
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      training_time: number;
    }[];
    cross_validation?: {
      scores: number[];
      mean: number;
      std: number;
    };
    learning_curve?: {
      train_scores: number[];
      val_scores: number[];
      training_sizes: number[];
    };
    overall_accuracy?: number;
    macro_avg?: {
      precision: number;
      recall: number;
      f1_score: number;
    };
  };
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ metrics }) => {
  const [expandedPanel, setExpandedPanel] = useState<string>('performance');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const renderOverviewCards = () => {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* ROC-AUC Card */}
        {metrics.roc_auc && (
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color={`${getPerformanceColor(metrics.roc_auc)}.main`}>
                  {(metrics.roc_auc * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ROC-AUC Score
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.roc_auc * 100}
                  color={getPerformanceColor(metrics.roc_auc)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Overall Accuracy Card */}
        {metrics.overall_accuracy && (
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" color={`${getPerformanceColor(metrics.overall_accuracy)}.main`}>
                  {(metrics.overall_accuracy * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall Accuracy
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.overall_accuracy * 100}
                  color={getPerformanceColor(metrics.overall_accuracy)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cross-Validation Score */}
        {metrics.cross_validation && (
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color={`${getPerformanceColor(metrics.cross_validation.mean)}.main`}>
                  {(metrics.cross_validation.mean * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  CV Score (±{(metrics.cross_validation.std * 100).toFixed(1)}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.cross_validation.mean * 100}
                  color={getPerformanceColor(metrics.cross_validation.mean)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Feature Count */}
        {metrics.feature_importance && (
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <InsightsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {Object.keys(metrics.feature_importance).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Important Features
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Top contributing features
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderPerformanceSection = () => {
    return (
      <Stack spacing={3}>
        {/* Performance Overview */}
        {renderOverviewCards()}

        {/* ROC-AUC Display */}
        {metrics.roc_auc && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                📈 ROC-AUC Performance Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={metrics.roc_auc * 100}
                  color={getPerformanceColor(metrics.roc_auc)}
                  sx={{ flex: 1, mr: 2, height: 12, borderRadius: 6 }}
                />
                <Typography variant="h6" color={`${getPerformanceColor(metrics.roc_auc)}.main`}>
                  {(metrics.roc_auc * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                ROC-AUC measures the model's ability to distinguish between classes. 
                {metrics.roc_auc >= 0.9 ? ' 🎉 Excellent performance!' :
                 metrics.roc_auc >= 0.8 ? ' ✅ Good performance.' :
                 metrics.roc_auc >= 0.7 ? ' ⚠️ Fair performance.' :
                 ' ❌ Needs improvement.'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Per-Class Metrics */}
        {metrics.per_class_metrics && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DataUsageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                🎯 Per-Class Performance Breakdown
              </Typography>
              <Stack spacing={2}>
                {metrics.per_class_metrics.map((classMetric, idx) => (
                  <Box key={idx} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Class: {classMetric.class}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip 
                        label={`Precision: ${(classMetric.precision * 100).toFixed(1)}%`} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={`Recall: ${(classMetric.recall * 100).toFixed(1)}%`} 
                        color="secondary" 
                        size="small" 
                      />
                      <Chip 
                        label={`F1: ${(classMetric.f1_score * 100).toFixed(1)}%`} 
                        color="success" 
                        size="small" 
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    );
  };

  const renderConfusionMatrix = () => {
    if (!metrics.confusion_matrix || !metrics.class_labels) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DataUsageIcon sx={{ mr: 1, color: 'secondary.main' }} />
            🎯 Confusion Matrix
          </Typography>
          <Paper sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Actual \ Predicted</strong></TableCell>
                  {metrics.class_labels.map((label: string) => (
                    <TableCell key={label} align="center">
                      <strong>{label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.confusion_matrix.map((row: number[], rowIdx: number) => (
                  <TableRow key={rowIdx}>
                    <TableCell>
                      <strong>{metrics.class_labels![rowIdx]}</strong>
                    </TableCell>
                    {row.map((value: number, colIdx: number) => (
                      <TableCell key={colIdx} align="center">
                        <Tooltip title={`Predicted ${metrics.class_labels![colIdx]}: ${value} instances`}>
                          <Chip
                            label={value}
                            color={rowIdx === colIdx ? 'success' : 'default'}
                            size="small"
                            variant={rowIdx === colIdx ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    );
  };

  const renderFeatureImportance = () => {
    if (!metrics.feature_importance) return null;

    const features = Object.entries(metrics.feature_importance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15); // Show top 15 features

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <InsightsIcon sx={{ mr: 1, color: 'info.main' }} />
            🔍 Top Feature Importance Analysis
          </Typography>
          <Stack spacing={1.5}>
            {features.map(([feature, importance], idx) => (
              <Box key={feature} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ minWidth: 140, fontSize: '0.875rem' }}>
                  #{idx + 1} {feature.length > 18 ? `${feature.substring(0, 15)}...` : feature}
                </Typography>
                <Box sx={{ flex: 1, mx: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={importance * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={idx < 5 ? 'primary' : idx < 10 ? 'secondary' : 'inherit'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
                  {(importance * 100).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              These features contribute most to the model's predictions. 
              Monitor these closely in production for data drift.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  const renderModelComparison = () => {
    if (!metrics.model_comparison) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 1, color: 'warning.main' }} />
            🏆 Model Performance Comparison
          </Typography>
          <Paper sx={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Model</strong></TableCell>
                  <TableCell align="center"><strong>Accuracy</strong></TableCell>
                  <TableCell align="center"><strong>Precision</strong></TableCell>
                  <TableCell align="center"><strong>Recall</strong></TableCell>
                  <TableCell align="center"><strong>F1 Score</strong></TableCell>
                  <TableCell align="center"><strong>Training Time</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.model_comparison.map((model, idx) => (
                  <TableRow 
                    key={model.name}
                    sx={{ 
                      bgcolor: idx === 0 ? 'success.light' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {idx === 0 && <Typography sx={{ mr: 1 }}>🥇</Typography>}
                        <Typography fontWeight={idx === 0 ? 'bold' : 'normal'}>
                          {model.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${(model.accuracy * 100).toFixed(1)}%`}
                        color={getPerformanceColor(model.accuracy)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{(model.precision * 100).toFixed(1)}%</TableCell>
                    <TableCell align="center">{(model.recall * 100).toFixed(1)}%</TableCell>
                    <TableCell align="center">{(model.f1_score * 100).toFixed(1)}%</TableCell>
                    <TableCell align="center">{model.training_time.toFixed(2)}s</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Interactive Model Analysis Dashboard</strong> - Comprehensive insights into your model's performance, 
          feature importance, and detailed metrics. Explore each section for in-depth analysis.
        </Typography>
      </Alert>

      {/* Performance Metrics */}
      <Accordion 
        expanded={expandedPanel === 'performance'} 
        onChange={handleAccordionChange('performance')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📊 Performance Overview & Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderPerformanceSection()}
        </AccordionDetails>
      </Accordion>

      {/* Confusion Matrix */}
      <Accordion 
        expanded={expandedPanel === 'confusion'} 
        onChange={handleAccordionChange('confusion')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">🎯 Confusion Matrix Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderConfusionMatrix()}
        </AccordionDetails>
      </Accordion>

      {/* Feature Importance */}
      <Accordion 
        expanded={expandedPanel === 'features'} 
        onChange={handleAccordionChange('features')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">🔍 Feature Importance Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderFeatureImportance()}
        </AccordionDetails>
      </Accordion>

      {/* Model Comparison */}
      <Accordion 
        expanded={expandedPanel === 'comparison'} 
        onChange={handleAccordionChange('comparison')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">🏆 Model Comparison</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderModelComparison()}
        </AccordionDetails>
      </Accordion>

      {/* Raw Metrics Data */}
      <Accordion 
        expanded={expandedPanel === 'raw'} 
        onChange={handleAccordionChange('raw')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📋 Raw Metrics Data</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" component="pre" sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: 400,
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(metrics, null, 2)}
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};

export default InteractiveCharts;