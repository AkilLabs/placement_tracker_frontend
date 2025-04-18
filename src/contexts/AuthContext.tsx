import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginData, SignupData } from '../types';
import axios from 'axios';

// Define API base URL
const API_BASE_URL = 'https://backend-pqg1.onrender.com';

// Define the shape of our Context
interface AuthContextType {
  authState: AuthState;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error parsing stored user data', error);
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Error loading user data',
        });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (data: LoginData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Make a real API call to the login endpoint
      const response = await axios.post(`${API_BASE_URL}/login/`, data);
      
      const user: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      });
    }
  };

  const signup = async (data: SignupData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Check password match before sending to API
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Make a real API call to the signup endpoint
      const response = await axios.post(`${API_BASE_URL}/signup/`, {
        username: data.username,
        email: data.email,
        password: data.password
      });
      
      const user: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        error: error.response?.data?.error || 'Signup failed. Please try again.',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    });
  };

  const isAdmin = (): boolean => {
    return authState.user?.role === 'admin';
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    signup,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;