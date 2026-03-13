import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HUD.css';

const XP_LEVELS = [0, 500, 1200, 2500, 4500, 7000];
const getLevel = (xp) => { for (let i = XP_LEVELS.length-1; i>=0; i--) if (xp >= XP_LEVELS[i]) return i+1; return 1; };
const getProgress = (xp) => {
  const lvl = getLevel(xp);
  if (lvl >= 6) return 100;
  return Math.min(100, Math.round(((xp - XP_LEVELS[lvl-1]) / (XP_LEVELS[lvl] - XP_LEVELS[lvl-1])) * 100));
};

export default function HUD({ streak }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const xp      = user?.totalXp ?? 0;
  const level   = getLevel(xp);
  const pct     = getProgress(xp);
  const isAdmin = user?.role === 'ADMIN';
  const s       = streak ?? user?.currentStreak ?? 0;
  const isActive = (p) => location.pathname === p;

  const LogoutIcon = () => (
    <svg className="hud-logout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10 17l1.4-1.4-2.6-2.6H20v-2H8.8l2.6-2.6L10 7l-5 5 5 5z" />
      <path d="M4 4h8v2H6v12h6v2H4V4z" />
    </svg>
  );

  return (
    <nav className="hud">
      <div className="hud-logo" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
        ECO<span>VERSE</span>
      </div>

      <div className="hud-nav">
        {isAdmin ? (
          <>
            <button className={`hud-tab${isActive('/admin') ? ' active' : ''}`} onClick={() => navigate('/admin')}>CONTROL PANEL</button>
            <button className={`hud-tab${isActive('/analytics') ? ' active' : ''}`} onClick={() => navigate('/analytics')}>ANALYTICS</button>
          </>
        ) : (
          <>
            <button className={`hud-tab${isActive('/dashboard') ? ' active' : ''}`} onClick={() => navigate('/dashboard')}>MISSIONS</button>
            <button className={`hud-tab${isActive('/leaderboard') ? ' active' : ''}`} onClick={() => navigate('/leaderboard')}>RANKINGS</button>
            <button className={`hud-tab${isActive('/profile') ? ' active' : ''}`} onClick={() => navigate('/profile')}>PROFILE</button>
          </>
        )}
      </div>

      <div className="hud-right">
        {s > 0 && (
          <div className="hud-streak" title={`${s} day streak!`}>
            <span className="hud-streak-icon" aria-hidden="true">{"\uD83D\uDD25"}</span>
            <span className="hud-streak-text">Day {s} streak</span>
          </div>
        )}
        <div className="hud-xp-wrap">
          <div className="hud-level">LVL <span className="hud-level-n">{level}</span></div>
          <div className="hud-xp-label">
            <div className="hud-xp-track">
              <div className="hud-xp-fill" style={{ width: `${pct}%` }} />
            </div>
            <span>{xp.toLocaleString()} XP</span>
          </div>
        </div>
        <button
          type="button"
          className="hud-logout"
          onClick={() => { logout(); navigate('/login'); }}
          title="Logout"
          aria-label="Logout">
          <LogoutIcon />
          <span className="hud-logout-text">LOGOUT</span>
        </button>
      </div>
    </nav>
  );
}
