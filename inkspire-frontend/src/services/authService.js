// src/services/authService.js

import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:8081/api/auth';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Attach token automatically if available
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AuthService methods

// Sign up (register) user
const signup = async (userData) => {
  try {
    const response = await axiosInstance.post('/register', userData);
    console.log('Signup response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response || error);
    throw error.response?.data || error.message || 'Registration failed';
  }
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', { email, password });
    const data = response.data;

    console.log('Login response data:', data);

    if (data.token) {
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        token: data.token
      };
      console.log('Storing user data:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error.message || 'Login failed';
  }
};

// Reset password
const resetPassword = async (email, newPassword) => {
  try {
    const response = await axiosInstance.post('/reset-password', { email, newPassword });
    return response.data; // Should return success message or true
  } catch (error) {
    console.error('Reset password error:', error.response || error);
    throw error.response?.data || error.message || 'Reset password failed';
  }
};

// Logout
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user from localStorage
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Update user profile (without changing password)
const updateUser = async (userData) => {
  try {
    const response = await axiosInstance.put('/profile', userData);
    if (response.data) {
      // Update local storage
      const currentUser = getCurrentUser();
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    console.error('Update user error:', error.response || error);
    throw error.response?.data || error.message || 'Profile update failed';
  }
};

// Separate update profile function (if needed differently)
const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error.response?.data || error);
    throw error.response?.data || { error: 'Failed to update profile' };
  }
};

const authService = {
  signup,
  login,
  resetPassword,
  logout,
  getCurrentUser,
  updateUser,
  updateProfile
};

export default authService;
