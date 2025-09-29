// src/components/PipelineBuilder/PipelineCanvas.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logEvent } from '../../services/analytics';

import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  OnConnect,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Button,
  Box,
  ButtonGroup,
  Chip,
  Stack,
  Divider,
  Tooltip,
  Badge,
  Skeleton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CircleIcon from '@mui/icons-material/Circle';
import { useCollaboration } from '../../hooks/useCollaboration';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🚀 Start Pipeline' },
    position: { x: 250, y: 50 },
    style: {
      background: '#8f8b3c',
      border: '2px solid #1976d2',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  }
];

const initialEdges: Edge[] = [];

export const PipelineCanvas: React.FC<{ pipelineId?: string }> = ({ pipelineId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);

  // Derive a stable pipeline id; fallback to default, allow ?pid=... in URL
  const computedPipelineId = useMemo(() => {
    if (pipelineId) return pipelineId;
    const params = new URLSearchParams(window.location.search);
    return params.get('pid') || 'default';
  }, [pipelineId]);

  // Debounce broadcasts to avoid flooding
  const broadcastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleBroadcast = useCallback((send: ReturnType<typeof useCollaboration>['send']) => {
    if (broadcastTimer.current) clearTimeout(broadcastTimer.current);
    broadcastTimer.current = setTimeout(() => {
      send({ type: 'sync', nodes, edges });
    }, 120);
  }, [nodes, edges]);

  // Collaboration hook: receive remote updates and merge
  const { send, status, connectedPeers } = useCollaboration(
    computedPipelineId,
    (remoteNodes, remoteEdges) => {
      // Replace with remote state (simple last-writer-wins strategy)
      setNodes(remoteNodes);
      setEdges(remoteEdges);
      // Recompute next id to avoid collisions
      const maxId = remoteNodes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 1);
      setNodeId(isFinite(maxId) ? maxId + 1 : 2);
    }
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const next = addEdge({ ...params, animated: true }, eds);
        // schedule broadcast after local mutation
        setTimeout(() => scheduleBroadcast(send), 0);
        return next;
      });
    },
    [setEdges, scheduleBroadcast, send]
  );

  const addNode = (label: string, emoji: string, color: string) => {
    const id = nodeId.toString();
    const newNode: Node = {
      id,
      data: { label: `${emoji} ${label}` },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 150
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: {
        background: color,
        border: '2px solid #333',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333'
      }
    };

    setNodes((nds) => {
      const next = nds.concat(newNode);
      setTimeout(() => scheduleBroadcast(send), 0);

      // Log node addition
      logEvent('pipeline_node_added', {
        pipelineId: computedPipelineId,
        nodeType: label,
        totalNodes: next.length,
        collaborationStatus: status
      });

      return next;
    });
    setNodeId((prev) => prev + 1);
  };

  const savePipeline = () => {
    const pipeline = { nodes, edges, pipelineId: computedPipelineId, savedAt: Date.now() };
    localStorage.setItem(`automl_pipeline_${computedPipelineId}`, JSON.stringify(pipeline));

    // Log pipeline save event
    logEvent('pipeline_save', {
      pipelineId: computedPipelineId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      collaborationStatus: status,
      connectedPeers
    });

    alert('✅ Pipeline saved successfully!');
  };

  const loadPipeline = () => {
    const stored = localStorage.getItem(`automl_pipeline_${computedPipelineId}`);
    if (stored) {
      const pipeline = JSON.parse(stored);
      setNodes(pipeline.nodes || []);
      setEdges(pipeline.edges || []);
      const maxId = (pipeline.nodes || []).reduce((m: number, n: Node) => Math.max(m, Number(n.id) || 0), 1);
      setNodeId(isFinite(maxId) ? maxId + 1 : 2);
      // broadcast loaded state to peers
      scheduleBroadcast(send);

      // Log pipeline load event
      logEvent('pipeline_load', {
        pipelineId: computedPipelineId,
        nodeCount: (pipeline.nodes || []).length,
        edgeCount: (pipeline.edges || []).length,
        savedAt: pipeline.savedAt
      });

      alert('✅ Pipeline loaded successfully!');
    } else {
      logEvent('pipeline_load_failed', {
        pipelineId: computedPipelineId,
        reason: 'no_saved_pipeline'
      });
      alert('ℹ️ No saved pipeline found');
    }
  };

  // When local node/edge change events occur via React Flow handlers, broadcast after applying
  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    onNodesChange(changes);
    scheduleBroadcast(send);
  }, [onNodesChange, scheduleBroadcast, send]);

  const handleEdgesChange = useCallback((changes: Parameters<typeof onEdgesChange>[0]) => {
    onEdgesChange(changes);
    scheduleBroadcast(send);
  }, [onEdgesChange, scheduleBroadcast, send]);

  // Clean timer on unmount
  useEffect(() => {
    if (status === 'open') {
      logEvent('collaboration_connected', {
        pipelineId: computedPipelineId,
        connectedPeers
      });
    } else if (status === 'error') {
      logEvent('collaboration_error', {
        pipelineId: computedPipelineId
      });
    }
  }, [status, computedPipelineId, connectedPeers]);

  const statusColor = status === 'open' ? 'success' : status === 'connecting' ? 'warning' : 'error';

  return (
    <Box
      sx={{
        height: '100%',
        border: '2px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />

        <Panel position="top-left">
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              minWidth: 280
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge
                  color={statusColor as any}
                  variant="dot"
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <CircleIcon fontSize="small" color={statusColor as any} />
                </Badge>
                <Chip
                  size="small"
                  label={`Collab: ${status.toUpperCase()} • Peers: ${connectedPeers}`}
                  color={status === 'open' ? 'success' : status === 'connecting' ? 'warning' : 'default'}
                  variant="outlined"
                />
                <Chip size="small" variant="outlined" label={`PID: ${computedPipelineId}`} />
              </Stack>

              <Divider />

              <ButtonGroup orientation="vertical" fullWidth>
                <Tooltip title="Add data preprocessing step">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddBoxIcon />}
                    onClick={() => addNode('Preprocess', '🔄', '#e8f5e8')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Data Preprocessing
                  </Button>
                </Tooltip>

                <Tooltip title="Add feature engineering step">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddBoxIcon />}
                    onClick={() => addNode('Feature Engineering', '⚙️', '#fff3e0')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Feature Engineering
                  </Button>
                </Tooltip>

                <Tooltip title="Add model training step">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddBoxIcon />}
                    onClick={() => addNode('Model Training', '🤖', '#f3e5f5')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Model Training
                  </Button>
                </Tooltip>

                <Tooltip title="Add model evaluation step">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddBoxIcon />}
                    onClick={() => addNode('Evaluation', '📊', '#e0f2f1')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Model Evaluation
                  </Button>
                </Tooltip>

                <Tooltip title="Add explainability analysis">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddBoxIcon />}
                    onClick={() => addNode('Explain', '🔍', '#fce4ec')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Explainability
                  </Button>
                </Tooltip>
              </ButtonGroup>

              <Divider />

              <ButtonGroup orientation="vertical" fullWidth>
                <Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={savePipeline} color="success">
                  Save Pipeline
                </Button>
                <Button variant="outlined" size="small" startIcon={<FolderOpenIcon />} onClick={loadPipeline} color="info">
                  Load Pipeline
                </Button>
                <Button variant="outlined" size="small" onClick={clearPipeline} color="error">
                  Clear All
                </Button>
              </ButtonGroup>
            </Stack>
          </Box>
        </Panel>
      </ReactFlow>
    </Box>
  );
};
