import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (mobile) => {
    const response = await axios.post(`${API}/auth/send-otp`, { mobile });
    return response.data;
  };

  const verifyOTP = async (mobile, otp) => {
    const response = await axios.post(`${API}/auth/verify-otp`, { mobile, otp });
    if (response.data.success) {
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(response.data.user);
    }
    return response.data;
  };

  const updateProfile = async (profileData) => {
    const response = await axios.put(`${API}/auth/profile`, profileData);
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      sendOTP,
      verifyOTP,
      updateProfile,
      logout,
      refreshUser: fetchUser
    }}>
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
