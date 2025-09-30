import { useState, useEffect, useRef, useCallback } from 'react';
import { logEvent, logError } from '../services/analytics';

interface CollaborationHook {
  send: (data: any) => void;
  status: 'connecting' | 'open' | 'error' | 'closed';
  connectedPeers: number;
}

export const useCollaboration = (
  pipelineId: string, 
  onMessage: (nodes: any[], edges: any[]) => void
): CollaborationHook => {
  const [status, setStatus] = useState<'connecting' | 'open' | 'error' | 'closed'>('closed');
  const [connectedPeers, setConnectedPeers] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const connect = useCallback(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Mock collaboration in development
      setStatus('closed');
      setConnectedPeers(1);
      return;
    }

    setStatus('connecting');
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:8050/ws/pipeline/${pipelineId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('open');
        setConnectedPeers(1);
        reconnectAttemptsRef.current = 0;
        
        logEvent('collaboration_connected', {
          pipelineId,
          reconnectAttempt: reconnectAttemptsRef.current
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'sync' && data.nodes && data.edges) {
            onMessage(data.nodes, data.edges);
          } else if (data.type === 'peers_update') {
            setConnectedPeers(data.count || 1);
          }
        } catch (error) {
          logError(error as Error, 'websocket_message_parsing');
        }
      };

      ws.onerror = () => {
        setStatus('error');
        logError(new Error('WebSocket connection error'), 'collaboration');
      };

      ws.onclose = (event) => {
        setStatus('closed');
        setConnectedPeers(0);
        
        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts && !event.wasClean) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        }
        
        logEvent('collaboration_disconnected', {
          pipelineId,
          wasClean: event.wasClean,
          code: event.code,
          reconnectAttempts: reconnectAttemptsRef.current
        });
      };
    } catch (error) {
      setStatus('error');
      logError(error as Error, 'websocket_connection');
    }
  }, [pipelineId, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
      } catch (error) {
        logError(error as Error, 'websocket_send');
      }
    }
  }, []);

  return { send, status, connectedPeers };
};
