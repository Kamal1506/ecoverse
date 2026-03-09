import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const change = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!form.email)
      e.email = 'Email is required';
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await register(form.name.trim(), form.email, form.password);
      toast.success(data.message || 'Profile created!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-grid" />

      <div className="auth-card">
        <div className="auth-logo">ECO<span>VERSE</span></div>
        <div className="auth-tagline">// CREATE YOUR PLAYER PROFILE</div>

        <form className="auth-form" onSubmit={submit} noValidate>

          <div className="field-group">
            <label className="field-label">DISPLAY NAME</label>
            <input
              className={`field-input${errors.name ? ' field-error' : ''}`}
              type="text"
              name="name"
              placeholder="EcoWarrior99"
              value={form.name}
              onChange={change}
              autoComplete="name"
            />
            {errors.name && <span className="err-msg">{errors.name}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">EMAIL ADDRESS</label>
            <input
              className={`field-input${errors.email ? ' field-error' : ''}`}
              type="email"
              name="email"
              placeholder="player@ecoverse.io"
              value={form.email}
              onChange={change}
              autoComplete="email"
            />
            {errors.email && <span className="err-msg">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">PASSWORD</label>
            <div className="password-wrap password-wrap-icon">
              <input
                className={`field-input${errors.password ? ' field-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={change}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-inline"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 3l18 18m-3.2-3.2A9.5 9.5 0 0 1 12 20C7 20 3.2 16.7 1.5 12c.8-2.1 2.1-3.9 3.9-5.2m3-1.7A9.8 9.8 0 0 1 12 4c5 0 8.8 3.3 10.5 8a15.2 15.2 0 0 1-2.6 4.2M14.1 14.1A3 3 0 0 1 9.9 9.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M1.5 12C3.2 7.3 7 4 12 4s8.8 3.3 10.5 8c-1.7 4.7-5.5 8-10.5 8S3.2 16.7 1.5 12Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">CONFIRM PASSWORD</label>
            <div className="password-wrap password-wrap-icon">
              <input
                className={`field-input${errors.confirm ? ' field-error' : ''}`}
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={change}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-inline"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 3l18 18m-3.2-3.2A9.5 9.5 0 0 1 12 20C7 20 3.2 16.7 1.5 12c.8-2.1 2.1-3.9 3.9-5.2m3-1.7A9.8 9.8 0 0 1 12 4c5 0 8.8 3.3 10.5 8a15.2 15.2 0 0 1-2.6 4.2M14.1 14.1A3 3 0 0 1 9.9 9.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M1.5 12C3.2 7.3 7 4 12 4s8.8 3.3 10.5 8c-1.7 4.7-5.5 8-10.5 8S3.2 16.7 1.5 12Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirm && <span className="err-msg">{errors.confirm}</span>}
          </div>

          {errors.api && (
            <div className="auth-api-error">{errors.api}</div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner">◈ CREATING PROFILE...</span>
            ) : (
              '▶ INITIALIZE PLAYER'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>Already a player?</span>
          <Link to="/login" className="auth-link">LOGIN →</Link>
        </div>
      </div>
    </div>
  );
}
