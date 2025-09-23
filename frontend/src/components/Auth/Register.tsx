import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom'; // Added
import { AuthContext } from '../../context/AuthContext';
import { z } from 'zod';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate(); // Added
  const [error, setError] = React.useState(''); // Added
  
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser(data.username, data.email, data.password);
      navigate('/'); // Fixed: Use navigate instead of window.location
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
          label="Email" 
          margin="normal" 
          {...register('email')} 
          error={!!formState.errors.email} 
          helperText={formState.errors.email?.message} 
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
          sx={{ mt: 2 }}
        >
          {formState.isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Box>
  );
};
