import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await axios.post(`${API_URL}/auth/google`, { credential });
    if (res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
