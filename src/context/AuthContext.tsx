import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { api, User } from '@/services/api';

interface JwtPayload {
  id: number;
  email: string;
  role: User['role'];
  exp: number;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'client' | 'provider') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('jwt_token');
        if (stored) {
          const decoded = jwtDecode<JwtPayload>(stored);
          if (decoded.exp * 1000 > Date.now()) {
            setToken(stored);
            setUser({ id: decoded.id, email: decoded.email, role: decoded.role, name: '' });
            const res = await api.get('/auth/me');
            setUser(res.data.usuario);
          } else {
            await SecureStore.deleteItemAsync('jwt_token');
          }
        }
      } catch {
        await SecureStore.deleteItemAsync('jwt_token');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, usuario } = res.data;
    await SecureStore.setItemAsync('jwt_token', t);
    setToken(t);
    setUser(usuario);
  }

  async function register(name: string, email: string, password: string, role: 'client' | 'provider') {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token: t, usuario } = res.data;
    await SecureStore.setItemAsync('jwt_token', t);
    setToken(t);
    setUser(usuario);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('jwt_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}
