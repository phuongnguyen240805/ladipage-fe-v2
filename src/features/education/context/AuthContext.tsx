'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authMe } from '@/features/education/api/auth';

interface User {
  role: string;
  fullName: string;
  email?: string;
  username?: string;
  id?: string;
  avatarUrl?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeRole(roles?: string[], fallback = 'student') {
  return (roles?.[0] || fallback).toLowerCase().replace(/^role_/, '');
}

function toUser(data: any, previous?: User | null): User {
  const roles = data?.roles || previous?.roles || [];

  return {
    role: normalizeRole(roles, previous?.role || 'student'),
    fullName: data?.fullName || data?.username || previous?.fullName || 'Người dùng',
    username: data?.username || previous?.username,
    email: data?.email || data?.username || previous?.email,
    id: data?.employeeId || data?.id || previous?.id,
    avatarUrl: data && Object.prototype.hasOwnProperty.call(data, 'avatarUrl') ? data.avatarUrl : previous?.avatarUrl,
    roles,
    permissions: data?.permissions || previous?.permissions || [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');

    if (!savedUser || !savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      authMe()
        .then((response: any) => {
          const freshUser = toUser(response?.data || response, parsedUser);
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Keep the cached user when /me is unavailable.
        })
        .finally(() => setIsLoading(false));
    } catch (error) {
      console.error('Loi parse user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    const response: any = await authMe();
    const freshUser = toUser(response?.data || response, user);
    setUser(freshUser);
    localStorage.setItem('user', JSON.stringify(freshUser));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
