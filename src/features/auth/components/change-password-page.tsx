import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import bdaLogo from '@/assets/bda-logo.jpg';
import loginBackground from '@/assets/ChatGPT Image Aug 27, 2026, 02_30_44 PM.png';
import inventechLogo from '@/assets/image.png';
import officerUserIcon from '@/assets/simple-user-profile-icon-bright-blue-color-isolated-transparent-background-image-shows-basic-contact-rendered-406359700.webp';

import { PasswordInput } from './password-input';
import { useAuth } from '../hooks/use-auth';
import { useChangePassword } from '../hooks/use-change-password';
import { changePasswordInputSchema } from '../schemas/auth.schema';
import { homePathForRole, portalLabelForRole } from '../utils/auth-paths';

export function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const changePasswordMutation = useChangePassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [localError, setLocalError] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.mustChangePassword) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError('');

    const parsed = changePasswordInputSchema.safeParse({
      oldPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message || 'Invalid password details');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(parsed.data);
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to reset password',
      );
    }
  }

  function onCancel() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div
      className="login-layout-wrapper"
      style={{ backgroundImage: `url("${loginBackground}")` }}
    >
      <header className="login-top-header">
        <div className="login-top-brand">
          <img
            src={bdaLogo}
            alt="Bangalore Development Authority"
            className="login-top-logo"
          />
          <div className="login-top-titles">
            <span className="login-top-org">BANGALORE DEVELOPMENT AUTHORITY</span>
            <h1 className="login-top-portal">
              BDA Asset &amp; IT Request Management Portal
            </h1>
            <span className="login-top-sub">{portalLabelForRole(user.role)}</span>
          </div>
        </div>
      </header>

      <main className="login-main-content">
        <div className="login-card-container">
          <div className="login-portal-card">
            <div className="login-avatar-circle" aria-hidden="true">
              <img
                src={officerUserIcon}
                alt=""
                className="login-avatar-img"
              />
            </div>

            <div className="login-portal-card-header">
              <h2 className="login-portal-card-title">Reset Password</h2>
              <p className="login-portal-card-subtitle">
                Update your temporary password to continue
              </p>
            </div>

            <form onSubmit={onSubmit} className="login-portal-form">
              <div className="login-field-group">
                <label htmlFor="old-password" className="login-input-label">
                  Old Password
                </label>
                <div className="login-input-wrapper">
                  <PasswordInput
                    id="old-password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter old password"
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label htmlFor="new-password" className="login-input-label">
                  New Password
                </label>
                <div className="login-input-wrapper">
                  <PasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    minLength={8}
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label
                  htmlFor="confirm-new-password"
                  className="login-input-label"
                >
                  Confirm New Password
                </label>
                <div className="login-input-wrapper">
                  <PasswordInput
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    minLength={8}
                  />
                </div>
              </div>

              {localError ? (
                <p className="error login-error">{localError}</p>
              ) : null}

              <div className="login-form-actions">
                <button
                  type="button"
                  className="login-cancel-btn"
                  onClick={onCancel}
                  disabled={changePasswordMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-action-btn"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending
                    ? 'Saving…'
                    : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

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
            <span className="login-footer-brand-name">
              Inventech Info Solutions
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
