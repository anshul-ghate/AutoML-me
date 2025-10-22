// AutoML-me/frontend/src/components/AI/AIChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  Fade,
  Divider
} from '@mui/material';
import { Send, SmartToy, Person, AutoAwesome } from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface AIChatInterfaceProps {
  sessionId?: string;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Hello! I\'m your AI supervisor. I can help analyze your data, suggest ML strategies, and monitor your models. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:8301', {
      transports: ['websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('AI Chat connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('ai_response', (data: { message: string }) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg?.loading) {
          updated[updated.length - 1] = {
            id: Date.now().toString(),
            type: 'ai',
            content: data.message,
            timestamp: new Date()
          };
        } else {
          updated.push({
            id: Date.now().toString(),
            type: 'ai',
            content: data.message,
            timestamp: new Date()
          });
        }
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !socket) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Send to backend
    socket.emit('user_message', {
      message: input,
      session_id: sessionId
    });

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'Analyze my dataset quality',
    'What ML algorithm should I use?',
    'How can I improve model accuracy?',
    'Check for data drift'
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
          <SmartToy />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Supervisor
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {isConnected ? '🟢 Online' : '🔴 Disconnected'}
          </Typography>
        </Box>
        <Chip
          icon={<AutoAwesome />}
          label="Powered by Claude"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'grey.50'
        }}
      >
        {messages.map((message, index) => (
          <Fade in key={message.id} timeout={300}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              {message.type === 'ai' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <SmartToy sx={{ fontSize: 20 }} />
                </Avatar>
              )}
              
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                  color: message.type === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  borderTopLeftRadius: message.type === 'ai' ? 0 : 2,
                  borderTopRightRadius: message.type === 'user' ? 0 : 2
                }}
              >
                {message.loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Thinking...</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>

              {message.type === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <Person sx={{ fontSize: 20 }} />
                </Avatar>
              )}
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestedQuestions.map((question, idx) => (
              <Chip
                key={idx}
                label={question}
                size="small"
                onClick={() => setInput(question)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your ML workflow..."
            variant="outlined"
            size="small"
            disabled={!isConnected}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || !isConnected}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.300' }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default AIChatInterface;
