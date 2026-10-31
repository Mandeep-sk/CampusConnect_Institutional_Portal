import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying authentication session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized role, redirect to their home dashboard
    const defaultRoute =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'faculty'
        ? '/faculty/dashboard'
        : '/student/dashboard';

    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
