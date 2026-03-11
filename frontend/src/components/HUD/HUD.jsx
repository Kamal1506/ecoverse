import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HUD.css';

const XP_LEVELS = [0, 500, 1200, 2500, 4500, 7000];

function getLevel(xp) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) return i + 1;
  }
  return 1;
}

function getXpProgress(xp) {
  const lvl  = getLevel(xp);
  if (lvl >= 6) return 100;
  const curr = XP_LEVELS[lvl - 1];
  const next = XP_LEVELS[lvl];
  return Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100));
}

export default function HUD() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const xp       = user?.totalXp ?? 0;
  const level    = getLevel(xp);
  const progress = getXpProgress(xp);
  const isAdmin  = user?.role === 'ADMIN';

  const navTo = (path) => navigate(path);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="hud">
      {/* Logo */}
      <div className="hud-logo" onClick={() => navTo(isAdmin ? '/admin' : '/dashboard')}>
        ECO<span>VERSE</span>
      </div>

      {/* Nav links */}
      <div className="hud-nav">
        {isAdmin ? (
          <>
            <button
              className={`hud-tab${isActive('/admin') ? ' active' : ''}`}
              onClick={() => navTo('/admin')}>
              CONTROL PANEL
            </button>
            <button
              className={`hud-tab${isActive('/analytics') ? ' active' : ''}`}
              onClick={() => navTo('/analytics')}>
              ANALYTICS
            </button>
            <button
              className={`hud-tab${isActive('/leaderboard') ? ' active' : ''}`}
              onClick={() => navTo('/leaderboard')}>
              RANKINGS
            </button>
          </>
        ) : (
          <>
            <button
              className={`hud-tab${isActive('/dashboard') ? ' active' : ''}`}
              onClick={() => navTo('/dashboard')}>
              MISSIONS
            </button>
            <button
              className={`hud-tab${isActive('/leaderboard') ? ' active' : ''}`}
              onClick={() => navTo('/leaderboard')}>
              RANKINGS
            </button>
          </>
        )}
      </div>

      {/* Right side: XP bar + level + logout */}
      <div className="hud-right">
        <div className="hud-xp-wrap">
          <div className="hud-xp-label">
            <span>LVL {level}</span>
            <span className="hud-score">{xp.toLocaleString()} XP</span>
          </div>
          <div className="hud-xp-track" aria-label="XP progress">
            <div className="hud-xp-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className="hud-logout" onClick={handleLogout} title="Logout">LOGOUT</button>
      </div>
    </nav>
  );
}
