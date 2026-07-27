import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken } from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || null);
  const [loading, setLoading] = useState(true);

  const hydratedRef = React.useRef(false);

  // Initial Auth Hydration
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const hydrateUser = async () => {
      const storedRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken');

      if (!storedRole || !token) {
        setLoading(false);
        return;
      }

      if (storedRole === 'admin') {
        setUser({
          _id: 'admin-1',
          fullName: 'Super Administrator',
          email: 'admin@skillbridge.ai',
          role: 'admin',
        });
        setRole('admin');
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

  const loginAdmin = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Admin credentials required');
      }
      const adminUser = {
        _id: 'admin-1',
        fullName: 'System Administrator',
        email: email,
        role: 'admin',
      };
      const token = 'admin-session-token-' + Date.now();
      setAccessToken(token);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userRole', 'admin');
      setUser(adminUser);
      setRole('admin');
      toast.success('Authenticated as System Administrator');
      return adminUser;
    } catch (err) {
      toast.error('Invalid administrator credentials');
      throw new Error('Invalid administrator credentials');
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : userData));
  };

  const refreshUser = async () => {
    const storedRole = localStorage.getItem('userRole') || role;
    if (!storedRole || storedRole === 'admin') return user;

    try {
      const endpoint = storedRole === 'company' ? '/auth/company/me' : '/auth/candidate/me';
      const { data } = await api.get(endpoint);
      const freshUser = data.data?.user || data.data || data.user;
      if (freshUser) {
        setUser(freshUser);
        return freshUser;
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
    return user;
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
        loginAdmin,
        logout,
        setUser,
        updateUser,
        refreshUser,
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
