import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, Search, Settings, LogOut, Ticket, Compass, History, User, Check, X, Edit2, AlertCircle, Clock, ArrowRight, Download, HelpCircle, Mail, Sparkles, Star, Trash2, CreditCard, MessageSquare, Send, Share2 } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { HERO_IMAGES, AVATARS, getEventCover, getAvatar } from '../utils/images';
import { calcAge, meetsAge } from '../utils/age';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import DashboardTopBar from '../components/DashboardTopBar';
import FormField, { FormInput, FormSelect } from '../components/FormField';

export default function GuestDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(mockStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, explore, timeline, messages, past, profile
  const [myRsvps, setMyRsvps] = useState([]);
  const [exploreEvents, setExploreEvents] = useState([]);
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
  const [profileAvatar, setProfileAvatar] = useState(mockStore.getCurrentUser()?.avatar || null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [timelineItems, setTimelineItems] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [viewLogDetail, setViewLogDetail] = useState(null);

  // Host messaging
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [composeText, setComposeText] = useState('');
  const [messagesView, setMessagesView] = useState('chats'); // chats | logs
  // Compose-to-host modal (launched from an RSVP ticket)
  const [messageHostFor, setMessageHostFor] = useState(null); // rsvp object
  const [hostMessageText, setHostMessageText] = useState('');

  // Search & Filter state for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyYear, setHistoryYear] = useState('All');

  // Search & Filter state for Discover
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [discoverState, setDiscoverState] = useState('');
  const [discoverCity, setDiscoverCity] = useState('');
  const [discoverType, setDiscoverType] = useState('');

  const getTimelineData = (user, db) => {
    if (!user || !db) return [];
    const items = [];
    const myUserRsvps = db.rsvps?.filter(r => r.email === user.email) || [];

    myUserRsvps.forEach(rsvp => {
      const event = db.events?.find(e => e.id === rsvp.eventId);
      if (!event) return;
      const ctx = { eventId: event.id, eventTitle: event.title };

      // 1. RSVP Creation
      items.push({
        ...ctx,
        id: `rsvp_${rsvp.id}`,
        title: rsvp.status === 'waitlist' ? 'Joined the waitlist' : 'RSVP registered',
        description: `Status set to ${rsvp.status.toUpperCase()} · Guest count: ${rsvp.guestCount || 1}.`,
        timestamp: rsvp.timestamp,
        type: 'booking'
      });

      // 2. Check-in
      if (rsvp.checkedIn) {
        items.push({
          ...ctx,
          id: `checkin_${rsvp.id}`,
          title: 'Checked in at the venue',
          description: 'QR pass scanned and entry approved.',
          timestamp: rsvp.timestamp,
          type: 'checkin'
        });
      }

      // 3. Payments
      if (event.enablePayments && rsvp.status !== 'declined' && rsvp.status !== 'waitlist') {
        const totalPaid = (event.ticketPrice || 0) * (rsvp.guestCount || 1);
        items.push({
          ...ctx,
          id: `payment_${rsvp.id}`,
          title: `Payment received · $${totalPaid.toFixed(2)}`,
          description: `Paid via Credit Card · Booking ID ${rsvp.id.toUpperCase()}. Receipt emailed.`,
          timestamp: rsvp.timestamp,
          type: 'payment'
        });
      }

      // 4. Comments
      const myComments = db.comments?.filter(c => c.eventId === event.id && (c.name === user.name || c.email === user.email)) || [];
      myComments.forEach(comment => {
        items.push({
          ...ctx,
          id: `comment_${comment.id}`,
          title: 'Posted a comment',
          description: `“${comment.text}”`,
          timestamp: comment.timestamp,
          type: 'comment'
        });
      });

      // 4b. Messages exchanged with the host for this event
      const eventConvo = db.conversations?.find(c => c.eventId === event.id && c.guestEmail === user.email);
      if (eventConvo) {
        eventConvo.messages.forEach(msg => {
          items.push({
            ...ctx,
            id: `msg_${eventConvo.id}_${msg.id}`,
            title: msg.sender === 'guest' ? 'You messaged the host' : `${eventConvo.hostName} replied`,
            description: `“${msg.text}”`,
            timestamp: msg.timestamp,
            type: 'message'
          });
        });
      }

      // 5. Feedback
      const myFeedback = db.feedbackResponses?.filter(f => f.eventId === event.id && (f.name === user.name || f.email === user.email)) || [];
      myFeedback.forEach(fb => {
        items.push({
          ...ctx,
          id: `feedback_${fb.id}`,
          title: `Submitted feedback · ${fb.rating}/5 ★`,
          description: `“${fb.comments || 'No written review'}”`,
          timestamp: fb.submittedAt,
          type: 'feedback'
        });
      });

      // 6. Notification Logs for this event
      const eventNotifs = db.notificationLogs?.filter(log => log.guestEmail === user.email && log.eventId === event.id) || [];
      eventNotifs.forEach(log => {
        items.push({
          ...ctx,
          id: `notif_${log.id}`,
          title: `${log.channel} alert sent`,
          description: `“${log.subject}” · ${log.status || 'Sent'}`,
          timestamp: log.sentAt,
          type: 'notification'
        });
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

    // Host conversations for this guest
    setConversations(mockStore.getGuestConversations(user.email));

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

  const handleSharePass = () => {
    if (!selectedTicket) return;
    const shareUrl = `${window.location.origin}/pass/${selectedTicket.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Pass share link copied to clipboard!\n${shareUrl}`);
    }).catch(err => {
      alert(`Could not copy share link: ${err}`);
    });
  };

  // Open the "Message Host" composer for a given RSVP'd event
  const handleOpenMessageHost = (rsvp) => {
    setMessageHostFor(rsvp);
    setHostMessageText('');
    setSelectedTicket(null);
  };

  // Send the first message to a host from the composer modal
  const handleSendHostMessage = () => {
    if (!messageHostFor || !hostMessageText.trim()) return;
    const convo = mockStore.sendGuestMessage(messageHostFor.eventId, currentUser, hostMessageText.trim());
    setMessageHostFor(null);
    setHostMessageText('');
    loadData();
    // Jump to the conversation in the Messages tab
    setActiveTab('messages');
    setMessagesView('chats');
    if (convo) setActiveConversationId(convo.id);
  };

  // Reply within an open conversation thread
  const handleSendReply = () => {
    if (!activeConversationId || !composeText.trim()) return;
    mockStore.sendGuestMessage(
      conversations.find(c => c.id === activeConversationId)?.eventId,
      currentUser,
      composeText.trim()
    );
    setComposeText('');
    const refreshed = mockStore.getGuestConversations(currentUser.email);
    setConversations(refreshed);
  };

  const handleOpenConversation = (convoId) => {
    setActiveConversationId(convoId);
    mockStore.markConversationRead(convoId, 'guest');
    setConversations(mockStore.getGuestConversations(currentUser.email));
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

  // Read an uploaded image as a data URL and store it as the guest's profile photo
  const handleGuestAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileAvatar(reader.result);
      try { mockStore.setCurrentUser({ ...mockStore.getCurrentUser(), avatar: reader.result }); } catch (err) { /* no-op */ }
    };
    reader.readAsDataURL(file);
  };

  // Resolved guest avatar: uploaded photo if present, else a generated one
  const guestAvatar = profileAvatar || getAvatar(currentUser?.email || currentUser?.name);

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
  const pendingCount = myRsvps.filter(r => r.status === 'waitlist' || r.approvalState === 'UNDER_APPROVAL').length;

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

  // ── Discover search / location / type filtering ──
  const discoverStates = [...new Set(exploreEvents.map(e => e.state).filter(Boolean))].sort();
  const discoverCities = [...new Set(
    exploreEvents
      .filter(e => !discoverState || e.state === discoverState)
      .map(e => e.location.split(',')[0].trim())
  )].sort();
  const discoverTypes = [...new Set(exploreEvents.map(e => e.eventType).filter(Boolean))].sort();

  const filteredExplore = exploreEvents.filter(evt => {
    const q = discoverSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      evt.title.toLowerCase().includes(q) ||
      evt.location.toLowerCase().includes(q) ||
      (evt.description && evt.description.toLowerCase().includes(q)) ||
      (evt.eventType && evt.eventType.toLowerCase().includes(q));
    const matchesState = !discoverState || evt.state === discoverState;
    const matchesCity = !discoverCity || evt.location.split(',')[0].trim() === discoverCity;
    const matchesType = !discoverType || evt.eventType === discoverType;
    return matchesSearch && matchesState && matchesCity && matchesType;
  });

  const discoverFiltersActive = discoverSearch || discoverState || discoverCity || discoverType;

  // Up Next Event (the soonest upcoming event)
  const getUpNextEvent = () => {
    const upcoming = myRsvps.filter(r => r.event.status === 'Published' && new Date(r.event.date) >= new Date() && r.status !== 'declined');
    if (upcoming.length === 0) return null;
    return upcoming.sort((a, b) => new Date(a.event.date) - new Date(b.event.date))[0];
  };

  const upNext = getUpNextEvent();

  // Presentation-only derived values for the hero strip
  const daysUntilNext = upNext
    ? Math.max(0, Math.ceil((new Date(upNext.event.date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const upcomingCount = activeRsvps.length;
  const attendedCount = pastRsvps.filter(r => r.status === 'going').length;
  const firstName = (currentUser?.name || 'there').split(' ')[0];

  const dashboardTopBar = (
    <DashboardTopBar
      embedded
      userName={currentUser?.name}
      roleLabel="Guest"
      avatarUrl={profileAvatar}
      planLabel={null}
      notifCount={typeof pendingReplyCount === 'number' ? pendingReplyCount : 0}
      onBell={() => setActiveTab('timeline')}
      onProfile={() => setActiveTab('profile')}
      onLogout={onLogout}
    />
  );

  return (
    <PageShell headerActions={dashboardTopBar}>
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

          <button type="button" onClick={() => setShowHelpModal(true)} className="dashboard-nav-btn" style={{ marginTop: 'auto' }}>
            <HelpCircle size={18} /> Help &amp; Resources
          </button>
          <button type="button" onClick={onLogout} className="dashboard-nav-btn" style={{ border: '1px solid var(--color-border)' }}>
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">

          {/* Personal Photo Hero Strip */}
          <div className="page-hero animate-fade-in" style={{ marginBottom: '16px' }}>
            <img className="page-hero-img" src={HERO_IMAGES.toast} alt="Friends celebrating together" />
            <div className="page-hero-overlay"></div>
            <div className="page-hero-content" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img className="avatar-img avatar-lg" src={guestAvatar} alt={currentUser?.name || 'Guest'} />
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, lineHeight: 1.15 }}>Hey, {firstName}! 👋</h1>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} style={{ color: '#FFD54F' }} />
                    {upNext
                      ? (daysUntilNext === 0
                          ? <>“{upNext.event.title}” is happening today — get excited!</>
                          : <>Your next event is in {daysUntilNext} day{daysUntilNext === 1 ? '' : 's'} — see you at “{upNext.event.title}”!</>)
                      : <>No plans yet? Let's find your next celebration.</>}
                  </p>
                </div>
              </div>

              {/* Discover CTA */}
              <Button
                variant="primary"
                onClick={() => setActiveTab('explore')}
                className="flex items-center gap-xs"
                style={{ padding: '11px 22px', fontSize: '0.88rem', borderRadius: '999px' }}
              >
                <Compass size={16} /> Discover Events
              </Button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid-3 animate-fade-in" style={{ gap: '14px', marginBottom: '28px' }}>
            <Card className="card-hover-lift" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-orange"><Ticket size={22} /></div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{upcomingCount}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Upcoming</span>
              </div>
            </Card>
            <Card className="card-hover-lift" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-green"><Check size={22} /></div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{attendedCount}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Attended</span>
              </div>
            </Card>
            <Card className="card-hover-lift" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-purple"><Clock size={22} /></div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{pendingCount}</p>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Pending Reply</span>
              </div>
            </Card>
          </div>

          {/* ========================================================================= */}
          {/* TAB: MY RSVPs (SPLIT VIEW WITH METRICS & ACCORDION HISTORY)                */}
          {/* ========================================================================= */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-xl">

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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                      {activeRsvps.length > 0 ? (
                        activeRsvps.map(rsvp => (
                          <div key={rsvp.id} className="ticket" style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {/* Cover photo with date chip */}
                            <div style={{
                              width: '150px', minHeight: '130px', alignSelf: 'stretch', flexShrink: 0, position: 'relative',
                              background: `url(${getEventCover(rsvp.event)}) center/cover no-repeat`
                            }}>
                              <span style={{
                                position: 'absolute', top: '10px', left: '10px', background: 'white', borderRadius: '10px',
                                padding: '4px 10px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', lineHeight: 1.1
                              }}>
                                <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                                  {new Date(rsvp.event.date + 'T00:00:00').toLocaleDateString([], { month: 'short' })}
                                </span>
                                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                  {new Date(rsvp.event.date + 'T00:00:00').getDate()}
                                </span>
                              </span>
                            </div>

                            {/* Ticket body */}
                            <div style={{ flex: 1, minWidth: '200px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                              <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{rsvp.event.title}</h4>
                                {rsvp.status === 'waitlist' && rsvp.approvalState !== 'REJECTED' ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(245,158,11,0.12)', color: '#ca8a04' }}>
                                    Waitlisted · Under Approval
                                  </span>
                                ) : rsvp.approvalState === 'UNDER_APPROVAL' ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(245,158,11,0.12)', color: '#ca8a04' }}>
                                    Under Approval
                                  </span>
                                ) : rsvp.approvalState === 'REJECTED' ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>
                                    Not Approved
                                  </span>
                                ) : rsvp.status === 'going' ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(0,200,83,0.12)', color: 'var(--color-accent)' }}>
                                    Confirmed
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(31, 58, 99,0.12)', color: 'var(--color-primary)' }}>
                                    {rsvp.status === 'waitlist' ? 'Waitlisted' : 'Awaiting RSVP'}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-md gap-y-xs text-muted" style={{ fontSize: '0.8rem' }}>
                                <span className="flex items-center gap-xs"><Calendar size={12} /> {rsvp.event.date} • {rsvp.event.time}</span>
                                <span className="flex items-center gap-xs"><MapPin size={12} /> {rsvp.event.location.split(',')[0]}</span>
                              </div>
                              <div className="flex items-center gap-xs" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <img className="avatar-img avatar-sm" src={getAvatar(rsvp.event.hostEmail || rsvp.event.hostName || `host-${rsvp.event.id}`)} alt="Event host" />
                                Hosted by <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{rsvp.event.hostName || 'Organizer'}</span>
                              </div>
                            </div>

                            {/* Ticket stub: actions */}
                            <div style={{
                              borderLeft: '2px dashed var(--color-border)', padding: '16px 18px', display: 'flex',
                              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '140px'
                            }}>
                              <QrCode size={26} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} />
                              {rsvp.status === 'waitlist' && rsvp.approvalState !== 'REJECTED' ? (
                                <Button variant="outline" disabled style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', opacity: 0.85 }}>
                                  Waitlisted
                                </Button>
                              ) : rsvp.approvalState === 'UNDER_APPROVAL' ? (
                                <Button variant="outline" disabled style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', opacity: 0.85 }}>
                                  Awaiting Approval
                                </Button>
                              ) : rsvp.approvalState === 'REJECTED' ? (
                                <Button variant="outline" disabled style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', opacity: 0.7 }}>
                                  Not Approved
                                </Button>
                              ) : rsvp.status === 'going' ? (
                                <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }} onClick={() => setSelectedTicket(rsvp)}>
                                  View Pass
                                </Button>
                              ) : (
                                <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }} onClick={() => handleOpenEditRsvp(rsvp)}>
                                  Reply Now
                                </Button>
                              )}
                              {/* UC-10: messaging shown only when the host enabled it for this event */}
                              {rsvp.event.messagingEnabled && rsvp.approvalState !== 'REJECTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenMessageHost(rsvp)}
                                  className="flex items-center justify-center gap-xs"
                                  style={{ padding: '7px 12px', fontSize: '0.78rem', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  <MessageSquare size={14} /> Message Host
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <img className="empty-state-img" src={HERO_IMAGES.landing} alt="Confetti celebration" />
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Your calendar is wide open!</h4>
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No upcoming events yet — your next great memory is one RSVP away.</p>
                          <Button variant="primary" onClick={() => setActiveTab('explore')} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                            <Compass size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} /> Explore Events
                          </Button>
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
                                <img className="thumb-img" src={getEventCover(rsvp.event)} alt={rsvp.event.title} />
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{rsvp.event.title}</h4>
                                  <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>{rsvp.event.date} • {rsvp.event.location.split(',')[0]}</p>
                                </div>
                                <span style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                                  background: rsvp.status === 'going' ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.1)',
                                  color: rsvp.status === 'going' ? 'var(--color-accent)' : '#FF1744',
                                  textTransform: 'uppercase', textAlign: 'center'
                                }}>
                                  {rsvp.status === 'going' ? 'Attended' : 'Declined'}
                                </span>
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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                                  {rsvp.status === 'going' && (
                                    <Link to={`/feedback/${rsvp.event.id}`} style={{ textDecoration: 'none' }}>
                                      <Button variant="primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} className="flex items-center gap-xs">
                                        <Star size={13} /> Leave Feedback
                                      </Button>
                                    </Link>
                                  )}
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
                        <div className="empty-state" style={{ padding: '24px' }}>
                          <History size={36} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No history records found — your memories will collect here.</p>
                        </div>
                      )}
                    </div>
                  </Card>

                </div>

                {/* Sidebar Column (1/3) */}
                <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                  
                  {/* Profile Summary Card */}
                  <Card style={{ padding: '20px' }} className="glass-surface">
                    <div className="flex items-center gap-md" style={{ marginBottom: '16px' }}>
                      <img className="avatar-img avatar-lg" src={guestAvatar} alt={currentUser?.name || 'Guest'} />
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{currentUser?.name}</h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Guest Member</span>
                      </div>
                    </div>
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
                        <span className="text-muted">Total Events</span>
                        <span style={{ fontWeight: 600 }}>{totalEventsCount}</span>
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
                      position: 'relative',
                      overflow: 'hidden',
                      color: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'start'
                    }} className="card-hover-lift">
                      <img src={getEventCover(upNext.event)} alt={upNext.event.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,10,5,0.88) 10%, rgba(31, 58, 99,0.45) 100%)', zIndex: 1 }}></div>
                      <div style={{
                        position: 'relative', zIndex: 2,
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
                      <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
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
                      position: 'relative',
                      overflow: 'hidden',
                      color: 'white',
                      padding: '24px 20px',
                      borderRadius: '16px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <img src={HERO_IMAGES.crowd} alt="Elegant dinner party" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,8,0.62)', zIndex: 1 }}></div>
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🎉</span>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>No upcoming events</h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', opacity: 0.9 }}>Time to search for a new adventure!</p>
                        <Button variant="primary" style={{ background: 'white', color: 'var(--color-primary)', border: 'none', padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setActiveTab('explore')}>Browse Events</Button>
                      </div>
                    </div>
                  )}

                  {/* Help Support Widget */}
                  <Card style={{ padding: '20px', border: '1px solid rgba(31, 58, 99,0.2)', background: 'rgba(31, 58, 99,0.03)' }} className="glass-surface">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <div style={{ padding: '8px', background: 'rgba(31, 58, 99,0.1)', color: 'var(--color-primary)', borderRadius: '8px' }}>
                        <HelpCircle size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>Need Help?</h4>
                        <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.75rem', lineHeight: 1.4 }}>
                          Can't find your ticket pass, or need to contact the organizer about dietary needs?
                        </p>
                        <button 
                          onClick={() => setActiveTab('profile')}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
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
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Discover Public Events</h3>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Search by name, filter by location or type, and grab your spot.</p>
              </div>

              {/* Search + Filters toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search events, places, types..."
                    value={discoverSearch}
                    onChange={(e) => setDiscoverSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none', background: 'var(--color-surface)', fontFamily: 'inherit' }}
                  />
                </div>
                <select
                  value={discoverState}
                  onChange={(e) => { setDiscoverState(e.target.value); setDiscoverCity(''); }}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: 'var(--color-surface)', outline: 'none' }}
                >
                  <option value="">All States</option>
                  {discoverStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={discoverCity}
                  onChange={(e) => setDiscoverCity(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: 'var(--color-surface)', outline: 'none' }}
                >
                  <option value="">All Cities</option>
                  {discoverCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={discoverType}
                  onChange={(e) => setDiscoverType(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: 'var(--color-surface)', outline: 'none' }}
                >
                  <option value="">All Types</option>
                  {discoverTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {discoverFiltersActive && (
                  <button
                    type="button"
                    onClick={() => { setDiscoverSearch(''); setDiscoverState(''); setDiscoverCity(''); setDiscoverType(''); }}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Result count */}
              {exploreEvents.length > 0 && (
                <p className="text-muted" style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 14px 0', textAlign: 'left' }}>
                  {filteredExplore.length === 0 ? 'No matches' : `${filteredExplore.length} event${filteredExplore.length === 1 ? '' : 's'} found`}
                </p>
              )}

              {filteredExplore.length > 0 ? (
                <div className="grid-3" style={{ gap: '20px' }}>
                  {filteredExplore.map((evt, idx) => (
                    <div key={evt.id} className="event-photo-card" style={{ textAlign: 'left' }}>
                      <div style={{ position: 'relative' }}>
                        <img className="event-photo-card-img" src={getEventCover(evt)} alt={evt.title} />
                        <span style={{
                          position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.95)',
                          borderRadius: '999px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 800,
                          display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text)'
                        }}>
                          <Star size={12} style={{ color: '#FFB300', fill: '#FFB300' }} />
                          {(4.2 + ((idx * 13) % 8) / 10).toFixed(1)}
                        </span>
                      </div>
                      <div className="event-photo-card-body">
                        <h4 style={{ fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{evt.title}</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                          {evt.description.length > 90 ? evt.description.substr(0, 90) + '...' : evt.description}
                        </p>
                        <div className="flex flex-col gap-xs text-muted" style={{ fontSize: '0.75rem' }}>
                          <span className="flex items-center gap-xs"><Calendar size={12} /> {evt.date} • {evt.time}</span>
                          <span className="flex items-center gap-xs"><MapPin size={12} /> {evt.location.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
                          <div className="avatar-stack">
                            {AVATARS.slice(idx % 4, (idx % 4) + 3).map((src, i) => (
                              <img key={i} className="avatar-img avatar-sm" src={src} alt="Guest going" />
                            ))}
                            <span className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.6rem' }}>
                              +{8 + ((idx * 7) % 20)}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>going</span>
                        </div>
                        <Link to={`/e/${evt.id}`} style={{ marginTop: 'auto' }}>
                          <Button variant="primary" style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}>
                            View Invitation <ArrowRight size={14} style={{ marginLeft: '6px', verticalAlign: '-2px' }} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : discoverFiltersActive ? (
                <Card style={{ padding: 0 }}>
                  <div className="empty-state">
                    <Search size={44} style={{ opacity: 0.3, color: 'var(--color-text-muted)' }} />
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>No events match your search</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Try a different keyword, city, or type — or clear your filters.</p>
                    <Button variant="primary" onClick={() => { setDiscoverSearch(''); setDiscoverState(''); setDiscoverCity(''); setDiscoverType(''); }} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>Clear filters</Button>
                  </div>
                </Card>
              ) : (
                <Card style={{ padding: 0 }}>
                  <div className="empty-state">
                    <img className="empty-state-img" src={HERO_IMAGES.landing} alt="Confetti celebration" />
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>You've explored it all!</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No new public events right now — check back soon or join one with a code.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: TIMELINE                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'timeline' && (() => {
            // Visual meta per activity type
            const metaFor = (type) => {
              switch (type) {
                case 'booking': return { Icon: Ticket, bg: 'rgba(31, 58, 99,0.12)', color: 'var(--color-primary)' };
                case 'checkin': return { Icon: QrCode, bg: 'rgba(34,197,94,0.12)', color: '#16a34a' };
                case 'payment': return { Icon: CreditCard, bg: 'rgba(234,179,8,0.12)', color: '#ca8a04' };
                case 'comment': return { Icon: MessageSquare, bg: 'rgba(147,51,234,0.12)', color: '#9333ea' };
                case 'feedback': return { Icon: Star, bg: 'rgba(249,115,22,0.12)', color: 'var(--color-accent)' };
                case 'message': return { Icon: Send, bg: 'rgba(14,165,233,0.12)', color: '#0ea5e9' };
                case 'notification': return { Icon: Mail, bg: 'rgba(100,116,139,0.12)', color: 'var(--color-text-muted)' };
                default: return { Icon: Clock, bg: 'rgba(100,116,139,0.12)', color: 'var(--color-text-muted)' };
              }
            };

            // Event lookup (cover, date, location) from the guest's RSVPs
            const eventsById = {};
            myRsvps.forEach(r => { eventsById[r.event.id] = r.event; });

            // Group chronological items by event (group order follows most-recent activity)
            const groups = [];
            const groupMap = {};
            timelineItems.forEach(item => {
              const key = item.eventId || 'general';
              if (!groupMap[key]) {
                groupMap[key] = { eventId: item.eventId, eventTitle: item.eventTitle || 'General activity', items: [] };
                groups.push(groupMap[key]);
              }
              groupMap[key].items.push(item);
            });

            return (
              <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Activity Timeline</h3>
                  <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    Everything that's happened across the events you've RSVP'd to — grouped by event, newest first.
                  </p>
                </div>

                {groups.length > 0 ? (
                  <div className="flex flex-col gap-lg">
                    {groups.map(group => {
                      const evt = eventsById[group.eventId];
                      return (
                        <Card key={group.eventId || 'general'} style={{ padding: 0, overflow: 'hidden' }} className="glass-surface">
                          {/* Event header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
                            {evt && (
                              <div style={{ width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0, background: `url(${getEventCover(evt)}) center/cover no-repeat`, boxShadow: 'var(--shadow-sm)' }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>{group.eventTitle}</h4>
                              {evt && (
                                <p className="text-muted" style={{ margin: '3px 0 0 0', fontSize: '0.78rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <span className="flex items-center gap-xs"><Calendar size={12} /> {evt.date}</span>
                                  <span className="flex items-center gap-xs"><MapPin size={12} /> {evt.location.split(',')[0]}</span>
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(31, 58, 99,0.1)', color: 'var(--color-primary)', flexShrink: 0 }}>
                              {group.items.length} {group.items.length === 1 ? 'update' : 'updates'}
                            </span>
                          </div>

                          {/* Sub-timeline of activities */}
                          <div style={{ padding: '18px 18px 18px 34px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '24px', top: '24px', bottom: '24px', width: '2px', background: 'var(--color-border)' }} />
                            <div className="flex flex-col gap-md">
                              {group.items.map(item => {
                                const { Icon, bg, color } = metaFor(item.type);
                                return (
                                  <div key={item.id} style={{ position: 'relative', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                    <div style={{ position: 'absolute', left: '-19px', top: '2px', width: '28px', height: '28px', borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface)' }}>
                                      <Icon size={14} />
                                    </div>
                                    <div style={{ flex: 1, marginLeft: '20px' }}>
                                      <div className="flex justify-between items-baseline" style={{ gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.title}</span>
                                        <span className="text-muted" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                          {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-muted" style={{ fontSize: '0.83rem', margin: '3px 0 0 0', lineHeight: 1.45 }}>{item.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card style={{ padding: 0 }} className="glass-surface">
                    <div className="empty-state">
                      <img className="empty-state-img" src={HERO_IMAGES.crowd} alt="Dinner party" />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Nothing here yet</h4>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>RSVP to an event and your activity story will start here.</p>
                      <Button variant="primary" onClick={() => setActiveTab('explore')} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>Explore Events</Button>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB: MESSAGES                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (() => {
            const activeConvo = conversations.find(c => c.id === activeConversationId) || null;
            return (
            <div className="animate-fade-in" style={{ textAlign: 'left' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Messages</h3>
                  <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    Chat directly with hosts of events you've RSVP'd to, and review every alert sent to you.
                  </p>
                </div>
              </div>

              {/* Sub-tab selector */}
              <div className="flex gap-md" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
                {[
                  { key: 'chats', label: 'Host Conversations', count: conversations.length },
                  { key: 'logs', label: 'Delivery Logs', count: messageLogs.length }
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setMessagesView(t.key)}
                    style={{
                      background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.95rem',
                      color: messagesView === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderBottom: messagesView === t.key ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '1px 7px', background: 'rgba(31, 58, 99,0.1)', color: 'var(--color-primary)', borderRadius: '10px' }}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ───── HOST CONVERSATIONS ───── */}
              {messagesView === 'chats' && (
                conversations.length > 0 ? (
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                    {/* Thread list */}
                    <Card style={{ padding: 0, flex: '1', minWidth: '260px', maxWidth: '340px', overflow: 'hidden' }} className="glass-surface">
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', fontWeight: 700, fontSize: '0.9rem' }}>
                        Your Hosts
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {conversations.map(convo => {
                          const last = convo.messages[convo.messages.length - 1];
                          const isActive = convo.id === activeConversationId;
                          return (
                            <button
                              key={convo.id}
                              type="button"
                              onClick={() => handleOpenConversation(convo.id)}
                              style={{
                                display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left',
                                padding: '14px 16px', border: 'none', cursor: 'pointer',
                                borderBottom: '1px solid var(--color-border)',
                                background: isActive ? 'rgba(31, 58, 99,0.06)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
                              }}
                            >
                              <img className="avatar-img" src={getAvatar(convo.hostEmail || convo.hostName)} alt={convo.hostName} style={{ width: '40px', height: '40px' }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="flex justify-between items-center">
                                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>{convo.hostName}</span>
                                  {convo.unreadByGuest && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{convo.eventTitle}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {last?.sender === 'guest' ? 'You: ' : ''}{last?.text}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Active thread */}
                    <Card style={{ padding: 0, flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="glass-surface">
                      {activeConvo ? (
                        <>
                          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface-hover)' }}>
                            <img className="avatar-img" src={getAvatar(activeConvo.hostEmail || activeConvo.hostName)} alt={activeConvo.hostName} style={{ width: '38px', height: '38px' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeConvo.hostName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Host of {activeConvo.eventTitle}</div>
                            </div>
                          </div>

                          <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '280px', maxHeight: '420px', overflowY: 'auto' }}>
                            {activeConvo.messages.map(msg => (
                              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'guest' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                  maxWidth: '78%', padding: '10px 14px', borderRadius: '14px', fontSize: '0.88rem', lineHeight: 1.45,
                                  background: msg.sender === 'guest' ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                                  color: msg.sender === 'guest' ? 'white' : 'var(--color-text)',
                                  borderBottomRightRadius: msg.sender === 'guest' ? '4px' : '14px',
                                  borderBottomLeftRadius: msg.sender === 'guest' ? '14px' : '4px'
                                }}>
                                  <div>{msg.text}</div>
                                  <div style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '4px', textAlign: 'right' }}>
                                    {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ padding: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <textarea
                              value={composeText}
                              onChange={(e) => setComposeText(e.target.value)}
                              placeholder={`Message ${activeConvo.hostName}...`}
                              rows={1}
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                              style={{ flex: 1, resize: 'none', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', background: 'var(--color-bg)' }}
                            />
                            <Button variant="primary" onClick={handleSendReply} disabled={!composeText.trim()} className="flex items-center gap-xs" style={{ padding: '10px 16px' }}>
                              <Send size={15} /> Send
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="empty-state" style={{ margin: 'auto' }}>
                          <MessageSquare size={40} style={{ opacity: 0.3, color: 'var(--color-text-muted)' }} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Pick a conversation</h4>
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Select a host on the left to read and reply.</p>
                        </div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <Card style={{ padding: 0 }} className="glass-surface">
                    <div className="empty-state">
                      <MessageSquare size={44} style={{ opacity: 0.3, color: 'var(--color-text-muted)' }} />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>No conversations yet</h4>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>RSVP to an event, then tap “Message Host” on your ticket to start a chat.</p>
                      <Button variant="primary" onClick={() => setActiveTab('tickets')} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>View my RSVPs</Button>
                    </div>
                  </Card>
                )
              )}

              {/* ───── DELIVERY LOGS ───── */}
              {messagesView === 'logs' && (
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
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: log.channel === 'Email' ? 'rgba(31, 58, 99,0.1)' : 'rgba(34,197,94,0.1)', color: log.channel === 'Email' ? 'var(--color-primary)' : '#16a34a', fontWeight: 600 }}>
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
                    <div className="empty-state">
                      <Mail size={44} style={{ opacity: 0.3, color: 'var(--color-text-muted)' }} />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Inbox is quiet</h4>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No messages have been dispatched to you yet — confirmations and reminders will land here.</p>
                    </div>
                  )}
                </Card>
              )}
            </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TAB: PROFILE                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-lg" style={{ textAlign: 'left' }}>
              <Card style={{ maxWidth: '600px', padding: '24px' }} className="glass-surface">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Guest Profile Preferences</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Update your default RSVP contact information and dietary settings.</p>
                
                <div className="flex items-center gap-md" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
                  <img src={guestAvatar} alt={currentUser?.name || 'Guest'} className="avatar-img avatar-lg" style={{ objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Profile Photo</h4>
                    <p className="text-muted" style={{ margin: '2px 0 10px 0', fontSize: '0.8rem' }}>Add a photo so hosts recognize you across RSVPs and messages.</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label htmlFor="guest-avatar-upload" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <User size={15} /> {profileAvatar ? 'Change photo' : 'Upload photo'}
                      </label>
                      <input id="guest-avatar-upload" type="file" accept="image/*" onChange={handleGuestAvatarUpload} style={{ display: 'none' }} />
                      {profileAvatar && (
                        <button type="button" onClick={() => { setProfileAvatar(null); try { mockStore.setCurrentUser({ ...mockStore.getCurrentUser(), avatar: null }); } catch (e) { /* no-op */ } }} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>

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

        {/* Help & Resources Modal (guest) */}
        {showHelpModal && (
          <div
            onClick={() => setShowHelpModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-fade-in"
              style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="stat-icon-tile stat-icon-blue" style={{ width: '36px', height: '36px' }}><HelpCircle size={18} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Help &amp; Resources</h3>
                    <p className="text-muted" style={{ margin: '1px 0 0 0', fontSize: '0.78rem' }}>Everything you need to RSVP and attend with ease</p>
                  </div>
                </div>
                <button onClick={() => setShowHelpModal(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { title: 'RSVP to an event', desc: 'Open an invite link, pick Yes / Maybe / No and add your party size.' },
                  { title: 'Find your ticket & QR pass', desc: 'Your passes live under “My RSVPs” — show the QR code at the door.' },
                  { title: 'Edit or cancel an RSVP', desc: 'Update your answers or cancel from a ticket, before the host’s cutoff.' },
                  { title: 'Message a host', desc: 'Ask questions from a ticket or the “Message Logs” tab anytime.' },
                  { title: 'Manage notifications', desc: 'Choose email or SMS reminders under Profile preferences.' },
                ].map((r, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => { e.preventDefault(); }}
                    className="card-hover-lift"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text)' }}
                  >
                    <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(31,58,99,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.82rem' }}>{i + 1}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>{r.title}</span>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{r.desc}</span>
                    </span>
                    <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </a>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', padding: '12px 14px', borderRadius: '12px', background: 'var(--color-surface-hover)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  <Mail size={15} style={{ flexShrink: 0 }} /> Still stuck? Email <strong style={{ color: 'var(--color-text)' }}>&nbsp;support@safalevents.com</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {selectedTicket && !showEditModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="custom-scrollbar" style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '450px',
              maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden', boxShadow: 'var(--shadow-lg)', position: 'relative', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              <button 
                 onClick={() => setSelectedTicket(null)} 
                 style={{ 
                   position: 'absolute', 
                   top: '12px', 
                   right: '12px', 
                   border: 'none', 
                   background: 'rgba(15, 23, 42, 0.65)', 
                   cursor: 'pointer', 
                   color: '#ffffff',
                   width: '32px',
                   height: '32px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   zIndex: 10,
                   transition: 'background-color 0.2s ease'
                 }}
                 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)'}
                 onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)'}
               >
                 <X size={16} />
               </button>

              {/* Ticket Header */}
              <div style={{ position: 'relative', padding: '28px 16px', color: 'white', textAlign: 'center', overflow: 'hidden' }}>
                <img src={getEventCover(selectedTicket.event)} alt={selectedTicket.event.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,10,5,0.85) 0%, rgba(31, 58, 99,0.55) 100%)', zIndex: 1 }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <Ticket size={36} style={{ marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0 }}>OFFICIAL EVENT PASS</h3>
                  <p style={{ opacity: 0.9, fontSize: '0.8rem', margin: '2px 0 0 0' }}>SafalEvents RSVP Ticket Pass</p>
                </div>
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

                {/* Age verification badge for age-restricted events (US-EVENT-017) */}
                {selectedTicket.event.ageRestricted && (
                  <div style={{ marginBottom: '12px' }}>
                    {selectedTicket.dob && meetsAge(selectedTicket.dob, selectedTicket.event.minimumAge) ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,200,83,0.12)', color: '#15803d', fontWeight: 800, fontSize: '0.78rem', padding: '4px 12px', borderRadius: '999px' }}>
                        🔒 Age Verified: {selectedTicket.event.minimumAge}+
                      </span>
                    ) : selectedTicket.ageVerified ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,200,83,0.12)', color: '#15803d', fontWeight: 800, fontSize: '0.78rem', padding: '4px 12px', borderRadius: '999px' }}>
                        🔒 Age Verified: {selectedTicket.event.minimumAge}+
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.14)', color: '#b45309', fontWeight: 800, fontSize: '0.78rem', padding: '4px 12px', borderRadius: '999px' }}>
                        ⚠️ Age Unverified – Check ID
                      </span>
                    )}
                  </div>
                )}

                {/* Checked-In Status Badge */}
                <div style={{ marginBottom: '16px' }}>
                  {selectedTicket.checkedIn ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,163,74,0.12)', color: '#16a34a', fontWeight: 800, fontSize: '0.78rem', padding: '6px 14px', borderRadius: '999px' }}>
                      <Check size={14} /> Checked In / Arrived
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(148,163,184,0.12)', color: '#64748b', fontWeight: 800, fontSize: '0.78rem', padding: '6px 14px', borderRadius: '999px' }}>
                      ⏱ Pending Gate Check-In
                    </span>
                  )}
                </div>

                <div style={{ background: 'var(--color-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'left', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                    <span className="text-muted">Ticket Holder:</span>
                    <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                    <span className="text-muted">Current Status:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>{selectedTicket.status}</span>
                  </div>

                  {/* Inline RSVP Toggles */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Change RSVP Status:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { key: 'going', label: 'Yes', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
                        { key: 'maybe', label: 'Maybe', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
                        { key: 'declined', label: 'No', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
                      ].map((opt) => {
                        const isActive = selectedTicket.status === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              mockStore.updateRSVP(selectedTicket.eventId, selectedTicket.id, { status: opt.key }, currentUser.name);
                              setSelectedTicket(prev => ({ ...prev, status: opt.key }));
                              loadData();
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 2px',
                              borderRadius: '6px',
                              border: isActive ? `1.5px solid ${opt.color}` : '1px solid var(--color-border)',
                              background: isActive ? opt.bg : 'var(--color-surface)',
                              color: isActive ? opt.color : 'var(--color-text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              outline: 'none'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guest Count Edit */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      Guests Count {selectedTicket.event.allowSelfEdit ? '(Edit)' : ''}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedTicket.event.maxGuestsPerRsvp || 4}
                      value={selectedTicket.guestCount || 1}
                      disabled={!selectedTicket.event.allowSelfEdit}
                      onChange={(e) => {
                        const count = Math.max(1, parseInt(e.target.value) || 1);
                        setSelectedTicket(prev => ({ ...prev, guestCount: count }));
                        mockStore.updateRSVP(selectedTicket.eventId, selectedTicket.id, { guestCount: count }, currentUser.name);
                        loadData();
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        background: selectedTicket.event.allowSelfEdit ? 'var(--color-bg)' : 'var(--color-surface-hover)',
                        color: 'var(--color-text)',
                        fontSize: '0.78rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Answers Edit */}
                  {selectedTicket.event.questions && selectedTicket.event.questions.map(q => {
                    const currentAns = selectedTicket.answers?.[q] || '';
                    return (
                      <div key={q} style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {q} {selectedTicket.event.allowSelfEdit ? '(Edit)' : ''}
                        </label>
                        <input
                          type="text"
                          value={currentAns}
                          disabled={!selectedTicket.event.allowSelfEdit}
                          onChange={(e) => {
                            const updatedAnswers = { ...(selectedTicket.answers || {}), [q]: e.target.value };
                            setSelectedTicket(prev => ({ ...prev, answers: updatedAnswers }));
                            mockStore.updateRSVP(selectedTicket.eventId, selectedTicket.id, { answers: updatedAnswers }, currentUser.name);
                            loadData();
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            background: selectedTicket.event.allowSelfEdit ? 'var(--color-bg)' : 'var(--color-surface-hover)',
                            color: 'var(--color-text)',
                            fontSize: '0.78rem',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                        />
                      </div>
                    );
                  })}

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
                </div>

                {selectedTicket.event?.messagingEnabled && (
                  <Button
                    variant="outline"
                    onClick={() => handleOpenMessageHost(selectedTicket)}
                    className="flex items-center justify-center gap-xs"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    <MessageSquare size={15} /> Message the Host
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleSharePass}
                  className="flex items-center justify-center gap-xs"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  <Share2 size={15} /> Share Pass Link
                </Button>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedTicket.event.title)}&dates=${selectedTicket.event.date.replace(/-/g,'')}T${(selectedTicket.event.time||'180000').replace(':','')}00/${selectedTicket.event.date.replace(/-/g,'')}T220000&location=${encodeURIComponent(selectedTicket.event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(31, 58, 99,0.06)', color: 'var(--color-primary)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
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
                  {[
                    { key: 'going', label: 'Going', activeColor: 'var(--color-primary)', activeBg: 'rgba(31, 58, 99, 0.08)' },
                    { key: 'maybe', label: 'Maybe', activeColor: '#d97706', activeBg: '#d9770612' },
                    { key: 'declined', label: 'Not Going', activeColor: '#dc2626', activeBg: '#dc262612' }
                  ].map(opt => {
                    const isActive = editRsvpStatus === opt.key;
                    return (
                      <button 
                        key={opt.key}
                        type="button" 
                        onClick={() => setEditRsvpStatus(opt.key)}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px',
                          border: isActive ? `2px solid ${opt.activeColor}` : '1px solid var(--color-border)',
                          background: isActive ? opt.activeBg : 'var(--color-surface)',
                          color: isActive ? opt.activeColor : 'var(--color-text-muted)',
                          cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
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
                      background: viewLogDetail.channel === 'Email' ? 'rgba(31, 58, 99,0.1)' : 'rgba(34,197,94,0.1)', 
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

        {/* Message Host Composer Modal */}
        {messageHostFor && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '460px',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
              overflow: 'hidden', textAlign: 'left'
            }}>
              {/* Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface-hover)' }}>
                <img className="avatar-img" src={getAvatar(messageHostFor.event.hostEmail || messageHostFor.event.hostName)} alt="Host" style={{ width: '42px', height: '42px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Message {messageHostFor.event.hostName || 'the Host'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>About “{messageHostFor.event.title}”</div>
                </div>
                <button onClick={() => setMessageHostFor(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px' }}>
                <p className="text-muted" style={{ fontSize: '0.82rem', margin: '0 0 12px 0' }}>
                  Ask about parking, accessibility, dress code, or anything else. Your message goes straight to the host and is saved in your conversation log.
                </p>
                <textarea
                  value={hostMessageText}
                  onChange={(e) => setHostMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={5}
                  autoFocus
                  style={{ width: '100%', resize: 'vertical', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', background: 'var(--color-bg)' }}
                />
              </div>

              {/* Footer */}
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setMessageHostFor(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleSendHostMessage} disabled={!hostMessageText.trim()} className="flex items-center gap-xs">
                  <Send size={15} /> Send Message
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
