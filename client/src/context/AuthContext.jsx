import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken } from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || null);
  const [loading, setLoading] = useState(true);

  // Initial Auth Hydration
  useEffect(() => {
    const hydrateUser = async () => {
      const storedRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken');

      if (!storedRole || !token) {
        setLoading(false);
        return;
      }

      try {
        const endpoint = storedRole === 'company' ? '/auth/company/me' : '/auth/candidate/me';
        const { data } = await api.get(endpoint);
        setUser(data.data.user);
        setRole(storedRole);
      } catch (err) {
        console.warn('Auth hydration error:', err.message);
        setAccessToken(null);
        localStorage.removeItem('userRole');
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const loginCandidate = async (email, password) => {
    try {
      const { data } = await api.post('/auth/candidate/login', { email, password });
      const { user: userData, accessToken } = data.data;
      setAccessToken(accessToken);
      localStorage.setItem('userRole', 'candidate');
      setUser(userData);
      setRole('candidate');
      toast.success('Welcome back, ' + userData.fullName + '!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to log in';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const loginCompany = async (email, password) => {
    try {
      const { data } = await api.post('/auth/company/login', { email, password });
      const { user: userData, accessToken } = data.data;
      setAccessToken(accessToken);
      localStorage.setItem('userRole', 'company');
      setUser(userData);
      setRole('company');
      toast.success('Welcome back, ' + userData.companyName + '!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to log in';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      const endpoint = role === 'company' ? '/auth/company/logout' : '/auth/candidate/logout';
      await api.post(endpoint).catch(() => {});
    } finally {
      setAccessToken(null);
      localStorage.removeItem('userRole');
      setUser(null);
      setRole(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
        loginCandidate,
        loginCompany,
        logout,
        setUser,
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
