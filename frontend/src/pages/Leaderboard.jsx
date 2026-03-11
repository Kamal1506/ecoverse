import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Leaderboard.css';

const LEVEL_COLORS = {
  6: '#FFD700',
  5: '#FF6B35',
  4: '#00E5FF',
  3: '#00FF88',
  2: '#A0FFB0',
  1: '#5a7a65',
};

const RANK_MEDALS = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' };
const CROWN = '\uD83D\uDC51';
const SEEDLING = '\uD83C\uDF31';

const XP_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000];

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(({ data }) => setBoard(data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const xpToNextLevel = (xp, level) => {
    if (level >= 6) return 100;
    const next = XP_THRESHOLDS[level];
    const curr = XP_THRESHOLDS[level - 1];
    return Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100));
  };

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="lb-wrap">
          <div className="lb-header">
            <div className="section-label">// GLOBAL</div>
            <h1 className="lb-title">RANKINGS</h1>
            <p className="lb-sub">Top EcoVerse players ranked by total XP earned</p>
          </div>

          {!loading && board.length >= 3 && (
            <div className="lb-podium">
              <div className="podium-slot podium-2">
                <div className="podium-medal">{RANK_MEDALS[2]}</div>
                <div className="podium-name">{board[1].name}</div>
                <div className="podium-xp" style={{ color: '#C0C0C0' }}>
                  {Number(board[1].totalXp).toLocaleString()} XP
                </div>
                <div className="podium-block p2-block">2</div>
              </div>

              <div className="podium-slot podium-1">
                <div className="podium-crown">{CROWN}</div>
                <div className="podium-medal">{RANK_MEDALS[1]}</div>
                <div className="podium-name">{board[0].name}</div>
                <div className="podium-xp" style={{ color: '#FFD700' }}>
                  {Number(board[0].totalXp).toLocaleString()} XP
                </div>
                <div className="podium-block p1-block">1</div>
              </div>

              <div className="podium-slot podium-3">
                <div className="podium-medal">{RANK_MEDALS[3]}</div>
                <div className="podium-name">{board[2].name}</div>
                <div className="podium-xp" style={{ color: '#CD7F32' }}>
                  {Number(board[2].totalXp).toLocaleString()} XP
                </div>
                <div className="podium-block p3-block">3</div>
              </div>
            </div>
          )}

          <div className="lb-table">
            <div className="lb-head">
              <div className="lbc rank-col mono">#</div>
              <div className="lbc mono">PLAYER</div>
              <div className="lbc mono center">LEVEL</div>
              <div className="lbc mono center">PROGRESS</div>
              <div className="lbc mono right">TOTAL XP</div>
            </div>

            {loading ? (
              <div className="lb-loading">LOADING RANKINGS...</div>
            ) : board.length === 0 ? (
              <div className="lb-empty">
                No players yet {'\u2014'} be the first to complete a mission! {SEEDLING}
              </div>
            ) : (
              board.map((player, i) => {
                const isMe = player.name === user?.name;
                const lvl = player.level || 1;
                const color = LEVEL_COLORS[lvl] || '#5a7a65';
                const pct = xpToNextLevel(Number(player.totalXp), lvl);
                const medal = RANK_MEDALS[player.rank];

                return (
                  <div
                    key={player.userId}
                    className={`lb-row${isMe ? ' lb-me' : ''}${i < 3 ? ' lb-top3' : ''}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="lbc rank-col">
                      {medal ? (
                        <span className="lb-medal">{medal}</span>
                      ) : (
                        <span className="lb-rank-n mono">{player.rank}</span>
                      )}
                    </div>

                    <div className="lbc lb-player-cell">
                      <div className="lb-avatar" style={{ borderColor: color, color }}>
                        {player.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="lb-player-name">
                          {player.name}
                          {isMe && <span className="lb-you-badge">YOU</span>}
                        </div>
                        <div className="lb-player-sub mono" style={{ color }}>
                          LVL {lvl}
                        </div>
                      </div>
                    </div>

                    <div className="lbc center">
                      <div
                        className="lb-level-badge"
                        style={{
                          color,
                          borderColor: color,
                          background: `${color}11`,
                        }}
                      >
                        {lvl}
                      </div>
                    </div>

                    <div className="lbc center lb-prog-cell">
                      <div className="lb-prog-track">
                        <div className="lb-prog-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {lvl < 6 ? `${pct}%` : 'MAX'}
                      </span>
                    </div>

                    <div className="lbc right">
                      <span className="lb-xp-val" style={{ color }}>
                        {Number(player.totalXp).toLocaleString()}
                      </span>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>
                        XP
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
