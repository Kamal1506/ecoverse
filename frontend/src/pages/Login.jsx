import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const normalizeEmailForLogin = (value) => {
    const normalized = value.trim().replace(/\s+/g, '');
    if (!normalized) return '';
    if (normalized.includes('@')) return normalized;
    return `${normalized}@gmail.com`;
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const emailToSend = normalizeEmailForLogin(form.email);
    setLoading(true);
    try {
      const data = await login(emailToSend, form.password);
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
      <div className="auth-grid" />

      <div className="auth-card">
        <div className="auth-logo">
          ECO<span>VERSE</span>
        </div>
        <div className="auth-tagline">// PLAYER AUTHENTICATION</div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="field-group">
            <label className="field-label">EMAIL ADDRESS</label>
            <input
              className={`field-input${errors.email ? ' field-error' : ''}`}
              type="text"
              name="email"
              placeholder="playername"
              value={form.email}
              onChange={change}
              autoComplete="email"
            />
            {errors.email && <span className="err-msg">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">PASSWORD</label>
            <div className="password-wrap">
              <input
                className={`field-input${errors.password ? ' field-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="********"
                value={form.password}
                onChange={change}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          {errors.api && <div className="auth-api-error">{errors.api}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner">AUTHENTICATING...</span> : 'ENTER ECOVERSE'}
          </button>
        </form>

        <div className="auth-switch">
          <span>No account?</span>
          <Link to="/register" className="auth-link">
            CREATE PROFILE {'->'}
          </Link>
        </div>
      </div>
    </div>
  );
}
