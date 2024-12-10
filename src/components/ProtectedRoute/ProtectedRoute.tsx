import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a spinner or loading state
    return (
      <div className="loading-container">
        <p>Loading...</p>
        {/* Optional: Add a spinner or custom loading animation */}
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the original route saved in the state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
