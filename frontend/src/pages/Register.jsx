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
            <input
              className={`field-input${errors.password ? ' field-error' : ''}`}
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={change}
              autoComplete="new-password"
            />
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">CONFIRM PASSWORD</label>
            <input
              className={`field-input${errors.confirm ? ' field-error' : ''}`}
              type="password"
              name="confirm"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={change}
              autoComplete="new-password"
            />
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