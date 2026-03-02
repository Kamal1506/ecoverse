import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any route that requires authentication
// Usage: <Route element={<ProtectedRoute />}> ... </Route>
export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // Role check (e.g. admin-only pages)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}