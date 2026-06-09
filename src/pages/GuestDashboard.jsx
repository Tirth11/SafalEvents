import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, Search, Settings, LogOut, Ticket, Compass, History, User, Check, X, Edit2, AlertCircle } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormSelect } from '../components/FormField';

export default function GuestDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(mockStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, explore, past, profile
  const [myRsvps, setMyRsvps] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); // ticket details modal
  const [editRsvpStatus, setEditRsvpStatus] = useState('');
  const [editAnswers, setEditAnswers] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dietary: localStorage.getItem('safal_guest_dietary') || 'None'
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [joinError, setJoinError] = useState('');

  const loadData = () => {
    const user = mockStore.getCurrentUser();
    setCurrentUser(user);
    if (!user) return;

    // Load guest RSVPs
    const allEvents = mockStore.getEvents();
    const userRsvps = [];
    allEvents.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      const userRsvp = rsvps.find(r => r.email === user.email);
      if (userRsvp) {
        userRsvps.push({
          ...userRsvp,
          event: evt
        });
      }
    });
    setMyRsvps(userRsvps);

    // Load explore events (events user hasn't RSVP'd to yet and are Published)
    const exploreList = allEvents.filter(evt => {
      if (evt.status !== 'Published') return false;
      const rsvps = mockStore.getRSVPs(evt.id);
      const userHasRsvp = rsvps.some(r => r.email === user.email);
      return !userHasRsvp;
    });
    setExploreEvents(exploreList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    const evt = mockStore.getEventById(searchCode.trim());
    if (evt) {
      setJoinError('');
      navigate(`/e/${evt.id}`);
    } else {
      setJoinError('Event not found. Try entering code "1" or "2".');
    }
  };

  const handleOpenEditRsvp = (rsvp) => {
    setSelectedTicket(rsvp);
    setEditRsvpStatus(rsvp.status);
    setEditAnswers(rsvp.answers || {});
    setShowEditModal(true);
  };

  const handleSaveRsvpEdit = () => {
    if (!selectedTicket) return;
    mockStore.updateRSVP(selectedTicket.eventId, selectedTicket.id, {
      status: editRsvpStatus,
      answers: editAnswers
    });
    setShowEditModal(false);
    setSelectedTicket(null);
    loadData();
  };

  const checkCancellationAllowed = (rsvp) => {
    if (!rsvp.event.allowSelfCancellation) {
      return { allowed: false, reason: "The host has disabled self-cancellation for this event." };
    }
    if (rsvp.event.cancellationCutoff > 0) {
      const eventDateTime = new Date(`${rsvp.event.date}T${rsvp.event.time}`);
      const now = new Date();
      const hoursDiff = (eventDateTime - now) / (1000 * 60 * 60);
      if (hoursDiff < rsvp.event.cancellationCutoff) {
        return { 
          allowed: false, 
          reason: `Cancellations are only allowed up to ${rsvp.event.cancellationCutoff} hours before the event.` 
        };
      }
    }
    return { allowed: true };
  };

  const handleCancelRsvp = (rsvp) => {
    const check = checkCancellationAllowed(rsvp);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    let reason = '';
    if (rsvp.event.requireCancellationReason) {
      reason = window.prompt("The host requires a cancellation reason. Please explain why you are cancelling:");
      if (reason === null) return; // user cancelled prompt
      if (!reason.trim()) {
        alert("A cancellation reason is required to cancel this RSVP.");
        return;
      }
    }

    if (window.confirm(`Are you sure you want to cancel your RSVP for "${rsvp.event.title}"?${reason ? `\n\nReason: "${reason}"` : ''}`)) {
      mockStore.updateRSVP(rsvp.eventId, rsvp.id, {
        status: 'declined',
        cancellationReason: reason
      });
      loadData();
      setSelectedTicket(null);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    mockStore.setCurrentUser({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone
    });
    localStorage.setItem('safal_guest_dietary', profileForm.dietary);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    loadData();
  };

  const activeRsvps = myRsvps.filter(r => r.status !== 'declined' && r.event.status !== 'Completed');
  const pastRsvps = myRsvps.filter(r => r.status === 'declined' || r.event.status === 'Completed');

  return (
    <PageShell>
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-title">Guest Center</div>
          <nav style={{ flex: 1, display: 'contents' }}>
            <button type="button" onClick={() => setActiveTab('tickets')} className={`dashboard-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}>
              <Ticket size={18} /> My Tickets
            </button>
            <button type="button" onClick={() => setActiveTab('explore')} className={`dashboard-nav-btn ${activeTab === 'explore' ? 'active' : ''}`}>
              <Compass size={18} /> Discover
            </button>
            <button type="button" onClick={() => setActiveTab('past')} className={`dashboard-nav-btn ${activeTab === 'past' ? 'active' : ''}`}>
              <History size={18} /> History
            </button>
            <button type="button" onClick={() => setActiveTab('profile')} className={`dashboard-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>
              <Settings size={18} /> Profile
            </button>
          </nav>
          <button type="button" onClick={onLogout} className="dashboard-nav-btn" style={{ marginTop: 'auto' }}>
            <LogOut size={18} /> Log Out
          </button>
        </aside>

      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <h1>Hey, {currentUser?.name}! 👋</h1>
            <p>Your RSVP portal — find events, manage tickets, and update your profile.</p>
          </div>
          
          {/* Quick Join form */}
          <form onSubmit={handleJoinByCode} className="flex gap-sm items-center" style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Enter event ID (e.g. 1)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                style={{
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: '240px'
                }}
              />
            </div>
            <Button variant="primary" type="submit" style={{ padding: '10px 18px' }}>Join</Button>
            {joinError && (
              <span style={{ position: 'absolute', top: '100%', left: 0, fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {joinError}
              </span>
            )}
          </form>
        </div>

        {/* Tab content */}
        {activeTab === 'tickets' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Attending & Upcoming Tickets</h3>
            
            {activeRsvps.length > 0 ? (
              <div className="grid-2">
                {activeRsvps.map((rsvp) => (
                  <div key={rsvp.id} className="ticket" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: 'var(--spacing-md)', position: 'relative' }}>
                      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          padding: '3px 10px', 
                          borderRadius: 'var(--radius-full)',
                          background: rsvp.status === 'going' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                          color: rsvp.status === 'going' ? '#16a34a' : '#ca8a04',
                          textTransform: 'uppercase'
                        }}>
                          {rsvp.status === 'going' ? '✓ Confirmed' : '? Maybe'}
                        </span>
                        {rsvp.checkedIn && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(0, 113, 227, 0.1)', color: 'var(--color-primary)' }}>
                            Checked In
                          </span>
                        )}
                      </div>
                      
                      <h4 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>{rsvp.event.title}</h4>
                      
                      <div className="flex flex-col gap-xs text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                        <span className="flex items-center gap-xs"><Calendar size={14} /> {rsvp.event.date} • {rsvp.event.time}</span>
                        <span className="flex items-center gap-xs"><MapPin size={14} /> {rsvp.event.location}</span>
                      </div>
                    </div>
                    
                    <div className="ticket-divider"></div>
                    
                    <div style={{ padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket holder</p>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.name}</p>
                      </div>
                      <div className="flex gap-xs">
                        {rsvp.event.allowSelfEdit && (
                          <Button variant="ghost" onClick={() => handleOpenEditRsvp(rsvp)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                            Edit RSVP
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => setSelectedTicket(rsvp)} style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <QrCode size={14} /> View Pass
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center" style={{ padding: 'var(--spacing-xl) 0', color: 'var(--color-text-muted)' }}>
                <Ticket size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-sm)' }} />
                <p style={{ marginBottom: 'var(--spacing-md)' }}>You don't have any active RSVPs.</p>
                <Button variant="primary" onClick={() => setActiveTab('explore')}>Discover events to attend</Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Explore Public Events</h3>
            {exploreEvents.length > 0 ? (
              <div className="grid-3">
                {exploreEvents.map((evt) => (
                  <Card key={evt.id} className="flex flex-col justify-between" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: '140px', background: evt.cover ? `url(${evt.cover}) center/cover` : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                    <div style={{ padding: 'var(--spacing-md)', flex: 1 }} className="flex flex-col justify-between">
                      <div>
                        <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>{evt.title}</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
                          {evt.description.length > 90 ? evt.description.substr(0, 90) + '...' : evt.description}
                        </p>
                        <div className="flex flex-col gap-xs text-muted" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>
                          <span className="flex items-center gap-xs"><Calendar size={12} /> {evt.date} • {evt.time}</span>
                          <span className="flex items-center gap-xs"><MapPin size={12} /> {evt.location.split(',')[0]}</span>
                        </div>
                      </div>
                      <Link to={`/e/${evt.id}`}>
                        <Button variant="outline" style={{ width: '100%', padding: '8px' }}>View Invitation</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center" style={{ padding: 'var(--spacing-xl) 0', color: 'var(--color-text-muted)' }}>
                <Compass size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-sm)' }} />
                <p>No new events available to explore at this time.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Past Events & History</h3>
            {pastRsvps.length > 0 ? (
              <div className="flex flex-col gap-md">
                {pastRsvps.map((rsvp) => (
                  <Card key={rsvp.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-md)' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>{rsvp.event.title}</h4>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{rsvp.event.date} • Attended as {currentUser.name}</p>
                    </div>
                    <div className="flex items-center gap-md">
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-full)',
                        background: rsvp.status === 'going' ? 'rgba(0, 113, 227, 0.1)' : 'rgba(100,116,139,0.1)',
                        color: rsvp.status === 'going' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                      }}>
                        {rsvp.status === 'going' ? 'Attended' : 'Declined RSVP'}
                      </span>
                      <Link to={`/e/${rsvp.eventId}`}>
                        <Button variant="ghost" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Visit Event Page</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center" style={{ padding: 'var(--spacing-xl) 0', color: 'var(--color-text-muted)' }}>
                <History size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-sm)' }} />
                <p>No past events recorded in your account history.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <Card style={{ maxWidth: '600px', padding: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Guest Profile Settings</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Update your default RSVP contact information and dietary settings.</p>
            
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-md">
              <FormField label="Full name">
                <FormInput type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </FormField>
              <FormField label="Email">
                <FormInput type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              </FormField>
              <FormField label="Phone">
                <FormInput type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </FormField>
              <FormField label="Dietary preferences">
                <FormSelect value={profileForm.dietary} onChange={(e) => setProfileForm({ ...profileForm, dietary: e.target.value })}>
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Other">Other</option>
                </FormSelect>
              </FormField>

              <div className="flex gap-sm items-center" style={{ marginTop: 'var(--spacing-sm)' }}>
                <Button variant="primary" type="submit">Save Settings</Button>
                {profileSaved && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> Profile updated successfully!</span>}
              </div>
            </form>
          </Card>
        )}

      </main>

      {/* Ticket Details Modal */}
      {selectedTicket && !showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '450px',
            overflow: 'hidden', boxShadow: 'var(--shadow-lg)', position: 'relative', border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <button 
              onClick={() => setSelectedTicket(null)} 
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            {/* Ticket Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #005bb5 100%)',
              padding: 'var(--spacing-lg) var(--spacing-md)', color: 'white', textAlign: 'center'
            }}>
              <Ticket size={36} style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0 }}>OFFICIAL EVENT PASS</h3>
              <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>SafalEvent RSVP Verification</p>
            </div>

            {/* Ticket Body */}
            <div style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text)' }}>{selectedTicket.event.title}</h4>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>{selectedTicket.event.date} • {selectedTicket.event.time}</p>

              {/* QR Code Placeholder */}
              <div style={{
                background: 'white', border: '2px solid var(--color-border)', borderRadius: '12px',
                width: '180px', height: '180px', margin: '0 auto var(--spacing-md) auto',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '12px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
              }}>
                {/* SVG Mock QR Code */}
                <svg width="130" height="130" viewBox="0 0 29 29">
                  <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1v3h3V2zm6-2h1v3h2v1H8zm3 0h1v1h1v1h-2zm2 0h2v1h-1v1h-1zm3 0h2v2h-1v1h-1v-2h-1v1h-1v-3zm3 0h7v7h-7zm1 1v5h5V1zm1 1v3h3V2zM0 8h2v2H0zm3 0h1v1H3zm2 0h1v3H5zm4 1h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-1h1v1h-1zm2 1h1v1h-1zm3-1h1v1h-1zm1 1h1v2h-1v-1h-1zm2-1h1v1h-1zm1 1h2v1h-2zm-12 3h1v1h-1zm2 0h1v1h-1zm2 0h2v1h-2zm4 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm0-3h1v1h-1zm0 2h1v1h-1zm-18 5h7v7H0zm1 1v5h5V15zm1 1v3h3V16zm6-1h1v1H8zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm1 0h2v1h-2zm-9 2h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm2 0h1v1h-1zm1 2h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm1 2h2v1h-2zm-9 2h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm2 0h1v1h-1zm1 2h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm1 2h2v1h-2z" fill="#000" />
                </svg>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '2px', marginTop: '8px' }}>
                  PASS: #{selectedTicket.id.toUpperCase()}
                </span>
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span className="text-muted">Guest:</span>
                  <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span className="text-muted">RSVP Status:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{selectedTicket.status.toUpperCase()}</span>
                </div>
                {Object.keys(selectedTicket.answers || {}).map(q => (
                  <div key={q} className="flex justify-between" style={{ marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '4px' }}>
                    <span className="text-muted" style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{q}:</span>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{selectedTicket.answers[q]}</span>
                  </div>
                ))}
                {selectedTicket.event.cancellationCutoff > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', textAlign: 'left' }}>
                    ⚠️ Cancellations must be made at least {selectedTicket.event.cancellationCutoff} hours prior to the event.
                  </div>
                )}
              </div>

              <div className="flex gap-sm">
                {checkCancellationAllowed(selectedTicket).allowed ? (
                  <Button variant="ghost" onClick={() => handleCancelRsvp(selectedTicket)} style={{ flex: 1, color: '#dc2626' }}>
                    Cancel RSVP
                  </Button>
                ) : (
                  <Button variant="ghost" disabled style={{ flex: 1, color: '#94a3b8', cursor: 'not-allowed' }} title={checkCancellationAllowed(selectedTicket).reason}>
                    Cancel RSVP (Locked)
                  </Button>
                )}
                {selectedTicket.event.allowSelfEdit && (
                  <Button variant="primary" onClick={() => handleOpenEditRsvp(selectedTicket)} style={{ flex: 1 }}>
                    Change Details
                  </Button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedTicket.event.title)}&dates=${selectedTicket.event.date.replace(/-/g,'')}T${(selectedTicket.event.time||'180000').replace(':','')}00/${selectedTicket.event.date.replace(/-/g,'')}T220000&location=${encodeURIComponent(selectedTicket.event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(0,113,227,0.08)', color: 'var(--color-primary)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  + Google Calendar
                </a>
                <a
                  href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(selectedTicket.event.title)}%0ALOCATION:${encodeURIComponent(selectedTicket.event.location)}%0ADTSTART:${selectedTicket.event.date.replace(/-/g,'')}T${(selectedTicket.event.time||'18:00').replace(':','')}00%0ADTEND:${selectedTicket.event.date.replace(/-/g,'')}T220000%0AEND:VEVENT%0AEND:VCALENDAR`}
                  download={`${selectedTicket.event.title.replace(/\s+/g,'-')}.ics`}
                  style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(249,115,22,0.08)', color: 'var(--color-accent)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  + Apple Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit RSVP Modal */}
      {showEditModal && selectedTicket && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '450px',
            padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>Edit RSVP Status</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>For "{selectedTicket.event.title}"</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Your Attendance</label>
              <div className="flex gap-sm">
                <button 
                  type="button" 
                  onClick={() => setEditRsvpStatus('going')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: editRsvpStatus === 'going' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: editRsvpStatus === 'going' ? 'rgba(0, 113, 227, 0.1)' : 'var(--color-surface-hover)', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text)'
                  }}
                >
                  Going
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditRsvpStatus('maybe')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: editRsvpStatus === 'maybe' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: editRsvpStatus === 'maybe' ? 'rgba(0, 113, 227, 0.1)' : 'var(--color-surface-hover)', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text)'
                  }}
                >
                  Maybe
                </button>
              </div>
            </div>

            {selectedTicket.event.questions && selectedTicket.event.questions.map(q => (
              <div key={q} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 500 }}>{q}</label>
                <input 
                  type="text" 
                  value={editAnswers[q] || ''}
                  onChange={(e) => setEditAnswers({ ...editAnswers, [q]: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>
            ))}

            <div className="flex gap-sm justify-end" style={{ marginTop: '20px' }}>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveRsvpEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageShell>
  );
}
