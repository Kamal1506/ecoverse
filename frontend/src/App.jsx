import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';

// Sprint 2+ pages will be imported here as they're built
// import QuizPlay    from './pages/QuizPlay';
// import Result      from './pages/Result';
// import Leaderboard from './pages/Leaderboard';
// import AdminPanel  from './pages/admin/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* Global toast notifications — gaming style */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:  '#041A0D',
              color:       '#B8FFD8',
              border:      '1px solid rgba(0,255,136,0.25)',
              fontFamily:  "'Rajdhani', sans-serif",
              fontWeight:  600,
              fontSize:    '15px',
              letterSpacing: '0.5px',
            },
            success: {
              iconTheme: { primary: '#00FF88', secondary: '#041A0D' },
            },
            error: {
              iconTheme: { primary: '#FF2244', secondary: '#041A0D' },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected player routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Sprint 2+ routes (uncomment as you build) */}
          {/*
          <Route path="/quiz/:id" element={
            <ProtectedRoute><QuizPlay /></ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute><Result /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><Leaderboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>
          } />
          */}

          {/* Catch-all → redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}