import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateCurrentUser: (user: User) => void;
  can: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  switchDemoUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Route to permission mappings
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard': 'dashboard.view',
  '/birthdays': 'birthdays.view',
  '/users': 'users.view',
  '/users/create': 'users.create',
  '/roles': 'roles.view',
  '/permissions': 'permissions.view',
  '/screen-permissions': 'permissions.view',
  '/reports': 'reports.view',
  '/logs': 'logs.view',
  '/settings': 'settings.view',
  '/api-playground': 'api.view',
  '/design-system': 'design-system.view',
  '/documentation': 'documentation.view',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token') || 'demo_token');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/auth/user');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch auth user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  }, []);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const switchDemoUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data);
      }
    } catch (err) {
      console.error('Failed to switch demo user', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Strict RBAC permission checker
  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // Administrator bypass
      if (user.roles?.includes('role-admin') || user.roles?.includes('admin')) {
        return true;
      }
      return user.permissions?.includes(permission) || false;
    },
    [user]
  );

  // Role membership checker
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user) return false;
      if (user.roles?.includes(roleName) || user.roles?.includes(`role-${roleName}`)) return true;
      return user.rolesDetails?.some((r) => r.name === roleName) || false;
    },
    [user]
  );

  // Screen permission protection validator
  const canAccessRoute = useCallback(
    (routePath: string): boolean => {
      const requiredPermission = ROUTE_PERMISSIONS[routePath];
      if (!requiredPermission) return true; // public or unrestricted authenticated route
      return can(requiredPermission);
    },
    [can]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateCurrentUser,
        can,
        hasRole,
        canAccessRoute,
        switchDemoUser,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
