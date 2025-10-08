import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InteractiveChartsProps {
  metrics: any;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({ metrics }) => {
  
  // ROC Curve Chart
  const rocChartData = metrics.roc_curve ? {
    labels: metrics.roc_curve.fpr.map((_: any, i: number) => i),
    datasets: [
      {
        label: `ROC Curve (AUC = ${(metrics.roc_auc * 100).toFixed(1)}%)`,
        data: metrics.roc_curve.fpr.map((fpr: number, i: number) => ({
          x: fpr,
          y: metrics.roc_curve.tpr[i]
        })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Random Classifier',
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        borderColor: 'rgb(54, 162, 235)',
        borderDash: [5, 5],
        fill: false
      }
    ]
  } : null;

  const rocChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'ROC Curve Analysis'
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'False Positive Rate'
        },
        min: 0,
        max: 1
      },
      y: {
        title: {
          display: true,
          text: 'True Positive Rate'
        },
        min: 0,
        max: 1
      }
    }
  };

  // Precision-Recall Curve
  const prChartData = metrics.pr_curve ? {
    labels: metrics.pr_curve.recall.map((_: any, i: number) => i),
    datasets: [
      {
        label: 'Precision-Recall Curve',
        data: metrics.pr_curve.recall.map((recall: number, i: number) => ({
          x: recall,
          y: metrics.pr_curve.precision[i]
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  const prChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Precision-Recall Curve'
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Recall'
        },
        min: 0,
        max: 1
      },
      y: {
        title: {
          display: true,
          text: 'Precision'
        },
        min: 0,
        max: 1
      }
    }
  };

  // Feature Importance Chart
  const featureImportanceData = metrics.per_class_metrics ? {
    labels: metrics.per_class_metrics.map((item: any) => item.class),
    datasets: [
      {
        label: 'Precision',
        data: metrics.per_class_metrics.map((item: any) => item.precision * 100),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Recall',
        data: metrics.per_class_metrics.map((item: any) => item.recall * 100),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'F1 Score',
        data: metrics.per_class_metrics.map((item: any) => item.f1_score * 100),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      }
    ]
  } : null;

  const featureImportanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Per-Class Performance Metrics'
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Percentage (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <Stack spacing={3}>
      {/* ROC Curve */}
      {rocChartData && (
        <Card>
          <CardContent>
            <Box sx={{ height: 400 }}>
              <Line data={rocChartData} options={rocChartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Precision-Recall Curve */}
      {prChartData && (
        <Card>
          <CardContent>
            <Box sx={{ height: 400 }}>
              <Line data={prChartData} options={prChartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Per-Class Metrics */}
      {featureImportanceData && (
        <Card>
          <CardContent>
            <Box sx={{ height: 400 }}>
              <Bar data={featureImportanceData} options={featureImportanceOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Confusion Matrix Heatmap */}
      {metrics.confusion_heatmap && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Confusion Matrix Heatmap
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={`data:image/png;base64,${metrics.confusion_heatmap}`}
                alt="Confusion Matrix Heatmap"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default InteractiveCharts;
