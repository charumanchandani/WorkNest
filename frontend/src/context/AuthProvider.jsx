import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend HttpOnly cookie on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle user login
  const login = async ({ email, password }) => {
    const res = await authService.login({ email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  // Handle user registration
  const register = async ({ name, email, password }) => {
    const res = await authService.register({ name, email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  // Handle user logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
