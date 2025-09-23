import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../../context/AuthContext';
import { z } from 'zod';
import { Button, TextField, Box, Typography } from '@mui/material';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Username" margin="normal" {...register('username')} error={!!formState.errors.username} helperText={formState.errors.username?.message} />
        <TextField fullWidth type="password" label="Password" margin="normal" {...register('password')} error={!!formState.errors.password} helperText={formState.errors.password?.message} />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={formState.isSubmitting}>Login</Button>
      </form>
    </Box>
  );
};
