// src/components/OAuthSuccessPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // You can fetch user info or store token here if needed

    // Add a short delay before redirecting to dashboard
    const timer = setTimeout(() => {
      navigate('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Welcome back! Logging you in...</h2>
      <p>Please wait while we redirect you to the dashboard.</p>
    </div>
  );
}

export default OAuthSuccessPage;
