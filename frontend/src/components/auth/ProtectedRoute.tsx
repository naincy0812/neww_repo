import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ component: React.FC, path: string, exact?: boolean }> = ({ component: Component, ...rest }) => {
  const isAuthenticated = document.cookie.includes('token=');

  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Component /> : <Navigate to="/login" replace />}
    />
  );
};

export default ProtectedRoute;
