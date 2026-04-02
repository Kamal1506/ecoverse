import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate               = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const hasGoogleClientId = Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(data.message || 'Welcome back!');
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(data.message || 'Welcome!');
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ECO<span>VERSE</span></div>
        <div className="auth-subtitle">// SIGN IN TO YOUR ACCOUNT</div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <input
              type="email" className="auth-input"
              placeholder="agent@ecoverse.in"
              value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">PASSWORD</label>
            <input
              type="password" className="auth-input"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'LOGIN ▶'}
          </button>
        </form>

        {hasGoogleClientId && (
          <>
            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">OR</span>
              <span className="auth-divider-line" />
            </div>

            {/* Google Login Button */}
            <div className="google-btn-wrap">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed.')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="signin_with_google"
                width="100%"
              />
            </div>
          </>
        )}

        <p className="auth-switch">
          No account? <Link className="auth-link" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
