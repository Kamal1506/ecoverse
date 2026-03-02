import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);   // { name, email, role, totalXp }
  const [token, setToken] = useState(null);   // JWT string — kept in memory only

  // ── Sync token to the axios interceptor's window variable ────────────────
  const storeToken = (t) => {
    window.__ecoverse_token__ = t;
    setToken(t);
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    storeToken(data.token);
    setUser({ name: data.name, email: data.email, role: data.role, totalXp: data.totalXp });
    return data;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    storeToken(data.token);
    setUser({ name: data.name, email: data.email, role: data.role, totalXp: data.totalXp });
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    window.__ecoverse_token__ = null;
    setToken(null);
    setUser(null);
  }, []);

  // ── Update XP after a quiz attempt (called by QuizPlay in Sprint 4) ──────
  const updateXp = useCallback((gained) => {
    setUser(prev => prev ? { ...prev, totalXp: prev.totalXp + gained } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, updateXp }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component instead of useContext(AuthContext)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}