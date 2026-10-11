'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  organization_name?: string;
  org_id: string;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    organization_name?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'USR-DEMO-LEAD',
  name: 'Sarah Chen',
  email: 'sarah.recruiter@provenance.ai',
  role: 'recruiter',
  department: 'Platform Architecture & Distributed Systems',
  organization_name: 'Provenance Enterprise Corp',
  org_id: 'ORG-PROVENANCE',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('provenance_auth_user');
      const storedToken = localStorage.getItem('provenance_auth_token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        // Initialize with default demo lead profile for seamless instant experience
        setUser(DEFAULT_DEMO_USER);
        setToken('token-provenance-demo-lead');
        localStorage.setItem('provenance_auth_user', JSON.stringify(DEFAULT_DEMO_USER));
        localStorage.setItem('provenance_auth_token', 'token-provenance-demo-lead');
      }
    } catch (_) {
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.detail || 'Invalid email or password.' };
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('provenance_auth_user', JSON.stringify(data.user));
      localStorage.setItem('provenance_auth_token', data.token);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unable to connect to authentication gateway.' };
    }
  };

  const signup = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    organization_name?: string;
  }) => {
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.detail || 'Registration failed. Please check inputs.' };
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('provenance_auth_user', JSON.stringify(data.user));
      localStorage.setItem('provenance_auth_token', data.token);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unable to connect to registration gateway.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('provenance_auth_user');
    localStorage.removeItem('provenance_auth_token');
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updated };
      localStorage.setItem('provenance_auth_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
