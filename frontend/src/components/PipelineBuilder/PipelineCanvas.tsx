import React, { useState, useCallback } from 'react';
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
  Tooltip 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddBoxIcon from '@mui/icons-material/AddBox';

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

export const PipelineCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
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
    setNodes((nds) => nds.concat(newNode));
    setNodeId(prev => prev + 1);
  };

  const savePipeline = () => {
    try {
      const pipeline = { nodes, edges };
      localStorage.setItem('automl_pipeline', JSON.stringify(pipeline));
      alert('✅ Pipeline saved successfully!');
    } catch (error) {
      alert('❌ Failed to save pipeline');
    }
  };

  const loadPipeline = () => {
    try {
      const stored = localStorage.getItem('automl_pipeline');
      if (stored) {
        const pipeline = JSON.parse(stored);
        setNodes(pipeline.nodes || []);
        setEdges(pipeline.edges || []);
        alert('✅ Pipeline loaded successfully!');
      } else {
        alert('ℹ️ No saved pipeline found');
      }
    } catch (error) {
      alert('❌ Failed to load pipeline');
    }
  };

  const clearPipeline = () => {
    if (window.confirm('Are you sure you want to clear the pipeline?')) {
      setNodes(initialNodes);
      setEdges([]);
      setNodeId(2);
    }
  };

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
            minWidth: 250
          }}>
            <Stack spacing={2}>
              <Chip 
                label="Pipeline Components" 
                color="primary" 
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
              
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
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<SaveIcon />}
                  onClick={savePipeline}
                  color="success"
                >
                  Save Pipeline
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<FolderOpenIcon />}
                  onClick={loadPipeline}
                  color="info"
                >
                  Load Pipeline
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={clearPipeline}
                  color="error"
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
