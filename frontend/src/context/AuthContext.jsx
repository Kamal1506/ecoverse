import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  // ── Register ────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    _applyAuth(data);
    return data;
  };

  // ── Login ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    _applyAuth(data);
    return data;
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    window.__ecoverse_token__ = null;
  };

  // ── Update XP after quiz attempt — keeps HUD in sync ───────────────────
  const updateXp = (xpEarned) => {
    setUser(u => u ? { ...u, totalXp: (u.totalXp || 0) + xpEarned } : u);
  };

  // ── Internal: apply token + user from any auth response ─────────────────
  const _applyAuth = (data) => {
    window.__ecoverse_token__ = data.token;
    setToken(data.token);
    setUser({
      name:     data.name,
      email:    data.email,
      role:     data.role,
      totalXp:  data.totalXp ?? 0,
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, updateXp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);