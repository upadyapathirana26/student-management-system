'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('sms_user');
    const storedToken = localStorage.getItem('sms_token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('sms_user');
        localStorage.removeItem('sms_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: Role) => {
    try {
      // 1. Call Real Backend Login API
      const response = await api.post('/auth/login', {
        email: email,
        passwordHash: password,
        role: role 
      });

      // 2. Validate Response
      if (!response.data) {
        throw new Error("No response data from server");
      }

      const { token, role: serverRole, email: serverEmail } = response.data;

      if (!token) {
        throw new Error("No token received");
      }

      // 3. Save Token and User Info
      const loggedInUser: User = {
        id: '1', 
        email: serverEmail,
        role: serverRole as Role,
        token: token
      };

      setUser(loggedInUser);
      localStorage.setItem('sms_user', JSON.stringify(loggedInUser));
      localStorage.setItem('sms_token', token);

      // 4. Set Authorization Header for all future Axios requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 5. Redirect based on Role
      if (serverRole === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/student-dashboard');
      }

    } catch (error: any) {
      console.error("Login failed", error);
      
      // Extract user-friendly error message
      const errorMessage = error.response?.data?.message 
                         || error.response?.data?.error 
                         || "Login failed! Please check your credentials.";
      
      alert(errorMessage);
      throw error; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sms_user');
    localStorage.removeItem('sms_token');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}