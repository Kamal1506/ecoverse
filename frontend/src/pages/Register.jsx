import { memo, useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate                  = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const hasGoogleClientId = Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(name, email, password);
      toast.success('Account created! Welcome to EcoVerse 🌍');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    const credential = (credentialResponse?.credential || '').trim();
    if (!credential) {
      toast.error('Google did not return a valid credential. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const data = await googleLogin(credential);
      toast.success(data.message || 'Welcome to EcoVerse!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  const handleGoogleError = useCallback(() => {
    toast.error('Google signup failed.');
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ECO<span>VERSE</span></div>
        <div className="auth-subtitle">// CREATE YOUR ACCOUNT</div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">NAME</label>
            <input
              type="text" className="auth-input"
              placeholder="Eco Agent"
              value={name} onChange={e => setName(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <input
              type="email" className="auth-input"
              placeholder="agent@ecoverse.in"
              value={email} onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">PASSWORD</label>
            <input
              type="password" className="auth-input"
              placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT ▶'}
          </button>
        </form>

        {hasGoogleClientId && (
          <>
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <span className="auth-divider-line" />
            </div>

            <div className="google-btn-wrap">
              <GoogleRegisterButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
          </>
        )}

        <p className="auth-switch">
          Already have an account? <Link className="auth-link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const GoogleRegisterButton = memo(function GoogleRegisterButton({ onSuccess, onError }) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      theme="filled_black"
      shape="rectangular"
      size="large"
      text="signup_with_google"
    />
  );
});
