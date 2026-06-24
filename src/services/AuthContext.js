import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api';
import { connectSocket, disconnectSocket } from './socket';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('rat_token');
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          if (res.data.success) {
            setAdmin(res.data.admin);
          }
        })
        .catch(() => {
          localStorage.removeItem('rat_token');
          localStorage.removeItem('rat_admin');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await authAPI.login(email, password);
      if (res.data.success) {
        localStorage.setItem('rat_token', res.data.token);
        localStorage.setItem('rat_admin', JSON.stringify(res.data.admin));
        setAdmin(res.data.admin);
        // Connect to WebSocket for real-time updates
        connectSocket(res.data.token);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('rat_token');
    localStorage.removeItem('rat_admin');
    setAdmin(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ admin, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

