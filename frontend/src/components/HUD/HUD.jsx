import { useEffect, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const xp      = user?.totalXp ?? 0;
  const level   = getLevel(xp);
  const pct     = getProgress(xp);
  const isAdmin = user?.role === 'ADMIN';
  const s       = streak ?? user?.currentStreak ?? 0;
  const isActive = (p) => location.pathname === p;
  const navItems = isAdmin
    ? [
      { label: 'CONTROL PANEL', path: '/admin' },
      { label: 'ANALYTICS', path: '/analytics' },
    ]
    : [
      { label: 'MISSIONS', path: '/dashboard' },
      { label: 'RANKINGS', path: '/leaderboard' },
      { label: 'PROFILE', path: '/profile' },
    ];

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 769) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const LogoutIcon = () => (
    <svg className="hud-logout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10 17l1.4-1.4-2.6-2.6H20v-2H8.8l2.6-2.6L10 7l-5 5 5 5z" />
      <path d="M4 4h8v2H6v12h6v2H4V4z" />
    </svg>
  );

  const MenuIcon = () => (
    <svg className="hud-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  );

  return (
    <nav className={`hud${menuOpen ? ' menu-open' : ''}`}>
      <div className="hud-logo" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
        ECO<span>VERSE</span>
      </div>

      <div className="hud-mobile-meta" aria-label={`Level ${level}, ${xp.toLocaleString()} XP`}>
        <div className="hud-level">LVL <span className="hud-level-n">{level}</span></div>
        <div className="hud-xp-label">
          <div className="hud-xp-track">
            <progress className="hud-xp-fill" max="100" value={pct} />
          </div>
          <span>{xp.toLocaleString()} XP</span>
        </div>
      </div>

      <button
        type="button"
        className="hud-menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}>
        <MenuIcon />
      </button>

      <div className={`hud-content${menuOpen ? ' open' : ''}`}>
        <div className="hud-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`hud-tab${isActive(item.path) ? ' active' : ''}`}
              onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
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
                <progress className="hud-xp-fill" max="100" value={pct} />
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
      </div>
    </nav>
  );
}
