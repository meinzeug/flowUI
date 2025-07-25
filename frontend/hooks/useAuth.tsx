import React, { createContext, useContext, useEffect, useState } from 'react';
import { wsService } from '../WebSocketService';

interface AuthContextType {
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    wsService.setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return originalFetch(input, { ...init, headers });
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
