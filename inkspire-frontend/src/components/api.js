import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No JWT token found in localStorage');
  }
  return config;
});

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    console.log('getAllUsers response:', response.data);
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid users data format');
    }
    return response;
  } catch (error) {
    console.error('getAllUsers error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    console.log(`followUser(${userId}) response:`, response.data);
    return response;
  } catch (error) {
    console.error(`followUser(${userId}) error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/unfollow`);
    console.log(`unfollowUser(${userId}) response:`, response.data);
    return response;
  } catch (error) {
    console.error(`unfollowUser(${userId}) error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getFollowedUsersPlans = async () => {
  try {
    const response = await api.get('/learning-plans/followed');
    console.log('getFollowedUsersPlans response:', response.data);
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid plans data format');
    }
    return response;
  } catch (error) {
    console.error('getFollowedUsersPlans error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};