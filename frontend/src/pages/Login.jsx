import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const change = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message || 'Welcome back!');
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Animated grid lines in background */}
      <div className="auth-grid" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          ECO<span>VERSE</span>
        </div>
        <div className="auth-tagline">// PLAYER AUTHENTICATION</div>

        <form className="auth-form" onSubmit={submit} noValidate>

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
            <input
              className={`field-input${errors.password ? ' field-error' : ''}`}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={change}
              autoComplete="current-password"
            />
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          {errors.api && (
            <div className="auth-api-error">{errors.api}</div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner">◈ AUTHENTICATING...</span>
            ) : (
              '▶ ENTER ECOVERSE'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>No account?</span>
          <Link to="/register" className="auth-link">CREATE PROFILE →</Link>
        </div>
      </div>
    </div>
  );
}