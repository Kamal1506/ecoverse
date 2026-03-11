import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HUD from '../components/HUD/HUD';
import './Result.css';

const RANK_CONFIG = {
  S: { label: 'LEGENDARY', color: '#FFD700', glow: 'rgba(255,215,0,0.4)', emoji: '\uD83D\uDC51' },
  A: { label: 'EXCELLENT', color: '#00FF88', glow: 'rgba(0,255,136,0.35)', emoji: '\uD83C\uDF3F' },
  B: { label: 'GOOD JOB', color: '#00E5FF', glow: 'rgba(0,229,255,0.3)', emoji: '\u267B\uFE0F' },
  C: { label: 'KEEP GOING', color: '#FF6B35', glow: 'rgba(255,107,53,0.3)', emoji: '\uD83D\uDCAA' },
};

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.result) navigate('/dashboard', { replace: true });
  }, []);

  if (!state?.result) return null;

  const result = state.result;
  const quizTitle = state.quizTitle || 'Quiz';
  const rank = result.rank || 'C';
  const cfg = RANK_CONFIG[rank] || RANK_CONFIG.C;
  const bars = Math.round((result.score / result.totalQuestions) * 10);
  const hasBonus = result.multiplier > 1.0;

  const fmt = (opt, text) => {
    if (!opt) return 'NO ANSWER';
    if (!text) return opt;
    return `${opt}. ${text}`;
  };

  return (
    <>
      <HUD />
      <div className="result-wrap">
        <div className="result-rank-section">
          <div className="result-tag">// MISSION COMPLETE</div>
          <div className="result-quiz-name">{quizTitle.toUpperCase()}</div>

          <div className="result-rank-ring" style={{ '--rank-color': cfg.color, '--rank-glow': cfg.glow }}>
            <div className="result-rank-letter">{rank}</div>
            <div className="result-rank-label">{cfg.label}</div>
          </div>
          <p className="result-message">{result.message}</p>
        </div>

        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: cfg.color }}>
              {result.score}
              <span style={{ fontSize: 18, color: 'var(--text-dim)' }}>/{result.totalQuestions}</span>
            </div>
            <div className="result-stat-l">CORRECT</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n">{result.percentage}%</div>
            <div className="result-stat-l">ACCURACY</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: '#FFD700' }}>
              {result.isFirstAttempt ? `+${result.xpEarned}` : '+0'}
            </div>
            <div className="result-stat-l">XP EARNED</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: 'var(--cyan)' }}>
              {(result.totalXp || 0).toLocaleString()}
            </div>
            <div className="result-stat-l">TOTAL XP</div>
          </div>
        </div>

        {hasBonus && result.isFirstAttempt && (
          <div className="result-bonus-notice">
            {'\uD83D\uDD25'} Streak bonus {result.multiplier}x applied! XP multiplied!
          </div>
        )}
        {!result.isFirstAttempt && (
          <div className="result-replay-notice">
            {'\uD83D\uDD04'} Replay attempt {'\u2014'} no XP awarded. First attempt XP is protected.
          </div>
        )}

        {result.newBadges?.length > 0 && (
          <div className="result-badges-earned">
            <div className="section-label" style={{ marginBottom: 12 }}>
              // NEW BADGES UNLOCKED!
            </div>
            <div className="result-badge-list">
              {result.newBadges.map((b, i) => (
                <div key={i} className="result-badge-item">
                  {'\uD83C\uDF1F'} {b}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-bar-wrap">
          <div className="result-bar-label">PERFORMANCE</div>
          <div className="result-bar-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`result-bar-seg${i < bars ? ' filled' : ''}`}
                style={i < bars ? { background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` } : {}}
              />
            ))}
          </div>
          <div className="result-bar-pct">{result.percentage}%</div>
        </div>

        <div className="result-actions">
          <button className="btn-ghost" onClick={() => navigate('/profile')}>
            VIEW PROFILE {'\uD83C\uDFC6'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            NEXT MISSION {'\u25BA'}
          </button>
        </div>

        {result.review?.length > 0 && (
          <div className="result-review">
            <div className="result-review-title">// ANSWER REVIEW</div>
            {result.review.map((item, i) => (
              <div key={item.questionId ?? i} className={`result-review-item ${item.correct ? 'ok' : 'bad'}`}>
                <div className="result-review-q">{i + 1}. {item.questionText}</div>
                <div className="result-review-row">
                  <span className="result-review-label">YOUR ANSWER</span>
                  {fmt(item.selectedOption, item.selectedText)}
                </div>
                <div className="result-review-row">
                  <span className="result-review-label">CORRECT</span>
                  {fmt(item.correctOption, item.correctText)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
