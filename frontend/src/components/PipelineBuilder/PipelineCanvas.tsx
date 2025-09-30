import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logEvent, logUserAction, logError } from '../../services/analytics';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  addEdge,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  OnConnect,
  Position,
  NodeChange,
  EdgeChange
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
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CircleIcon from '@mui/icons-material/Circle';
import { useCollaboration } from '../../hooks/useCollaboration';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🚀 Start Pipeline' },
    position: { x: 250, y: 50 },
    style: {
      background: '#e3f2fd',
      border: '2px solid #1976d2',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  }
];

const initialEdges: Edge[] = [];

const nodeTypes = [
  { label: 'Data Preprocessing', emoji: '🔄', color: '#e8f5e8' },
  { label: 'Feature Engineering', emoji: '⚙️', color: '#fff3e0' },
  { label: 'Model Training', emoji: '🤖', color: '#f3e5f5' },
  { label: 'Model Evaluation', emoji: '📊', color: '#e0f2f1' },
  { label: 'Hyperparameter Tuning', emoji: '🎛️', color: '#fce4ec' },
  { label: 'Model Explainability', emoji: '🔍', color: '#f1f8e9' }
];

export const PipelineCanvas: React.FC<{ pipelineId?: string }> = ({ pipelineId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const computedPipelineId = useMemo(() => {
    if (pipelineId) return pipelineId;
    const params = new URLSearchParams(window.location.search);
    return params.get('pid') || 'default';
  }, [pipelineId]);

  const broadcastTimer = useRef<NodeJS.Timeout | null>(null);

  const scheduleBroadcast = useCallback((send: ReturnType<typeof useCollaboration>['send']) => {
    if (broadcastTimer.current) clearTimeout(broadcastTimer.current);
    broadcastTimer.current = setTimeout(() => {
      send({ type: 'sync', nodes, edges, timestamp: Date.now() });
    }, 300);
  }, [nodes, edges]);

  const { send, status, connectedPeers } = useCollaboration(
    computedPipelineId,
    (remoteNodes, remoteEdges) => {
      setNodes(remoteNodes);
      setEdges(remoteEdges);
      const maxId = remoteNodes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 1);
      setNodeId(isFinite(maxId) ? maxId + 1 : 2);
    }
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const next = addEdge({ ...params, animated: true }, eds);
        setTimeout(() => scheduleBroadcast(send), 0);
        
        logUserAction('pipeline_edge_added', {
          pipelineId: computedPipelineId,
          source: params.source,
          target: params.target,
          totalEdges: next.length
        });
        
        return next;
      });
    },
    [setEdges, scheduleBroadcast, send, computedPipelineId]
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
      
      logUserAction('pipeline_node_added', {
        pipelineId: computedPipelineId,
        nodeType: label,
        totalNodes: next.length,
        collaborationStatus: status
      });
      
      return next;
    });
    
    setNodeId((prev) => prev + 1);
  };

  const savePipeline = async () => {
    setSaveStatus('saving');
    
    try {
      const pipeline = { 
        nodes, 
        edges, 
        pipelineId: computedPipelineId, 
        savedAt: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(`automl_pipeline_${computedPipelineId}`, JSON.stringify(pipeline));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      logEvent('pipeline_save', {
        pipelineId: computedPipelineId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        collaborationStatus: status,
        connectedPeers,
        saveMethod: 'local_storage'
      });
      
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      logError(error as Error, 'pipeline_save');
    }
  };

  const loadPipeline = () => {
    try {
      const stored = localStorage.getItem(`automl_pipeline_${computedPipelineId}`);
      if (stored) {
        const pipeline = JSON.parse(stored);
        setNodes(pipeline.nodes || []);
        setEdges(pipeline.edges || []);
        
        const maxId = (pipeline.nodes || []).reduce((m: number, n: Node) => Math.max(m, Number(n.id) || 0), 1);
        setNodeId(isFinite(maxId) ? maxId + 1 : 2);
        
        scheduleBroadcast(send);
        
        logEvent('pipeline_load', {
          pipelineId: computedPipelineId,
          nodeCount: (pipeline.nodes || []).length,
          edgeCount: (pipeline.edges || []).length,
          savedAt: pipeline.savedAt,
          version: pipeline.version
        });
        
      } else {
        logEvent('pipeline_load_failed', {
          pipelineId: computedPipelineId,
          reason: 'no_saved_pipeline'
        });
      }
    } catch (error) {
      logError(error as Error, 'pipeline_load');
    }
  };

  const clearPipeline = () => {
    if (window.confirm('Are you sure you want to clear the pipeline? This action cannot be undone.')) {
      setNodes(initialNodes);
      setEdges([]);
      setNodeId(2);
      
      setTimeout(() => scheduleBroadcast(send), 0);
      
      logUserAction('pipeline_clear', {
        pipelineId: computedPipelineId,
        nodeCount: nodes.length,
        edgeCount: edges.length
      });
    }
  };

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    scheduleBroadcast(send);
  }, [onNodesChange, scheduleBroadcast, send]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    scheduleBroadcast(send);
  }, [onEdgesChange, scheduleBroadcast, send]);

  useEffect(() => {
    return () => {
      if (broadcastTimer.current) {
        clearTimeout(broadcastTimer.current);
      }
    };
  }, []);

  const statusColor = status === 'open' ? 'success' : status === 'connecting' ? 'warning' : 'error';
  const saveButtonText = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Pipeline';

  return (
    <Box sx={{
      height: '100%',
      border: '2px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper'
    }}>
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
          <Box sx={{
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            minWidth: 280,
            maxWidth: 320
          }}>
            <Stack spacing={2}>
              <Badge
                color={statusColor as any}
                variant="dot"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <CircleIcon sx={{ fontSize: 12 }} />
              </Badge>
              
              <Chip 
                size="small"
                label={`Collab: ${status.toUpperCase()} • Peers: ${connectedPeers}`}
                color={status === 'open' ? 'success' : status === 'connecting' ? 'warning' : 'default'}
                variant="outlined"
              />
              
              <Chip 
                label="Pipeline Components" 
                color="primary" 
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
              
              <ButtonGroup orientation="vertical" fullWidth>
                {nodeTypes.map((nodeType, index) => (
                  <Tooltip key={index} title={`Add ${nodeType.label.toLowerCase()} step`}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<AddBoxIcon />}
                      onClick={() => addNode(nodeType.label, nodeType.emoji, nodeType.color)}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        mb: 0.5
                      }}
                    >
                      {nodeType.emoji} {nodeType.label}
                    </Button>
                  </Tooltip>
                ))}
              </ButtonGroup>
              
              <Divider />
              
              {/* Save Status - FIXED: Removed size prop */}
              {saveStatus === 'saved' && (
                <Alert severity="success" sx={{ fontSize: '0.75rem' }}>
                  Pipeline saved successfully!
                </Alert>
              )}
              {saveStatus === 'error' && (
                <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
                  Failed to save pipeline
                </Alert>
              )}
              
              <ButtonGroup orientation="vertical" fullWidth>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<SaveIcon />}
                  onClick={savePipeline}
                  color="success"
                  disabled={saveStatus === 'saving'}
                  sx={{ textTransform: 'none' }}
                >
                  {saveButtonText}
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<FolderOpenIcon />}
                  onClick={loadPipeline}
                  color="info"
                  sx={{ textTransform: 'none' }}
                >
                  Load Pipeline
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<ClearAllIcon />}
                  onClick={clearPipeline}
                  color="error"
                  sx={{ textTransform: 'none' }}
                >
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
