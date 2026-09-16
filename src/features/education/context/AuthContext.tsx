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
  login: (userData: User, legacyToken?: string) => void;
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
    // Remove credentials left by the pre-BFF education login implementation.
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_password');

    const savedUser = localStorage.getItem('user');
    let parsedUser: User | null = null;
    try {
      parsedUser = savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Loi parse user:', error);
      localStorage.removeItem('user');
    }

    const mockMode = process.env.NEXT_PUBLIC_AUTH_MOCK === 'true';
    if (mockMode && parsedUser?.permissions?.includes('demo')) {
      setUser(parsedUser);
      setIsLoading(false);
      return;
    }

    authMe()
      .then((response: any) => {
        const freshUser = toUser(response?.data || response, parsedUser);
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (userData: User, _legacyToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('remember_password');
    document.cookie = 'user-role=; path=/; max-age=0; SameSite=Lax';
    void fetch('/api/education-auth/session', {
      method: 'DELETE',
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => undefined);
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
