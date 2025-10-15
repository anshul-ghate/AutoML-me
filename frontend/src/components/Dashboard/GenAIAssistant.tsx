import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  Fade,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
  ModelTraining as ModelTrainingIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { useTheme, alpha, keyframes } from '@mui/material/styles';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  insights?: AIInsight[];
  recommendations?: AIRecommendation[];
  isTyping?: boolean;
}

interface AIInsight {
  type: 'performance' | 'data' | 'market' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  implementationTime: string;
  category: 'model' | 'data' | 'business' | 'technical';
}

interface GenAIAssistantProps {
  context?: {
    currentProject?: any;
    modelMetrics?: any;
    dataProfile?: any;
  };
}

const typingAnimation = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
`;

const generateAIResponse = (userMessage: string, context?: any): AIMessage => {
  const responses = [
    {
      content: "Based on your current model performance, I recommend implementing ensemble methods to boost accuracy by 2-5%. This would involve combining your Random Forest with a Gradient Boosting model.",
      insights: [
        {
          type: 'performance' as const,
          title: 'Model Accuracy Improvement',
          description: 'Current accuracy of 87.5% can be improved to 90-92% using ensemble methods',
          confidence: 0.85,
          actionable: true
        },
        {
          type: 'optimization' as const,
          title: 'Feature Selection Opportunity',
          description: 'Removing 15% of low-importance features could speed up training by 30%',
          confidence: 0.78,
          actionable: true
        }
      ],
      recommendations: [
        {
          id: '1',
          title: 'Implement Ensemble Method',
          description: 'Combine Random Forest with XGBoost for better predictions',
          priority: 'high' as const,
          estimatedImpact: '+3-5% accuracy',
          implementationTime: '2-3 hours',
          category: 'model' as const
        }
      ]
    },
    {
      content: "I've analyzed current market trends for your industry. Consumer behavior patterns show increased digital engagement, which should be factored into your model features.",
      insights: [
        {
          type: 'market' as const,
          title: 'Market Trend Analysis',
          description: 'Digital engagement metrics show 40% increase in Q4 2024',
          confidence: 0.92,
          actionable: true
        }
      ]
    },
    {
      content: "Your data quality looks good! However, I notice potential data drift in the last 30 days. Consider retraining with recent data to maintain model performance.",
      insights: [
        {
          type: 'data' as const,
          title: 'Data Drift Detection',
          description: 'Statistical distribution has shifted by 12% in recent samples',
          confidence: 0.88,
          actionable: true
        }
      ]
    }
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    id: (Date.now() + 1).toString(),
    type: 'assistant',
    content: randomResponse.content,
    timestamp: new Date(),
    suggestions: ["Tell me more", "Show implementation steps", "Analyze other models", "Export insights"],
    insights: randomResponse.insights,
    recommendations: randomResponse.recommendations
  };
};

export const GenAIAssistant: React.FC<GenAIAssistantProps> = ({ context }) => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hello! I'm your AI-powered AutoML assistant. I can help you optimize models, analyze market trends, and provide personalized recommendations based on your data and business context. What would you like to explore?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my current model performance",
        "Suggest feature improvements",
        "Show market trend insights",
        "Optimize hyperparameters"
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage, context);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUpIcon />;
      case 'data': return <DataUsageIcon />;
      case 'market': return <AssessmentIcon />;
      case 'optimization': return <SpeedIcon />;
      default: return <InsightsIcon />;
    }
  };

  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'model': return <ModelTrainingIcon />;
      case 'data': return <DataUsageIcon />;
      case 'business': return <TrendingUpIcon />;
      case 'technical': return <SpeedIcon />;
      default: return <RecommendIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {messages.map((message) => (
            <Fade key={message.id} in timeout={500}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Box sx={{ maxWidth: '80%' }}>
                  {message.type === 'assistant' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32,
                          mr: 1
                        }}
                      >
                        <AIIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        AI Assistant • {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      border: message.type === 'assistant' ? 1 : 0,
                      borderColor: 'divider',
                      boxShadow: message.type === 'user' ? theme.shadows[2] : 'none'
                    }}
                  >
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                  </Paper>

                  {/* AI Insights */}
                  {message.insights && message.insights.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        🧠 AI Insights
                      </Typography>
                      <Stack spacing={1}>
                        {message.insights.map((insight, idx) => (
                          <Card
                            key={idx}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: 'info.main',
                                    width: 32,
                                    height: 32,
                                    mr: 1.5
                                  }}
                                >
                                  {getInsightIcon(insight.type)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {insight.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {insight.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={`${(insight.confidence * 100).toFixed(0)}% Confidence`}
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                    {insight.actionable && (
                                      <Chip
                                        label="Actionable"
                                        size="small"
                                        color="success"
                                        variant="filled"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* AI Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        💡 Recommendations
                      </Typography>
                      <Stack spacing={1}>
                        {message.recommendations.map((rec) => (
                          <Card
                            key={rec.id}
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.main',
                                    width: 32,
                                    height: 32,
                                    mr: 1.5
                                  }}
                                >
                                  {getRecommendationIcon(rec.category)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                                      {rec.title}
                                    </Typography>
                                    <Chip
                                      label={rec.priority}
                                      size="small"
                                      color={getPriorityColor(rec.priority) as any}
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {rec.description}
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Chip
                                      label={`Impact: ${rec.estimatedImpact}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                                    />
                                    <Chip
                                      label={`Time: ${rec.implementationTime}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Stack>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Quick Suggestions */}
                  {message.suggestions && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.suggestions.map((suggestion, idx) => (
                        <Chip
                          key={idx}
                          label={suggestion}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderColor: theme.palette.primary.main
                            }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Fade>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Fade in timeout={300}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32,
                      mr: 1
                    }}
                  >
                    <AIIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    AI Assistant is thinking...
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    ml: 1
                  }}
                >
                  <Stack direction="row" spacing={0.5}>
                    {[0, 1, 2].map((dot) => (
                      <Box
                        key={dot}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          animation: `${typingAnimation} 1.4s infinite ease-in-out`,
                          animationDelay: `${dot * 0.16}s`
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Fade>
          )}

          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Enhanced Input Area */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          boxShadow: 'none',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Stack spacing={2}>
          {/* Quick Actions */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={() => handleSuggestionClick("Analyze my current model performance")}
              sx={{ borderRadius: 2 }}
            >
              Model Analysis
            </Button>
            <Button
              size="small"
              startIcon={<TrendingUpIcon />}
              onClick={() => handleSuggestionClick("Show market trend insights")}
              sx={{ borderRadius: 2 }}
            >
              Market Trends
            </Button>
            <Button
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleSuggestionClick("Suggest optimization strategies")}
              sx={{ borderRadius: 2 }}
            >
              Optimize
            </Button>
          </Stack>

          {/* Message Input */}
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth
              placeholder="Ask me anything about your ML models, data, or market insights..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              multiline
              maxRows={4}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper'
                }
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isTyping}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default GenAIAssistant;