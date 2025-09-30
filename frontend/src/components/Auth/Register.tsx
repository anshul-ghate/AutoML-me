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

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    const startTime = Date.now();
    
    try {
      setError('');
      setSuccess('');
      
      logUserAction('register_attempt', {
        username: data.username,
        email: data.email
      });
      
      await registerUser(data.username, data.email, data.password);
      
      const registerDuration = Date.now() - startTime;
      logEvent('register_success', {
        username: data.username,
        email: data.email,
        duration: registerDuration
      });
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (err: any) {
      const registerDuration = Date.now() - startTime;
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      
      setError(errorMessage);
      
      logEvent('register_failed', {
        username: data.username,
        email: data.email,
        error: errorMessage,
        duration: registerDuration,
        statusCode: err.response?.status
      });
      
      logError(err, 'register_form');
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
              Create Your Account
            </Typography>
          </Stack>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {success}
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
                type="email"
                label={t('email')}
                variant="outlined"
                {...register('email')} 
                error={!!formState.errors.email} 
                helperText={formState.errors.email?.message} 
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
              
              <TextField 
                fullWidth 
                type="password" 
                label="Confirm Password"
                variant="outlined"
                {...register('confirmPassword')} 
                error={!!formState.errors.confirmPassword} 
                helperText={formState.errors.confirmPassword?.message} 
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
                {formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?
            </Typography>
            
            <Button
              component={Link}
              to="/login"
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
              Sign In to Existing Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
