import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ArrowRight, LayoutDashboard, Menu, X, Compass, LogIn, Sparkles } from 'lucide-react';
import { mockStore } from '../utils/mockStore';

export default function PageShell({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Desktop Navigation */}
          <nav className="site-nav site-nav-desktop">
            <Link to="/" className="site-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={15} /> Explore Events
            </Link>

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
                <Link to="/login" className="site-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={15} /> Sign In
                </Link>
                <Link to="/login?signup=true" className="site-nav-cta">
                  <Sparkles size={14} /> Become a Host <ArrowRight size={14} />
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="mobile-only" style={{ gap: '8px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label="Toggle Menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 999,
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <Link to="/" className="site-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>
              <Compass size={18} style={{ color: 'var(--color-primary)' }} /> Explore Events
            </Link>

            {currentUser && currentUser.role ? (
              <>
                <Link to="/dashboard" className="dashboard-pill" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', width: 'fit-content' }}>
                  <LayoutDashboard size={16} /> My Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '8px 0',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={18} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="site-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>
                  <LogIn size={18} style={{ color: 'var(--color-primary)' }} /> Sign In
                </Link>
                <Link to="/login?signup=true" className="site-nav-cta" onClick={() => setMobileMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', width: '100%', justifyContent: 'center' }}>
                  <Sparkles size={16} /> Become a Host <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        )}
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
