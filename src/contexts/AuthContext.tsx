import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types/user.type';
import api from '../config/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error: any) {
      console.error('Error loading user profile:', error);

      if (error?.response?.status === 401) {
        // token refresh flow in api interceptor may already have run.
        // if it still fails, clear auth state.
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // refreshUser can be called externally (e.g. after login) to re-fetch the
  // current user without triggering the isLoading spinner on the whole app.
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error: any) {
      console.error('Error refreshing user profile:', error);

      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
