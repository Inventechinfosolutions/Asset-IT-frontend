import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';

import bdaLogo from '@/assets/bda-logo.jpg';
import userIcon from '@/assets/user-icon-on-transparent-background-free-png.webp';
import { useAuth } from '@/features/auth';

import { HeaderDateTime } from './header-date-time';
import { RequestsIcon } from './sidebar-nav-icons';

export function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (!navOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    document.body.classList.add('nav-lock');
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('nav-lock');
    };
  }, [navOpen]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`admin-shell${navOpen ? ' nav-open' : ''}`}>
      <header className="shell-header">
        <div className="shell-header-left">
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            aria-controls="user-sidebar"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="nav-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div className="shell-header-brand">
            <img src={bdaLogo} alt="BDA" className="shell-header-logo" />
            <div className="shell-header-copy">
              <span className="shell-header-eyebrow">
                Bangalore Development Authority
              </span>
              <strong className="shell-header-title">
                BDA Asset &amp; IT Request Management Portal
              </strong>
              <span className="shell-header-subtitle">User portal</span>
            </div>
          </div>
        </div>
        <div className="shell-header-right">
          <HeaderDateTime />
          <div className="topbar-user shell-header-user">
            <img src={userIcon} alt="" className="topbar-user-icon" />
            <div className="topbar-user-meta">
              <span className="topbar-user-label">Signed in</span>
              <p className="topbar-user-name">{user.name}</p>
            </div>
          </div>
        </div>
      </header>

      <button
        type="button"
        className="nav-backdrop"
        aria-label="Close menu"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

      <aside className="sidebar" id="user-sidebar">
        <nav className="sidebar-nav">
          <NavLink
            to="/portal"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            end={false}
          >
            <RequestsIcon className="nav-link-icon" />
            Requests
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
            aria-label="Log out"
          >
            <span className="sidebar-logout-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 4a8 8 0 1 1 0 16" />
                <path d="M10 12H3" />
                <path d="M6.5 8.5 3 12l3.5 3.5" />
              </svg>
            </span>
            <span className="sidebar-logout-text">Log out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
