// src/hooks/useCollaboration.ts
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

export type CollabMessage = {
  type: 'sync';
  nodes: Node[];
  edges: Edge[];
  clientId: string;
  ts: number;
};

type Status = 'closed' | 'connecting' | 'open' | 'error';

function toWsUrl(httpUrl: string) {
  if (httpUrl.startsWith('https://')) return httpUrl.replace('https://', 'wss://');
  if (httpUrl.startsWith('http://')) return httpUrl.replace('http://', 'ws://');
  return httpUrl;
}

export function useCollaboration(
  pipelineId: string,
  onSync: (nodes: Node[], edges: Edge[], fromClientId: string) => void
) {
  const clientIdRef = useRef<string>(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`); 
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<Status>('closed');
  const [connectedPeers, setConnectedPeers] = useState<number>(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:8301', []);
  const wsUrl = useMemo(() => `${toWsUrl(base)}/ws/pipeline/${pipelineId}`, [base, pipelineId]);

  const cleanup = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    reconnectRef.current = null;
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }
    wsRef.current = null;
  }, []);

  useEffect(() => {
    cleanup();
    setStatus('connecting');
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('open');
        // lightweight heartbeat to keep connection alive behind proxies
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', clientId: clientIdRef.current, ts: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'presence') {
            setConnectedPeers(data.count ?? 0);
            return;
          }
          if (data.type === 'sync') {
            const msg = data as CollabMessage;
            if (msg.clientId !== clientIdRef.current) {
              onSync(msg.nodes, msg.edges, msg.clientId);
            }
          }
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = () => {
        setStatus('closed');
        if (!reconnectRef.current) {
          reconnectRef.current = setTimeout(() => {
            reconnectRef.current = null;
            // trigger re-connect by recreating effect
            setStatus('connecting');
            // Re-run effect by changing a local state would be noisy; rely on pipelineId changes or page focus for now.
            // Caller can re-initialize by toggling pipelineId if needed.
          }, 1500);
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };
    } catch {
      setStatus('error');
    }

    return () => cleanup();
  }, [wsUrl, onSync, cleanup]);

  const send = useCallback((payload: Omit<CollabMessage, 'clientId' | 'ts'>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg: CollabMessage = { ...payload, clientId: clientIdRef.current, ts: Date.now() };
      ws.send(JSON.stringify(msg));
    }
  }, []);

  return {
    clientId: clientIdRef.current,
    status,
    connectedPeers,
    send,
  };
}
