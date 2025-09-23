import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAxios } from '../hooks/useAxios';
import jwtDecode from 'jwt-decode';

interface AuthContextProps {
  token: string | null;
  user: any;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const axios = useAxios(token);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      setUser(jwtDecode(stored));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const resp = await axios.post('/auth/login', { username, password });
    const access = resp.data.access_token;
    localStorage.setItem('token', access);
    setToken(access);
    setUser(jwtDecode(access));
  };

  const register = async (username: string, email: string, password: string) => {
    await axios.post('/auth/register', { username, email, password });
    // Optionally auto-login after registration
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
