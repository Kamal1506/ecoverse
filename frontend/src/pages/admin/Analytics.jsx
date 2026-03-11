import { useState, useEffect } from 'react';
import HUD from '../../components/HUD/HUD';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './Analytics.css';

export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <HUD />
      <div className="page-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontFamily: 'var(--font-mono)',
        fontSize: 12, letterSpacing: 3, color: 'var(--text-dim)'
      }}>
        LOADING ANALYTICS...
      </div>
    </>
  );

  const board = data?.leaderboard || [];
  const maxXp = board.length > 0 ? Math.max(...board.map(p => Number(p.totalXp))) : 1;

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="analytics-wrap">

          {/* Header */}
          <div className="analytics-header">
            <div className="section-label">// ADMIN</div>
            <h1 className="analytics-title">PLATFORM ANALYTICS</h1>
          </div>

          {/* Top stats */}
          <div className="analytics-stats">
            <div className="an-stat">
              <div className="an-stat-icon">👥</div>
              <div className="an-stat-n">{data?.totalUsers ?? 0}</div>
              <div className="an-stat-l">TOTAL PLAYERS</div>
            </div>
            <div className="an-stat">
              <div className="an-stat-icon">🎮</div>
              <div className="an-stat-n">{data?.totalAttempts ?? 0}</div>
              <div className="an-stat-l">QUIZ ATTEMPTS</div>
            </div>
            <div className="an-stat">
              <div className="an-stat-icon">⬡</div>
              <div className="an-stat-n" style={{ color: 'var(--yellow)' }}>
                {board.reduce((s, p) => s + Number(p.totalXp), 0).toLocaleString()}
              </div>
              <div className="an-stat-l">TOTAL XP AWARDED</div>
            </div>
            <div className="an-stat">
              <div className="an-stat-icon">🏆</div>
              <div className="an-stat-n" style={{ color: '#FFD700' }}>
                {board.length > 0 ? board[0].name : '—'}
              </div>
              <div className="an-stat-l">TOP PLAYER</div>
            </div>
          </div>

          {/* XP bar chart */}
          <div className="section-label" style={{ marginBottom: 16 }}>
            // XP DISTRIBUTION — TOP PLAYERS
          </div>

          <div className="an-chart">
            {board.length === 0 ? (
              <div className="an-empty">No player data yet.</div>
            ) : (
              board.slice(0, 10).map((player, i) => {
                const pct = maxXp > 0 ? (Number(player.totalXp) / maxXp) * 100 : 0;
                const colors = ['#FFD700','#C0C0C0','#CD7F32','#00FF88','#00E5FF',
                                '#FF6B35','#A0FFB0','#00FF88','#00E5FF','#FF6B35'];
                const color = colors[i] || 'var(--green)';

                return (
                  <div key={player.userId} className="an-bar-row">
                    <div className="an-bar-rank mono">#{player.rank}</div>
                    <div className="an-bar-name">{player.name}</div>
                    <div className="an-bar-track">
                      <div
                        className="an-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: color,
                          boxShadow: `0 0 10px ${color}55`,
                          animationDelay: `${i * 0.08}s`
                        }}
                      />
                    </div>
                    <div className="an-bar-xp mono" style={{ color }}>
                      {Number(player.totalXp).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Full leaderboard table */}
          <div className="section-label" style={{ marginTop: 40, marginBottom: 16 }}>
            // FULL LEADERBOARD
          </div>

          <div className="an-table">
            <div className="an-table-head">
              <div className="atc mono">#</div>
              <div className="atc mono">PLAYER</div>
              <div className="atc mono center">LEVEL</div>
              <div className="atc mono right">TOTAL XP</div>
            </div>
            {board.map((player, i) => (
              <div key={player.userId} className="an-table-row">
                <div className="atc mono" style={{ color: i < 3 ? '#FFD700' : 'var(--text-dim)' }}>
                  {player.rank}
                </div>
                <div className="atc">
                  <span style={{ fontWeight: 700 }}>{player.name}</span>
                </div>
                <div className="atc center">
                  <span className="an-level-tag mono">LVL {player.level}</span>
                </div>
                <div className="atc right mono" style={{ color: 'var(--cyan)' }}>
                  {Number(player.totalXp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}