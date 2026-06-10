import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import ExploreEvents from './pages/ExploreEvents'
import HostDashboard from './pages/HostDashboard'
import GuestDashboard from './pages/GuestDashboard'
import CreateEvent from './pages/CreateEvent'
import EventPage from './pages/EventPage'
import RsvpFlow from './pages/RsvpFlow'
import FeedbackPage from './pages/FeedbackPage'
import AdminDashboard from './pages/AdminDashboard'
import HostProfile from './pages/HostProfile'
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

      <div className="role-switcher">
        <div className="role-switcher-label">
          <Sparkles size={14} /> Demo roles
        </div>
        <button
          type="button"
          onClick={() => toggleRole('host')}
          className={`role-switcher-btn ${user.role === 'host' ? 'active-host' : ''}`}
        >
          Host
        </button>
        <button
          type="button"
          onClick={() => toggleRole('admin')}
          className={`role-switcher-btn ${user.role === 'admin' ? 'active-admin' : ''}`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => toggleRole('guest')}
          className={`role-switcher-btn ${user.role === 'guest' ? 'active-guest' : ''}`}
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
      <Route path="/explore" element={<ExploreEvents />} />
      <Route path="/dashboard" element={<DashboardWrapper />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="/e/:eventId" element={<EventPage />} />
      <Route path="/host/:hostName" element={<HostProfile />} />
      <Route path="/rsvp/:eventId" element={<RsvpFlow />} />
      <Route path="/feedback/:eventId" element={<FeedbackPage />} />
    </Routes>
  )
}

export default App

