import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import api from '../../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/genai/chat', {
        model_key: 'gpt-4o',
        messages: [...messages, userMsg]
      });

      const assistantText: string =
        response.data?.choices?.[0]?.message?.content ?? 'Error';
      const assistantMsg: Message = { role: 'assistant', content: assistantText };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Error: ' + (error.response?.data?.detail || error.message)
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
      <List ref={listRef} sx={{ maxHeight: 400, overflow: 'auto' }}>
        {messages.map((msg, i) => (
          <ListItem
            key={i}
            sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <ListItemText
              primary={msg.content}
              sx={{
                bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.200',
                p: 1,
                borderRadius: 1,
                maxWidth: '70%'
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box display="flex" mt={1}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={send}
          sx={{ ml: 1 }}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </Box>
    </Paper>
  );
};
