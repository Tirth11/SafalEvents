import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ArrowRight, LayoutDashboard } from 'lucide-react';
import { mockStore } from '../utils/mockStore';

export default function PageShell({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(mockStore.getCurrentUser());
  }, []);

  const handleLogout = () => {
    mockStore.setCurrentUser({ role: null, name: '', email: '', phone: '' });
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="site-logo">
            <div className="site-logo-mark">SE</div>
            <span>
              Safal<span style={{ color: 'var(--color-primary)' }}>Events</span>
            </span>
          </Link>

          <nav className="site-nav site-nav-desktop">
            <Link to="/" className="site-nav-link">Explore Events</Link>

            {currentUser && currentUser.role ? (
              <>
                <Link to="/dashboard" className="dashboard-pill">
                  <LayoutDashboard size={14} /> My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="site-nav-link">Sign In</Link>
                <Link to="/login?signup=true" className="site-nav-cta">
                  Become a Host <ArrowRight size={14} />
                </Link>
              </>
            )}
          </nav>

          <div className="mobile-only" style={{ gap: '8px' }}>
            {currentUser && currentUser.role ? (
              <Link to="/dashboard" className="dashboard-pill" style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                <LayoutDashboard size={14} />
              </Link>
            ) : (
              <Link to="/login" className="site-nav-cta" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="container site-footer-inner">
          <div>
            <strong>© {new Date().getFullYear()} SafalEvents.</strong> Made for events that actually happen.
          </div>
          <div className="site-footer-links">
            <Link to="/terms" className="site-nav-link">Terms</Link>
            <Link to="/privacy" className="site-nav-link">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
