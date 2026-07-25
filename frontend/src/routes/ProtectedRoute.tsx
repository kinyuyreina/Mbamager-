import * as React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from '../components/common/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, restoreSession, currentUser } = useAuthStore();
  const location = useLocation();

  // Proactively try to restore the session from localStorage on mount
  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated;

  if (!isAuth) {
    // Save the intercepted location to redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
