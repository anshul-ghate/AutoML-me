import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom'; // Added
import { AuthContext } from '../../context/AuthContext';
import { z } from 'zod';
import {
  Button,
  TextField,
  Box,
  Typography,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Added
  const [error, setError] = React.useState(''); // Added
  
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.username, data.password);
      navigate('/'); // Fixed: Use navigate instead of window.location
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>
        Login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          {...register('username')}
          error={!!formState.errors.username}
          helperText={formState.errors.username?.message}
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          {...register('password')}
          error={!!formState.errors.password}
          helperText={formState.errors.password?.message}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <Typography align="center" mt={2}>
        <Link component={RouterLink} to="/register">
          Don't have an account? Register
        </Link>
      </Typography>
    </Box>
  );
};
