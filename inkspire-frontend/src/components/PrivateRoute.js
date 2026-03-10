import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, token } = useAuth();

  if (!currentUser || (!token && token !== 'google-session')) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
