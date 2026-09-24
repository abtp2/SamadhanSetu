import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved session on application start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUserStr = await AsyncStorage.getItem('user');

        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setToken(savedToken);
          setUser(parsedUser);

          // Verify token validity with backend
          try {
            const meRes = await mobileApi.get('/auth/me');
            if (meRes.success && meRes.user) {
              setUser(meRes.user);
              await AsyncStorage.setItem('user', JSON.stringify(meRes.user));
            }
          } catch (verifyErr) {
            // If token explicitly expired or invalid (401), clear session
            if (verifyErr.message?.includes('401') || verifyErr.message?.includes('expired')) {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.warn('Error loading mobile session:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Real user login against MongoDB Atlas
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const res = await mobileApi.post('/auth/login', {
      email: email.trim(),
      password,
    });

    if (res.success && res.token && res.user) {
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }

    throw new Error(res.message || 'Login failed. Please check credentials.');
  };

  // Real user registration against MongoDB Atlas
  const register = async (userData) => {
    const { name, email, password, role, district, universityName, organizationName, otp } = userData;

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'citizen',
      district: district || 'Ranchi',
      state: 'Jharkhand',
      universityName: universityName?.trim() || '',
      organizationName: organizationName?.trim() || '',
      otp: otp ? otp.trim() : undefined,
    };

    const res = await mobileApi.post('/auth/register', payload);

    if (res.success && res.token && res.user) {
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }

    throw new Error(res.message || 'Registration failed.');
  };

  // Log out current user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (_) {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
