import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const register = async (data: { name: string; email: string; password: string }): Promise<void> => {
    try {
      const response = await axios.post<{ user: User; token: string }>('https://issue-tracker-backend-3.onrender.com/api/auth/register', data);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  };

  const login = async (data: { email: string; password: string }): Promise<void> => {
    try {
      const response = await axios.post<{ user: User; token: string }>('https://issue-tracker-backend-3.onrender.com/api/auth/login', data);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 