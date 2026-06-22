import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ArrowRight, LayoutDashboard, Menu, X, LogIn, Sparkles, Bell, UserPlus, CheckCircle, CreditCard } from 'lucide-react';
import { mockStore } from '../utils/mockStore';

export default function PageShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = mockStore.getCurrentUser();
    setCurrentUser(user);

    if (user && user.role === 'host') {
      setNotifications(mockStore.getHostNotifications());
      // Poll every 10 seconds to show dynamic updates
      const interval = setInterval(() => {
        setNotifications(mockStore.getHostNotifications());
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    mockStore.markHostNotificationsRead();
    setNotifications(mockStore.getHostNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    mockStore.setCurrentUser({ role: null, name: '', email: '', phone: '' });
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="site-logo">
            <img src="/logo.png" alt="SafalEvents" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
            <span>
              Safal<span style={{ color: 'var(--color-primary)' }}>Events</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="site-nav site-nav-desktop">
            <Link to="/explore" className="site-nav-link">Explore</Link>
            <Link to="/pricing" className="site-nav-link">Pricing</Link>
            {currentUser && currentUser.role && location.pathname !== '/' ? (
              <>
                {currentUser.role === 'host' && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '50%',
                        position: 'relative',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          border: '2px solid white'
                        }}></span>
                      )}
                    </button>

                    {showNotifDropdown && (
                      <div className="glass-surface" style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '320px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-soft)',
                        marginTop: '12px',
                        zIndex: 1000,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Activity Alerts</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {notifications.length > 0 ? (
                            notifications.map(notif => (
                              <div
                                key={notif.id}
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: notif.read ? 'transparent' : 'rgba(255,107,53,0.05)',
                                  fontSize: '0.8rem',
                                  transition: 'background-color 0.2s',
                                  alignItems: 'flex-start',
                                  position: 'relative'
                                }}
                              >
                                <div style={{
                                  padding: '4px',
                                  borderRadius: '50%',
                                  background: notif.type === 'rsvp' ? 'rgba(255,107,53,0.1)' : notif.type === 'payment' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: notif.type === 'rsvp' ? 'var(--color-primary)' : notif.type === 'payment' ? '#16a34a' : '#ca8a04',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: '2px'
                                }}>
                                  {notif.type === 'rsvp' ? <UserPlus size={14} /> : notif.type === 'payment' ? <CreditCard size={14} /> : <CheckCircle size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{notif.title}</div>
                                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2px', lineHeight: '1.3' }}>{notif.message}</div>
                                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', marginTop: '4px' }}>
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                {!notif.read && (
                                  <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    alignSelf: 'center'
                                  }}></span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px', fontSize: '0.8rem' }}>
                              No alerts yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                <Link to="/login?host=true" className="site-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} /> Become a Host
                </Link>
                <Link to="/login?signup=true" className="site-nav-cta">
                  <UserPlus size={14} /> Sign Up <ArrowRight size={14} />
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
          <div className="mobile-only" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 999 }}>
            {currentUser && location.pathname !== '/' ? (
              <>
                {currentUser.role === 'host' && (
                  <Link to="/dashboard" className="dashboard-pill" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', width: 'fit-content' }}>
                    <LayoutDashboard size={16} /> My Dashboard
                  </Link>
                )}
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
                <Link to="/login?host=true" className="site-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '1rem', color: 'var(--color-text)', fontWeight: 600 }}>
                  <Sparkles size={18} style={{ color: 'var(--color-primary)' }} /> Become a Host
                </Link>
                <Link to="/login?signup=true" className="site-nav-cta" onClick={() => setMobileMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', width: '100%', justifyContent: 'center' }}>
                  <UserPlus size={16} /> Sign Up <ArrowRight size={16} />
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
            <strong>© {new Date().getFullYear()} Safalvir Inc.</strong> All rights reserved.
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
