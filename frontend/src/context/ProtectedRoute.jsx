import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // ADMIN trying to access a USER-only page → redirect to admin panel
  if (!requiredRole && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Wrong role for a role-restricted page (e.g. USER trying /admin)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}