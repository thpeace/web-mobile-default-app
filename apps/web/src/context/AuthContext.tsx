'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@app/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          api.setToken(storedToken);
          // Refresh profile in background
          const profile = await api.getProfile();
          setUser(profile);
          localStorage.setItem('auth_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const authData = await api.login({ email, password });
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    api.setToken(authData.token);
    setUser(authData.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    api.setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
