import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';

// Sprint 1
import Login    from './pages/Login';
import Register from './pages/Register';

// Sprint 2 ✅
import Dashboard  from './pages/Dashboard';
import AdminPanel from './pages/admin/AdminPanel';

// Sprint 3+ (uncomment as you build)
// import CsvUpload   from './pages/admin/CsvUpload';
// import QuizPlay    from './pages/QuizPlay';
// import Result      from './pages/Result';
// import Leaderboard from './pages/Leaderboard';
// import Analytics   from './pages/admin/Analytics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:    '#041A0D',
              color:         '#B8FFD8',
              border:        '1px solid rgba(0,255,136,0.25)',
              fontFamily:    "'Rajdhani', sans-serif",
              fontWeight:    600,
              fontSize:      '15px',
              letterSpacing: '0.5px',
            },
            success: { iconTheme: { primary: '#00FF88', secondary: '#041A0D' } },
            error:   { iconTheme: { primary: '#FF2244', secondary: '#041A0D' } },
          }}
        />

        <Routes>
          {/* ── Public ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Player routes ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>
          } />

          {/* Sprint 3+ routes — uncomment as built */}
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
          <Route path="/admin/analytics" element={
            <ProtectedRoute requiredRole="ADMIN"><Analytics /></ProtectedRoute>
          } />
          */}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}