import React from 'react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const handleMicrosoftLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/login`;
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="app-title">
          <h1>AppHelix</h1>
        </div>
        <div className="login-card">
          <div className="login-header">
            <h1>Login</h1>
            <p>Welcome back! Please login to your account.</p>
          </div>
          <button onClick={handleMicrosoftLogin} className="login-button">
            Login with Microsoft
          </button>
          <div className="login-footer">
            <p>AppHelix Dashboard 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;