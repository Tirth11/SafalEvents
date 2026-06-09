import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, QrCode, Search, Settings, LogOut, Ticket, Compass, History, User, Check, X, Edit2, AlertCircle,
  Clock, Mail, Download, Trash2, CreditCard, MessageSquare, Star, Share2, HelpCircle
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormSelect } from '../components/FormField';

export default function GuestDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(mockStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, explore, timeline, messages, past, profile
  const [myRsvps, setMyRsvps] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null); // ticket details modal
  const [editRsvpStatus, setEditRsvpStatus] = useState('');
  const [editAnswers, setEditAnswers] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    dietary: 'None',
    preferredChannel: 'Email',
    reminderSchedule: 'both',
    optOutSms: false
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [timelineItems, setTimelineItems] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [viewLogDetail, setViewLogDetail] = useState(null);

  // Search & Filter state for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyYear, setHistoryYear] = useState('All');

  const getTimelineData = (user, db) => {
    if (!user || !db) return [];
    const items = [];
    const myUserRsvps = db.rsvps?.filter(r => r.email === user.email) || [];

    myUserRsvps.forEach(rsvp => {
      const event = db.events?.find(e => e.id === rsvp.eventId);
      if (!event) return;

      // 1. RSVP Creation
      items.push({
        id: `rsvp_${rsvp.id}`,
        title: rsvp.status === 'waitlist' 
          ? `Waitlist entry registered for "${event.title}"` 
          : `RSVP registered for "${event.title}"`,
        description: `Status set to: ${rsvp.status.toUpperCase()}. Guest Count: ${rsvp.guestCount || 1}.`,
        timestamp: rsvp.timestamp,
        type: 'booking'
      });

      // 2. Check-in
      if (rsvp.checkedIn) {
        items.push({
          id: `checkin_${rsvp.id}`,
          title: `Checked-in to "${event.title}"`,
          description: `QR pass scanned and entry approved at the venue.`,
          timestamp: rsvp.timestamp,
          type: 'checkin'
        });
      }

      // 3. Payments
      if (event.enablePayments && rsvp.status !== 'declined' && rsvp.status !== 'waitlist') {
        const totalPaid = (event.ticketPrice || 0) * (rsvp.guestCount || 1);
        items.push({
          id: `payment_${rsvp.id}`,
          title: `Payment Received for "${event.title}"`,
          description: `Paid $${totalPaid.toFixed(2)} via Credit Card (Booking ID: ${rsvp.id.toUpperCase()}). Receipt email sent.`,
          timestamp: rsvp.timestamp,
          type: 'payment'
        });
      }

      // 4. Comments
      const myComments = db.comments?.filter(c => c.eventId === event.id && (c.name === user.name || c.email === user.email)) || [];
      myComments.forEach(comment => {
        items.push({
          id: `comment_${comment.id}`,
          title: `Posted Comment on "${event.title}"`,
          description: `Text: "${comment.text}"`,
          timestamp: comment.timestamp,
          type: 'comment'
        });
      });

      // 5. Feedback
      const myFeedback = db.feedbackResponses?.filter(f => f.eventId === event.id && (f.name === user.name || f.email === user.email)) || [];
      myFeedback.forEach(fb => {
        items.push({
          id: `feedback_${fb.id}`,
          title: `Submitted Feedback Survey for "${event.title}"`,
          description: `Rating: ${fb.rating}/5 stars. Review: "${fb.comments || 'No comment text'}"`,
          timestamp: fb.submittedAt,
          type: 'feedback'
        });
      });
    });

    // 6. Notification Logs
    const myNotifs = db.notificationLogs?.filter(log => log.guestEmail === user.email) || [];
    myNotifs.forEach(log => {
      items.push({
        id: `notif_${log.id}`,
        title: `${log.channel} Notification Dispatch`,
        description: `Subject: "${log.subject}". Status: ${log.status || 'Sent'}`,
        timestamp: log.sentAt,
        type: 'notification'
      });
    });

    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const loadData = () => {
    const user = mockStore.getCurrentUser();
    setCurrentUser(user);
    if (!user) return;

    // Load database
    const db = JSON.parse(localStorage.getItem('safalevent_db') || '{}');

    // Sync form state
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dietary: localStorage.getItem('safal_guest_dietary') || 'None',
      preferredChannel: user.preferredChannel || 'Email',
      preferredNotification: user.preferredChannel || 'Email', // duplicate for backup
      reminderSchedule: user.reminderSchedule || 'both',
      optOutSms: user.optOutSms || false
    });

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

    // Load explore events
    const exploreList = allEvents.filter(evt => {
      if (evt.status !== 'Published') return false;
      const rsvps = mockStore.getRSVPs(evt.id);
      const userHasRsvp = rsvps.some(r => r.email === user.email);
      return !userHasRsvp;
    });
    setExploreEvents(exploreList);

    // Timeline & Message logs
    setTimelineItems(getTimelineData(user, db));
    setMessageLogs((db.notificationLogs || []).filter(log => log.guestEmail === user.email));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rsvpId = params.get('rsvpId');
    if (rsvpId) {
      const db = JSON.parse(localStorage.getItem('safalevent_db') || '{}');
      const rsvp = db.rsvps?.find(r => r.id === rsvpId);
      if (rsvp) {
        const matchedUser = db.users?.find(u => u.email === rsvp.email);
        const userObj = matchedUser || {
          role: 'guest',
          name: rsvp.name,
          email: rsvp.email,
          phone: rsvp.phone,
          preferredChannel: rsvp.preferredChannel || 'Email',
          reminderSchedule: rsvp.reminderSchedule || 'both',
          optOutSms: rsvp.optOutSms || false
        };
        mockStore.setCurrentUser(userObj);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
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
      phone: profileForm.phone,
      preferredChannel: profileForm.preferredChannel,
      reminderSchedule: profileForm.reminderSchedule,
      optOutSms: profileForm.optOutSms
    });
    localStorage.setItem('safal_guest_dietary', profileForm.dietary);

    // Update guest's RSVPs to match preferences
    const db = JSON.parse(localStorage.getItem('safalevent_db') || '{}');
    if (db.rsvps) {
      db.rsvps = db.rsvps.map(r => r.email === currentUser.email ? {
        ...r,
        preferredChannel: profileForm.preferredChannel,
        reminderSchedule: profileForm.reminderSchedule,
        optOutSms: profileForm.optOutSms
      } : r);
      localStorage.setItem('safalevent_db', JSON.stringify(db));
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
    loadData();
  };

  const handleExportGuestCSV = () => {
    const db = JSON.parse(localStorage.getItem('safalevent_db') || '{}');
    const user = mockStore.getCurrentUser();
    if (!user) return;

    const myUserRsvps = db.rsvps?.filter(r => r.email === user.email) || [];
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Export Date: " + new Date().toISOString() + "\n";
    csvContent += "Guest Name,Guest Email,Guest Phone,Dietary\n";
    csvContent += `"${user.name}","${user.email}","${user.phone}","${localStorage.getItem('safal_guest_dietary') || 'None'}"\n\n`;
    
    csvContent += "TICKETS & RSVPs\n";
    csvContent += "Event ID,Event Title,Date,Time,Location,Status,Checked-In,Timestamp\n";
    myUserRsvps.forEach(r => {
      const event = db.events?.find(e => e.id === r.eventId) || {};
      csvContent += `"${r.eventId}","${event.title || ''}","${event.date || ''}","${event.time || ''}","${event.location || ''}","${r.status}",${r.checkedIn ? 'Yes' : 'No'},"${r.timestamp}"\n`;
    });

    csvContent += "\nACTIVITY TIMELINE\n";
    csvContent += "Timestamp,Activity Type,Activity Description\n";
    const timelineData = getTimelineData(user, db);
    timelineData.forEach(item => {
      csvContent += `"${item.timestamp}","${item.type}","${item.title}: ${item.description}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guest_data_${user.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePurgeAccountData = () => {
    if (window.confirm("⚠️ DANGER: Are you sure you want to permanently delete your guest account and purge all your RSVP registrations? This cannot be undone!")) {
      const db = JSON.parse(localStorage.getItem('safalevent_db') || '{}');
      const user = mockStore.getCurrentUser();
      if (!user) return;

      if (db.comments) {
        db.comments = db.comments.filter(c => c.email !== user.email && c.name !== user.name);
      }
      if (db.rsvps) {
        db.rsvps = db.rsvps.filter(r => r.email !== user.email);
      }
      if (db.notificationLogs) {
        db.notificationLogs = db.notificationLogs.filter(log => log.guestEmail !== user.email);
      }

      localStorage.setItem('safalevent_db', JSON.stringify(db));
      localStorage.removeItem('safal_guest_dietary');
      
      alert("Your account data has been successfully purged. Logging out...");
      onLogout();
    }
  };

  // Classify tickets into Active and Past/Declined
  const activeRsvps = myRsvps.filter(r => r.status !== 'declined' && r.event.status !== 'Completed');
  const pastRsvps = myRsvps.filter(r => r.status === 'declined' || r.event.status === 'Completed');

  // Compute metrics variables
  const totalEventsCount = myRsvps.length;
  const attendingCount = myRsvps.filter(r => r.status === 'going').length;
  const pendingCount = myRsvps.filter(r => r.status === 'maybe' || r.status === 'waitlist').length;

  // Search and Filter Past Records
  const filteredPastRsvps = pastRsvps.filter(r => {
    const matchesSearch = r.event.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                          r.event.location.toLowerCase().includes(historySearch.toLowerCase());
    const yearString = new Date(r.event.date).getFullYear().toString();
    const matchesYear = historyYear === 'All' || yearString === historyYear;
    return matchesSearch && matchesYear;
  });

  const getAvailableYears = () => {
    const years = new Set();
    pastRsvps.forEach(r => {
      if (r.event.date) {
        years.add(new Date(r.event.date).getFullYear().toString());
      }
    });
    return Array.from(years).sort().reverse();
  };

  // Up Next Event (the soonest upcoming event)
  const getUpNextEvent = () => {
    const upcoming = myRsvps.filter(r => r.event.status === 'Published' && new Date(r.event.date) >= new Date() && r.status !== 'declined');
    if (upcoming.length === 0) return null;
    return upcoming.sort((a, b) => new Date(a.event.date) - new Date(b.event.date))[0];
  };

  const upNext = getUpNextEvent();

  return (
    <PageShell>
      <div className="dashboard-layout">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🎟️</span> Guest Center
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <button type="button" onClick={() => setActiveTab('tickets')} className={`dashboard-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}>
              <Ticket size={18} /> My RSVPs
            </button>
            <button type="button" onClick={() => setActiveTab('explore')} className={`dashboard-nav-btn ${activeTab === 'explore' ? 'active' : ''}`}>
              <Compass size={18} /> Discover
            </button>
            <button type="button" onClick={() => setActiveTab('timeline')} className={`dashboard-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`}>
              <Clock size={18} /> Activity Timeline
            </button>
            <button type="button" onClick={() => setActiveTab('messages')} className={`dashboard-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}>
              <Mail size={18} /> Message Logs
            </button>
            <button type="button" onClick={() => setActiveTab('profile')} className={`dashboard-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>
              <Settings size={18} /> Profile
            </button>
          </nav>
          
          <button type="button" onClick={onLogout} className="dashboard-nav-btn" style={{ marginTop: 'auto', border: '1px solid var(--color-border)' }}>
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Hey, {currentUser?.name}! 👋</h1>
              <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Welcome to your RSVP portal — discover events and track your history.</p>
            </div>
            
            {/* Quick Join form */}
            <form onSubmit={handleJoinByCode} className="flex gap-sm items-center" style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Enter event code (e.g. 1)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    width: '220px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <Button variant="primary" type="submit" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>Join</Button>
              {joinError && (
                <span style={{ position: 'absolute', top: '100%', left: 0, fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 50 }}>
                  <AlertCircle size={12} /> {joinError}
                </span>
              )}
            </form>
          </div>

          {/* ========================================================================= */}
          {/* TAB: MY RSVPs (SPLIT VIEW WITH METRICS & ACCORDION HISTORY)                */}
          {/* ========================================================================= */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-xl">
              
              {/* At-a-Glance Metrics Cards */}
              <div className="grid-3" style={{ gap: '16px' }}>
                <Card style={{ padding: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="glass-surface">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Events</span>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 0 0' }}>{totalEventsCount}</p>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', borderRadius: '8px' }}>
                    <Ticket size={24} />
                  </div>
                </Card>

                <Card style={{ padding: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="glass-surface">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attending</span>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 0 0', color: '#16a34a' }}>{attendingCount}</p>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: '8px' }}>
                    <Check size={24} />
                  </div>
                </Card>

                <Card style={{ padding: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="glass-surface">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Reply</span>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ca8a04' }}>{pendingCount}</p>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(234,179,8,0.1)', color: '#ca8a04', borderRadius: '8px' }}>
                    <Clock size={24} />
                  </div>
                </Card>
              </div>

              {/* Split Pane Layout */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Main Feed Column (2/3) */}
                <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Active & Pending Section */}
                  <Card style={{ padding: 0, overflow: 'hidden', textAlign: 'left' }} className="glass-surface">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⭐ Upcoming & Pending
                      </h3>
                      {pendingCount > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(234,179,8,0.1)', color: '#ca8a04', borderRadius: '12px' }}>
                          {pendingCount} Action Required
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {activeRsvps.length > 0 ? (
                        activeRsvps.map(rsvp => (
                          <div 
                            key={rsvp.id} 
                            style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}
                            className="flex justify-between items-center flex-wrap gap-md hover:bg-slate-50"
                          >
                            <div className="flex gap-md" style={{ flex: 1 }}>
                              <div style={{
                                width: '48px', height: '48px', borderRadius: '8px', 
                                background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                              </div>
                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>{rsvp.event.title}</h4>
                                <div className="flex flex-wrap gap-x-md gap-y-xs text-muted" style={{ fontSize: '0.8rem' }}>
                                  <span className="flex items-center gap-xs"><Calendar size={12} /> {rsvp.event.date} • {rsvp.event.time}</span>
                                  <span className="flex items-center gap-xs"><MapPin size={12} /> {rsvp.event.location.split(',')[0]}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-sm">
                              {rsvp.status === 'going' ? (
                                <>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    Confirmed
                                  </span>
                                  <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setSelectedTicket(rsvp)}>
                                    View Pass
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.2)' }}>
                                    {rsvp.status === 'waitlist' ? 'Waitlisted' : 'Awaiting RSVP'}
                                  </span>
                                  <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => handleOpenEditRsvp(rsvp)}>
                                    Reply Now
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          No upcoming events. Discover new opportunities in the "Discover" tab!
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* History / Accordion Section */}
                  <Card style={{ padding: 0, overflow: 'hidden', textAlign: 'left' }} className="glass-surface">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Event History & Records</h3>
                      
                      <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                          <input 
                            type="text" 
                            placeholder="Search past events..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            style={{ padding: '6px 10px 6px 30px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', width: '180px' }}
                          />
                        </div>
                        <select 
                          value={historyYear}
                          onChange={(e) => setHistoryYear(e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', background: 'var(--color-surface)' }}
                        >
                          <option value="All">All Years</option>
                          {getAvailableYears().map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                      {filteredPastRsvps.length > 0 ? (
                        filteredPastRsvps.map(rsvp => (
                          <details key={rsvp.id} className="group" style={{ border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-surface)', overflow: 'hidden' }}>
                            <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer', listStyle: 'none', background: 'var(--color-surface-hover)', userSelect: 'none' }}>
                              <div className="flex items-center gap-md">
                                <span style={{
                                  fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px',
                                  background: rsvp.status === 'going' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                  color: rsvp.status === 'going' ? '#16a34a' : '#ef4444',
                                  textTransform: 'uppercase', minWidth: '80px', textAlign: 'center'
                                }}>
                                  {rsvp.status === 'going' ? 'Attended' : 'Declined'}
                                </span>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{rsvp.event.title}</h4>
                                  <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>{rsvp.event.date} • {rsvp.event.location.split(',')[0]}</p>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', transition: 'transform 0.2s' }} className="group-open:rotate-180">
                                ▼
                              </span>
                            </summary>
                            
                            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '0.85rem' }}>
                              <div className="grid-3" style={{ gap: '16px' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Registration Type</span>
                                  <strong style={{ display: 'block', marginTop: '2px' }}>{rsvp.event.ticketPrice ? 'Paid Pass ($' + rsvp.event.ticketPrice + ')' : 'Free Entry'}</strong>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>Guests Size</span>
                                  <strong style={{ display: 'block', marginTop: '2px' }}>{rsvp.guestCount || 1} Adult(s)</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                  {rsvp.event.allowSelfEdit && (
                                    <Button variant="ghost" onClick={() => handleOpenEditRsvp(rsvp)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Change RSVP</Button>
                                  )}
                                  <Button variant="outline" onClick={() => setSelectedTicket(rsvp)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>View Ticket</Button>
                                </div>
                              </div>
                            </div>
                          </details>
                        ))
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          No history records found.
                        </div>
                      )}
                    </div>
                  </Card>

                </div>

                {/* Sidebar Column (1/3) */}
                <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                  
                  {/* Profile Summary Card */}
                  <Card style={{ padding: '20px' }} className="glass-surface">
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
                      My Profile
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                      <div className="flex justify-between">
                        <span className="text-muted">Email</span>
                        <span style={{ fontWeight: 600 }} className="break-all">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Member Since</span>
                        <span style={{ fontWeight: 600 }}>2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Dietary Preference</span>
                        <span style={{ fontWeight: 600 }}>{localStorage.getItem('safal_guest_dietary') || 'None'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}
                    >
                      Edit Preferences
                    </button>
                  </Card>

                  {/* Up Next Calendar Card */}
                  {upNext ? (
                    <div style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'start'
                    }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '8px',
                        padding: '10px',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                          {new Date(upNext.event.date + 'T00:00:00').toLocaleDateString([], { month: 'short' }).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                          {new Date(upNext.event.date + 'T00:00:00').getDate()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>Up Next</span>
                        <h4 style={{ margin: '4px 0 2px 0', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{upNext.event.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                          {upNext.status === 'going' ? 'You are confirmed!' : "You haven't confirmed yet."}
                        </p>
                        <button 
                          onClick={() => upNext.status === 'going' ? setSelectedTicket(upNext) : handleOpenEditRsvp(upNext)}
                          style={{
                            marginTop: '16px',
                            background: 'white',
                            color: 'var(--color-primary)',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {upNext.status === 'going' ? 'View Ticket' : 'RSVP Now'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e3a8a 100%)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '16px',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🌲</span>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>No upcoming events</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', opacity: 0.8 }}>Time to search for a new adventure!</p>
                      <Button variant="primary" style={{ background: 'white', color: 'var(--color-primary)', border: 'none', padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setActiveTab('explore')}>Browse Events</Button>
                    </div>
                  )}

                  {/* Help Support Widget */}
                  <Card style={{ padding: '20px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.02)' }} className="glass-surface">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', color: 'rgb(99,102,241)', borderRadius: '8px' }}>
                        <HelpCircle size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: 'rgb(79,70,229)' }}>Need Help?</h4>
                        <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.75rem', lineHeight: 1.4 }}>
                          Can't find your ticket pass, or need to contact the organizer about dietary needs?
                        </p>
                        <button 
                          onClick={() => setActiveTab('profile')}
                          style={{ background: 'none', border: 'none', color: 'rgb(99,102,241)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        >
                          Contact Event Support &rarr;
                        </button>
                      </div>
                    </div>
                  </Card>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: EXPLORE / DISCOVER                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'explore' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)', textAlign: 'left' }}>Explore Public Events</h3>
              {exploreEvents.length > 0 ? (
                <div className="grid-3" style={{ gap: '16px' }}>
                  {exploreEvents.map((evt) => (
                    <Card key={evt.id} className="flex flex-col justify-between" style={{ overflow: 'hidden', padding: 0 }} className="glass-surface card-hover-lift">
                      <div style={{ height: '140px', background: evt.cover ? `url(${evt.cover}) center/cover` : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                      <div style={{ padding: 'var(--spacing-md)', flex: 1, display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '12px', textAlign: 'left' }}>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{evt.title}</h4>
                          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '12px', lineHeight: 1.4 }}>
                            {evt.description.length > 90 ? evt.description.substr(0, 90) + '...' : evt.description}
                          </p>
                          <div className="flex flex-col gap-xs text-muted" style={{ fontSize: '0.75rem' }}>
                            <span className="flex items-center gap-xs"><Calendar size={12} /> {evt.date} • {evt.time}</span>
                            <span className="flex items-center gap-xs"><MapPin size={12} /> {evt.location.split(',')[0]}</span>
                          </div>
                        </div>
                        <Link to={`/e/${evt.id}`}>
                          <Button variant="outline" style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}>View Invitation</Button>
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

          {/* ========================================================================= */}
          {/* TAB: TIMELINE                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'timeline' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)', textAlign: 'left' }}>Guest Activity Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--color-border)', textAlign: 'left' }}>
                {timelineItems.length > 0 ? (
                  timelineItems.map((item, idx) => {
                    let IconComponent = Clock;
                    let iconBg = 'rgba(100,116,139,0.1)';
                    let iconColor = 'var(--color-text-muted)';
                    
                    if (item.type === 'booking') {
                      IconComponent = Ticket;
                      iconBg = 'rgba(0,113,227,0.1)';
                      iconColor = 'var(--color-primary)';
                    } else if (item.type === 'checkin') {
                      IconComponent = QrCode;
                      iconBg = 'rgba(34,197,94,0.1)';
                      iconColor = '#16a34a';
                    } else if (item.type === 'payment') {
                      IconComponent = CreditCard;
                      iconBg = 'rgba(234,179,8,0.1)';
                      iconColor = '#ca8a04';
                    } else if (item.type === 'comment') {
                      IconComponent = MessageSquare;
                      iconBg = 'rgba(147,51,234,0.1)';
                      iconColor = '#9333ea';
                    } else if (item.type === 'feedback') {
                      IconComponent = Star;
                      iconBg = 'rgba(249,115,22,0.1)';
                      iconColor = 'var(--color-accent)';
                    } else if (item.type === 'notification') {
                      IconComponent = Mail;
                      iconBg = 'rgba(100,116,139,0.1)';
                      iconColor = 'var(--color-text-muted)';
                    }

                    return (
                      <div key={item.id} style={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{
                          position: 'absolute', left: '-31px', top: '4px',
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'var(--color-surface)', border: '2px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: iconColor }}></div>
                        </div>
                        
                        <Card style={{ flex: 1, padding: '16px' }} className="glass-surface">
                          <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ display: 'inline-flex', padding: '4px', borderRadius: '4px', background: iconBg, color: iconColor }}>
                                <IconComponent size={14} />
                              </span>
                              {item.title}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>{item.description}</p>
                        </Card>
                      </div>
                    );
                  })
                ) : (
                  <Card className="text-center" style={{ padding: 'var(--spacing-xl) 0', color: 'var(--color-text-muted)', borderLeft: 'none' }}>
                    <Clock size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-sm)' }} />
                    <p>No activity logs recorded yet.</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MESSAGES                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)', textAlign: 'left' }}>Message Delivery Logs</h3>
              <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                {messageLogs.length > 0 ? (
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Date Sent</th>
                        <th>Channel</th>
                        <th>Alert Type</th>
                        <th>Subject Line</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messageLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.85rem' }}>{new Date(log.sentAt).toLocaleString()}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: log.channel === 'Email' ? 'rgba(0,113,227,0.1)' : 'rgba(34,197,94,0.1)', color: log.channel === 'Email' ? 'var(--color-primary)' : '#16a34a', fontWeight: 600 }}>
                              {log.channel}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{log.type}</td>
                          <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{log.subject}</td>
                          <td>
                            <Button 
                              variant="ghost" 
                              onClick={() => setViewLogDetail(log)}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              Read Message
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0' }}>
                    <Mail size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p>No messages have been dispatched to you yet.</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PROFILE                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-lg" style={{ textAlign: 'left' }}>
              <Card style={{ maxWidth: '600px', padding: '24px' }} className="glass-surface">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Guest Profile Preferences</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Update your default RSVP contact information and dietary settings.</p>
                
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-md">
                  <FormField label="Full name">
                    <FormInput type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </FormField>
                  <FormField label="Email address">
                    <FormInput type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} disabled />
                  </FormField>
                  <FormField label="Phone number">
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

                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 700 }}>Notification Preferences</h4>
                    <div className="flex flex-col gap-sm">
                      <FormField label="Preferred Dispatch Channel">
                        <FormSelect 
                          value={profileForm.preferredChannel} 
                          onChange={(e) => setProfileForm({ ...profileForm, preferredChannel: e.target.value })}
                        >
                          <option value="Email">Email Alerts</option>
                          <option value="SMS">SMS & WhatsApp Messages</option>
                        </FormSelect>
                      </FormField>

                      <FormField label="Reminder Schedule">
                        <FormSelect 
                          value={profileForm.reminderSchedule} 
                          onChange={(e) => setProfileForm({ ...profileForm, reminderSchedule: e.target.value })}
                        >
                          <option value="24h">24 hours prior only</option>
                          <option value="3h">3 hours prior only</option>
                          <option value="both">Both 24 hours & 3 hours prior</option>
                          <option value="none">Disable alerts</option>
                        </FormSelect>
                      </FormField>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
                        <input 
                          type="checkbox" 
                          id="optOutSms" 
                          checked={profileForm.optOutSms} 
                          onChange={(e) => setProfileForm({ ...profileForm, optOutSms: e.target.checked })} 
                        />
                        <label htmlFor="optOutSms" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
                          Opt out of SMS alerts permanently (Reply STOP to block text messages)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-sm items-center" style={{ marginTop: '12px' }}>
                    <Button variant="primary" type="submit">Save Preferences</Button>
                    {profileSaved && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> Profile settings updated successfully!</span>}
                  </div>
                </form>
              </Card>

              <Card style={{ maxWidth: '600px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.01)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px', color: '#dc2626' }}>Account Data & Safety Controls</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Export your entire RSVP history logs as a CSV sheet, or permanently delete your account database.</p>
                
                <div className="flex gap-sm">
                  <Button variant="outline" type="button" onClick={handleExportGuestCSV} className="flex items-center gap-xs" style={{ flex: 1 }}>
                    <Download size={15} /> Export Profile (CSV)
                  </Button>
                  <Button variant="outline" type="button" onClick={handlePurgeAccountData} style={{ borderColor: '#dc2626', color: '#dc2626', flex: 1 }} className="flex items-center gap-xs">
                    <Trash2 size={15} /> Delete Account & Purge Data
                  </Button>
                </div>
              </Card>
            </div>
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
                padding: '24px 16px', color: 'white', textAlign: 'center'
              }}>
                <Ticket size={36} style={{ marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0 }}>OFFICIAL EVENT PASS</h3>
                <p style={{ opacity: 0.8, fontSize: '0.8rem', margin: '2px 0 0 0' }}>SafalEvents RSVP Ticket Pass</p>
              </div>

              {/* Ticket Body */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: 'var(--color-text)' }}>{selectedTicket.event.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{selectedTicket.event.date} • {selectedTicket.event.time}</p>

                {/* QR Code Placeholder */}
                <div style={{
                  background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px',
                  width: '170px', height: '170px', margin: '0 auto 16px auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '12px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)'
                }}>
                  <svg width="120" height="120" viewBox="0 0 29 29">
                    <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1v3h3V2zm6-2h1v3h2v1H8zm3 0h1v1h1v1h-2zm2 0h2v1h-1v1h-1zm3 0h2v2h-1v1h-1v-2h-1v1h-1v-3zm3 0h7v7h-7zm1 1v5h5V1zm1 1v3h3V2zM0 8h2v2H0zm3 0h1v1H3zm2 0h1v3H5zm4 1h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-1h1v1h-1zm2 1h1v1h-1zm3-1h1v1h-1zm1 1h1v2h-1v-1h-1zm2-1h1v1h-1zm1 1h2v1h-2zm-12 3h1v1h-1zm2 0h1v1h-1zm2 0h2v1h-2zm4 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm0-3h1v1h-1zm0 2h1v1h-1zm-18 5h7v7H0zm1 1v5h5V15zm1 1v3h3V16zm6-1h1v1H8zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm1 0h2v1h-2zm-9 2h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm2 0h1v1h-1zm1 2h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm1 2h2v1h-2zm-9 2h1v1H9zm1 0h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm2 0h1v1h-1zm1 2h1v1h-1zm1 0h1v1h-1zm2-2h1v1h-1zm1 2h2v1h-2z" fill="#000" />
                  </svg>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '2px', marginTop: '8px' }}>
                    PASS: #{selectedTicket.id.toUpperCase()}
                  </span>
                </div>

                <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'left' }}>
                  <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                    <span className="text-muted">Ticket Holder:</span>
                    <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                    <span className="text-muted">RSVP Status:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{selectedTicket.status.toUpperCase()}</span>
                  </div>
                  {Object.keys(selectedTicket.answers || {}).map(q => (
                    <div key={q} className="flex justify-between" style={{ marginTop: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '4px' }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{q}:</span>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{selectedTicket.answers[q]}</span>
                    </div>
                  ))}
                  {selectedTicket.event.cancellationCutoff > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                      ⚠️ Cancellations must be made at least {selectedTicket.event.cancellationCutoff} hours prior.
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
                      Change details
                    </Button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedTicket.event.title)}&dates=${selectedTicket.event.date.replace(/-/g,'')}T${(selectedTicket.event.time||'180000').replace(':','')}00/${selectedTicket.event.date.replace(/-/g,'')}T220000&location=${encodeURIComponent(selectedTicket.event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(0,113,227,0.06)', color: 'var(--color-primary)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    + Google Calendar
                  </a>
                  <a
                    href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(selectedTicket.event.title)}%0ALOCATION:${encodeURIComponent(selectedTicket.event.location)}%0ADTSTART:${selectedTicket.event.date.replace(/-/g,'')}T${(selectedTicket.event.time||'18:00').replace(':','')}00%0ADTEND:${selectedTicket.event.date.replace(/-/g,'')}T220000%0AEND:VEVENT%0AEND:VCALENDAR`}
                    download={`${selectedTicket.event.title.replace(/\s+/g,'-')}.ics`}
                    style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(249,115,22,0.06)', color: 'var(--color-accent)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
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
              padding: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
              textAlign: 'left'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', margin: 0 }}>Change RSVP Settings</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>For "{selectedTicket.event.title}"</p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Your Attendance</label>
                <div className="flex gap-sm">
                  <button 
                    type="button" 
                    onClick={() => setEditRsvpStatus('going')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: editRsvpStatus === 'going' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: editRsvpStatus === 'going' ? 'rgba(0, 113, 227, 0.08)' : 'var(--color-surface-hover)', cursor: 'pointer', fontWeight: 700, color: 'var(--color-text)'
                    }}
                  >
                    Going
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditRsvpStatus('maybe')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: editRsvpStatus === 'maybe' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: editRsvpStatus === 'maybe' ? 'rgba(0, 113, 227, 0.08)' : 'var(--color-surface-hover)', cursor: 'pointer', fontWeight: 700, color: 'var(--color-text)'
                    }}
                  >
                    Maybe
                  </button>
                </div>
              </div>

              {selectedTicket.event.questions && selectedTicket.event.questions.map(q => (
                <div key={q} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 500 }}>{q}</label>
                  <input 
                    type="text" 
                    value={editAnswers[q] || ''}
                    onChange={(e) => setEditAnswers({ ...editAnswers, [q]: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
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

        {/* Message Details Modal */}
        {viewLogDetail && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
              maxHeight: '85vh', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <span>Message Details</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 8px', 
                      borderRadius: '9999px', 
                      background: viewLogDetail.channel === 'Email' ? 'rgba(0,113,227,0.1)' : 'rgba(34,197,94,0.1)', 
                      color: viewLogDetail.channel === 'Email' ? 'var(--color-primary)' : '#16a34a',
                      fontWeight: 600
                    }}>
                      {viewLogDetail.channel}
                    </span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 8px', 
                      borderRadius: '9999px', 
                      background: 'var(--color-surface-hover)', 
                      color: 'var(--color-text-muted)',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}>
                      {viewLogDetail.type}
                    </span>
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                    Sent on {new Date(viewLogDetail.sentAt || viewLogDetail.timestamp).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setViewLogDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', textAlign: 'left' }}>
                {viewLogDetail.channel === 'Email' ? (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                      <div><strong>To:</strong> {viewLogDetail.guestEmail}</div>
                      <div style={{ marginTop: '4px' }}><strong>Subject:</strong> {viewLogDetail.subject}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--color-bg)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)', minHeight: '150px' }}>
                      {viewLogDetail.body}
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-md)' }}>
                      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                        iMessage / SMS Conversation
                      </div>
                      <div style={{
                        alignSelf: 'flex-start',
                        background: 'var(--color-surface-hover)',
                        color: 'var(--color-text)',
                        padding: '10px 14px',
                        borderRadius: '18px',
                        fontSize: '0.8rem',
                        maxWidth: '85%',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4'
                      }}>
                        {viewLogDetail.body}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'end' }}>
                <Button variant="ghost" onClick={() => setViewLogDetail(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
