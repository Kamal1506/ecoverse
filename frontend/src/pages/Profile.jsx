import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HUD from '../components/HUD/HUD';
import BadgeGrid from '../components/BadgeGrid/BadgeGrid';
import StreakBanner from '../components/StreakBanner/StreakBanner';
import api from '../api/axios';
import { RANK_COLORS } from '../constants/ranks';
import toast from 'react-hot-toast';
import './Profile.css';

const NATIONALITIES = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ZA', label: 'South Africa' },
];

const getFlagFromCode = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '';
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
};

const getNationalityLabel = (countryCode) => {
  if (!countryCode) return '';
  return NATIONALITIES.find(n => n.code === countryCode)?.label || countryCode;
};

const getInitial = (name) => {
  if (!name) return '?';
  const firstWord = name.trim().split(/\s+/)[0];
  return firstWord?.charAt(0)?.toUpperCase() || '?';
};
const MAX_PROFILE_IMAGE_SIZE = 10 * 1024 * 1024;

const isValidProfileImage = (value) => {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  return /^https?:\/\//i.test(v);
};

export default function Profile() {
  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [form, setForm] = useState({
    name: '',
    pictureUrl: '',
    nationality: '',
    bio: '',
  });

  useEffect(() => {
    api.get('/profile/me')
      .then(({ data }) => {
        setProfile(data);
        setAvatarLoadError(false);
        setForm({
          name: data?.name || '',
          pictureUrl: data?.pictureUrl || '',
          nationality: data?.nationality || '',
          bio: data?.bio || '',
        });
      })
      .catch(() => { toast.error('Failed to load profile'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <><HUD /><div className="quiz-loading"><div className="quiz-loading-spinner" /><span>LOADING PROFILE...</span></div></>
  );

  const earnedBadges = profile?.badges?.filter(b => b.earned) || [];
  const flag = getFlagFromCode(profile?.nationality);
  const nationalityLabel = getNationalityLabel(profile?.nationality);

  const onChangeField = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const onUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      toast.error('Image is too large. Max allowed is 10MB');
      e.target.value = '';
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingPhoto(true);
    try {
      const { data } = await api.post('/profile/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, pictureUrl: data?.pictureUrl || '' }));
      setAvatarLoadError(false);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const beginEdit = () => {
    setForm({
      name: profile?.name || '',
      pictureUrl: profile?.pictureUrl || '',
      nationality: profile?.nationality || '',
      bio: profile?.bio || '',
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({
      name: profile?.name || '',
      pictureUrl: profile?.pictureUrl || '',
      nationality: profile?.nationality || '',
      bio: profile?.bio || '',
    });
  };

  const saveProfile = async () => {
    const trimmedName = form.name.trim();
    if (trimmedName.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        pictureUrl: form.pictureUrl || null,
        nationality: form.nationality || null,
        bio: form.bio.trim() || null,
      };
      const { data } = await api.put('/profile/me', payload);
      setProfile(prev => ({ ...prev, ...data }));
      setAvatarLoadError(false);
      updateUserProfile({ name: data.name, pictureUrl: data.pictureUrl });
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <HUD streak={profile?.currentStreak} />
      <div className="page-container">
        <div className="profile-wrap">

          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {isValidProfileImage(profile?.pictureUrl) && !avatarLoadError ? (
                <img
                  src={profile.pictureUrl}
                  alt="Profile"
                  className="profile-avatar-img"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                getInitial(profile?.name)
              )}
            </div>
            <div>
              <div className="section-label">// PLAYER PROFILE</div>
              <h1 className="profile-name">{profile?.name?.toUpperCase()}</h1>
              <div className="profile-email">{profile?.email}</div>
              {(nationalityLabel || profile?.bio) && (
                <div className="profile-meta-wrap">
                  {nationalityLabel && (
                    <div className="profile-nationality mono">
                      <span>{flag}</span>
                      <span>{nationalityLabel}</span>
                    </div>
                  )}
                  {profile?.bio && <div className="profile-bio">{profile.bio}</div>}
                </div>
              )}
            </div>
            {!editing ? (
              <button type="button" className="btn-ghost profile-edit-btn" onClick={beginEdit}>
                EDIT PROFILE
              </button>
            ) : null}
          </div>

          {editing && (
            <div className="profile-edit-panel">
              <div className="section-label">// EDIT PROFILE</div>
              <div className="profile-edit-grid">
                <label className="profile-field">
                  <span className="profile-field-label">USERNAME</span>
                  <input
                    type="text"
                    maxLength={80}
                    value={form.name}
                    onChange={onChangeField('name')}
                    placeholder="Enter username"
                  />
                </label>

                <label className="profile-field">
                  <span className="profile-field-label">NATIONALITY</span>
                  <select value={form.nationality} onChange={onChangeField('nationality')}>
                    <option value="">Select nationality</option>
                    {NATIONALITIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {getFlagFromCode(item.code)} {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="profile-field profile-field-full">
                  <span className="profile-field-label">BIO</span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.bio}
                    onChange={onChangeField('bio')}
                    placeholder="Tell us about your eco mission..."
                  />
                </label>

                <div className="profile-field profile-field-full">
                  <span className="profile-field-label">PROFILE PHOTO</span>
                  <div className="profile-photo-row">
                    <div className="profile-photo-preview">
                      {isValidProfileImage(form.pictureUrl) ? (
                        <img src={form.pictureUrl} alt="Preview" className="profile-avatar-img" />
                      ) : (
                        getInitial(form?.name)
                      )}
                    </div>
                    <div className="profile-photo-actions">
                      <input type="file" accept="image/*" onChange={onUploadPhoto} />
                      {uploadingPhoto && <span className="mono" style={{ fontSize: 11 }}>UPLOADING...</span>}
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setForm(prev => ({ ...prev, pictureUrl: '' }))}
                        disabled={uploadingPhoto}>
                        REMOVE PHOTO
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-edit-actions">
                <button type="button" className="btn-primary" onClick={saveProfile} disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
                <button type="button" className="btn-ghost" onClick={cancelEdit} disabled={saving}>
                  CANCEL
                </button>
              </div>
            </div>
          )}

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
