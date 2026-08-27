import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import bdaLogo from '../assets/bda-logo.jpg';
import { homePathForRole } from '../auth-guards';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../auth';

/** Add shared login carousel images here for infinite scroll */
const LOGIN_SCROLL_IMAGES: { src: string; alt: string }[] = [];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(username, password);
      navigate(homePathForRole(loggedIn.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const scrollImages =
    LOGIN_SCROLL_IMAGES.length > 0
      ? [...LOGIN_SCROLL_IMAGES, ...LOGIN_SCROLL_IMAGES]
      : [];

  return (
    <div className="login-page">
      <div className="login-stage">
        <section className="login-hero" aria-label="BDA portal branding">
          <div className="login-hero-top">
            <img
              src={bdaLogo}
              alt="Bangalore Development Authority"
              className="login-hero-logo"
            />
            <h1 className="login-hero-brand">BDA</h1>
            <p className="login-hero-tagline">
              Asset &amp; IT Request Management Portal
            </p>
          </div>

          {scrollImages.length > 0 ? (
            <div className="login-marquee" aria-hidden="true">
              <div className="login-marquee-track">
                {scrollImages.map((image, index) => (
                  <div
                    className="login-marquee-item"
                    key={`${image.src}-${index}`}
                  >
                    <img src={image.src} alt="" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <ul className="login-hero-features">
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3 4.5 6.5v5.2c0 4.4 3.1 8.4 7.5 9.3 4.4-.9 7.5-4.9 7.5-9.3V6.5L12 3Z" />
                  <path d="m9.2 12.1 1.8 1.8 3.8-3.8" />
                </svg>
              </span>
              <strong>Secure Access</strong>
              <span>Your data is protected with advanced security.</span>
            </li>
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 20V9.5L12 4l8 5.5V20" />
                  <path d="M9.5 20v-6h5v6" />
                </svg>
              </span>
              <strong>Smart Requests</strong>
              <span>Raise and manage asset &amp; IT requests.</span>
            </li>
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 19h16" />
                  <path d="M5 15.5 9.5 10l3.5 3.5L19 7" />
                </svg>
              </span>
              <strong>Live Tracking</strong>
              <span>Follow status from submit to closure.</span>
            </li>
            <li>
              <span className="login-feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M12 3.5v2.2M12 18.3v2.2M4.8 12H3M21 12h-1.8M6.4 6.4l1.5 1.5M16.1 16.1l1.5 1.5M17.6 6.4l-1.5 1.5M7.9 16.1l-1.5 1.5" />
                </svg>
              </span>
              <strong>Reliable System</strong>
              <span>Built for performance and reliability.</span>
            </li>
          </ul>
        </section>

        <section className="login-side">
          <div className="login-panel">
            <header className="login-panel-header">
              <p className="login-panel-eyebrow">Secure sign-in</p>
              <h1 className="login-panel-title">Welcome back</h1>
              <p className="login-panel-copy">
                Enter your credentials to continue to the portal.
              </p>
            </header>

            <form onSubmit={onSubmit} className="form login-form">
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  minLength={3}
                  placeholder="Enter username"
                />
              </label>
              <label>
                Password
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
              </label>
              {error ? <p className="error login-error">{error}</p> : null}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
