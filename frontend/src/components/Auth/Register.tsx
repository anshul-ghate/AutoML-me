import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '../../context/AuthContext';
import { z } from 'zod';
import { Button, TextField, Box, Typography } from '@mui/material';

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.username, data.email, data.password);
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>Register</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField fullWidth label="Username" margin="normal" {...register('username')} error={!!formState.errors.username} helperText={formState.errors.username?.message} />
        <TextField fullWidth label="Email" margin="normal" {...register('email')} error={!!formState.errors.email} helperText={formState.errors.email?.message} />
        <TextField fullWidth type="password" label="Password" margin="normal" {...register('password')} error={!!formState.errors.password} helperText={formState.errors.password?.message} />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={formState.isSubmitting}>Register</Button>
      </form>
    </Box>
  );
};
