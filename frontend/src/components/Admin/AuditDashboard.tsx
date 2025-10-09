import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import api from '../../services/api';

interface AuditEntry {
  user_id: string;
  session_id: string;
  action: string;
  timestamp: string;
  input_data?: any;
  result?: any;
}

export const AuditDashboard: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [days, setDays] = useState(7);

  const fetchAuditData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/enterprise-training/audit/${userId}?days=${days}`);
      setAuditData(response.data.entries);
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string): "default" | "primary" | "secondary" | "success" | "info" => {
    switch (action) {
      case 'single_prediction': return 'primary';
      case 'batch_prediction': return 'secondary';
      case 'evaluation_computed': return 'success';
      case 'report_generated': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Audit Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              size="small"
            />
            <TextField
              label="Days"
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              size="small"
              sx={{ width: 100 }}
            />
            <Button
              variant="contained"
              onClick={fetchAuditData}
              disabled={!userId || loading}
            >
              {loading ? 'Loading...' : 'Load Audit Data'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {auditData.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Session ID</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditData.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.action}
                      color={getActionColor(entry.action)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.session_id}</TableCell>
                  <TableCell>
                    {entry.input_data && (
                      <Typography variant="caption">
                        Input: {JSON.stringify(entry.input_data).substring(0, 50)}...
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditDashboard;
