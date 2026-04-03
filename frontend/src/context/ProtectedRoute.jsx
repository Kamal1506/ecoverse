import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem('ecoverse_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem('ecoverse_user');
    return null;
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuth();
  const storedUser = readStoredUser();
  const effectiveUser = user || storedUser;
  const effectiveToken = token || sessionStorage.getItem('ecoverse_token');

  // Not logged in -> go to login
  if (!effectiveUser && !effectiveToken) return <Navigate to="/login" replace />;

  // Auth is present but context has not hydrated yet.
  if (!effectiveUser) return null;

  // ADMIN trying to access a USER-only page -> redirect to admin panel
  if (!requiredRole && effectiveUser.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Wrong role for a role-restricted page (e.g. USER trying /admin)
  if (requiredRole && effectiveUser.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
