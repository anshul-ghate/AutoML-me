import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import axios from '../../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    const response = await axios.post('/genai/chat', {
      model_key: 'gpt-4o',
      messages: [...messages, userMsg]
    });
    const assistantText = response.data.choices?.[0]?.message?.content || 'Error';
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: assistantText }]);
  };

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  return (
    <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
      <List ref={listRef}>
        {messages.map((msg, i) => (
          <ListItem key={i} sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <ListItemText 
              primary={msg.content} 
              sx={{ bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.200', p:1, borderRadius:1 }}
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
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && send()} 
        />
        <Button variant="contained" onClick={send} sx={{ ml:1 }}>Send</Button>
      </Box>
    </Paper>
  );
};
