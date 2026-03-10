import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // New state for success messages

  const showError = (message) => {
    setError(message);
    setSuccess(''); // Clear success message if an error occurs
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError(''); // Clear error message if success occurs
  };

  const clearNotification = () => {
    setError('');
    setSuccess('');
  };

  return (
    <NotificationContext.Provider value={{ error, success, showError, showSuccess, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}