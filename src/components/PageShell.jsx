import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, ArrowRight, LayoutDashboard, Compass } from 'lucide-react';
import { mockStore } from '../utils/mockStore';

export default function PageShell({ children }) {
  const navigate = useNavigate();
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
      {/* Premium Dark Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 0'
      }}>
        <div className="container flex justify-between items-center">
          {/* Logo & Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/logo.png" 
              alt="SafalEvents" 
              style={{ height: '36px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(59,130,246,0.15)' }} 
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
              Safal<span className="text-gradient">Events</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)', transition: 'color 0.2s' }} className="hover:text-text">
              Explore Events
            </Link>

            {currentUser && currentUser.role ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link 
                  to="/dashboard" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: 'var(--color-primary)', 
                    background: 'rgba(59,130,246,0.08)', 
                    padding: '6px 12px', 
                    borderRadius: 'var(--radius-sm)' 
                  }}
                >
                  <LayoutDashboard size={14} /> My Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-text-muted)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                  className="hover:text-text"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }} className="hover:text-text">
                  Sign In
                </Link>
                <Link 
                  to="/login?signup=true" 
                  style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    background: 'var(--color-primary)', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: 'var(--radius-full)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  Become a Host <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Page Area */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {children}
      </main>

      {/* Premium Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px 0',
        background: '#070a11',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--spacing-xl)'
      }}>
        <div className="container flex justify-between items-center">
          <div>
            <strong>© {new Date().getFullYear()} SafalEvents.</strong> Made for events that actually happen.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/terms" style={{ color: 'var(--color-text-muted)' }} className="hover:text-text">Terms</Link>
            <Link to="/privacy" style={{ color: 'var(--color-text-muted)' }} className="hover:text-text">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
