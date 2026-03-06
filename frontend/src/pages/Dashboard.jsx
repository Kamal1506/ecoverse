import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import QuizCard from '../components/QuizCard/QuizCard';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // If admin lands here by mistake, redirect to /admin automatically
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data);
    } catch (err) {
      toast.error('Failed to load missions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render dashboard content for admins (they'll be redirected)
  if (user?.role === 'ADMIN') return null;

  return (
    <>
      <HUD />
      <div className="page-container">
        <div className="dashboard-wrap">

          {/* Welcome banner */}
          <div className="dash-hero">
            <div className="dash-hero-tag">// MISSION CONTROL</div>
            <h1 className="dash-hero-title">
              WELCOME BACK,<br />
              <span className="dash-hero-name">{user?.name?.toUpperCase()}</span>
            </h1>
            <p className="dash-hero-sub">
              Choose a mission. Answer correctly. Earn XP. Save the planet.
            </p>
          </div>

          {/* Stats strip — fixed: show 0 instead of broken icon */}
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dash-stat-n">{user?.totalXp ?? 0}</div>
              <div className="dash-stat-l">Total XP</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n">{loading ? '...' : quizzes.length}</div>
              <div className="dash-stat-l">Missions Available</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-n" style={{ color: 'var(--cyan)', fontSize: 22 }}>
                PLAYER
              </div>
              <div className="dash-stat-l">Rank</div>
            </div>
          </div>

          {/* Quiz grid */}
          <div className="section-label">// AVAILABLE MISSIONS</div>

          {loading ? (
            <div className="dash-loading">
              <div className="dash-loading-dot" />
              <span>LOADING MISSIONS...</span>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="dash-empty">
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
              <div style={{
                fontFamily: 'var(--font-hud)', fontSize: 14,
                color: 'var(--text-dim)', letterSpacing: 2
              }}>
                NO MISSIONS AVAILABLE YET
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                Check back soon — admins are loading new content.
              </div>
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}