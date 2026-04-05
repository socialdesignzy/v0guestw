import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Backend API configuration
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios to send cookies
  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      // Not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    // Fetch fresh user data from /auth/me to get all fields including trial_activated_at, payment_method, etc.
    const freshUserResponse = await axios.get(`${API}/auth/me`);
    setUser(freshUserResponse.data);
    return freshUserResponse.data; // Return the fresh user data with all fields
  };

  const register = async (userData) => {
    await axios.post(`${API}/auth/register`, userData);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (error) {
      console.error('Logout error', error);
    }
    setUser(null);
  };

  const activatePlan = async (activationKey) => {
    const response = await axios.post(`${API}/auth/redeem-key`, { key: activationKey });
    await fetchUser();
    return response.data; // Return the response for redirect with data
  };

  const hasActiveSubscription = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // Allow access for "active" or "cancelled" subscriptions if still within billing period
    if (user.subscription_status === 'active' || user.subscription_status === 'cancelled') {
      // Check if still within billing period
      if (user.plan_end_date) {
        const endDate = new Date(user.plan_end_date);
        const now = new Date();
        return endDate > now;
      }
      return user.subscription_status === 'active';
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, activatePlan, hasActiveSubscription, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
