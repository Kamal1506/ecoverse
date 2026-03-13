import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import QuizCard from '../components/QuizCard/QuizCard';
import StreakBanner from '../components/StreakBanner/StreakBanner';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';
import './DashboardExtra.css';

const DIFFICULTIES = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const DIFF_COLORS  = { BEGINNER:'var(--green)', INTERMEDIATE:'var(--yellow)', EXPERT:'var(--red)' };

const GAMES = [
  { path:'/game/waste', icon:'♻️', title:'WASTE SORTER',
    desc:'Drag waste items into the correct bin. Learn real recycling knowledge.',
    tag:'SORTING GAME', color:'var(--green)' },
  { path:'/game/water', icon:'💧', title:'PIPELINE PUZZLE',
    desc:'Rotate pipes to connect homes to the water source. 3 difficulty levels.',
    tag:'PUZZLE GAME',  color:'var(--cyan)' },
];

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') { navigate('/admin', { replace: true }); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/profile/me'),
      ]);
      setQuizzes(qRes.data);
      setProfile(pRes.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setLoading(false); }
  };

  if (user?.role === 'ADMIN') return null;

  const filtered = filter === 'ALL'
    ? quizzes
    : quizzes.filter(q => q.difficulty === filter);

  return (
    <>
      <HUD streak={profile?.currentStreak} />
      <div className="page-container">
        <div className="dashboard-wrap">

          <div className="dash-hero">
            <div className="dash-hero-tag">// MISSION CONTROL</div>
            <h1 className="dash-hero-title">
              WELCOME BACK,<br />
              <span className="dash-hero-name">{user?.name?.toUpperCase()}</span>
            </h1>
            <p className="dash-hero-sub">Answer correctly. Play games. Save the planet.</p>
          </div>

          <StreakBanner streak={profile?.currentStreak||0} longest={profile?.longestStreak||0} />

          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-n">{user?.totalXp ?? 0}</div>
              <div className="dash-stat-l">Total XP</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n">{loading ? '...' : quizzes.length}</div>
              <div className="dash-stat-l">Missions</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n" style={{ color:'var(--cyan)', fontSize:20 }}>
                {profile?.badges?.filter(b=>b.earned).length||0}/{profile?.badges?.length||0}
              </div>
              <div className="dash-stat-l">Badges</div>
            </div>
          </div>

          {/* ── Games Section ── */}
          <div className="section-label" style={{ marginBottom:14 }}>// ECO GAMES</div>
          <div className="games-grid">
            {GAMES.map(g => (
              <div key={g.path} className="game-card" onClick={() => navigate(g.path)}
                style={{ '--gc': g.color }}>
                <div className="game-card-tag" style={{ color:g.color, borderColor:g.color }}>
                  {g.tag}
                </div>
                <div className="game-card-icon">{g.icon}</div>
                <div className="game-card-title" style={{ color:g.color }}>{g.title}</div>
                <div className="game-card-desc">{g.desc}</div>
                <div className="game-card-play" style={{ color:g.color }}>PLAY NOW ▶</div>
              </div>
            ))}
          </div>

          {/* ── Quizzes Section ── */}
          <div className="dash-filter-row">
            <div className="section-label">// QUIZ MISSIONS</div>
            <div className="diff-filters">
              {DIFFICULTIES.map(d => (
                <button key={d}
                  className={`diff-btn${filter===d?' active':''}`}
                  style={filter===d?{borderColor:DIFF_COLORS[d]||'var(--green)',color:DIFF_COLORS[d]||'var(--green)'}:{}}
                  onClick={() => setFilter(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="dash-loading"><div className="dash-loading-dot"/><span>LOADING MISSIONS...</span></div>
          ) : filtered.length === 0 ? (
            <div className="dash-empty">
              <div style={{fontSize:36,marginBottom:12}}>🌱</div>
              <div style={{fontFamily:'var(--font-hud)',fontSize:14,color:'var(--text-dim)',letterSpacing:2}}>
                {filter==='ALL'?'NO MISSIONS AVAILABLE YET':`NO ${filter} MISSIONS`}
              </div>
            </div>
          ) : (
            <div className="quiz-grid">
              {filtered.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
            </div>
          )}

        </div>
      </div>
    </>
  );
}