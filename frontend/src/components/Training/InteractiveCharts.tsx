import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface InteractiveChartsProps {
  metrics: any;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ metrics }) => {
  
  return (
    <Stack spacing={3}>
      <Typography variant="h6" gutterBottom>
        📊 Model Performance Visualization
      </Typography>

      {/* ROC-AUC Display */}
      {metrics.roc_auc && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 ROC-AUC Performance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={metrics.roc_auc * 100}
                color="success"
                sx={{ flex: 1, mr: 2, height: 12, borderRadius: 6 }}
              />
              <Typography variant="h6" color="success.main">
                {(metrics.roc_auc * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ROC-AUC measures model's ability to distinguish between classes
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Per-Class Metrics */}
      {metrics.per_class_metrics && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 Per-Class Performance
            </Typography>
            <Stack spacing={2}>
              {metrics.per_class_metrics.map((classMetric: any, idx: number) => (
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

      {/* Confusion Matrix */}
      {metrics.confusion_matrix && metrics.class_labels && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 Confusion Matrix
            </Typography>
            <Paper sx={{ overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Actual →</strong></TableCell>
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
                        <strong>{metrics.class_labels[rowIdx]}</strong>
                      </TableCell>
                      {row.map((value: number, colIdx: number) => (
                        <TableCell key={colIdx} align="center">
                          <Chip 
                            label={value} 
                            color={rowIdx === colIdx ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Raw Metrics */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>📋 Detailed Metrics Data</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(metrics, null, 2)}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};

export default InteractiveCharts;