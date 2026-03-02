import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: 24,
      fontFamily: 'var(--font-hud)',
      textAlign: 'center',
    }}>
      {/* Sprint 1 placeholder — replaced with full Dashboard in Sprint 2 */}
      <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        // SPRINT 1 SUCCESS
      </div>

      <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--green)',
        textShadow: '0 0 30px var(--green)' }}>
        MISSION<br/>CONTROL
      </div>

      <div style={{ fontSize: 15, color: 'var(--text-dim)', letterSpacing: 1, lineHeight: 1.8 }}>
        Welcome, <span style={{ color: 'var(--cyan)' }}>{user?.name}</span><br />
        Role: <span style={{ color: 'var(--yellow)' }}>{user?.role}</span><br />
        XP: <span style={{ color: 'var(--green)' }}>{user?.totalXp}</span>
      </div>

      <div style={{
        background: 'rgba(0,255,136,0.04)',
        border: '1px solid var(--border)',
        padding: '16px 24px',
        color: 'var(--text-dim)',
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
        letterSpacing: 1,
        maxWidth: 380,
      }}>
        ✓ JWT authentication working<br />
        ✓ Role-based access active<br />
        ✓ Spring Boot + React connected<br />
        → Sprint 2: Quiz management next
      </div>

      <button onClick={handleLogout} style={{
        fontFamily: 'var(--font-hud)',
        fontSize: 12,
        letterSpacing: 3,
        padding: '12px 28px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        marginTop: 8,
        transition: 'all .2s',
      }}
      onMouseOver={e => e.target.style.borderColor = 'var(--red)'}
      onMouseOut={e => e.target.style.borderColor = 'var(--border)'}
      >
        ⏏ LOGOUT
      </button>
    </div>
  );
}