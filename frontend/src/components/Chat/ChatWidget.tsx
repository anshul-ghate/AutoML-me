import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  Fade,
  CircularProgress,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../services/api';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: theme.shadows[8]
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    : 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '3px'
  }
}));

// Fixed: Remove theme parameter requirement
const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  background: isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : theme.palette.background.paper,
  color: isUser ? '#ffffff' : theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  wordBreak: 'break-word',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    border: `8px solid transparent`,
    borderTopColor: isUser 
      ? '#667eea'
      : theme.palette.background.paper,
    bottom: '-8px',
    [isUser ? 'right' : 'left']: theme.spacing(2)
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper
}));

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I\'m your AI assistant. How can I help you with your AutoML tasks today?',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/genai/chat', {
        model_key: 'gpt-4o',
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.response?.data?.detail || 'Connection failed'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <ChatContainer elevation={3}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              AI Assistant
            </Typography>
            <Chip 
              label="Online" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.8)', 
                color: 'white',
                height: 20,
                fontSize: '0.7rem'
              }} 
            />
          </Box>
        </Stack>
      </Box>

      <MessagesContainer>
        <List sx={{ p: 0 }}>
          {messages.map((message, index) => (
            <Fade in key={index} timeout={500}>
              <ListItem 
                sx={{ 
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Stack 
                  direction={message.role === 'user' ? 'row-reverse' : 'row'} 
                  spacing={1}
                  alignItems="flex-start"
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
                    }}
                  >
                    {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <Stack spacing={0.5}>
                    <MessageBubble isUser={message.role === 'user'}>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </MessageBubble>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        px: 1,
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Stack>
                </Stack>
              </ListItem>
            </Fade>
          ))}
          {loading && (
            <Fade in>
              <ListItem sx={{ justifyContent: 'flex-start' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <SmartToyIcon />
                  </Avatar>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'background.paper',
                    boxShadow: 2
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </ListItem>
            </Fade>
          )}
        </List>
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3
              }
            }}
          />
          <Button
            variant="contained"
            onClick={send}
            disabled={loading || !input.trim()}
            sx={{
              borderRadius: 3,
              minWidth: 56,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
              }
            }}
          >
            <SendIcon />
          </Button>
        </Stack>
      </InputContainer>
    </ChatContainer>
  );
};
