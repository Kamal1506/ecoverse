import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './context/ProtectedRoute';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import QuizPlay   from './pages/QuizPlay';
import Result     from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/admin/AdminPanel';
import Analytics  from './pages/admin/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0a1a0f',
              color: '#e0ffe8',
              border: '1px solid rgba(0,255,136,0.2)',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.5px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Player routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/quiz/:id" element={
            <ProtectedRoute><QuizPlay /></ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute><Result /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><Leaderboard /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="ADMIN"><Analytics /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}