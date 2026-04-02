import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    _apply(data); return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    _apply(data); return data;
  };

  // Google login — sends the Google credential token to backend
  const googleLogin = async (googleToken) => {
    const { data } = await api.post('/auth/google', { token: googleToken });
    _apply(data); return data;
  };

  const logout = () => {
    setUser(null); setToken(null);
    window.__ecoverse_token__ = null;
  };

  const updateXp = (xpEarned) =>
    setUser(u => u ? { ...u, totalXp: (u.totalXp || 0) + xpEarned } : u);

  const updateUserProfile = (updates) =>
    setUser(u => u ? { ...u, ...updates } : u);

  const _apply = (data) => {
    window.__ecoverse_token__ = data.token;
    setToken(data.token);
    setUser({
      name:          data.name,
      email:         data.email,
      role:          data.role,
      totalXp:       data.totalXp       ?? 0,
      currentStreak: data.currentStreak ?? 0,
      longestStreak: data.longestStreak ?? 0,
      provider:      data.provider      ?? 'LOCAL',
      pictureUrl:    data.pictureUrl    ?? null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, googleLogin, logout, updateXp, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
