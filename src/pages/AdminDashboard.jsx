import React, { useState, useEffect } from 'react';
import {
  Building2, CheckCircle2, XCircle, FileText, UserCheck, UserX,
  Shield, Check, X, Mail, Phone, MapPin, Search, Users, Calendar,
  Ticket, Clock, Lock, Settings, Activity, Compass, Eye, LogOut, ArrowRight
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { HERO_IMAGES, getAvatar, getEventCover, EVENT_COVERS } from '../utils/images';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import DashboardTopBar from '../components/DashboardTopBar';
import AdminEconomicsPanel from '../components/AdminEconomicsPanel';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, hosts, events, applications, settings
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'SafalEvents',
    primaryColor: '#2563eb',
    fromName: 'SafalEvents',
    supportEmail: 'support@safalevent.com',
    smsSenderId: 'SAFALEVT',
    defaultRsvpDeadline: 12,
    defaultSelfCancellation: true
  });

  // Rejection comments state
  const [rejectionHostId, setRejectionHostId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Suspension comments state
  const [suspensionHostEmail, setSuspensionHostEmail] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Host detail drawer/modal state
  const [selectedHost, setSelectedHost] = useState(null);

  // Event detail read-only drawer/modal state
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Document preview state
  const [documentPreview, setDocumentPreview] = useState(null);

  // Hosts page filters
  const [hostsSearch, setHostsSearch] = useState('');
  const [hostsStatusFilter, setHostsStatusFilter] = useState('All'); // All, ACTIVE, SUSPENDED, PENDING, REJECTED

  // Events page filters
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventsStatusFilter, setEventsStatusFilter] = useState('All'); // All, Draft, Published, Closed, Cancelled
  const [eventsHostSearch, setEventsHostSearch] = useState('');

  const loadData = () => {
    setUsers(mockStore.getUsers());
    setEvents(mockStore.getEvents());
    setPlatformSettings(mockStore.getPlatformSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamically apply the platform primary color ONLY while the admin console is
  // mounted. The cleanup removes the inline override so the brand color never
  // leaks into other roles/pages after logout or navigation (restores the CSS
  // default in index.css for guest/host/staff/login/landing).
  useEffect(() => {
    const root = document.documentElement;
    const hexToRgb = (hex) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim());
      return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null;
    };
    if (platformSettings.primaryColor) {
      root.style.setProperty('--color-primary', platformSettings.primaryColor);
      const rgb = hexToRgb(platformSettings.primaryColor);
      if (rgb) root.style.setProperty('--color-primary-rgb', rgb);
    }
    return () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-rgb');
    };
  }, [platformSettings.primaryColor]);

  // --- Handlers ---
  const handleApprove = (userId, hostName) => {
    const host = users.find(u => u.id === userId);
    if (host && host.hostType === 'organization' && !(host.orgProfile?.docs?.length)) {
      alert('Cannot approve — this organization has not uploaded verification documents yet.');
      return;
    }
    const res = mockStore.updateUserStatus(userId, 'ACTIVE');
    if (res && res.error) {
      alert('Cannot approve — verification documents are required.');
      return;
    }
    mockStore.addAuditLog('Superadmin', `Approved host application for ${hostName}`, userId);
    loadData();
    alert('Host registration approved successfully!');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    const hostUser = users.find(u => u.id === rejectionHostId);
    mockStore.updateUserStatus(rejectionHostId, 'REJECTED', rejectReason);
    mockStore.addAuditLog('Superadmin', `Rejected host application for ${hostUser ? hostUser.name : 'Unknown Host'}. Reason: ${rejectReason}`, rejectionHostId);
    
    setRejectionHostId(null);
    setRejectReason('');
    loadData();
    alert('Host registration rejected.');
  };

  const handleSuspendSubmit = (e) => {
    e.preventDefault();
    if (!suspensionReason.trim()) return;
    
    mockStore.toggleHostSuspension(suspensionHostEmail, true, suspensionReason);
    mockStore.addAuditLog('Superadmin', `Suspended host ${suspensionHostEmail}. Reason: ${suspensionReason}`);
    
    setSuspensionHostEmail(null);
    setSuspensionReason('');
    
    // Close detail drawer if open
    if (selectedHost && selectedHost.email === suspensionHostEmail) {
      setSelectedHost(null);
    }
    
    loadData();
    alert(`Host suspension successfully activated.`);
  };

  const handleUnsuspend = (email) => {
    if (window.confirm(`Are you sure you want to lift the suspension for host ${email}?`)) {
      mockStore.toggleHostSuspension(email, false);
      mockStore.addAuditLog('Superadmin', `Lifted suspension for host ${email}`);
      
      // Close detail drawer if open
      if (selectedHost && selectedHost.email === email) {
        setSelectedHost(null);
      }
      
      loadData();
      alert(`Host suspension lifted.`);
    }
  };

  const handleForceCloseRsvps = (eventId, eventTitle, currentStatus) => {
    const nextStatus = currentStatus === 'Closed' ? 'Open' : 'Closed';
    if (window.confirm(`Are you sure you want to ${nextStatus === 'Closed' ? 'force close' : 're-open'} RSVPs for "${eventTitle}"?`)) {
      mockStore.updateEvent(eventId, { rsvpStatus: nextStatus }, 'Superadmin');
      
      // Close details if open
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(null);
      }
      
      loadData();
      alert(`RSVPs are now ${nextStatus === 'Closed' ? 'closed' : 'opened'} for "${eventTitle}".`);
    }
  };

  const handleToggleEventPrivacy = (eventId, eventTitle, currentPrivacy) => {
    const nextPrivacy = currentPrivacy === 'Private' ? 'Public' : 'Private';
    if (window.confirm(`Are you sure you want to ${nextPrivacy === 'Private' ? 'hide' : 'show'} "${eventTitle}" in discovery lists?`)) {
      mockStore.updateEvent(eventId, { privacy: nextPrivacy }, 'Superadmin');
      
      // Close details if open
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(null);
      }
      
      loadData();
      alert(`"${eventTitle}" is now ${nextPrivacy === 'Private' ? 'hidden' : 'visible'} on discovery lists.`);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    mockStore.savePlatformSettings(platformSettings);
    loadData();
    alert('Global platform settings updated successfully!');
  };

  // --- Calculations for Overview / KPIs ---
  const activeHostsList = users.filter(u => u.role === 'host' && u.status === 'ACTIVE');
  const approvedHostsCount = activeHostsList.filter(h => !mockStore.isHostSuspended(h.email)).length;
  const pendingHosts = users.filter(u => u.role === 'host' && u.status === 'PENDING_ADMIN_APPROVAL');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const activeEventsToday = events.filter(evt => evt.status === 'Published' && evt.date === todayStr);

  const totalRsvpsLast7Days = events.reduce((acc, evt) => {
    const rsvps = mockStore.getRSVPs(evt.id);
    const recent = rsvps.filter(r => {
      const diffTime = Math.abs(new Date() - new Date(r.timestamp));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    return acc + recent.length;
  }, 0);

  // Small dashboard tables preview lists
  const pendingHostsPreview = pendingHosts.slice(0, 5);
  
  // Today/upcoming 7 days events
  const upcomingEventsPreview = events.filter(evt => {
    const evtDate = new Date(evt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = evtDate - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).slice(0, 5);

  // --- Hosts Page Filter Logic ---
  const filteredHosts = users.filter(u => {
    if (u.role !== 'host') return false;
    
    const hostName = u.hostType === 'organization' ? u.orgProfile?.orgName : u.name;
    const matchesSearch = 
      hostName.toLowerCase().includes(hostsSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(hostsSearch.toLowerCase());
      
    const isSuspended = mockStore.isHostSuspended(u.email);
    
    if (hostsStatusFilter === 'All') return matchesSearch;
    if (hostsStatusFilter === 'ACTIVE') return matchesSearch && u.status === 'ACTIVE' && !isSuspended;
    if (hostsStatusFilter === 'SUSPENDED') return matchesSearch && u.status === 'ACTIVE' && isSuspended;
    if (hostsStatusFilter === 'PENDING') return matchesSearch && u.status === 'PENDING_ADMIN_APPROVAL';
    if (hostsStatusFilter === 'REJECTED') return matchesSearch && u.status === 'REJECTED';
    
    return matchesSearch;
  });

  // --- Events Page Filter Logic ---
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(eventsSearch.toLowerCase()) || 
      evt.location.toLowerCase().includes(eventsSearch.toLowerCase());
      
    const matchesStatus = 
      eventsStatusFilter === 'All' || 
      evt.status === eventsStatusFilter || 
      (eventsStatusFilter === 'Closed' && evt.rsvpStatus === 'Closed');

    const hostName = evt.hostName || 'Organizer';
    const matchesHost = 
      !eventsHostSearch || 
      hostName.toLowerCase().includes(eventsHostSearch.toLowerCase()) ||
      (evt.hostEmail && evt.hostEmail.toLowerCase().includes(eventsHostSearch.toLowerCase()));

    return matchesSearch && matchesStatus && matchesHost;
  });

  return (
    <PageShell>
      <div className="dashboard-layout">
        
        {/* ───────── Sidebar Navigation ───────── */}
        <aside className="dashboard-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '0 4px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              {platformSettings.platformName}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              Admin
            </span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`dashboard-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Activity size={18} /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('hosts')}
              className={`dashboard-nav-btn ${activeTab === 'hosts' ? 'active' : ''}`}
            >
              <UserCheck size={18} /> Hosts Directory
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`dashboard-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            >
              <Calendar size={18} /> Events Directory
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`dashboard-nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
            >
              <Building2 size={18} /> Host Applications {pendingHosts.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--color-accent)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%' }}>{pendingHosts.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`dashboard-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} /> Branding &amp; Settings
            </button>
            <button 
              onClick={() => setActiveTab('economics')}
              className={`dashboard-nav-btn ${activeTab === 'economics' ? 'active' : ''}`}
            >
              <Ticket size={18} /> Economics & Plans
            </button>
          </nav>

          <button 
            onClick={onLogout}
            className="dashboard-nav-btn"
            style={{ marginTop: 'auto', border: '1px solid var(--color-border)' }}
          >
            <LogOut size={18} /> Exit Admin Portal
          </button>
        </aside>

        {/* ───────── Main Content Pane ───────── */}
        <main className="dashboard-main">

          <DashboardTopBar
            userName={mockStore.getCurrentUser()?.name || 'Super Admin'}
            roleLabel="Platform Admin"
            planLabel="Superadmin"
            planTone="admin"
            notifCount={0}
            onBell={() => setActiveTab('overview')}
            onProfile={() => setActiveTab('settings')}
            onLogout={onLogout}
          />

          {/* ─── Hero header ─── */}
          <div className="page-hero animate-fade-in" style={{ minHeight: '150px', marginBottom: '20px' }}>
            <img src={HERO_IMAGES.adminOps} alt="Operations Banner" className="page-hero-img" />
            <div className="page-hero-overlay" />
            <div className="page-hero-content" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', marginBottom: '8px', backdropFilter: 'blur(4px)' }}>
                  <Shield size={12} /> Superadmin Console
                </span>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Platform Control Center</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>Control and oversee hosts, applications, events, and default configurations.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={getAvatar('Super Admin')} alt="Super Admin" className="avatar-img" />
                <div style={{ fontSize: '0.75rem', lineHeight: 1.3, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Super Admin</div>
                  <div style={{ opacity: 0.85 }}>admin@safalevent.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── TAB 1: OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Approved Hosts', value: approvedHostsCount, icon: <Users size={20} />, tile: 'stat-icon-blue', hint: 'Active organizers' },
                  { label: 'Pending Applications', value: pendingHosts.length, icon: <Clock size={20} />, tile: 'stat-icon-purple', hint: 'Awaiting your review' },
                  { label: 'Active Events Today', value: activeEventsToday.length, icon: <Calendar size={20} />, tile: 'stat-icon-orange', hint: 'Currently live' },
                  { label: 'RSVPs (Last 7 Days)', value: totalRsvpsLast7Days, icon: <Ticket size={20} />, tile: 'stat-icon-green', hint: 'Recent bookings' }
                ].map(kpi => (
                  <Card key={kpi.label} className="glass-surface" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', background: '#fff' }}>
                    <div className={`stat-icon-tile ${kpi.tile}`}>{kpi.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>{kpi.label}</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.1, margin: '2px 0' }}>{kpi.value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{kpi.hint}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Overview Two Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                
                {/* 1. Pending Host Applications */}
                <Card style={{ padding: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>Host Applications</h3>
                      <p className="text-muted" style={{ fontSize: '0.78rem', margin: '2px 0 0 0' }}>Pending review application requests.</p>
                    </div>
                    {pendingHosts.length > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(249, 115, 22, 0.12)', color: 'var(--color-accent)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>{pendingHosts.length} New</span>}
                  </div>

                  {pendingHostsPreview.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="premium-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>Host / Org</th>
                            <th>Type</th>
                            <th>Email</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingHostsPreview.map(host => (
                            <tr key={host.id}>
                              <td style={{ fontWeight: 600 }}>
                                {host.hostType === 'organization' ? host.orgProfile?.orgName : host.name}
                              </td>
                              <td style={{ textTransform: 'capitalize' }}>{host.hostType}</td>
                              <td>{host.email}</td>
                              <td style={{ textAlign: 'right' }}>
                                <Button 
                                  variant="ghost" 
                                  onClick={() => {
                                    setActiveTab('applications');
                                  }}
                                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '8px' }}
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={32} style={{ color: '#22c55e', marginBottom: '8px' }} />
                      <div>No pending registration requests.</div>
                    </div>
                  )}
                </Card>

                {/* 2. Active Events preview */}
                <Card style={{ padding: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>Upcoming Events (7 Days)</h3>
                      <p className="text-muted" style={{ fontSize: '0.78rem', margin: '2px 0 0 0' }}>Events scheduled within the next week.</p>
                    </div>
                  </div>

                  {upcomingEventsPreview.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="premium-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr>
                            <th>Event Name</th>
                            <th>Host</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>RSVPs</th>
                            <th style={{ textAlign: 'right' }}>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingEventsPreview.map(evt => {
                            const rsvpsCount = mockStore.getRSVPs(evt.id).length;
                            return (
                              <tr key={evt.id}>
                                <td style={{ fontWeight: 600 }}>{evt.title}</td>
                                <td>{evt.hostName || 'Organizer'}</td>
                                <td>{new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{rsvpsCount}</td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    onClick={() => setSelectedEvent(evt)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                                  >
                                    Open
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <Calendar size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <div>No events scheduled for the next 7 days.</div>
                    </div>
                  )}
                </Card>

              </div>
            </div>
          )}

          {/* ─── TAB 2: HOSTS DIRECTORY ─── */}
          {activeTab === 'hosts' && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Hosts Directory</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '4px 0 0 0' }}>Search and manage privileges of all registered hosts.</p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Search hosts by name, organization or email..."
                    value={hostsSearch}
                    onChange={(e) => setHostsSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                </div>
                <select
                  value={hostsStatusFilter}
                  onChange={(e) => setHostsStatusFilter(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <option value="All">All Statuses</option>
                  <option value="ACTIVE">Active (Unrestricted)</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Table */}
              <Card style={{ padding: 0 }} className="glass-surface">
                {filteredHosts.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Host / Org Name</th>
                          <th>Type</th>
                          <th>Email</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                          <th style={{ textAlign: 'right' }}>Events</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHosts.map(host => {
                          const hostEvents = events.filter(e => e.hostEmail === host.email || (host.name === 'Alex Rivera' && e.hostName === 'Alex Rivera'));
                          const isSuspended = mockStore.isHostSuspended(host.email);
                          
                          let statusBadge = (
                            <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                              Active
                            </span>
                          );
                          if (isSuspended) {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                                Suspended
                              </span>
                            );
                          } else if (host.status === 'PENDING_ADMIN_APPROVAL') {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(234,179,8,0.1)', color: '#ca8a04' }}>
                                Pending
                              </span>
                            );
                          } else if (host.status === 'REJECTED') {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(100,116,139,0.12)', color: '#475569' }}>
                                Rejected
                              </span>
                            );
                          }

                          return (
                            <tr key={host.id}>
                              <td style={{ fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img src={getAvatar(host.name)} alt={host.name} className="avatar-img avatar-sm" />
                                  <div style={{ textAlign: 'left' }}>
                                    {host.hostType === 'organization' ? host.orgProfile?.orgName : host.name}
                                    {host.hostType === 'organization' && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Contact: {host.name}</div>}
                                  </div>
                                </div>
                              </td>
                              <td style={{ textTransform: 'capitalize' }}>{host.hostType}</td>
                              <td>{host.email}</td>
                              <td style={{ textAlign: 'center' }}>{statusBadge}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700 }}>{hostEvents.length}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setSelectedHost(host)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                  >
                                    View Host
                                  </button>
                                  {host.status === 'ACTIVE' && (
                                    isSuspended ? (
                                      <button
                                        onClick={() => handleUnsuspend(host.email)}
                                        style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                      >
                                        Unsuspend
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setSuspensionHostEmail(host.email)}
                                        style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                      >
                                        Suspend
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Users size={40} className="text-muted" style={{ marginBottom: '8px' }} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>No matching hosts found</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Try modifying your status filter or search queries.</p>
                  </div>
                )}
              </Card>

            </div>
          )}

          {/* ─── TAB 3: EVENTS DIRECTORY ─── */}
          {activeTab === 'events' && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Events Directory</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '4px 0 0 0' }}>Monitor and enforce restrictions on events across the platform.</p>
              </div>

              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by event title, location..."
                    value={eventsSearch}
                    onChange={(e) => setEventsSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search by host name or email..."
                    value={eventsHostSearch}
                    onChange={(e) => setEventsHostSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <select
                    value={eventsStatusFilter}
                    onChange={(e) => setEventsStatusFilter(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="All">All Event Statuses</option>
                    <option value="Published">Published (Active)</option>
                    <option value="Closed">RSVPs Closed</option>
                    <option value="Draft">Drafts</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <Card style={{ padding: 0 }} className="glass-surface">
                {filteredEvents.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Event Cover &amp; Title</th>
                          <th>Host</th>
                          <th>Date &amp; Time</th>
                          <th style={{ textAlign: 'center' }}>RSVP Cap</th>
                          <th style={{ textAlign: 'center' }}>Privacy</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map(evt => {
                          const rsvpList = mockStore.getRSVPs(evt.id);
                          const totalGoing = rsvpList.filter(r => r.status === 'going').length;
                          const isClosed = evt.rsvpStatus === 'Closed';
                          const isHidden = evt.privacy === 'Private';

                          let statusBadge = (
                            <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                              Published
                            </span>
                          );
                          if (isClosed) {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                                RSVPs Closed
                              </span>
                            );
                          } else if (evt.status === 'Draft') {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(100,116,139,0.15)', color: '#475569' }}>
                                Draft
                              </span>
                            );
                          } else if (evt.status === 'Completed') {
                            statusBadge = (
                              <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, background: 'rgba(14,165,233,0.12)', color: '#0284c7' }}>
                                Completed
                              </span>
                            );
                          }

                          return (
                            <tr key={evt.id}>
                              <td style={{ fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img src={getEventCover(evt)} alt={evt.title} className="thumb-img" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                  <div style={{ textAlign: 'left' }}>
                                    <div>{evt.title}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{evt.location.split(',')[0]}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{evt.hostName || 'Organizer'}</td>
                              <td>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{new Date(evt.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{evt.time}</div>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                {totalGoing} / {evt.capacity}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isHidden ? '#ca8a04' : 'var(--color-primary)' }}>
                                  {evt.privacy}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>{statusBadge}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setSelectedEvent(evt)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                  >
                                    Open
                                  </button>
                                  <button
                                    onClick={() => handleForceCloseRsvps(evt.id, evt.title, evt.rsvpStatus)}
                                    style={{ background: 'none', border: 'none', color: isClosed ? '#16a34a' : '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                  >
                                    {isClosed ? 'Open RSVP' : 'Close RSVP'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleEventPrivacy(evt.id, evt.title, evt.privacy)}
                                    style={{ background: 'none', border: 'none', color: isHidden ? '#16a34a' : '#ca8a04', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                                  >
                                    {isHidden ? 'Unhide' : 'Hide'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Calendar size={40} className="text-muted" style={{ marginBottom: '8px' }} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>No matching events found</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Try adjusting your search queries or status filters.</p>
                  </div>
                )}
              </Card>

            </div>
          )}

          {/* ─── TAB 4: HOST APPLICATIONS ─── */}
          {activeTab === 'applications' && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Host Applications</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '4px 0 0 0' }}>Review org/individual registry applications and approve host accounts.</p>
              </div>

              <div className="flex flex-col gap-md">
                {pendingHosts.length > 0 ? (
                  pendingHosts.map(host => (
                    <Card key={host.id} style={{ padding: '20px' }} className="glass-surface">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                          <img src={getAvatar(host.name)} alt={host.name} className="avatar-img avatar-lg" />
                          <div className="flex flex-col gap-xs" style={{ flex: 1 }}>
                            <div className="flex items-center gap-xs">
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(234,179,8,0.12)', color: '#ca8a04', padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                                {host.hostType}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Registered: {new Date(host.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', margin: '4px 0 2px 0', fontWeight: 800 }}>
                              {host.hostType === 'organization' ? host.orgProfile?.orgName : host.name}
                            </h3>
                            {host.hostType === 'organization' && (
                              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                                <Compass size={14} /> Organization Type: {host.orgProfile?.orgType} | Website: <a href={host.orgProfile?.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>{host.orgProfile?.website || 'N/A'}</a>
                              </p>
                            )}

                            <div className="grid-3" style={{ background: 'var(--color-surface-hover)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', margin: '12px 0 8px 0', fontSize: '0.8rem' }}>
                              <div>
                                <strong style={{ color: 'var(--color-text-muted)' }}>Contact Person:</strong><br />{host.name}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--color-text-muted)' }}>Email (Verified):</strong><br />{host.email}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--color-text-muted)' }}>Phone (Verified):</strong><br />{host.phone}
                              </div>
                            </div>

                            {host.hostType === 'organization' && (
                              host.orgProfile?.docs?.length ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>EIN / DOCS:</span>
                                {host.orgProfile.docs.map((doc, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setDocumentPreview(doc)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', fontSize: '0.75rem', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: 'var(--radius-full)', background: 'rgba(37, 99, 235, 0.08)', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}
                                  >
                                    <FileText size={12} /> {doc} <Eye size={12} />
                                  </button>
                                ))}
                              </div>
                              ) : (
                              <div style={{ marginTop: '6px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', fontSize: '0.72rem', fontWeight: 800, borderRadius: 'var(--radius-full)', background: 'rgba(245, 158, 11, 0.12)', color: '#b45309' }}>
                                  ⚠ Awaiting documents — cannot approve until uploaded
                                </span>
                              </div>
                              )
                            )}

                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Button
                            variant="ghost"
                            onClick={() => setRejectionHostId(host.id)}
                            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#dc2626', background: 'rgba(239,68,68,0.05)', padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', fontWeight: 700 }}
                          >
                            <UserX size={16} /> Reject
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleApprove(host.id, host.name)}
                            disabled={host.hostType === 'organization' && !host.orgProfile?.docs?.length}
                            style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', fontWeight: 700, opacity: (host.hostType === 'organization' && !host.orgProfile?.docs?.length) ? 0.5 : 1, cursor: (host.hostType === 'organization' && !host.orgProfile?.docs?.length) ? 'not-allowed' : 'pointer' }}
                          >
                            <UserCheck size={16} /> Approve Host
                          </Button>
                        </div>

                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-surface">
                    <div className="empty-state">
                      <CheckCircle2 size={40} style={{ color: '#22c55e', marginBottom: '8px' }} />
                      <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Inbox Fully Cleared</h3>
                      <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, maxWidth: '360px' }}>No pending host applications require review at this time.</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 5: BRANDING & SETTINGS ─── */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ maxWidth: '640px', textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Platform Settings</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '4px 0 0 0' }}>Configure global branding styles, email/SMS sender ID templates, and default booking policies.</p>
              </div>

              <Card style={{ padding: '24px' }} className="glass-surface">
                <form onSubmit={handleSaveSettings} className="flex flex-col gap-md">
                  
                  {/* Branding section */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Branding</h3>
                    <div className="grid-2">
                      <div className="form-field">
                        <label className="form-label">Platform Name</label>
                        <input
                          type="text"
                          required
                          value={platformSettings.platformName}
                          onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Primary Color Theme</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="color"
                            value={platformSettings.primaryColor}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, primaryColor: e.target.value })}
                            style={{ width: '42px', height: '42px', padding: 0, border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                          />
                          <input
                            type="text"
                            required
                            value={platformSettings.primaryColor}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, primaryColor: e.target.value })}
                            className="form-input"
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email/SMS section */}
                  <div style={{ marginTop: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Communications &amp; Keys</h3>
                    <div className="grid-2">
                      <div className="form-field">
                        <label className="form-label">Sender Display Name</label>
                        <input
                          type="text"
                          required
                          value={platformSettings.fromName}
                          onChange={(e) => setPlatformSettings({ ...platformSettings, fromName: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Support Email Address</label>
                        <input
                          type="email"
                          required
                          value={platformSettings.supportEmail}
                          onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginTop: '10px' }}>
                      <label className="form-label">SMS Sender Alpha ID</label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={platformSettings.smsSenderId}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, smsSenderId: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Policy Defaults section */}
                  <div style={{ marginTop: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>Policy Defaults</h3>
                    <div className="grid-2">
                      <div className="form-field">
                        <label className="form-label">Default RSVP Deadline (Hours before)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={platformSettings.defaultRsvpDeadline}
                          onChange={(e) => setPlatformSettings({ ...platformSettings, defaultRsvpDeadline: parseInt(e.target.value) || 0 })}
                          className="form-input"
                        />
                      </div>
                      <div className="form-field" style={{ justifyContent: 'center' }}>
                        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer', height: '100%', paddingTop: '22px' }}>
                          <input
                            type="checkbox"
                            checked={platformSettings.defaultSelfCancellation}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, defaultSelfCancellation: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                          />
                          <span>Allow Self-Cancellation by Default</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '14px', padding: '13px', fontWeight: 700 }}>
                    Save Platform Settings
                  </Button>

                </form>
              </Card>
            </div>
          )}

          {/* ECONOMICS & PLANS */}
          {activeTab === 'economics' && (
            <AdminEconomicsPanel />
          )}

        </main>

        {/* ───────── DETAIL DRAWER MODAL: HOST DETAIL ───────── */}
        {selectedHost && (() => {
          const hostEvents = events.filter(e => e.hostEmail === selectedHost.email || (selectedHost.name === 'Alex Rivera' && e.hostName === 'Alex Rivera'));
          const isSuspended = mockStore.isHostSuspended(selectedHost.email);
          return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={{
                background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '900px',
                padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Host Details &amp; Directory</h3>
                  <button onClick={() => setSelectedHost(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <img src={getAvatar(selectedHost.name)} alt={selectedHost.name} className="avatar-img avatar-lg" />
                  <div>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                      {selectedHost.hostType === 'organization' ? selectedHost.orgProfile?.orgName : selectedHost.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: 'var(--color-surface-hover)', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {selectedHost.hostType}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Registered: {new Date(selectedHost.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '18px', alignItems: 'start' }}>
                  {/* Left Column: Details & Events */}
                  <div>
                    <div className="grid-2" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px', fontSize: '0.85rem', marginBottom: '18px', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Contact Person:</strong> {selectedHost.name}</div>
                        <div><strong>Verified Email:</strong> {selectedHost.email}</div>
                        <div><strong>Verified Phone:</strong> {selectedHost.phone}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedHost.hostType === 'organization' && (
                          <>
                            <div><strong>Org Type:</strong> {selectedHost.orgProfile?.orgType}</div>
                            <div><strong>Website:</strong> <a href={selectedHost.orgProfile?.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{selectedHost.orgProfile?.website || 'N/A'}</a></div>
                            <div><strong>Location:</strong> {selectedHost.orgProfile?.city || 'N/A'}, {selectedHost.orgProfile?.state || 'USA'}</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Events List</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '10px' }}>{hostEvents.length} total</span>
                      </h4>
                      {hostEvents.length > 0 ? (
                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                          {hostEvents.map(evt => (
                            <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                              <div>
                                <strong style={{ display: 'block', marginBottom: '2px' }}>{evt.title}</strong>
                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{evt.date} • {evt.location.split(',')[0]}</div>
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: evt.status === 'Published' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.15)', color: evt.status === 'Published' ? '#16a34a' : 'var(--color-text-muted)' }}>{evt.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted" style={{ fontSize: '0.82rem', margin: 0, padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>This host has not hosted any events yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Billing & Subscriptions */}
                  {(() => {
                    const sub = mockStore.getSubscription(selectedHost.email) || mockStore.autoAssignFreePlan(selectedHost.email, selectedHost.hostType || 'individual');
                    const plan = sub ? mockStore.getPlanById(sub.planId) : null;
                    const transactions = mockStore.getTransactions(selectedHost.email) || [];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Subscription Plan</h4>
                          {plan ? (
                            <div style={{ padding: '12px 14px', background: 'linear-gradient(to right, rgba(37,99,235,0.05), rgba(139,92,246,0.05))', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.15)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{plan.emoji} {plan.name}</div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: (sub.status || '').toUpperCase() === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: (sub.status || '').toUpperCase() === 'ACTIVE' ? '#16a34a' : '#b45309', padding: '3px 8px', borderRadius: '4px' }}>
                                  {(sub.status || '').toUpperCase()}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                <strong>Billing:</strong> <span style={{ textTransform: 'capitalize' }}>{sub.billingCycle}</span>
                                {sub.currentPeriodEnd && ` • Renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                <strong>Commission:</strong> {plan.commission}% per ticket
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted" style={{ fontSize: '0.82rem', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>No active plan</div>
                          )}
                        </div>

                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Billing History</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '10px' }}>{transactions.length} total</span>
                          </h4>
                          {transactions.length > 0 ? (
                            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                              {transactions.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                  <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize' }}>{tx.type}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{new Date(tx.createdAt).toLocaleDateString()} • {tx.description}</div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: tx.type === 'refund' ? '#dc2626' : 'var(--color-text)' }}>
                                      {tx.type === 'refund' ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: tx.status === 'completed' ? '#16a34a' : 'var(--color-text-muted)' }}>{tx.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted" style={{ fontSize: '0.82rem', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>No transaction history found.</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '18px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setSelectedHost(null)}>Close</Button>
                  {selectedHost.status === 'ACTIVE' && (
                    isSuspended ? (
                      <Button variant="primary" onClick={() => handleUnsuspend(selectedHost.email)} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                        Lift Suspension
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => { setSuspensionHostEmail(selectedHost.email); }} style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                        Suspend Account
                      </Button>
                    )
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* ───────── DETAIL DRAWER MODAL: EVENT DETAIL (READ-ONLY) ───────── */}
        {selectedEvent && (() => {
          const rsvps = mockStore.getRSVPs(selectedEvent.id);
          const goingCount = rsvps.filter(r => r.status === 'going').length;
          const waitlistCount = rsvps.filter(r => r.status === 'waitlist').length;
          const cancelledCount = rsvps.filter(r => r.status === 'declined').length;
          const isClosed = selectedEvent.rsvpStatus === 'Closed';
          const isHidden = selectedEvent.privacy === 'Private';

          return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={{
                background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px',
                padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Event Profile (Read-Only)</h3>
                  <button onClick={() => setSelectedEvent(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' }}>
                  <img src={getEventCover(selectedEvent)} alt="" style={{ width: '120px', height: '90px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  <div>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{selectedEvent.title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ color: 'var(--color-primary)' }} /> {selectedEvent.location}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--color-surface-hover)', fontWeight: 600 }}>{selectedEvent.eventType}</span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: isHidden ? 'rgba(234,179,8,0.12)' : 'rgba(37,99,235,0.1)', color: isHidden ? '#ca8a04' : 'var(--color-primary)', fontWeight: 600 }}>{selectedEvent.privacy}</span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: isClosed ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: isClosed ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{isClosed ? 'RSVPs Closed' : 'RSVPs Open'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '18px', lineHeight: 1.5 }}>
                  <strong>Description:</strong>
                  <div style={{ padding: '10px 14px', background: 'var(--color-surface-hover)', borderRadius: '10px', border: '1px solid var(--color-border)', marginTop: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                    {selectedEvent.description}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <div style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-muted)' }}>SCHEDULE</div>
                    <div><strong>Date:</strong> {selectedEvent.date}</div>
                    <div><strong>Time:</strong> {selectedEvent.time}</div>
                    <div><strong>Host email:</strong> {selectedEvent.hostEmail || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-muted)' }}>RSVP STATS</div>
                    <div><strong>Confirmed Going:</strong> {goingCount} / {selectedEvent.capacity}</div>
                    {waitlistCount > 0 && <div><strong>Waitlisted:</strong> {waitlistCount}</div>}
                    <div><strong>Declined/Cancelled:</strong> {cancelledCount}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Close</Button>
                  <Button
                    variant="primary"
                    onClick={() => handleToggleEventPrivacy(selectedEvent.id, selectedEvent.title, selectedEvent.privacy)}
                    style={{ background: isHidden ? '#16a34a' : '#ca8a04', borderColor: isHidden ? '#16a34a' : '#ca8a04' }}
                  >
                    {isHidden ? 'Unhide Event' : 'Hide from Public'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleForceCloseRsvps(selectedEvent.id, selectedEvent.title, selectedEvent.rsvpStatus)}
                    style={{ background: isClosed ? '#16a34a' : '#dc2626', borderColor: isClosed ? '#16a34a' : '#dc2626' }}
                  >
                    {isClosed ? 'Open RSVPs' : 'Force Close RSVPs'}
                  </Button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ───────── SUSPENSION MODAL ───────── */}
        {suspensionHostEmail && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '440px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }} className="flex items-center gap-xs">
                  <UserX size={20} /> Suspend Host Account
                </h3>
                <button onClick={() => setSuspensionHostEmail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSuspendSubmit} className="flex flex-col gap-md">
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Suspending <strong>{suspensionHostEmail}</strong> will immediately revoke their event creation and management privileges. Their existing events will remain but they cannot publish drafts.
                </div>
                <div className="form-field">
                  <label className="form-label">Suspension Reason *</label>
                  <textarea
                    required
                    placeholder="e.g. Terms of Service violation: hosting fraudulent listings."
                    rows="3"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    className="form-textarea"
                  ></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button variant="ghost" type="button" onClick={() => setSuspensionHostEmail(null)}>Cancel</Button>
                  <Button variant="primary" type="submit" style={{ background: '#dc2626', borderColor: '#dc2626' }}>Suspend Host</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ───────── REJECTION MODAL ───────── */}
        {rejectionHostId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '440px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }} className="flex items-center gap-xs">
                  <UserX size={20} /> Reject Registration
                </h3>
                <button onClick={() => setRejectionHostId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleRejectSubmit} className="flex flex-col gap-md">
                <div className="form-field">
                  <label className="form-label">Specify Rejection Reason *</label>
                  <textarea
                    required
                    placeholder="e.g. Document proof is illegible or organization details could not be verified."
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="form-textarea"
                  ></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button variant="ghost" type="button" onClick={() => setRejectionHostId(null)}>Cancel</Button>
                  <Button variant="primary" type="submit" style={{ background: '#dc2626', borderColor: '#dc2626' }}>Reject Registration</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ───────── DOCUMENT PREVIEW MODAL ───────── */}
        {documentPreview && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1020
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '580px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
              border: '1px solid var(--color-border)', color: 'var(--color-text)', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }} className="flex items-center gap-xs">
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} /> Document Viewer
                </h3>
                <button onClick={() => setDocumentPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{
                background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '36px 16px',
                textAlign: 'center', flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px'
              }}>
                <FileText size={48} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>{documentPreview}</h4>
                  <p className="text-muted" style={{ fontSize: '0.78rem', margin: 0 }}>Simulated File Size: 1.4 MB | Format: PDF/Scan</p>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 12px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Safe Verification Scan Passed
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDocumentPreview(null)}>Close Preview</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
