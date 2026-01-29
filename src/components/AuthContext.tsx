import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'super-admin';

interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  employeeId?: string;
}

interface ManagedUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  addUser: (data: Omit<ManagedUser, 'id'>) => void;
  updateUser: (id: string, data: Partial<Omit<ManagedUser, 'password'>>) => void;
  deleteUser: (id: string) => void;
  changePassword: (id: string, currentPassword: string, newPassword: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: ManagedUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    name: 'System Admin',
    email: 'admin@hr-portal.com',
    role: 'admin',
    department: 'Management',
    avatar: '',
    password: 'admin123'
  },
  {
    id: 'user-2',
    username: 'hr_manager',
    name: 'HR Manager',
    email: 'hr@hr-portal.com',
    role: 'hr',
    department: 'Human Resources',
    avatar: '',
    password: 'hr123456'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    const stored = localStorage.getItem('managedUsers');
    if (stored) {
      try {
        return JSON.parse(stored) as ManagedUser[];
      } catch (err) {
        localStorage.removeItem('managedUsers');
      }
    }
    return defaultUsers;
  });

  // Load user and token from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('managedUsers', JSON.stringify(managedUsers));
  }, [managedUsers]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      
      const userData: User = {
        id: response.id,
        username: response.username,
        name: response.name || response.username,
        email: response.email,
        role: response.role,
        employeeId: response.employeeId,
      };

      setUser(userData);
      setToken(response.token);
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', response.token);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      setIsLoading(false);
    }
  };

  const addUser = (data: Omit<ManagedUser, 'id'>) => {
    const newUser: ManagedUser = {
      ...data,
      id: `user-${Date.now()}`,
    };
    setManagedUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<Omit<ManagedUser, 'password'>>) => {
    setManagedUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...data } : u))
    );
  };

  const deleteUser = (id: string) => {
    setManagedUsers(prev => prev.filter(u => u.id !== id));
  };

  const changePassword = (id: string, currentPassword: string, newPassword: string) => {
    let success = false;
    setManagedUsers(prev =>
      prev.map(u => {
        if (u.id !== id) return u;
        if (u.password !== currentPassword) return u;
        success = true;
        return { ...u, password: newPassword };
      })
    );
    return success;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        users: managedUsers.map(({ password, ...rest }) => rest),
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
