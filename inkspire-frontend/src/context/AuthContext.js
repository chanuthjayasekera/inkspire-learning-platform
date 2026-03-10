import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const res = await fetch('http://localhost:8081/api/auth/verify', {
            headers: { Authorization: `Bearer ${storedToken}` },
            credentials: 'include'
          });
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        }

        // Check Google session only if no local token
        const googleRes = await fetch('http://localhost:8081/api/auth/google-user', {
          credentials: 'include'
        });
        if (googleRes.ok) {
          const googleUser = await googleRes.json();
          setCurrentUser(googleUser);
          setToken('google-session');
        } else {
          // No active session — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setCurrentUser(response);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  };

  const signup = async (signupData) => {
    const res = await fetch('http://localhost:8081/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Signup failed');
    }
    return res.json();
  };

  const resetPassword = async (email, newPassword) => {
    const res = await fetch('http://localhost:8081/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to reset password');
    }
    return true;
  };

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:8081/login/oauth2/authorization/google';
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, signup, resetPassword, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
