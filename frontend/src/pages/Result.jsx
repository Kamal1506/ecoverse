import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HUD from '../components/HUD/HUD';
import './Result.css';

const RANK_CONFIG = {
  S: { label: 'LEGENDARY',  color: '#FFD700', glow: 'rgba(255,215,0,0.4)',   emoji: '👑' },
  A: { label: 'EXCELLENT',  color: '#00FF88', glow: 'rgba(0,255,136,0.35)',  emoji: '🌿' },
  B: { label: 'GOOD JOB',   color: '#00E5FF', glow: 'rgba(0,229,255,0.3)',   emoji: '♻️' },
  C: { label: 'KEEP GOING', color: '#FF6B35', glow: 'rgba(255,107,53,0.3)',  emoji: '💪' },
};

export default function Result() {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const result    = state?.result;
  const quizTitle = state?.quizTitle || 'Quiz';
  const quizId    = state?.quizId ?? result?.quizId ?? null;
  const answerReview = result?.answerReview || [];

  // Redirect if landed here directly without data
  useEffect(() => {
    if (!result) navigate('/dashboard', { replace: true });
  }, []);

  if (!result) return null;

  const rank   = result.rank || 'C';
  const cfg    = RANK_CONFIG[rank] || RANK_CONFIG['C'];
  const pct    = result.percentage;
  const bars   = Math.round((result.score / result.totalQuestions) * 10);

  return (
    <>
      <HUD />
      <div className="result-wrap">

        {/* ── Rank Badge ── */}
        <div className="result-rank-section">
          <div className="result-tag">// MISSION COMPLETE</div>
          <div className="result-quiz-name">{quizTitle.toUpperCase()}</div>

          <div className="result-rank-ring" style={{
            '--rank-color': cfg.color,
            '--rank-glow':  cfg.glow,
          }}>
            <div className="result-rank-letter">{rank}</div>
            <div className="result-rank-label">{cfg.label}</div>
          </div>

          <p className="result-message">{result.message}</p>
        </div>

        {/* ── Stats grid ── */}
        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: cfg.color }}>
              {result.score}<span style={{ fontSize: 18, color: 'var(--text-dim)' }}>/{result.totalQuestions}</span>
            </div>
            <div className="result-stat-l">CORRECT</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n">{pct}%</div>
            <div className="result-stat-l">ACCURACY</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: '#FFD700' }}>+{result.xpEarned}</div>
            <div className="result-stat-l">XP EARNED</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-n" style={{ color: 'var(--cyan)' }}>
              {result.totalXp.toLocaleString()}
            </div>
            <div className="result-stat-l">TOTAL XP</div>
          </div>
        </div>

        {/* ── Score bar visual ── */}
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
          <div className="result-bar-pct">{pct}%</div>
        </div>

        {answerReview.length > 0 && (
          <div className="result-review">
            <div className="result-review-title">ANSWER REVIEW</div>
            {answerReview.map((item, index) => (
              <div
                key={item.questionId ?? index}
                className={`result-review-item ${item.correct ? 'ok' : 'bad'}`}>
                <div className="result-review-q">
                  Q{item.questionNumber ?? index + 1}. {item.questionText}
                </div>
                <div className="result-review-row">
                  <span className="result-review-label">Your answer:</span>
                  <span>
                    {item.yourOption
                      ? `${item.yourOption}. ${item.yourAnswerText || ''}`
                      : 'Not answered'}
                  </span>
                </div>
                <div className="result-review-row">
                  <span className="result-review-label">Correct answer:</span>
                  <span>{item.correctOption}. {item.correctAnswerText}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="result-actions">
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            ← BACK TO MISSIONS
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (quizId) {
                navigate(`/quiz/${quizId}`);
              } else {
                navigate('/dashboard');
              }
            }}>
            NEXT MISSION ▶
          </button>
        </div>

        {/* ── XP Level progress ── */}
        <div className="result-level-note">
          <span className="mono" style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-dim)' }}>
            YOUR TOTAL XP: {result.totalXp.toLocaleString()} — Keep playing to level up! 🚀
          </span>
        </div>

      </div>
    </>
  );
}
