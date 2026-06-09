import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import HostDashboard from './pages/HostDashboard'
import GuestDashboard from './pages/GuestDashboard'
import CreateEvent from './pages/CreateEvent'
import EventPage from './pages/EventPage'
import RsvpFlow from './pages/RsvpFlow'
import FeedbackPage from './pages/FeedbackPage'
import AdminDashboard from './pages/AdminDashboard'
import { mockStore } from './utils/mockStore'
import { Sparkles } from 'lucide-react'

function DashboardWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(mockStore.getCurrentUser());

  useEffect(() => {
    const activeUser = mockStore.getCurrentUser();
    // If not logged in, send to login
    if (!activeUser || !activeUser.role) {
      // Set a default user if navigating directly to /dashboard for ease of testing
      const defaultUser = { role: 'host', name: 'Alex Rivera', email: 'alex@safalevent.com', phone: '+1 (555) 999-8888' };
      mockStore.setCurrentUser(defaultUser);
      setUser(defaultUser);
    } else {
      setUser(activeUser);
    }
  }, [location]);

  const handleLogout = () => {
    mockStore.setCurrentUser({ role: null, name: '', email: '', phone: '' });
    navigate('/');
  };

  const toggleRole = (role) => {
    const updated = role === 'host' 
      ? { role: 'host', name: 'Alex Rivera', email: 'alex@safalevent.com', phone: '+1 (555) 999-8888' }
      : role === 'admin'
      ? { role: 'admin', name: 'Super Admin', email: 'admin@safalevent.com', phone: '+1 (555) 000-0000' }
      : { role: 'guest', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567' };
    
    mockStore.setCurrentUser(updated);
    setUser(updated);
    // Reload dashboard state by refreshing window or setting state (state setting is enough)
    window.location.reload();
  };

  if (!user || !user.role) return null;

  return (
    <div style={{ position: 'relative' }}>
      {user.role === 'host' ? (
        <HostDashboard onLogout={handleLogout} />
      ) : user.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <GuestDashboard onLogout={handleLogout} />
      )}

      {/* Floating Demo Persona Switcher */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          zIndex: 9999, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(79, 70, 229, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          padding: '10px 14px', 
          boxShadow: 'var(--shadow-lg)', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center' 
        }}
      >
        <div className="flex items-center gap-xs" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          <Sparkles size={14} /> Quick Switch Role:
        </div>
        <button 
          onClick={() => toggleRole('host')} 
          style={{ 
            background: user.role === 'host' ? 'var(--color-primary)' : 'none', 
            color: user.role === 'host' ? 'white' : 'var(--color-text)', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '5px 10px', 
            fontSize: '0.75rem', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Host
        </button>
        <button 
          onClick={() => toggleRole('admin')} 
          style={{ 
            background: user.role === 'admin' ? '#0ea5e9' : 'none', 
            color: user.role === 'admin' ? 'white' : 'var(--color-text)', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '5px 10px', 
            fontSize: '0.75rem', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Admin
        </button>
        <button 
          onClick={() => toggleRole('guest')} 
          style={{ 
            background: user.role === 'guest' ? 'var(--color-accent)' : 'none', 
            color: user.role === 'guest' ? 'white' : 'var(--color-text)', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '5px 10px', 
            fontSize: '0.75rem', 
            cursor: 'pointer', 
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Guest
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardWrapper />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="/e/:eventId" element={<EventPage />} />
      <Route path="/rsvp/:eventId" element={<RsvpFlow />} />
      <Route path="/feedback/:eventId" element={<FeedbackPage />} />
    </Routes>
  )
}

export default App

