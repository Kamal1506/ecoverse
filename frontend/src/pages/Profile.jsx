import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import BadgeGrid from '../components/BadgeGrid/BadgeGrid';
import StreakBanner from '../components/StreakBanner/StreakBanner';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Profile.css';

const RANK_COLORS = { S: '#FFD700', A: '#00FF88', B: '#00E5FF', C: '#FF6B35' };

export default function Profile() {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile/me')
      .then(({ data }) => setProfile(data))
      .catch(() => { toast.error('Failed to load profile'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <><HUD /><div className="quiz-loading"><div className="quiz-loading-spinner" /><span>LOADING PROFILE...</span></div></>
  );

  const earnedBadges = profile?.badges?.filter(b => b.earned) || [];

  return (
    <>
      <HUD streak={profile?.currentStreak} />
      <div className="page-container">
        <div className="profile-wrap">

          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="section-label">// PLAYER PROFILE</div>
              <h1 className="profile-name">{profile?.name?.toUpperCase()}</h1>
              <div className="profile-email">{profile?.email}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-n" style={{ color: 'var(--yellow)' }}>
                {(profile?.totalXp || 0).toLocaleString()}
              </div>
              <div className="profile-stat-l">TOTAL XP</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-n" style={{ color: '#FF6B35' }}>
                {profile?.currentStreak || 0}
              </div>
              <div className="profile-stat-l">CURRENT STREAK</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-n">{profile?.longestStreak || 0}</div>
              <div className="profile-stat-l">BEST STREAK</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-n" style={{ color: 'var(--cyan)' }}>
                {earnedBadges.length}
              </div>
              <div className="profile-stat-l">BADGES</div>
            </div>
          </div>

          {/* Streak */}
          <StreakBanner streak={profile?.currentStreak || 0} longest={profile?.longestStreak || 0} />

          {/* Badges */}
          <BadgeGrid badges={profile?.badges || []} />

          {/* History */}
          {profile?.history?.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div className="section-label">// MISSION HISTORY</div>
              <div className="profile-history">
                {profile.history.map(r => (
                  <div key={r.resultId} className="history-row">
                    <div className="history-title">{r.quizTitle}</div>
                    <div className="history-score">
                      {r.score}/{r.totalQuestions} ({r.percentage}%)
                    </div>
                    <div className="history-rank"
                      style={{ color: RANK_COLORS[r.rank] || '#aaa' }}>
                      {r.rank}
                    </div>
                    <div className="history-xp" style={{ color: 'var(--yellow)' }}>
                      +{r.xpEarned} XP
                    </div>
                    <div className="history-date mono">
                      {new Date(r.attemptedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}