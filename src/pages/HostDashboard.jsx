import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Calendar, Settings, LogOut, Users, ExternalLink, BarChart2, Check, X, 
  Trash2, Mail, Download, MessageSquare, ChevronLeft, Award, HelpCircle, RefreshCw, BarChart, ToggleLeft,
  Compass, Star
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { mockStore } from '../utils/mockStore';

export default function HostDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeSidebar, setActiveSidebar] = useState('events'); // events, audience, analytics, settings
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, drafts
  
  // State for events, RSVPs, global stats
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null); // Managed event ID
  const [selectedEventTab, setSelectedEventTab] = useState('overview'); // overview, guests, polls, comments, edit, notifications
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('rsvp'); // rsvp, reminder, feedback
  const [previewMode, setPreviewMode] = useState('email'); // email or sms
  const [viewLogDetail, setViewLogDetail] = useState(null);
  const [schedulerRunResult, setSchedulerRunResult] = useState(null);
  
  // Dialog state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // New Poll form state
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  // Edit Event state
  const [editEventForm, setEditEventForm] = useState({
    title: '',
    eventType: 'Meetup',
    date: '',
    time: '',
    location: '',
    description: '',
    cover: '',
    theme: 'mesh-gradient-sunset',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    capacity: 100,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24,
    requireCancellationReason: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    allowComments: true,
    allowPhotoUploads: false,
    enablePayments: false,
    ticketPrice: 0,
    questions: [],
    
    // Notification engine defaults
    sendRsvpConfirmationEmail: true,
    sendRsvpConfirmationSms: true,
    sendPreEventReminders: true,
    sendPostEventFeedbackEmail: true,
    sendPostEventFeedbackSms: false,
    reminder1Offset: 24,
    reminder2Enabled: false,
    reminder2Offset: 3,
    feedbackDelay: 3,
    templates: {
      rsvp: { subject: "", body: "" },
      reminder: { subject: "", body: "" },
      feedback: { subject: "", body: "" }
    }
  });

  const loadDashboardData = () => {
    const allEvents = mockStore.getEvents();
    setEvents(allEvents);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute metrics
  const totalEvents = events.length;
  const upcomingEventsCount = events.filter(e => e.status === 'Published' && new Date(e.date) >= new Date()).length;
  
  // Calculate total RSVPs across all events
  let totalRsvps = 0;
  let totalViews = 0;
  events.forEach(e => {
    const rsvps = mockStore.getRSVPs(e.id);
    totalRsvps += rsvps.filter(r => r.status === 'going' || r.status === 'maybe').length;
    totalViews += mockStore.getViews(e.id);
  });

  // Unique audience list
  const getAudienceList = () => {
    const audienceMap = new Map();
    events.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      rsvps.forEach(rsvp => {
        if (!audienceMap.has(rsvp.email)) {
          audienceMap.set(rsvp.email, {
            name: rsvp.name,
            email: rsvp.email,
            phone: rsvp.phone,
            eventsAttended: [evt.title],
            status: rsvp.status
          });
        } else {
          const entry = audienceMap.get(rsvp.email);
          if (!entry.eventsAttended.includes(evt.title)) {
            entry.eventsAttended.push(evt.title);
          }
        }
      });
    });
    return Array.from(audienceMap.values());
  };

  const audienceList = getAudienceList();

  const handleManageEvent = (eventId) => {
    setSelectedEventId(eventId);
    setSelectedEventTab('overview');
    const evt = mockStore.getEventById(eventId);
    if (evt) {
      setEditEventForm({
        title: evt.title,
        eventType: evt.eventType || 'Meetup',
        date: evt.date,
        time: evt.time,
        location: evt.location,
        description: evt.description,
        cover: evt.cover || '',
        theme: evt.theme || 'mesh-gradient-sunset',
        privacy: evt.privacy || 'Public',
        rsvpStatus: evt.rsvpStatus || 'Open',
        showGuestList: evt.showGuestList !== undefined ? evt.showGuestList : true,
        capacity: evt.capacity,
        maxGuestsPerRsvp: evt.maxGuestsPerRsvp !== undefined ? evt.maxGuestsPerRsvp : 2,
        rsvpDeadline: evt.rsvpDeadline || '',
        allowSelfEdit: evt.allowSelfEdit !== undefined ? evt.allowSelfEdit : true,
        allowSelfCancellation: evt.allowSelfCancellation !== undefined ? evt.allowSelfCancellation : true,
        cancellationCutoff: evt.cancellationCutoff !== undefined ? evt.cancellationCutoff : 24,
        requireCancellationReason: evt.requireCancellationReason !== undefined ? evt.requireCancellationReason : false,
        guestConfirmation: evt.guestConfirmation !== undefined ? evt.guestConfirmation : true,
        reminderSchedule: evt.reminderSchedule || '24h',
        hostAlerts: evt.hostAlerts !== undefined ? evt.hostAlerts : true,
        allowComments: evt.allowComments !== undefined ? evt.allowComments : true,
        allowPhotoUploads: evt.allowPhotoUploads !== undefined ? evt.allowPhotoUploads : false,
        enablePayments: evt.enablePayments !== undefined ? evt.enablePayments : false,
        ticketPrice: evt.ticketPrice || 0,
        questions: evt.questions || [],
        
        // Notification settings
        sendRsvpConfirmationEmail: evt.sendRsvpConfirmationEmail !== undefined ? evt.sendRsvpConfirmationEmail : true,
        sendRsvpConfirmationSms: evt.sendRsvpConfirmationSms !== undefined ? evt.sendRsvpConfirmationSms : true,
        sendPreEventReminders: evt.sendPreEventReminders !== undefined ? evt.sendPreEventReminders : true,
        sendPostEventFeedbackEmail: evt.sendPostEventFeedbackEmail !== undefined ? evt.sendPostEventFeedbackEmail : true,
        sendPostEventFeedbackSms: evt.sendPostEventFeedbackSms !== undefined ? evt.sendPostEventFeedbackSms : false,
        reminder1Offset: evt.reminder1Offset !== undefined ? evt.reminder1Offset : 24,
        reminder2Enabled: evt.reminder2Enabled !== undefined ? evt.reminder2Enabled : false,
        reminder2Offset: evt.reminder2Offset !== undefined ? evt.reminder2Offset : 3,
        feedbackDelay: evt.feedbackDelay !== undefined ? evt.feedbackDelay : 3,
        templates: evt.templates || {
          rsvp: { subject: "", body: "" },
          reminder: { subject: "", body: "" },
          feedback: { subject: "", body: "" }
        }
      });
    }
  };

  const handleToggleCheckin = (eventId, rsvpId, checkedIn) => {
    mockStore.updateRSVP(eventId, rsvpId, { checkedIn: !checkedIn });
    loadDashboardData();
  };

  const handleApproveRSVP = (eventId, rsvpId, approve) => {
    mockStore.updateRSVP(eventId, rsvpId, { status: approve ? 'going' : 'declined' });
    loadDashboardData();
  };

  const handleDeleteRSVP = (eventId, rsvpId) => {
    if (window.confirm("Are you sure you want to remove this guest RSVP?")) {
      mockStore.updateRSVP(eventId, rsvpId, { status: 'declined' });
      loadDashboardData();
    }
  };

  // Export CSV
  const handleExportCSV = (event, rsvps) => {
    const headers = 'Name,Email,Phone,Status,Checked-In,Timestamp\n';
    const rows = rsvps.map(r => `"${r.name}","${r.email}","${r.phone}","${r.status}",${r.checkedIn ? 'Yes' : 'No'},"${r.timestamp}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `guestlist_${event.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast Message
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    
    // Log broadcast to notification logs for all targeted guests
    const targetGuests = managedEventRsvps.filter(r => {
      if (broadcastTarget === 'all') return r.status === 'going' || r.status === 'maybe';
      if (broadcastTarget === 'going') return r.status === 'going';
      if (broadcastTarget === 'maybe') return r.status === 'maybe';
      return r.email === broadcastTarget; // Individual guest
    });

    targetGuests.forEach(guest => {
      const subject = mockStore.renderTemplate(broadcastSubject, managedEvent, guest);
      const body = mockStore.renderTemplate(broadcastMessage, managedEvent, guest);
      mockStore.addNotificationLog(selectedEventId, {
        rsvpId: guest.id,
        guestEmail: guest.email,
        type: 'broadcast',
        channel: 'Email',
        subject,
        body
      });
    });

    setBroadcastSent(true);
    setTimeout(() => {
      setShowBroadcastModal(false);
      setBroadcastSent(false);
      setBroadcastSubject('');
      setBroadcastMessage('');
    }, 2000);
  };

  // Poll Creation
  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    const activeOptions = newPollOptions.filter(o => o.trim() !== '');
    if (activeOptions.length < 2) return;
    mockStore.createPoll(selectedEventId, newPollQuestion, activeOptions);
    setNewPollQuestion('');
    setNewPollOptions(['', '']);
    loadDashboardData();
  };

  // Edit Event Details Submit
  const handleEditEventSubmit = (e) => {
    e.preventDefault();
    const eventRsvps = mockStore.getRSVPs(selectedEventId);
    const attendingCount = eventRsvps.filter(r => r.status === 'going' || r.status === 'maybe').length;
    
    // Capacity reduction limit block
    if (editEventForm.capacity < attendingCount) {
      alert(`❌ Capacity decrease blocked! You currently have ${attendingCount} registered guests. You cannot reduce capacity below this number.`);
      return;
    }

    const currentEvt = mockStore.getEventById(selectedEventId);
    const dateChanged = editEventForm.date !== currentEvt.date || editEventForm.time !== currentEvt.time;
    const locationChanged = editEventForm.location !== currentEvt.location;

    mockStore.updateEvent(selectedEventId, editEventForm);
    loadDashboardData();

    if (dateChanged || locationChanged) {
      const goingGuests = eventRsvps.filter(r => r.status === 'going' || r.status === 'maybe');
      goingGuests.forEach(guest => {
        const subject = `Event Updated: ${editEventForm.title}`;
        const body = `Hi ${guest.name},\n\nWe wanted to let you know that the details for the event "${editEventForm.title}" have been updated.\n\nNew Details:\nDate: ${editEventForm.date}\nTime: ${editEventForm.time}\nLocation: ${editEventForm.location}\n\nManage RSVP: http://localhost:5173/dashboard`;
        
        mockStore.addNotificationLog(selectedEventId, {
          rsvpId: guest.id,
          guestEmail: guest.email,
          type: 'broadcast',
          channel: 'Email',
          subject,
          body
        });
      });
      alert('Event details updated successfully! 📧 An automatic email update has been broadcast to all registered guests notifying them of the new schedule or venue.');
    } else {
      alert('Event settings updated successfully!');
    }
  };

  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    mockStore.updateEvent(selectedEventId, {
      sendRsvpConfirmationEmail: editEventForm.sendRsvpConfirmationEmail,
      sendRsvpConfirmationSms: editEventForm.sendRsvpConfirmationSms,
      sendPreEventReminders: editEventForm.sendPreEventReminders,
      sendPostEventFeedbackEmail: editEventForm.sendPostEventFeedbackEmail,
      sendPostEventFeedbackSms: editEventForm.sendPostEventFeedbackSms,
      reminder1Offset: editEventForm.reminder1Offset,
      reminder2Enabled: editEventForm.reminder2Enabled,
      reminder2Offset: editEventForm.reminder2Offset,
      feedbackDelay: editEventForm.feedbackDelay,
      templates: editEventForm.templates
    });
    loadDashboardData();
    alert('Notification settings and templates saved successfully!');
  };

  const handleDuplicateEvent = (eventId) => {
    if (window.confirm("Duplicate this event and copy all settings?")) {
      const cloned = mockStore.duplicateEvent(eventId);
      if (cloned) {
        alert(`Cloned successfully! New event "${cloned.title}" has been created as a Draft.`);
        loadDashboardData();
        setSelectedEventId(cloned.id);
        setSelectedEventTab('edit');
      }
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete this event and remove all guest RSVP logs? This action CANNOT be undone!")) {
      mockStore.deleteEvent(eventId);
      loadDashboardData();
      setSelectedEventId(null);
      alert('Event deleted successfully.');
    }
  };

  // Get active managed event details
  const managedEvent = selectedEventId ? mockStore.getEventById(selectedEventId) : null;
  const managedEventRsvps = selectedEventId ? mockStore.getRSVPs(selectedEventId) : [];
  const managedEventPolls = selectedEventId ? mockStore.getPolls(selectedEventId) : [];
  const managedEventComments = selectedEventId ? mockStore.getComments(selectedEventId) : [];
  const managedEventViews = selectedEventId ? mockStore.getViews(selectedEventId) : 0;

  // Filter events by tab
  const filteredEvents = events.filter(e => {
    if (activeTab === 'upcoming') return e.status === 'Published' && new Date(e.date) >= new Date();
    if (activeTab === 'past') return e.status === 'Completed' || (e.status === 'Published' && new Date(e.date) < new Date());
    return e.status === 'Draft';
  });

  return (
    <PageShell>
      <div className="flex" style={{ minHeight: '80vh', background: 'var(--color-bg)' }}>
        {/* Sidebar */}
        <aside style={{ width: '260px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: 'var(--spacing-lg) var(--spacing-md)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 'var(--spacing-xl)', padding: '0 var(--spacing-sm)' }}>
            <div className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Host Portal</div>
          </div>

        <nav className="flex flex-col gap-sm" style={{ flex: 1 }}>
          <button 
            onClick={() => { setActiveSidebar('events'); setSelectedEventId(null); }} 
            className="flex items-center gap-sm" 
            style={{ 
              width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer',
              padding: '10px 16px', 
              background: activeSidebar === 'events' ? 'rgba(79,70,229,0.08)' : 'transparent', 
              color: activeSidebar === 'events' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              borderRadius: 'var(--radius-md)', fontWeight: 600 
            }}
          >
            <Calendar size={20} /> My Events
          </button>
          
          <button 
            onClick={() => { setActiveSidebar('audience'); setSelectedEventId(null); }} 
            className="flex items-center gap-sm" 
            style={{ 
              width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer',
              padding: '10px 16px', 
              background: activeSidebar === 'audience' ? 'rgba(79,70,229,0.08)' : 'transparent', 
              color: activeSidebar === 'audience' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              borderRadius: 'var(--radius-md)', fontWeight: 600 
            }}
          >
            <Users size={20} /> Audience
          </button>

          <button 
            onClick={() => { setActiveSidebar('analytics'); setSelectedEventId(null); }} 
            className="flex items-center gap-sm" 
            style={{ 
              width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer',
              padding: '10px 16px', 
              background: activeSidebar === 'analytics' ? 'rgba(79,70,229,0.08)' : 'transparent', 
              color: activeSidebar === 'analytics' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              borderRadius: 'var(--radius-md)', fontWeight: 600 
            }}
          >
            <BarChart2 size={20} /> Analytics
          </button>

          <button 
            onClick={() => { setActiveSidebar('settings'); setSelectedEventId(null); }} 
            className="flex items-center gap-sm" 
            style={{ 
              width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer',
              padding: '10px 16px', 
              background: activeSidebar === 'settings' ? 'rgba(79,70,229,0.08)' : 'transparent', 
              color: activeSidebar === 'settings' ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              borderRadius: 'var(--radius-md)', fontWeight: 600 
            }}
          >
            <Settings size={20} /> Settings
          </button>
        </nav>

        <button 
          onClick={onLogout} 
          className="flex items-center gap-sm text-muted" 
          style={{ padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
        
        {/* --- GLOBAL SIDEBAR NAVIGATION --- */}
        {activeSidebar === 'events' && !selectedEventId && (
          <div>
            {/* Title banner */}
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '4px' }}>Host Dashboard</h1>
                <p className="text-muted">Create invitation layouts, manage attendees, and view analytics.</p>
              </div>
              <Link to="/create">
                <Button variant="primary" className="flex items-center gap-xs">
                  <Plus size={20} /> Create New Event
                </Button>
              </Link>
            </div>

            {/* Metric Tiles */}
            <div className="grid-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                <div>
                  <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total RSVPs</h3>
                  <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>{totalRsvps}</p>
                </div>
                {/* SVG sparkline */}
                <svg width="60" height="30" style={{ opacity: 0.7 }}>
                  <path d="M0,25 Q15,10 30,18 T60,5" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
                </svg>
              </Card>
              <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                <div>
                  <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Upcoming Events</h3>
                  <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>{upcomingEventsCount}</p>
                </div>
                <Calendar size={32} style={{ color: 'var(--color-accent)', opacity: 0.8 }} />
              </Card>
              <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                <div>
                  <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Platform Views</h3>
                  <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>{totalViews}</p>
                </div>
                {/* SVG view analytics mini chart */}
                <svg width="60" height="30" style={{ opacity: 0.7 }}>
                  <rect x="0" y="15" width="8" height="15" rx="2" fill="var(--color-text-muted)" />
                  <rect x="12" y="10" width="8" height="20" rx="2" fill="var(--color-text-muted)" />
                  <rect x="24" y="20" width="8" height="10" rx="2" fill="var(--color-text-muted)" />
                  <rect x="36" y="5" width="8" height="25" rx="2" fill="var(--color-primary)" />
                  <rect x="48" y="0" width="8" height="30" rx="2" fill="var(--color-accent)" />
                </svg>
              </Card>
            </div>

            {/* Events Selector Tabbed list */}
            <div>
              <div className="flex gap-md" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-md)' }}>
                <button onClick={() => setActiveTab('upcoming')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'upcoming' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'upcoming' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Upcoming</button>
                <button onClick={() => setActiveTab('past')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'past' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'past' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Past Events</button>
                <button onClick={() => setActiveTab('drafts')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: activeTab === 'drafts' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'drafts' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Drafts</button>
              </div>

              <div className="flex flex-col gap-md">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => {
                    const rsvps = mockStore.getRSVPs(event.id);
                    const attending = rsvps.filter(r => r.status === 'going').length;
                    const maybe = rsvps.filter(r => r.status === 'maybe').length;
                    
                    return (
                      <Card key={event.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-md)', transition: 'transform var(--transition-fast)', cursor: 'default' }}>
                        <div className="flex items-center gap-md" style={{ flex: 1 }}>
                          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: event.cover ? `url(${event.cover}) center/cover` : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', flexShrink: 0 }}></div>
                          <div>
                            <div className="flex items-center gap-xs" style={{ marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: event.status === 'Published' ? 'rgba(79,70,229,0.1)' : 'rgba(100,116,139,0.1)', color: event.status === 'Published' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{event.status}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Code: {event.id}</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{event.title}</h3>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>{event.date} • {event.time} • {event.location.split(',')[0]}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-xl">
                          <div className="text-center" style={{ minWidth: '80px' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{attending + maybe} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ {event.capacity}</span></p>
                            <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RSVPs</p>
                          </div>
                          
                          <div className="flex gap-sm">
                            <Button variant="outline" onClick={() => handleManageEvent(event.id)} style={{ padding: '8px 16px' }}>Manage</Button>
                            {event.status === 'Published' && (
                              <Link to={`/e/${event.id}`} target="_blank">
                                <Button variant="ghost" style={{ padding: '8px' }}><ExternalLink size={20} /></Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0' }}>
                    <Calendar size={48} style={{ opacity: 0.3, margin: '0 auto var(--spacing-sm)' }} />
                    <p>No events found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- EVENT MANAGER DETAILED VIEW --- */}
        {selectedEventId && managedEvent && (
          <div>
            {/* Breadcrumb and Header */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <button 
                onClick={() => setSelectedEventId(null)}
                className="flex items-center gap-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}
              >
                <ChevronLeft size={16} /> Back to Events
              </button>
              
              <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                <div>
                  <div className="flex items-center gap-xs" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)' }}>{managedEvent.status}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Invite URL: localhost:5173/e/{managedEvent.id}</span>
                  </div>
                  <h1 style={{ fontSize: '2rem' }}>{managedEvent.title}</h1>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>{managedEvent.date} at {managedEvent.time} • {managedEvent.location}</p>
                </div>
                
                <div className="flex gap-sm">
                  <button 
                    onClick={() => handleExportCSV(managedEvent, managedEventRsvps)}
                    className="btn btn-outline"
                    style={{ padding: '10px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} /> Export CSV
                  </button>
                  <button 
                    onClick={() => setShowBroadcastModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Mail size={16} /> Message Guests
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Tabs for Event Management */}
            <div className="flex gap-md" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-md)' }}>
              <button onClick={() => setSelectedEventTab('overview')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Stats & Charts</button>
              <button onClick={() => setSelectedEventTab('guests')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'guests' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'guests' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Guest List ({managedEventRsvps.length})</button>
              <button onClick={() => setSelectedEventTab('polls')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'polls' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'polls' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Polls ({managedEventPolls.length})</button>
              <button onClick={() => setSelectedEventTab('comments')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'comments' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'comments' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Comments ({managedEventComments.length})</button>
              <button onClick={() => setSelectedEventTab('edit')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'edit' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'edit' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Details Editor</button>
              <button onClick={() => setSelectedEventTab('notifications')} style={{ background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: selectedEventTab === 'notifications' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: selectedEventTab === 'notifications' ? '2px solid var(--color-primary)' : '2px solid transparent' }}>Notifications</button>
            </div>

            {/* --- Event Sub-Tab Content --- */}
            {selectedEventTab === 'overview' && (
              <div>
                <div className="grid-3" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <Card style={{ padding: '12px' }} className="text-center">
                    <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Going</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{managedEventRsvps.filter(r => r.status === 'going').length}</p>
                  </Card>
                  <Card style={{ padding: '12px' }} className="text-center">
                    <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maybe</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#ca8a04' }}>{managedEventRsvps.filter(r => r.status === 'maybe').length}</p>
                  </Card>
                  <Card style={{ padding: '12px' }} className="text-center">
                    <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Declined / Waitlist</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>
                      {managedEventRsvps.filter(r => r.status === 'declined').length} / {managedEventRsvps.filter(r => r.status === 'waitlist').length}
                    </p>
                  </Card>
                </div>

                <div className="grid-2">
                  {/* Attendance Analytics SVG */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>RSVP Attendance Breakdown</h4>
                    <div className="flex items-center justify-around" style={{ minHeight: '220px' }}>
                      {/* Interactive SVG Pie/Donut Chart */}
                      <svg width="180" height="180" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4"></circle>
                        {/* Going slice */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#16a34a" strokeWidth="4.2"
                          strokeDasharray={`${(managedEventRsvps.filter(r => r.status === 'going').length / (managedEventRsvps.length || 1)) * 100} ${100 - ((managedEventRsvps.filter(r => r.status === 'going').length / (managedEventRsvps.length || 1)) * 100)}`}
                          strokeDashoffset="25"></circle>
                        {/* Maybe slice */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ca8a04" strokeWidth="4.2"
                          strokeDasharray={`${(managedEventRsvps.filter(r => r.status === 'maybe').length / (managedEventRsvps.length || 1)) * 100} ${100 - ((managedEventRsvps.filter(r => r.status === 'maybe').length / (managedEventRsvps.length || 1)) * 100)}`}
                          strokeDashoffset={25 - ((managedEventRsvps.filter(r => r.status === 'going').length / (managedEventRsvps.length || 1)) * 100)}></circle>
                      </svg>
                      
                      <div className="flex flex-col gap-xs" style={{ fontSize: '0.875rem' }}>
                        <span className="flex items-center gap-xs"><span style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></span> Going: {managedEventRsvps.filter(r => r.status === 'going').length}</span>
                        <span className="flex items-center gap-xs"><span style={{ width: '12px', height: '12px', background: '#ca8a04', borderRadius: '50%' }}></span> Maybe: {managedEventRsvps.filter(r => r.status === 'maybe').length}</span>
                        <span className="flex items-center gap-xs"><span style={{ width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '50%' }}></span> Others: {managedEventRsvps.filter(r => r.status !== 'going' && r.status !== 'maybe').length}</span>
                        <span className="flex items-center gap-xs" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4px', fontWeight: 600 }}><HelpCircle size={14} /> Views: {managedEventViews}</span>
                      </div>
                    </div>
                  </Card>

                  {/* SVG registration velocity */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>RSVP Registration Timeline</h4>
                    <div style={{ padding: '10px 0' }}>
                      <svg width="100%" height="200" viewBox="0 0 400 150">
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" />
                        <line x1="40" y1="60" x2="380" y2="60" stroke="#f1f5f9" />
                        <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" />
                        <line x1="40" y1="130" x2="380" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                        
                        {/* Line chart path representing signups */}
                        <path d="M 40 130 L 100 115 L 160 90 L 220 100 L 280 60 L 340 40 L 380 25" fill="none" stroke="var(--color-primary)" strokeWidth="3" className="chart-line" />
                        
                        {/* Dot indicators */}
                        <circle cx="100" cy="115" r="4" fill="var(--color-primary)" />
                        <circle cx="160" cy="90" r="4" fill="var(--color-primary)" />
                        <circle cx="220" cy="100" r="4" fill="var(--color-primary)" />
                        <circle cx="280" cy="60" r="4" fill="var(--color-primary)" />
                        <circle cx="340" cy="40" r="4" fill="var(--color-primary)" />
                        <circle cx="380" cy="25" r="4" fill="var(--color-accent)" />
                        
                        {/* Labels */}
                        <text x="40" y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">June 1</text>
                        <text x="160" y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">June 3</text>
                        <text x="280" y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">June 5</text>
                        <text x="380" y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">Today</text>
                      </svg>
                    </div>
                  </Card>
                </div>

                {/* Event Feedback Section */}
                {(() => {
                  const eventFeedback = mockStore.getFeedbackResponses(managedEvent.id);
                  if (eventFeedback.length > 0) {
                    const avgEventRating = (eventFeedback.reduce((sum, f) => sum + f.rating, 0) / eventFeedback.length).toFixed(1);
                    return (
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MessageSquare size={18} /> Guest Feedback & Satisfaction
                        </h4>
                        <div className="grid-2">
                          <Card style={{ padding: '16px' }}>
                            <h5 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Ratings Breakdown</h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                                  {avgEventRating}
                                </div>
                                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '6px' }}>
                                  {[1, 2, 3, 4, 5].map(star => {
                                    const active = star <= Math.round(Number(avgEventRating));
                                    return <Star key={star} size={12} fill={active ? '#fbbf24' : 'none'} stroke={active ? '#fbbf24' : '#cbd5e1'} />;
                                  })}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{eventFeedback.length} responses</div>
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[5, 4, 3, 2, 1].map(stars => {
                                  const count = eventFeedback.filter(fb => fb.rating === stars).length;
                                  const pct = (count / eventFeedback.length) * 100;
                                  return (
                                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                                      <span style={{ width: '30px', textAlign: 'right', fontWeight: 500 }}>{stars} ★</span>
                                      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: '#fbbf24' }}></div>
                                      </div>
                                      <span style={{ width: '20px', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{count}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </Card>

                          <Card style={{ padding: '16px' }}>
                            <h5 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Review Comments</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                              {eventFeedback.map(fb => (
                                <div key={fb.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontSize: '0.8rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                                    <span>{fb.name}</span>
                                    <div style={{ display: 'flex', gap: '1px' }}>
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={8} fill={star <= fb.rating ? '#fbbf24' : 'none'} stroke={star <= fb.rating ? '#fbbf24' : '#cbd5e1'} />
                                      ))}
                                    </div>
                                  </div>
                                  {fb.comments && <p style={{ margin: '4px 0 0 0', color: '#475569', fontStyle: 'italic', fontSize: '0.75rem' }}>"{fb.comments}"</p>}
                                </div>
                              ))}
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} /> Guest Feedback & Satisfaction
                      </h4>
                      <Card style={{ padding: '24px', textAlign: 'center' }}>
                        <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>No guest feedback responses received for this event yet.</p>
                      </Card>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedEventTab === 'guests' && (
              <Card style={{ padding: 0 }} className="glass-surface">
                <div style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                  <h4 style={{ fontSize: '1.1rem', margin: 0 }} className="flex items-center gap-xs">Guest Signups <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', borderRadius: '12px' }}>{managedEventRsvps.length} Total</span></h4>
                </div>
                
                {managedEventRsvps.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Guest Name</th>
                          <th>Contact Details</th>
                          <th>Status</th>
                          <th>Checked In</th>
                          <th>Custom Answers</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managedEventRsvps.map(rsvp => (
                          <tr key={rsvp.id}>
                            <td style={{ fontWeight: 600 }}>{rsvp.name}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{rsvp.email}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rsvp.phone}</div>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                background: rsvp.status === 'going' ? 'rgba(34,197,94,0.1)' : rsvp.status === 'maybe' ? 'rgba(234,179,8,0.1)' : rsvp.status === 'waitlist' ? 'rgba(148,163,184,0.1)' : 'rgba(239,68,68,0.1)',
                                color: rsvp.status === 'going' ? '#16a34a' : rsvp.status === 'maybe' ? '#ca8a04' : rsvp.status === 'waitlist' ? '#64748b' : '#ef4444'
                              }}>
                                {rsvp.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <input 
                                type="checkbox" 
                                checked={rsvp.checkedIn}
                                onChange={() => handleToggleCheckin(managedEvent.id, rsvp.id, rsvp.checkedIn)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td>
                              {Object.keys(rsvp.answers || {}).length > 0 ? (
                                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {Object.keys(rsvp.answers).map(q => (
                                    <div key={q}><strong>{q}:</strong> {rsvp.answers[q]}</div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>None</span>
                              )}
                            </td>
                            <td>
                              <div className="flex gap-xs">
                                {rsvp.status === 'waitlist' && (
                                  <>
                                    <button 
                                      onClick={() => handleApproveRSVP(managedEvent.id, rsvp.id, true)} 
                                      title="Approve RSVP" 
                                      style={{ border: 'none', background: 'rgba(34,197,94,0.1)', color: '#16a34a', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleApproveRSVP(managedEvent.id, rsvp.id, false)} 
                                      title="Reject RSVP" 
                                      style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => handleDeleteRSVP(managedEvent.id, rsvp.id)} 
                                  title="Delete RSVP" 
                                  style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0' }}>
                    <Users size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p>No RSVPs found for this event yet.</p>
                  </div>
                )}
              </Card>
            )}

            {selectedEventTab === 'polls' && (
              <div className="grid-2">
                <Card style={{ padding: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Active Polls & Survey Responses</h4>
                  {managedEventPolls.length > 0 ? (
                    <div className="flex flex-col gap-md">
                      {managedEventPolls.map(poll => {
                        const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                        return (
                          <div key={poll.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                            <h5 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>Q: {poll.question}</h5>
                            <div className="flex flex-col gap-xs">
                              {poll.options.map(opt => {
                                const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                return (
                                  <div key={opt.id}>
                                    <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                                      <span>{opt.text}</span>
                                      <span style={{ fontWeight: 600 }}>{opt.votes} votes ({percent}%)</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', background: 'var(--color-primary)', width: `${percent}%`, borderRadius: '3px' }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>No polls created for this event.</p>
                  )}
                </Card>

                {/* Create Poll Card */}
                <Card style={{ padding: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Create a Guest Poll</h4>
                  <form onSubmit={handleCreatePollSubmit} className="flex flex-col gap-sm">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Question / Prompt</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Which date works best for you?" 
                        value={newPollQuestion}
                        onChange={(e) => setNewPollQuestion(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Options</label>
                      {newPollOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-xs items-center" style={{ marginBottom: '6px' }}>
                          <input 
                            type="text" 
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const opts = [...newPollOptions];
                              opts[idx] = e.target.value;
                              setNewPollOptions(opts);
                            }}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          />
                          {newPollOptions.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== idx))}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => setNewPollOptions([...newPollOptions, ''])}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <Button variant="primary" type="submit" style={{ padding: '10px', fontSize: '0.9rem' }}>Create Poll</Button>
                  </form>
                </Card>
              </div>
            )}

            {selectedEventTab === 'comments' && (
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Guest Comments Board & Moderation</h4>
                {managedEventComments.length > 0 ? (
                  <div className="flex flex-col gap-md">
                    {managedEventComments.map(comment => (
                      <div key={comment.id} className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                        <div>
                          <div className="flex items-center gap-xs" style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.name}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(comment.timestamp).toLocaleString()}</span>
                          </div>
                          <p style={{ fontSize: '0.9rem' }}>{comment.text}</p>
                          {Object.keys(comment.reactions || {}).length > 0 && (
                            <div className="flex gap-xs" style={{ marginTop: '6px' }}>
                              {Object.keys(comment.reactions).map(emoji => (
                                <span key={emoji} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                  {emoji} {comment.reactions[emoji]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            mockStore.deleteComment(managedEvent.id, comment.id);
                            loadDashboardData();
                          }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                          title="Delete Comment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>No comments posted on the event board yet.</p>
                )}
              </Card>
            )}

            {selectedEventTab === 'edit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {/* Event Settings Header */}
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }} className="flex justify-between items-center">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Event Settings Control Panel</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Configure rules, visibility policies, self-service controls, and notifications.</p>
                  </div>
                </div>

                <form onSubmit={handleEditEventSubmit} className="flex flex-col gap-lg" style={{ maxWidth: '750px' }}>
                  
                  {/* SECTION 1: Basic Event Info Settings */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <Calendar size={18} /> 1. Basic Event Info Settings
                    </h4>
                    <div className="flex flex-col gap-sm">
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Event Title</label>
                        <input 
                          type="text" 
                          value={editEventForm.title}
                          onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          required
                        />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                          ℹ️ <strong>What it does:</strong> Shown on invitation page and tickets. <strong>Changeable:</strong> Anytime.
                        </span>
                      </div>

                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Event Type</label>
                          <select 
                            value={editEventForm.eventType}
                            onChange={(e) => setEditEventForm({ ...editEventForm, eventType: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                          >
                            <option value="Party">Party</option>
                            <option value="Meetup">Meetup</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Religious">Religious / Temple</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Other">Other</option>
                          </select>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                            ℹ️ Used to categorize events in discovery feeds.
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
                            <input 
                              type="date" 
                              value={editEventForm.date}
                              onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                              required
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Time</label>
                            <input 
                              type="time" 
                              value={editEventForm.time}
                              onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Warning on date change */}
                      {(editEventForm.date !== managedEvent.date || editEventForm.time !== managedEvent.time) && (
                        <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.08)', borderRadius: '6px', color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600 }}>
                          ⚠️ Warning: Changing the date or time will send an automatic update email to all {managedEventRsvps.filter(r => r.status === 'going' || r.status === 'maybe').length} registered guests.
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Venue Location</label>
                        <input 
                          type="text" 
                          value={editEventForm.location}
                          onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                          required
                        />
                        {editEventForm.location !== managedEvent.location && (
                          <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.08)', borderRadius: '6px', color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px' }}>
                            ⚠️ Warning: Changing the venue location will send an automatic update notification to all registered guests.
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Event Description</label>
                        <textarea 
                          value={editEventForm.description}
                          onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                          rows="4"
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                          required
                        ></textarea>
                      </div>
                    </div>
                  </Card>

                  {/* SECTION 2: Visibility & Privacy Settings */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <Compass size={18} /> 2. Visibility & Privacy Settings
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Event Privacy</label>
                        <select
                          value={editEventForm.privacy}
                          onChange={(e) => setEditEventForm({ ...editEventForm, privacy: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                        >
                          <option value="Public">Public (Listed in discover feeds)</option>
                          <option value="Private">Private (Direct invitation URL only)</option>
                          <option value="Unlisted">Unlisted (Shown only on direct hosts list)</option>
                        </select>
                        {editEventForm.privacy !== managedEvent.privacy && editEventForm.privacy !== 'Public' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-accent)', display: 'block', marginTop: '4px' }}>
                            ⚠️ Switching to private/unlisted removes this event from search.
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>RSVP Status</label>
                        <select
                          value={editEventForm.rsvpStatus}
                          onChange={(e) => setEditEventForm({ ...editEventForm, rsvpStatus: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                        >
                          <option value="Open">Open (Accepting RSVPs)</option>
                          <option value="Closed">Closed (RSVP button disabled)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Show Guest List Social Proof</span>
                        <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Renders attendee avatars & names on public page. Turn off for anonymous counts only.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={editEventForm.showGuestList} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, showGuestList: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </Card>

                  {/* SECTION 3: Capacity & RSVP Behavior */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <Users size={18} /> 3. Capacity & RSVP Behavior
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Total Capacity</label>
                        <input 
                          type="number" 
                          value={editEventForm.capacity}
                          onChange={(e) => setEditEventForm({ ...editEventForm, capacity: Number(e.target.value) })}
                          style={{ 
                            width: '100%', padding: '10px', borderRadius: '6px', 
                            border: editEventForm.capacity < managedEventRsvps.filter(r => r.status === 'going' || r.status === 'maybe').length ? '2px solid #ef4444' : '1px solid var(--color-border)' 
                          }}
                        />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                          ℹ️ Max attendee headcount. Current registrations: <strong>{managedEventRsvps.filter(r => r.status === 'going' || r.status === 'maybe').length}</strong>
                        </span>
                        {editEventForm.capacity < managedEventRsvps.filter(r => r.status === 'going' || r.status === 'maybe').length && (
                          <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                            ❌ Error: Cannot decrease capacity below attendee total.
                          </span>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Max Plus-Ones per RSVP</label>
                        <input 
                          type="number" 
                          value={editEventForm.maxGuestsPerRsvp}
                          onChange={(e) => setEditEventForm({ ...editEventForm, maxGuestsPerRsvp: Number(e.target.value) })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>RSVP Deadline</label>
                      <input 
                        type="datetime-local" 
                        value={editEventForm.rsvpDeadline}
                        onChange={(e) => setEditEventForm({ ...editEventForm, rsvpDeadline: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                        ℹ️ <strong>Impact:</strong> RSVPs close automatically at this date, even if status is set to Open.
                      </span>
                    </div>
                  </Card>

                  {/* SECTION 4: Self-Service Change & Cancellation Policies */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <CheckSquare size={18} /> 4. Guest Self-Service Policies
                    </h4>

                    <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Allow Guest Self-Edit RSVP details</span>
                          <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Allow guests to update their attendance/custom questions post-RSVP.</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={editEventForm.allowSelfEdit} 
                            onChange={(e) => setEditEventForm({ ...editEventForm, allowSelfEdit: e.target.checked })}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Allow Guest Self-Cancellation</span>
                          <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Guests can cancel their RSVP and free up capacity spots themselves.</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={editEventForm.allowSelfCancellation} 
                            onChange={(e) => setEditEventForm({ ...editEventForm, allowSelfCancellation: e.target.checked })}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>Cancellation Cut-off (hrs)</label>
                          <input 
                            type="number" 
                            value={editEventForm.cancellationCutoff}
                            onChange={(e) => setEditEventForm({ ...editEventForm, cancellationCutoff: Number(e.target.value) })}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
                          />
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Cut off self-cancels X hours before event.</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div className="flex justify-between items-center">
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Require Reason text</span>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.requireCancellationReason} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, requireCancellationReason: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* SECTION 5: Registration Form & Custom Questions */}
                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <FileText size={18} /> 5. Custom RSVP Questions Form
                    </h4>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>Form Questions</label>
                      {editEventForm.questions && editEventForm.questions.map((q, idx) => (
                        <div key={idx} className="flex gap-xs items-center" style={{ marginBottom: '8px' }}>
                          <input 
                            type="text" 
                            value={q} 
                            onChange={(e) => {
                              const questions = [...editEventForm.questions];
                              questions[idx] = e.target.value;
                              setEditEventForm({ ...editEventForm, questions });
                            }}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                          />
                          <button 
                            type="button" 
                            onClick={() => setEditEventForm({ ...editEventForm, questions: editEventForm.questions.filter((_, i) => i !== idx) })}
                            style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        type="button" 
                        onClick={() => setEditEventForm({ ...editEventForm, questions: [...editEventForm.questions, ''] })}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        + Add Custom Checkout Question
                      </button>
                    </div>
                  </Card>

                  {/* SECTION 6 & 7 & 8: Communications, Payments & Social */}
                  <div className="grid-2">
                    <Card style={{ padding: 'var(--spacing-md)' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                        <Bell size={16} /> 6. Reminders & Alerts
                      </h4>
                      <div className="flex flex-col gap-xs" style={{ fontSize: '0.85rem' }}>
                        <div className="flex justify-between items-center">
                          <span>Confirmation Emails</span>
                          <label className="switch">
                            <input type="checkbox" checked={editEventForm.guestConfirmation} onChange={(e) => setEditEventForm({ ...editEventForm, guestConfirmation: e.target.checked })} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="flex justify-between items-center" style={{ marginTop: '8px' }}>
                          <span>Reminder Schedule</span>
                          <select 
                            value={editEventForm.reminderSchedule} 
                            onChange={(e) => setEditEventForm({ ...editEventForm, reminderSchedule: e.target.value })}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                          >
                            <option value="24h">24 Hours Before</option>
                            <option value="3h">3 Hours Before</option>
                            <option value="none">Disabled</option>
                          </select>
                        </div>
                      </div>
                    </Card>

                    <Card style={{ padding: 'var(--spacing-md)' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                        <CreditCard size={16} /> 7. Ticketing Payments
                      </h4>
                      <div className="flex flex-col gap-xs" style={{ fontSize: '0.85rem' }}>
                        <div className="flex justify-between items-center">
                          <span>Enable Ticket Charging</span>
                          <label className="switch">
                            <input type="checkbox" checked={editEventForm.enablePayments} onChange={(e) => setEditEventForm({ ...editEventForm, enablePayments: e.target.checked })} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        {editEventForm.enablePayments && (
                          <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                            <span>Ticket Price ($)</span>
                            <input 
                              type="number" 
                              value={editEventForm.ticketPrice} 
                              onChange={(e) => setEditEventForm({ ...editEventForm, ticketPrice: Number(e.target.value) })}
                              style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  <Card style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                      <MessageSquare size={18} /> 8. Social & Engagement
                    </h4>
                    <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Allow Guest Comments & Board reactions</span>
                        <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Guests can leave greetings, question feeds, and vote in polls.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={editEventForm.allowComments} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, allowComments: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Allow Photo Uploads (Post-Event gallery)</span>
                        <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Guests can add snapshots to the event photo grid.</p>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={editEventForm.allowPhotoUploads} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, allowPhotoUploads: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </Card>

                  {/* SECTION 9: Admin / Risk Controls */}
                  <Card style={{ padding: 'var(--spacing-md)', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.01)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                      <Shield size={18} /> 9. Admin & Risk Controls
                    </h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>Clone event settings or remove the invitation directory entirely.</p>
                    
                    <div className="flex gap-sm">
                      <button 
                        type="button" 
                        onClick={() => handleDuplicateEvent(managedEvent.id)}
                        className="btn btn-outline"
                        style={{ padding: '10px 18px', fontSize: '0.85rem', flex: 1 }}
                      >
                        Duplicate / Clone Event Settings
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteEvent(managedEvent.id)}
                        className="btn"
                        style={{ padding: '10px 18px', fontSize: '0.85rem', flex: 1, background: '#dc2626', color: 'white' }}
                      >
                        Delete Event Invitation
                      </button>
                    </div>
                  </Card>

                  {/* Save button footer */}
                  <div className="flex gap-sm justify-end" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <Button variant="ghost" type="button" onClick={() => setSelectedEventId(null)}>Cancel</Button>
                    <Button variant="primary" type="submit">Save Event Settings</Button>
                  </div>

                </form>
              </div>
            )}

            {selectedEventTab === 'notifications' && (
              <div>
                <form onSubmit={handleNotificationsSubmit} className="flex flex-col gap-md">
                  <div className="grid-2">
                    
                    {/* LEFT COLUMN: Controls & Simulator */}
                    <div className="flex flex-col gap-md">
                      
                      {/* Toggles */}
                      <Card style={{ padding: 'var(--spacing-md)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                          <Bell size={18} /> General Channels Toggles
                        </h4>
                        
                        <div className="flex flex-col gap-sm" style={{ fontSize: '0.875rem' }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span style={{ fontWeight: 600 }}>Send RSVP Confirmation Emails</span>
                              <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Instantly email booking ID and details to guest on RSVP.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.sendRsvpConfirmationEmail} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, sendRsvpConfirmationEmail: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>Send RSVP Confirmation SMS</span>
                              <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Send confirmation text to guest's phone number.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.sendRsvpConfirmationSms} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, sendRsvpConfirmationSms: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>Send Pre-Event Reminders</span>
                              <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Send automated emails before the event starts.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.sendPreEventReminders} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, sendPreEventReminders: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>Send Post-Event Feedback Email</span>
                              <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Automatically ask for feedback and star ratings after the event.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.sendPostEventFeedbackEmail} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, sendPostEventFeedbackEmail: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>

                          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>Send Post-Event Feedback SMS</span>
                              <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Send text survey link to attendee phone numbers.</p>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={editEventForm.sendPostEventFeedbackSms} 
                                onChange={(e) => setEditEventForm({ ...editEventForm, sendPostEventFeedbackSms: e.target.checked })}
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        </div>
                      </Card>

                      {/* Schedule Controls */}
                      <Card style={{ padding: 'var(--spacing-md)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                          <Calendar size={18} /> Schedule Timing Controls
                        </h4>
                        
                        <div className="flex flex-col gap-md" style={{ fontSize: '0.875rem' }}>
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Reminder 1 timing</label>
                            <select 
                              value={editEventForm.reminder1Offset}
                              onChange={(e) => setEditEventForm({ ...editEventForm, reminder1Offset: Number(e.target.value) })}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                              disabled={!editEventForm.sendPreEventReminders}
                            >
                              <option value="48">48 hours before start</option>
                              <option value="24">24 hours before start</option>
                              <option value="12">12 hours before start</option>
                              <option value="3">3 hours before start</option>
                            </select>
                          </div>

                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                              <span style={{ fontWeight: 600 }}>Enable Second Reminder</span>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={editEventForm.reminder2Enabled} 
                                  onChange={(e) => setEditEventForm({ ...editEventForm, reminder2Enabled: e.target.checked })}
                                  disabled={!editEventForm.sendPreEventReminders}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                            {editEventForm.reminder2Enabled && (
                              <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Reminder 2 timing</label>
                                <select 
                                  value={editEventForm.reminder2Offset}
                                  onChange={(e) => setEditEventForm({ ...editEventForm, reminder2Offset: Number(e.target.value) })}
                                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                                  disabled={!editEventForm.sendPreEventReminders}
                                >
                                  <option value="12">12 hours before start</option>
                                  <option value="6">6 hours before start</option>
                                  <option value="3">3 hours before start</option>
                                  <option value="1">1 hour before start</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Post-event Feedback delay</label>
                            <select 
                              value={editEventForm.feedbackDelay}
                              onChange={(e) => setEditEventForm({ ...editEventForm, feedbackDelay: Number(e.target.value) })}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                              disabled={!editEventForm.sendPostEventFeedbackEmail}
                            >
                              <option value="2">2 hours after event ends</option>
                              <option value="3">3 hours after event ends</option>
                              <option value="12">12 hours after event ends</option>
                              <option value="24">24 hours after event ends</option>
                              <option value="48">48 hours after event ends</option>
                            </select>
                          </div>
                        </div>
                      </Card>

                      {/* Virtual Cron Simulator */}
                      <Card style={{ padding: 'var(--spacing-md)', background: 'rgba(79,70,229,0.02)', border: '1px dashed var(--color-primary)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                          <RefreshCw size={18} /> System Scheduler Simulator
                        </h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
                          SafalEvents dispatches scheduled reminders hourly. Click below to simulate running the cron job runner for this event right now.
                        </p>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            const dispatched = mockStore.runScheduledJobs(managedEvent.id);
                            setSchedulerRunResult({ count: dispatched.length, logs: dispatched });
                            loadDashboardData();
                          }}
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '10px', fontSize: '0.875rem' }}
                        >
                          Trigger virtual cron job check
                        </button>

                        {schedulerRunResult && (
                          <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', background: schedulerRunResult.count > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(148,163,184,0.08)', border: schedulerRunResult.count > 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(148,163,184,0.2)', fontSize: '0.8rem' }}>
                            {schedulerRunResult.count > 0 ? (
                              <span>🎉 Successfully dispatched <strong>{schedulerRunResult.count}</strong> notifications:
                                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                                  {schedulerRunResult.logs.map((log, i) => (
                                    <li key={i}>{log.channel} {log.type} to {log.guestEmail}</li>
                                  ))}
                                </ul>
                              </span>
                            ) : (
                              <span>ℹ️ Virtual cron ran. No notifications were due to send at this time. (Check dates and templates)</span>
                            )}
                          </div>
                        )}
                      </Card>

                    </div>

                    {/* RIGHT COLUMN: Template Editor & Realtime Live Preview */}
                    <div className="flex flex-col gap-md">
                      
                      {/* Template Editor */}
                      <Card style={{ padding: 'var(--spacing-md)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Template Text Customizer</h4>
                        
                        {/* Selector Tabs */}
                        <div className="flex gap-xs" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '12px', paddingBottom: '8px' }}>
                          {['rsvp', 'reminder', 'feedback'].map(key => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedTemplateKey(key)}
                              style={{
                                background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: 600,
                                color: selectedTemplateKey === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                borderBottom: selectedTemplateKey === key ? '2px solid var(--color-primary)' : '2px solid transparent'
                              }}
                            >
                              {key === 'rsvp' ? 'RSVP Confirm' : key === 'reminder' ? 'Reminder 24h/3h' : 'Post-Event Feedback'}
                            </button>
                          ))}
                        </div>

                        {/* Subject & Wording inputs */}
                        <div className="flex flex-col gap-sm">
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Subject Line</label>
                            <input 
                              type="text"
                              value={editEventForm.templates[selectedTemplateKey]?.subject || ''}
                              onChange={(e) => {
                                const updated = { ...editEventForm.templates };
                                updated[selectedTemplateKey].subject = e.target.value;
                                setEditEventForm({ ...editEventForm, templates: updated });
                              }}
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                              required
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Wording Text</label>
                            <textarea 
                              rows="6"
                              value={editEventForm.templates[selectedTemplateKey]?.body || ''}
                              onChange={(e) => {
                                const updated = { ...editEventForm.templates };
                                updated[selectedTemplateKey].body = e.target.value;
                                setEditEventForm({ ...editEventForm, templates: updated });
                              }}
                              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'monospace', fontSize: '0.8rem' }}
                              required
                            ></textarea>
                          </div>

                          {/* Placeholder Variables Cheat Sheet */}
                          <div style={{ background: 'var(--color-surface-hover)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                            <strong style={{ color: 'var(--color-primary)' }}>Dynamic Placeholders:</strong>
                            <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginTop: '4px' }}>
                              {['{{guest_name}}', '{{event_name}}', '{{event_date}}', '{{event_start_time}}', '{{booking_id}}', '{{manage_rsvp_link}}', '{{feedback_survey_link}}'].map(v => (
                                <code key={v} style={{ background: 'var(--color-surface)', padding: '2px 4px', borderRadius: '3px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>{v}</code>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Realtime Live rendering Viewport */}
                      <Card style={{ padding: 'var(--spacing-md)', background: 'var(--color-surface-hover)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Real-Time Dispatch Preview</h4>
                          <div className="flex gap-xs">
                            <button
                              type="button"
                              onClick={() => setPreviewMode('email')}
                              style={{
                                background: previewMode === 'email' ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: previewMode === 'email' ? 'white' : 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            >
                              Email Client
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewMode('sms')}
                              style={{
                                background: previewMode === 'sms' ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: previewMode === 'sms' ? 'white' : 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
                              }}
                            >
                              SMS Bubble
                            </button>
                          </div>
                        </div>

                        {/* Rendering Preview */}
                        {(() => {
                          const dummyGuest = { name: "Alice Vance", email: "alice@example.com", phone: "+1 (555) 123-4567", id: "rsvp-alice" };
                          const templateSubject = editEventForm.templates[selectedTemplateKey]?.subject || '';
                          const templateBody = editEventForm.templates[selectedTemplateKey]?.body || '';
                          
                          const resolvedSubject = mockStore.renderTemplate(templateSubject, managedEvent, dummyGuest);
                          const resolvedBody = mockStore.renderTemplate(templateBody, managedEvent, dummyGuest);

                          if (previewMode === 'email') {
                            return (
                              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', color: 'var(--color-text)' }}>
                                <div style={{ background: 'var(--color-surface-hover)', padding: '6px 12px', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                                  <strong>To:</strong> {dummyGuest.email} <br/>
                                  <strong>Subject:</strong> {resolvedSubject || 'Event Update'}
                                </div>
                                <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--color-text)', whiteSpace: 'pre-line', minHeight: '120px', textAlign: 'left' }}>
                                  {resolvedBody}
                                  
                                  {selectedTemplateKey === 'rsvp' && (
                                    <div style={{ marginTop: '16px' }}>
                                      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Manage My RSVP</a>
                                    </div>
                                  )}
                                  {selectedTemplateKey === 'feedback' && (
                                    <div style={{ marginTop: '16px' }}>
                                      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', padding: '8px 16px', background: '#16a34a', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Submit Feedback Survey</a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            // SMS Bubble preview
                            return (
                              <div style={{ maxWidth: '320px', margin: '0 auto', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                                  iMessage / SMS Conversation
                                </div>
                                <div style={{
                                  alignSelf: 'flex-start',
                                  background: 'var(--color-surface-hover)',
                                  color: 'var(--color-text)',
                                  padding: '8px 12px',
                                  borderRadius: '16px',
                                  fontSize: '0.75rem',
                                  maxWidth: '85%',
                                  whiteSpace: 'pre-line',
                                  textAlign: 'left'
                                }}>
                                  {resolvedBody.length > 180 ? resolvedBody.substring(0, 177) + '...' : resolvedBody}
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </Card>

                    </div>

                  </div>

                  {/* Save button footer */}
                  <div className="flex gap-sm justify-end" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '12px' }}>
                    <Button variant="ghost" type="button" onClick={() => setSelectedEventId(null)}>Cancel</Button>
                    <Button variant="primary" type="submit">Save Notification Configuration</Button>
                  </div>
                </form>

                {/* DISPATCH LOGS SECTION */}
                <div style={{ marginTop: '24px' }}>
                  <Card style={{ padding: 0 }} className="glass-surface">
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Notification Dispatch History Logs</h4>
                      <p className="text-muted" style={{ fontSize: '0.8rem', margin: '2px 0 0 0' }}>Logs of all triggers and broadcast deliveries executed for this event.</p>
                    </div>

                    {mockStore.getNotificationLogs(managedEvent.id).length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Date Sent</th>
                              <th>Recipient Email</th>
                              <th>Channel</th>
                              <th>Alert Type</th>
                              <th>Subject</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockStore.getNotificationLogs(managedEvent.id).map(log => (
                              <tr key={log.id}>
                                <td>{new Date(log.sentAt).toLocaleString()}</td>
                                <td>{log.guestEmail}</td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: log.channel === 'Email' ? 'rgba(79,70,229,0.1)' : 'rgba(34,197,94,0.1)', color: log.channel === 'Email' ? 'var(--color-primary)' : '#16a34a', fontWeight: 600 }}>
                                    {log.channel}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 500 }}>
                                    {log.type}
                                  </span>
                                </td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {log.subject}
                                </td>
                                <td>
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => setViewLogDetail(log)}
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  >
                                    View Message
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted" style={{ padding: '24px 0' }}>
                        No dispatched notifications logged yet. (Submit a guest RSVP to generate logs)
                      </div>
                    )}
                  </Card>
                </div>
                
              </div>
            )}
          </div>
        )}

        {/* --- GLOBAL AUDIENCE VIEW --- */}
        {activeSidebar === 'audience' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Audience Directory</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>List of all unique guests who have RSVP'd or attended your events.</p>
            
            <Card style={{ padding: 0 }} className="glass-surface">
              {audienceList.length > 0 ? (
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Events RSVP'd</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audienceList.map(guest => (
                      <tr key={guest.email}>
                        <td style={{ fontWeight: 600 }}>{guest.name}</td>
                        <td>{guest.email}</td>
                        <td>{guest.phone}</td>
                        <td>{guest.eventsAttended.join(', ')}</td>
                        <td>
                          <Button 
                            variant="ghost" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setBroadcastTarget(guest.email);
                              setShowBroadcastModal(true);
                            }}
                          >
                            <Mail size={12} /> Contact
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0' }}>
                  <Users size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>No audience members found in your history.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- GLOBAL ANALYTICS VIEW --- */}
        {activeSidebar === 'analytics' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Channel & Traffic Analytics</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Insights into event traffic, conversion rates, and acquisition channels.</p>
            
            <div className="grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
              {/* Conversion Funnel */}
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>RSVP Conversion Funnel</h4>
                <div className="flex flex-col gap-md" style={{ padding: '10px 0' }}>
                  <div>
                    <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>Total Page Views</span>
                      <span style={{ fontWeight: 600 }}>{totalViews} (100%)</span>
                    </div>
                    <div style={{ height: '24px', background: 'rgba(79,70,229,0.1)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', background: 'var(--color-primary)', width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>RSVP Drawer Opened</span>
                      <span style={{ fontWeight: 600 }}>{Math.round(totalViews * 0.45)} (45%)</span>
                    </div>
                    <div style={{ height: '24px', background: 'rgba(79,70,229,0.1)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', background: 'var(--color-primary)', width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span>RSVPs Submitted (Going / Maybe)</span>
                      <span style={{ fontWeight: 600 }}>{totalRsvps} ({totalViews > 0 ? Math.round((totalRsvps / totalViews) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: '24px', background: 'rgba(244,63,94,0.1)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', background: 'var(--color-accent)', width: `${totalViews > 0 ? (totalRsvps / totalViews) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Referral Channels */}
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Traffic Channels</h4>
                <div style={{ minHeight: '200px' }} className="flex justify-around items-center">
                  {/* SVG Bar Chart for Channels */}
                  <svg width="220" height="150" viewBox="0 0 220 150">
                    <line x1="30" y1="120" x2="210" y2="120" stroke="#cbd5e1" />
                    
                    {/* WhatsApp */}
                    <rect x="50" y="30" width="24" height="90" rx="3" fill="#22c55e" className="chart-bar" />
                    {/* Instagram */}
                    <rect x="90" y="50" width="24" height="70" rx="3" fill="#e1306c" className="chart-bar" />
                    {/* Email/Direct */}
                    <rect x="130" y="75" width="24" height="45" rx="3" fill="var(--color-primary)" className="chart-bar" />
                    {/* Twitter */}
                    <rect x="170" y="100" width="24" height="20" rx="3" fill="#1da1f2" className="chart-bar" />

                    {/* Labels */}
                    <text x="62" y="135" fontSize="8" textAnchor="middle" fill="#64748b">WhatsApp</text>
                    <text x="102" y="135" fontSize="8" textAnchor="middle" fill="#64748b">Insta</text>
                    <text x="142" y="135" fontSize="8" textAnchor="middle" fill="#64748b">Direct</text>
                    <text x="182" y="135" fontSize="8" textAnchor="middle" fill="#64748b">Twitter</text>
                  </svg>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '4px' }}><strong>• WhatsApp:</strong> 60%</div>
                    <div style={{ marginBottom: '4px' }}><strong>• Instagram:</strong> 25%</div>
                    <div style={{ marginBottom: '4px' }}><strong>• Direct Link:</strong> 10%</div>
                    <div style={{ marginBottom: '4px' }}><strong>• Twitter/X:</strong> 5%</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Global Feedback Survey Analytics */}
            {(() => {
              const allEvents = mockStore.getEvents();
              const allFeedback = allEvents.reduce((acc, evt) => {
                const evFeedbacks = mockStore.getFeedbackResponses(evt.id).map(fb => ({ ...fb, eventTitle: evt.title }));
                return [...acc, ...evFeedbacks];
              }, []);

              if (allFeedback.length > 0) {
                const avgRating = (allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length).toFixed(1);
                return (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Guest Feedback & Satisfaction (Aggregate)</h3>
                    <div className="grid-2">
                      <Card style={{ padding: 'var(--spacing-md)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>Ratings Overview</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                              {avgRating}
                            </div>
                            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '8px 0 4px 0' }}>
                              {[1, 2, 3, 4, 5].map(star => {
                                const active = star <= Math.round(Number(avgRating));
                                return <Star key={star} size={14} fill={active ? '#fbbf24' : 'none'} stroke={active ? '#fbbf24' : '#cbd5e1'} />;
                              })}
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{allFeedback.length} reviews</span>
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {[5, 4, 3, 2, 1].map(stars => {
                              const count = allFeedback.filter(fb => fb.rating === stars).length;
                              const pct = (count / allFeedback.length) * 100;
                              return (
                                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                  <span style={{ width: '40px', textAlign: 'right', fontWeight: 500 }}>{stars} ★</span>
                                  <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: '#fbbf24', borderRadius: '4px' }}></div>
                                  </div>
                                  <span style={{ width: '24px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>

                      <Card style={{ padding: 'var(--spacing-md)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>Recent Feedback Reviews</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                          {allFeedback.slice().reverse().map(fb => (
                            <div key={fb.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>{fb.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(fb.submittedAt).toLocaleDateString()}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', gap: '1px' }}>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={10} fill={star <= fb.rating ? '#fbbf24' : 'none'} stroke={star <= fb.rating ? '#fbbf24' : '#cbd5e1'} />
                                  ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>on "{fb.eventTitle}"</span>
                              </div>
                              {fb.comments && <p style={{ color: '#475569', margin: '4px 0 0 0', fontStyle: 'italic', fontSize: '0.8rem' }}>"{fb.comments}"</p>}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              }
              return (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Guest Feedback & Satisfaction (Aggregate)</h3>
                  <Card style={{ padding: '32px', textAlign: 'center' }} className="glass-surface">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', marginBottom: '12px' }}>
                      <MessageSquare size={24} />
                    </div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 4px 0', fontWeight: 600 }}>No Guest Feedback Yet</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                      Feedback surveys are automatically sent after events complete. Responses will show up here.
                    </p>
                  </Card>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- GLOBAL SETTINGS VIEW --- */}
        {activeSidebar === 'settings' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Settings & Config</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Manage host credentials and profile defaults.</p>
            
            <Card style={{ maxWidth: '600px', padding: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-sm)' }}>Organizer Profile</h4>
              <form onSubmit={(e) => { e.preventDefault(); alert('Profile updated!'); }} className="flex flex-col gap-md">
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>Host Display Name</label>
                  <input type="text" defaultValue="Alex Rivera" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>Email Address</label>
                  <input type="email" defaultValue="alex@safalevent.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>Contact Phone</label>
                  <input type="text" defaultValue="+1 (555) 999-8888" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>Default Brand Colors</label>
                  <div className="flex gap-sm">
                    <span style={{ width: '30px', height: '30px', background: 'var(--color-primary)', borderRadius: '50%', cursor: 'pointer', border: '2px solid white', boxShadow: '0 0 0 2px var(--color-primary)' }}></span>
                    <span style={{ width: '30px', height: '30px', background: 'var(--color-accent)', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent' }}></span>
                    <span style={{ width: '30px', height: '30px', background: '#10b981', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent' }}></span>
                    <span style={{ width: '30px', height: '30px', background: '#f59e0b', borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent' }}></span>
                  </div>
                </div>
                
                <Button variant="primary" type="submit" style={{ marginTop: '10px' }}>Save Changes</Button>
              </form>
            </Card>
          </div>
        )}

      </main>

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px',
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={20} /> Broadcast message</h3>
              <button onClick={() => setShowBroadcastModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-sm">
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Recipient Group</label>
                <select 
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                >
                  <option value="all">All RSVP Guests ({managedEventRsvps.length})</option>
                  <option value="going">Going Only ({managedEventRsvps.filter(r => r.status === 'going').length})</option>
                  <option value="maybe">Maybe Only ({managedEventRsvps.filter(r => r.status === 'maybe').length})</option>
                  {broadcastTarget.includes('@') && <option value={broadcastTarget}>Direct to: {broadcastTarget}</option>}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Subject Line</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Venue Update or Parking Info" 
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Message Content</label>
                <textarea 
                  required 
                  placeholder="Write your email/SMS broadcast here..." 
                  rows="6"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '12px' }}>
                <Button variant="ghost" type="button" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={broadcastSent}>
                  {broadcastSent ? 'Sending...' : 'Broadcast Message'}
                </Button>
              </div>
            </form>
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
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
            maxHeight: '85vh', border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span>Message Details</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '9999px', 
                    background: viewLogDetail.channel === 'Email' ? 'rgba(79,70,229,0.1)' : 'rgba(34,197,94,0.1)', 
                    color: viewLogDetail.channel === 'Email' ? 'var(--color-primary)' : '#16a34a',
                    fontWeight: 600
                  }}>
                    {viewLogDetail.channel}
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '9999px', 
                    background: '#f1f5f9', 
                    color: '#475569',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}>
                    {viewLogDetail.type}
                  </span>
                </h3>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                  Sent to {viewLogDetail.guestEmail} on {new Date(viewLogDetail.sentAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setViewLogDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {viewLogDetail.channel === 'Email' ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <div><strong>From:</strong> Alex Rivera &lt;alex@safalevent.com&gt;</div>
                    <div><strong>To:</strong> {viewLogDetail.guestEmail}</div>
                    <div style={{ marginTop: '4px' }}><strong>Subject:</strong> {viewLogDetail.subject}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--color-bg)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: 'var(--color-text)', minHeight: '150px', textAlign: 'left' }}>
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
                      lineHeight: '1.4',
                      textAlign: 'left'
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
