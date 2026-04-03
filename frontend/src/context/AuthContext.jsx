import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
const TOKEN_KEY = 'ecoverse_token';
const USER_KEY = 'ecoverse_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  });

  if (token) {
    window.__ecoverse_token__ = token;
  }

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
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const updateXp = (xpEarned) =>
    setUser(u => u ? { ...u, totalXp: (u.totalXp || 0) + xpEarned } : u);

  const updateUserProfile = (updates) =>
    setUser(u => u ? { ...u, ...updates } : u);

  const _apply = (data) => {
    const nextUser = {
      name:          data.name,
      email:         data.email,
      role:          data.role,
      totalXp:       data.totalXp       ?? 0,
      currentStreak: data.currentStreak ?? 0,
      longestStreak: data.longestStreak ?? 0,
      provider:      data.provider      ?? 'LOCAL',
      pictureUrl:    data.pictureUrl    ?? null,
    };
    window.__ecoverse_token__ = data.token;
    setToken(data.token);
    setUser(nextUser);
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, googleLogin, logout, updateXp, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
