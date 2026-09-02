import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import bdaLogo from '@/assets/bda-logo.jpg';
import loginBackground from '@/assets/ChatGPT Image Aug 27, 2026, 02_30_44 PM.png';
import inventechLogo from '@/assets/image.png';
import officerUserIcon from '@/assets/simple-user-profile-icon-bright-blue-color-isolated-transparent-background-image-shows-basic-contact-rendered-406359700.webp';

import { PasswordInput } from './password-input';
import { useAuth } from '../hooks/use-auth';
import { useCaptcha } from '../hooks/use-captcha';
import { useLogin } from '../hooks/use-login';
import { homePathForRole } from '../utils/auth-paths';

export function LoginPage() {
  const { user } = useAuth();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [aliasName, setAliasName] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [localError, setLocalError] = useState('');
  const captchaQuery = useCaptcha(captchaRefreshKey);

  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError('');
    try {
      const loggedIn = await loginMutation.mutateAsync({
        aliasName,
        password,
        captchaId: captchaQuery.data?.captchaId ?? '',
        captchaAnswer,
      });
      navigate(homePathForRole(loggedIn.role));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
      setCaptchaAnswer('');
      setCaptchaRefreshKey((key) => key + 1);
    }
  }

  function refreshCaptcha() {
    setCaptchaAnswer('');
    setLocalError('');
    setCaptchaRefreshKey((key) => key + 1);
  }

  return (
    <div
      className="login-layout-wrapper"
      style={{ backgroundImage: `url("${loginBackground}")` }}
    >
      {/* Top Header */}
      <header className="login-top-header">
        <div className="login-top-brand">
          <img
            src={bdaLogo}
            alt="Bangalore Development Authority"
            className="login-top-logo"
          />
          <div className="login-top-titles">
            <span className="login-top-org">BANGALORE DEVELOPMENT AUTHORITY</span>
            <h1 className="login-top-portal">BDA Asset &amp; IT Request Management Portal</h1>
            <span className="login-top-sub">Admin Portal</span>
          </div>
        </div>

       
      </header>

      {/* Main Login Area */}
      <main className="login-main-content">
        <div className="login-card-container">
         

          <div className="login-portal-card">
            <div className="login-avatar-circle" aria-hidden="true">
              <img
                src={officerUserIcon}
                alt="Officer User Icon"
                className="login-avatar-img"
              />
            </div>

            <div className="login-portal-card-header">
              <h2 className="login-portal-card-title">Officer Login</h2>
              <p className="login-portal-card-subtitle">Sign in to your account</p>
            </div>

            <form onSubmit={onSubmit} className="login-portal-form">
              <div className="login-field-group">
                <label htmlFor="login-alias-name" className="login-input-label">
                  Enter User Name
                </label>
                <div className="login-input-wrapper">
                  <svg
                    className="login-field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="login-alias-name"
                    type="text"
                    value={aliasName}
                    onChange={(e) => setAliasName(e.target.value)}
                    required
                    autoComplete="username"
                    minLength={3}
                    placeholder="Enter User Name"
                    
                    className="login-text-input"
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label htmlFor="login-password" className="login-input-label">
                  Enter Password
                </label>
                <div className="login-input-wrapper">
                  <svg
                    className="login-field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <PasswordInput
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter Password"
                    
                  />
                </div>
              </div>

              <div className="login-captcha-group">
                <div className="login-captcha-heading">
                  <label htmlFor="login-captcha" className="login-input-label">
                    Enter CAPTCHA
                  </label>
                  <button
                    type="button"
                    className="login-captcha-refresh"
                    onClick={refreshCaptcha}
                    disabled={captchaQuery.isFetching}
                    aria-label="Refresh CAPTCHA"
                    title="Refresh CAPTCHA"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
                    </svg>
                    Refresh
                  </button>
                </div>
                <div className="login-captcha-row">
                  {captchaQuery.data ? (
                    <img
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(captchaQuery.data.image)}`}
                      alt="CAPTCHA challenge"
                      className="login-captcha-image"
                    />
                  ) : (
                    <div className="login-captcha-image login-captcha-loading">
                      {captchaQuery.isPending ? 'Loading…' : 'Unavailable'}
                    </div>
                  )}
                  <input
                    id="login-captcha"
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                    minLength={5}
                    maxLength={5}
                    autoComplete="off"
                    placeholder="Enter code"
                    className="login-text-input login-captcha-input"
                    aria-describedby="captcha-help"
                  />
                </div>
                <span id="captcha-help" className="login-captcha-help">
                  Enter the 5 characters shown above.
                </span>
              </div>

              {localError ? (
                <p className="error login-error">{localError}</p>
              ) : null}

              <button
                type="submit"
                className="login-action-btn"
                disabled={
                  loginMutation.isPending ||
                  captchaQuery.isFetching ||
                  !captchaQuery.data
                }
              >
                {loginMutation.isPending ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Feature Pill Cards */}
        <div className="login-features-strip">
          <div className="login-feature-pill">
            <span className="login-pill-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="login-pill-text">Manage Asset &amp; IT requests</span>
          </div>

          <div className="login-feature-pill">
            <span className="login-pill-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="m9 16 2 2 4-4" />
              </svg>
            </span>
            <span className="login-pill-text">Track Requests</span>
          </div>

          <div className="login-feature-pill">
            <span className="login-pill-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span className="login-pill-text">Role-based Authorisation</span>
          </div>

          <div className="login-feature-pill">
            <span className="login-pill-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </span>
            <span className="login-pill-text">Transparent Process</span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="login-bottom-footer">
        <div className="login-footer-content">
          <p className="login-footer-left">
            &copy; 2026 ASSET &amp; IT PORTAL - Bangalore Development Authority
          </p>
          <div className="login-footer-right">
            <span>Designed &amp; Developed by</span>
            <img
              src={inventechLogo}
              alt="Inventech Info Solutions"
              className="login-footer-inventech-logo"
            />
            <span className="login-footer-brand-name">Inventech Info Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
