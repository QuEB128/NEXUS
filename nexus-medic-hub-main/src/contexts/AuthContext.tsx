import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/axiosConfig';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        const refreshTokenStored = localStorage.getItem('refresh_token');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Set default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Check if token is still valid by making a test request
          try {
            await api.get('/staff/me/profile');
          } catch (error: any) {
            if (error.response?.status === 401 && refreshTokenStored) {
              // Try to refresh token
              try {
                await refreshToken();
              } catch (refreshError) {
                // Refresh failed, clear auth
                clearAuth();
              }
            } else {
              clearAuth();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/auth/staff/login', {
        email,
        password
      });

      const { user: userData, access_token, refresh_token, expires_at } = response.data;

      // Store auth data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('expires_at', expires_at.toString());

      // Update state
      setToken(access_token);
      setUser(userData);

      // Set default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Login failed. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Call backend logout endpoint
      await api.post('/auth/staff/logout', {
        refresh_token: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if backend call fails
    } finally {
      clearAuth();
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/staff/refresh', {
        refresh_token: storedRefreshToken
      });

      const { access_token, refresh_token, expires_at } = response.data;

      // Update stored tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('expires_at', expires_at.toString());

      // Update state
      setToken(access_token);

      // Update Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      throw error;
    }
  };

  const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('expires_at');

    // Clear state
    setToken(null);
    setUser(null);

    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken
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