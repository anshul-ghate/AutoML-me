import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { z } from 'zod';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Alert, 
  Card, 
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import { logEvent, logError, logUserAction } from '../../services/analytics';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    const startTime = Date.now();
    
    try {
      setError('');
      
      logUserAction('login_attempt', {
        username: data.username
      });
      
      await login(data.username, data.password);
      
      const loginDuration = Date.now() - startTime;
      logEvent('login_success', {
        username: data.username,
        duration: loginDuration
      });
      
      window.location.href = '/';
    } catch (err: any) {
      const loginDuration = Date.now() - startTime;
      const errorMessage = err.response?.data?.detail || 'Login failed';
      
      setError(errorMessage);
      
      logEvent('login_failed', {
        username: data.username,
        error: errorMessage,
        duration: loginDuration,
        statusCode: err.response?.status
      });
      
      logError(err, 'login_form');
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography 
              variant="h3" 
              component="h1" 
              textAlign="center" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              🤖 AutoML
            </Typography>
            
            <Typography variant="h5" component="h2" textAlign="center" color="text.secondary">
              {t('login')} to Your Account
            </Typography>
          </Stack>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ mt: 3 }}>
              <TextField 
                fullWidth 
                label={t('username')}
                variant="outlined"
                {...register('username')} 
                error={!!formState.errors.username} 
                helperText={formState.errors.username?.message} 
                disabled={formState.isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <TextField 
                fullWidth 
                type="password" 
                label={t('password')}
                variant="outlined"
                {...register('password')} 
                error={!!formState.errors.password} 
                helperText={formState.errors.password?.message} 
                disabled={formState.isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={formState.isSubmitting}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {formState.isSubmitting ? 'Logging in...' : t('login')}
              </Button>
            </Stack>
          </form>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>
          
          <Stack spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                borderRadius: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Create New Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
