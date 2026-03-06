import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './HUD.css';

const XP_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000];

export default function HUD() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const level    = XP_THRESHOLDS.findIndex((t, i) =>
    user.totalXp >= t && (i === XP_THRESHOLDS.length - 1 || user.totalXp < XP_THRESHOLDS[i + 1])
  ) + 1;
  const xpCurrent = user.totalXp - (XP_THRESHOLDS[level - 1] || 0);
  const xpNeeded  = (XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1]) - (XP_THRESHOLDS[level - 1] || 0);
  const xpPct     = Math.min((xpCurrent / xpNeeded) * 100, 100);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="hud">
      {/* Logo */}
      <div className="hud-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        ECO<span>VERSE</span>
      </div>

      {/* Nav tabs */}
      <div className="hud-nav">
        {user.role === 'USER' && (
          <>
            <button className={`hud-tab${isActive('/dashboard') ? ' active' : ''}`}
              onClick={() => navigate('/dashboard')}>MISSIONS</button>
            <button className={`hud-tab${isActive('/leaderboard') ? ' active' : ''}`}
              onClick={() => navigate('/leaderboard')}>RANKINGS</button>
          </>
        )}
        {user.role === 'ADMIN' && (
          <>
            <button className={`hud-tab${isActive('/admin') ? ' active' : ''}`}
              onClick={() => navigate('/admin')}>CONTROL PANEL</button>
          </>
        )}
      </div>

      {/* Right side: XP bar + score + logout */}
      <div className="hud-right">
        <div className="hud-xp-wrap">
          <div className="hud-xp-label">
            <span className="hud-font" style={{ fontSize: 10, letterSpacing: 2 }}>
              LVL <span style={{ color: 'var(--green)' }}>{level}</span>
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
              {user.totalXp} XP
            </span>
          </div>
          <div className="hud-xp-track">
            <div className="hud-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className="hud-score">
          ⬡ {user.totalXp?.toLocaleString()}
        </div>

        <button className="hud-logout" onClick={handleLogout} title="Logout">
          ⏏
        </button>
      </div>
    </nav>
  );
}