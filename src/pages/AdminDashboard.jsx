import React, { useState, useEffect } from 'react';
import {
  Building2, CheckCircle2, XCircle, FileText, UserCheck, UserX,
  History, LogOut, Compass, Eye, Shield, Check, X, ArrowLeft, Mail, Phone, MapPin,
  Search, Download, TrendingUp, AlertTriangle, Users, Calendar, Ticket, Clock
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { HERO_IMAGES, getAvatar, getEventCover, EVENT_COVERS } from '../utils/images';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, messages, templates, audit, lookup, logs
  const [users, setUsers] = useState([]);
  const [vlogs, setVlogs] = useState([]);
  const [rejectionHostId, setRejectionHostId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [documentPreview, setDocumentPreview] = useState(null); // File name

  // Host suspension
  const [suspensionHostEmail, setSuspensionHostEmail] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // System templates
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [selectedSysTemplateKey, setSelectedSysTemplateKey] = useState('rsvp');
  const [sysSubject, setSysSubject] = useState('');
  const [sysBody, setSysBody] = useState('');
  const [sysVersionLog, setSysVersionLog] = useState('');

  // Message Logs Search
  const [msgSearchQuery, setMsgSearchQuery] = useState('');
  const [msgChannelFilter, setMsgChannelFilter] = useState('All');

  // Audit Logs CSV search
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // User Lookup
  const [lookupSearch, setLookupSearch] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const loadData = () => {
    setUsers(mockStore.getUsers());
    setVlogs(mockStore.getVerificationLogs());
    setSystemTemplates(mockStore.getSystemTemplates());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const tmpl = systemTemplates.find(t => t.key === selectedSysTemplateKey);
    if (tmpl) {
      setSysSubject(tmpl.subject);
      setSysBody(tmpl.body);
    }
  }, [selectedSysTemplateKey, systemTemplates]);

  const handleApprove = (userId) => {
    mockStore.updateUserStatus(userId, 'ACTIVE');
    loadData();
    alert('Host registration approved successfully!');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    mockStore.updateUserStatus(rejectionHostId, 'REJECTED', rejectReason);
    setRejectionHostId(null);
    setRejectReason('');
    loadData();
    alert('Host registration rejected.');
  };

  const handleSuspendSubmit = (e) => {
    e.preventDefault();
    if (!suspensionReason.trim()) return;
    mockStore.toggleHostSuspension(suspensionHostEmail, true, suspensionReason);
    setSuspensionHostEmail(null);
    setSuspensionReason('');
    loadData();
    alert(`Host suspension successfully activated.`);
  };

  const handleUnsuspend = (email) => {
    if (window.confirm(`Are you sure you want to lift the suspension for host ${email}?`)) {
      mockStore.toggleHostSuspension(email, false);
      loadData();
      alert(`Host suspension lifted.`);
    }
  };

  const handleTemplateUpdateSubmit = (e) => {
    e.preventDefault();
    if (!sysSubject.trim() || !sysBody.trim() || !sysVersionLog.trim()) {
      alert("All fields are required to update a system template.");
      return;
    }
    mockStore.updateSystemTemplate(selectedSysTemplateKey, sysSubject, sysBody, sysVersionLog);
    setSysVersionLog('');
    loadData();
    alert(`Template ${selectedSysTemplateKey} updated and version bumped successfully!`);
  };

  const handleUserLookup = (e) => {
    e.preventDefault();
    if (!lookupSearch.trim()) return;
    
    const dbUsers = mockStore.getUsers();
    const foundHost = dbUsers.find(u => u.email.toLowerCase() === lookupSearch.toLowerCase() || u.phone === lookupSearch);
    
    if (foundHost) {
      const hosted = mockStore.getEvents().filter(e => e.hostEmail === foundHost.email || foundHost.name === 'Alex Rivera');
      setLookupResult({
        type: 'Host',
        name: foundHost.name,
        email: foundHost.email,
        phone: foundHost.phone,
        status: foundHost.status,
        createdAt: foundHost.createdAt,
        details: hosted
      });
      return;
    }

    const dbEvents = mockStore.getEvents();
    let guestRsvps = [];
    dbEvents.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      const guestMatch = rsvps.find(r => r.email.toLowerCase() === lookupSearch.toLowerCase() || r.phone === lookupSearch);
      if (guestMatch) {
        guestRsvps.push({
          eventTitle: evt.title,
          eventId: evt.id,
          rsvpId: guestMatch.id,
          status: guestMatch.status,
          guestCount: guestMatch.guestCount,
          checkedIn: guestMatch.checkedIn,
          timestamp: guestMatch.timestamp
        });
      }
    });

    if (guestRsvps.length > 0) {
      const firstMatch = guestRsvps[0];
      const rsvps = mockStore.getRSVPs(firstMatch.eventId);
      const guestRecord = rsvps.find(r => r.id === firstMatch.rsvpId);

      setLookupResult({
        type: 'Guest',
        name: guestRecord.name,
        email: guestRecord.email,
        phone: guestRecord.phone,
        status: 'Active',
        createdAt: guestRecord.timestamp,
        details: guestRsvps
      });
    } else {
      setLookupResult(null);
      alert("No host or guest found with that email or phone number.");
    }
  };

  const pendingHosts = users.filter(u => u.role === 'host' && u.status === 'PENDING_ADMIN_APPROVAL');
  const activeHosts = users.filter(u => u.role === 'host' && u.status === 'ACTIVE');
  const rejectedHosts = users.filter(u => u.role === 'host' && u.status === 'REJECTED');

  // Platform-wide KPI figures (read-only derivations for the header banner)
  const platformEvents = mockStore.getEvents();
  const platformRsvpCount = platformEvents.reduce((acc, evt) => acc + mockStore.getRSVPs(evt.id).length, 0);

  const kpiCards = [
    { label: 'Active Hosts', value: activeHosts.length, icon: <Users size={20} />, tile: 'stat-icon-blue', hint: 'Verified organizers' },
    { label: 'Live Events', value: platformEvents.length, icon: <Calendar size={20} />, tile: 'stat-icon-orange', hint: 'Across the platform' },
    { label: 'Total RSVPs', value: platformRsvpCount, icon: <Ticket size={20} />, tile: 'stat-icon-green', hint: 'Guest registrations' },
    { label: 'Pending Approvals', value: pendingHosts.length, icon: <Clock size={20} />, tile: 'stat-icon-purple', hint: 'Awaiting your review' },
  ];

  return (
    <PageShell>
      <div className="dashboard-layout">
      {/* Sidebar navigation */}
      <aside className="dashboard-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '0 4px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Admin Portal</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(14, 165, 233, 0.12)', color: '#0369a1', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Superadmin</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`dashboard-nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
          >
            <Building2 size={18} /> Pending ({pendingHosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`dashboard-nav-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            <UserCheck size={18} /> Directory ({activeHosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`dashboard-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
          >
            <Mail size={18} /> Message Logs
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`dashboard-nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <FileText size={18} /> System Templates
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`dashboard-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <History size={18} /> Audit Trail
          </button>
          <button 
            onClick={() => setActiveTab('lookup')}
            className={`dashboard-nav-btn ${activeTab === 'lookup' ? 'active' : ''}`}
          >
            <Search size={18} /> User Lookup
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`dashboard-nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <Shield size={18} /> OTP Logs ({vlogs.length})
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

      {/* Main dashboard content */}
      <main className="dashboard-main">

        {/* --- PLATFORM CONTROL CENTER HERO + KPI BANNER --- */}
        <div className="page-hero animate-fade-in" style={{ minHeight: '160px', marginBottom: '18px' }}>
          <img src={HERO_IMAGES.adminOps} alt="Operations team at work" className="page-hero-img" />
          <div className="page-hero-overlay" />
          <div className="page-hero-content" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.9)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', marginBottom: '8px' }}>
                <Shield size={12} /> Superadmin Console
              </span>
              <h1 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Platform Control Center</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Welcome back, Super Admin — here is what's happening across SafalEvents today.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={getAvatar('Super Admin')} alt="Super Admin" className="avatar-img" />
              <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700 }}>Super Admin</div>
                <div style={{ opacity: 0.85 }}>admin@safalevent.com</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {kpiCards.map(kpi => (
            <Card key={kpi.label} className="glass-surface" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: '#fff' }}>
              <div className={`stat-icon-tile ${kpi.tile}`}>{kpi.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, lineHeight: 1.2 }}>{kpi.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{kpi.hint}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* --- PENDING APPLICATIONS VIEW --- */}
        {activeTab === 'pending' && (
          <div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Host Registration Approvals</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Verify organization registration details and approve accounts to allow event creations.
            </p>

            <div className="flex flex-col gap-md">
              {pendingHosts.length > 0 ? (
                pendingHosts.map(host => (
                  <Card key={host.id} style={{ padding: 'var(--spacing-md)' }} className="glass-surface">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                        <img src={getAvatar(host.name)} alt={host.name} className="avatar-img avatar-lg" />
                      <div className="flex flex-col gap-xs" style={{ textAlign: 'left', flex: 1 }}>
                        <div className="flex items-center gap-xs">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(234,179,8,0.1)', color: '#ca8a04', padding: '2px 8px', borderRadius: '9999px' }}>
                            {host.hostType.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Registered: {new Date(host.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', margin: '4px 0 2px 0', fontWeight: 700 }}>{host.orgProfile?.orgName}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Compass size={14} /> Org Type: {host.orgProfile?.orgType} | Website: <a href={host.orgProfile?.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{host.orgProfile?.website || 'N/A'}</a>
                        </p>

                        <div className="grid-3" style={{ background: 'var(--color-surface-hover)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', margin: '10px 0', fontSize: '0.8rem' }}>
                          <div>
                            <strong>Contact Name:</strong><br />{host.name}
                          </div>
                          <div>
                            <strong>Email (Verified):</strong><br />{host.email}
                          </div>
                          <div>
                            <strong>Phone (Verified):</strong><br />{host.phone}
                          </div>
                        </div>

                        {host.orgProfile?.docs && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>DOCUMENTS:</span>
                            {host.orgProfile.docs.map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => setDocumentPreview(doc)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', fontSize: '0.75rem', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '9999px', background: 'rgba(14, 165, 233, 0.08)', cursor: 'pointer', color: '#0369a1', fontWeight: 600 }}
                              >
                                <FileText size={12} /> {doc} <Eye size={12} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      </div>

                      <div className="flex gap-sm">
                        <Button
                          variant="ghost"
                          onClick={() => setRejectionHostId(host.id)}
                          style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', background: 'rgba(239,68,68,0.06)', padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', fontWeight: 600 }}
                        >
                          <UserX size={16} /> Reject
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleApprove(host.id)}
                          style={{ background: '#00C853', borderColor: '#00C853', padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '9999px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,200,83,0.25)' }}
                        >
                          <UserCheck size={16} /> Approve
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="glass-surface">
                  <div className="empty-state">
                    <img src={EVENT_COVERS.meetup[0]} alt="Team celebrating" className="empty-state-img" />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00C853', fontWeight: 700, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> All caught up!
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Applications Inbox Clear</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', maxWidth: '360px', margin: 0 }}>
                      No pending host registration applications await review. New applications will appear here the moment they arrive.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* --- ALL HOSTS DIRECTORY VIEW --- */}
        {activeTab === 'all' && (
          <div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Registered Hosts Directory</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>List of active and rejected host profiles on SafalEvents.</p>

            <Card style={{ padding: 0 }} className="glass-surface">
              {users.filter(u => u.role === 'host').length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Host Name / Org</th>
                        <th>Type</th>
                        <th>Contact Email</th>
                        <th>Contact Phone</th>
                        <th>Status</th>
                        <th>Reason (if rejected)</th>
                        <th>Privileges Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'host').map(host => (
                        <tr key={host.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={getAvatar(host.name)} alt={host.name} className="avatar-img avatar-sm" />
                              <div>
                                {host.hostType === 'organization' ? host.orgProfile?.orgName : host.name}
                                {host.hostType === 'organization' && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Contact: {host.name}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {host.hostType}
                            </span>
                          </td>
                          <td>{host.email}</td>
                          <td>{host.phone}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
                              background: host.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : host.status === 'PENDING_ADMIN_APPROVAL' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                              color: host.status === 'ACTIVE' ? '#22c55e' : host.status === 'PENDING_ADMIN_APPROVAL' ? '#ca8a04' : '#ef4444'
                            }}>
                              {host.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {host.rejectReason || '-'}
                          </td>
                          <td>
                            {host.status === 'ACTIVE' ? (
                              mockStore.isHostSuspended(host.email) ? (
                                <div className="flex items-center gap-xs">
                                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>Suspended</span>
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    onClick={() => handleUnsuspend(host.email)}
                                    style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#16a34a', color: '#16a34a' }}
                                  >
                                    Unsuspend
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  onClick={() => setSuspensionHostEmail(host.email)}
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                  Suspend Send
                                </Button>
                              )
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <img src={EVENT_COVERS.conference[1]} alt="Empty venue" className="empty-state-img" />
                  <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>No hosts yet</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, maxWidth: '340px' }}>Once organizers register on SafalEvents, their profiles will show up in this directory.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- VERIFICATION AUDIT LOGS VIEW --- */}
        {activeTab === 'logs' && (
          <div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Security Verification Logs</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Real-time security auditing history logs for multi-channel OTP attempts.</p>

            <Card style={{ padding: 0 }} className="glass-surface">
              {vlogs.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Target Info</th>
                        <th>OTP Type</th>
                        <th>Verification Status</th>
                        <th>IP Address</th>
                        <th>Device User Agent</th>
                        <th>Log Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vlogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.8rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.targetEmail}</div>
                            {log.targetPhone && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.targetPhone}</div>}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, padding: '2px 6px', background: 'var(--color-surface-hover)', borderRadius: '4px' }}>
                              {log.type}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
                              background: log.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: log.success ? '#22c55e' : '#ef4444'
                            }}>
                              {log.success ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ip}</td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.device}</td>
                          <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="stat-icon-tile stat-icon-blue" style={{ width: '56px', height: '56px' }}><Shield size={26} /></div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>No verification activity</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, maxWidth: '340px' }}>OTP verification attempts across email and SMS channels will be logged here in real time.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- GLOBAL MESSAGE LOGS & HEALTH CHARTS --- */}
        {activeTab === 'messages' && (() => {
          const allEvents = mockStore.getEvents();
          const allNotificationLogs = allEvents.reduce((acc, evt) => {
            const evLogs = mockStore.getNotificationLogs(evt.id).map(log => ({ ...log, eventTitle: evt.title, eventCover: getEventCover(evt) }));
            return [...acc, ...evLogs];
          }, []);

          const filteredMsgLogs = allNotificationLogs.filter(log => {
            const query = msgSearchQuery.toLowerCase();
            const matchesQuery = 
              log.guestEmail.toLowerCase().includes(query) || 
              log.subject.toLowerCase().includes(query) || 
              log.body.toLowerCase().includes(query) || 
              log.eventTitle.toLowerCase().includes(query);
            const matchesChannel = msgChannelFilter === 'All' || log.channel === msgChannelFilter;
            return matchesQuery && matchesChannel;
          });

          // SVG Charts stats
          const totalLogs = allNotificationLogs.length;
          const emailLogs = allNotificationLogs.filter(l => l.channel === 'Email').length;
          const smsLogs = allNotificationLogs.filter(l => l.channel === 'SMS').length;
          const bounceLogs = Math.round(totalLogs * 0.03); // 3% simulated bounces

          return (
            <div>
              <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Platform Message Logs & Delivery Health</h1>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Search notification outbox history and view delivery volume metrics.</p>

              {/* Delivery Health Spark/Bar Charts */}
              <div className="grid-3" style={{ marginBottom: '24px' }}>
                <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Email Volume</h5>
                    <p className="text-muted" style={{ fontSize: '0.7rem', margin: '0 0 6px 0' }}>Transactional emails sent platform-wide</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{emailLogs}</p>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}><TrendingUp size={12} /> Channel active</span>
                  </div>
                  <svg width="80" height="50">
                    <rect x="10" y="30" width="12" height="20" fill="var(--color-primary)" rx="2" />
                    <rect x="26" y="20" width="12" height="30" fill="var(--color-primary)" rx="2" />
                    <rect x="42" y="15" width="12" height="35" fill="var(--color-primary)" rx="2" />
                    <rect x="58" y="5" width="12" height="45" fill="var(--color-primary)" rx="2" />
                  </svg>
                </Card>

                <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>SMS Volume</h5>
                    <p className="text-muted" style={{ fontSize: '0.7rem', margin: '0 0 6px 0' }}>Text reminders and OTP messages</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{smsLogs}</p>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}><TrendingUp size={12} /> Channel active</span>
                  </div>
                  <svg width="80" height="50">
                    <rect x="10" y="35" width="12" height="15" fill="#22c55e" rx="2" />
                    <rect x="26" y="25" width="12" height="25" fill="#22c55e" rx="2" />
                    <rect x="42" y="30" width="12" height="20" fill="#22c55e" rx="2" />
                    <rect x="58" y="10" width="12" height="40" fill="#22c55e" rx="2" />
                  </svg>
                </Card>

                <Card style={{ padding: 'var(--spacing-md)' }} className="flex justify-between items-center glass-surface">
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Bounces & Failures</h5>
                    <p className="text-muted" style={{ fontSize: '0.7rem', margin: '0 0 6px 0' }}>Undeliverable messages this period</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>{bounceLogs}</p>
                    <span style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}><AlertTriangle size={12} /> Normal 3% bounce rate</span>
                  </div>
                  <svg width="80" height="50">
                    <rect x="10" y="45" width="12" height="5" fill="#ef4444" rx="2" />
                    <rect x="26" y="40" width="12" height="10" fill="#ef4444" rx="2" />
                    <rect x="42" y="42" width="12" height="8" fill="#ef4444" rx="2" />
                    <rect x="58" y="45" width="12" height="5" fill="#ef4444" rx="2" />
                  </svg>
                </Card>
              </div>

              {/* Search Filters */}
              <div className="flex gap-sm items-center" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
                  <input
                    type="text"
                    placeholder="Search by email, subject, body content or event title..."
                    value={msgSearchQuery}
                    onChange={(e) => setMsgSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                </div>
                <select
                  value={msgChannelFilter}
                  onChange={(e) => setMsgChannelFilter(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                >
                  <option value="All">All Channels</option>
                  <option value="Email">Email Only</option>
                  <option value="SMS">SMS Only</option>
                </select>
              </div>

              {/* Message log table */}
              <Card style={{ padding: 0 }} className="glass-surface">
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Date Sent</th>
                        <th>Event Context</th>
                        <th>Guest Recipient</th>
                        <th>Channel</th>
                        <th>Subject Line</th>
                        <th>Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMsgLogs.length > 0 ? (
                        filteredMsgLogs.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '0.75rem', width: '150px' }}>{new Date(log.sentAt).toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={log.eventCover} alt={log.eventTitle} className="thumb-img" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                                {log.eventTitle}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={getAvatar(log.guestEmail)} alt="" className="avatar-img avatar-sm" />
                                {log.guestEmail}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: log.channel === 'Email' ? 'rgba(0,113,227,0.1)' : 'rgba(34,197,94,0.1)', color: log.channel === 'Email' ? 'var(--color-primary)' : '#16a34a', fontWeight: 600 }}>
                                {log.channel}
                              </span>
                            </td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.subject}>
                              {log.subject}
                            </td>
                            <td>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00963f', background: 'rgba(0,200,83,0.1)', padding: '3px 10px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={11} /> Delivered
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No system notification logs matched your query.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* --- SYSTEM WIDE TEMPLATES VERSION EDITOR --- */}
        {activeTab === 'templates' && (
          <div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>System Template Version Editor</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Modify platform defaults for life-cycle transaction notifications and update versions.</p>

            <div className="grid-2" style={{ alignItems: 'start' }}>
              
              {/* Selector & Form */}
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '2px', fontWeight: 600 }}>Edit Base Template</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0 0 16px 0' }}>Changes apply platform-wide and are version-tracked automatically.</p>

                <form onSubmit={handleTemplateUpdateSubmit} className="flex flex-col gap-md">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Select System Template</label>
                    <select
                      value={selectedSysTemplateKey}
                      onChange={(e) => setSelectedSysTemplateKey(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    >
                      {systemTemplates.map(t => (
                        <option key={t.key} value={t.key}>{t.name} (v{t.version})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Default Subject Line</label>
                    <input
                      type="text"
                      required
                      value={sysSubject}
                      onChange={(e) => setSysSubject(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Wording Text Template</label>
                    <textarea
                      required
                      rows="8"
                      value={sysBody}
                      onChange={(e) => setSysBody(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                    ></textarea>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Template Modification Log *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Updated support support email and footer address"
                      value={sysVersionLog}
                      onChange={(e) => setSysVersionLog(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>Saving will automatically increment the template version by 0.1.</span>
                  </div>

                  <Button type="submit" variant="primary" style={{ padding: '12px' }}>Publish & Update System Template</Button>
                </form>
              </Card>

              {/* Version Logs History */}
              <Card style={{ padding: 'var(--spacing-md)' }}>
                {(() => {
                  const tmpl = systemTemplates.find(t => t.key === selectedSysTemplateKey);
                  return (
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: 600 }}>{tmpl?.name} History</h4>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Current Version: <strong style={{ color: 'var(--color-primary)' }}>v{tmpl?.version}</strong> | Last Updated: {tmpl ? new Date(tmpl.updatedAt).toLocaleString() : 'N/A'}</p>
                      
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Changelog Audit History</h5>
                      <div className="flex flex-col gap-sm" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                        {tmpl?.logs && tmpl.logs.length > 0 ? (
                          tmpl.logs.slice().reverse().map((log, idx) => (
                            <div key={idx} style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                              {log}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted" style={{ fontSize: '0.8rem' }}>No changelogs recorded for this template yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </Card>

            </div>
          </div>
        )}

        {/* --- PLATFORM WIDE IMMUTABLE AUDIT TRAIL --- */}
        {activeTab === 'audit' && (() => {
          const filteredAudit = mockStore.getAuditTrail().filter(log => {
            const query = auditSearchQuery.toLowerCase();
            return log.actor.toLowerCase().includes(query) || log.action.toLowerCase().includes(query);
          });

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.45rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Immutable System Audit Logs</h1>
                  <p className="text-muted" style={{ margin: '4px 0 0 0' }}>Security auditing chronological history trail of host and admin operations.</p>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const headers = 'Timestamp,Actor,Action,Event ID\n';
                    const rows = mockStore.getAuditTrail().map(log => `"${log.timestamp}","${log.actor}","${log.action}","${log.eventId || 'SYSTEM'}"`).join('\n');
                    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `immutable_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{ padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <Download size={16} /> Export Audit Log (CSV)
                </Button>
              </div>

              {/* Search filter input */}
              <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Search logs by actor name or action..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
              </div>

              <Card style={{ padding: 0 }} className="glass-surface">
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor Profile</th>
                        <th>Operation Action Performed</th>
                        <th>Event Target ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudit.length > 0 ? (
                        filteredAudit.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '0.8rem', width: '200px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td style={{ fontWeight: 600, width: '200px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={getAvatar(log.actor)} alt={log.actor} className="avatar-img avatar-sm" />
                                {log.actor}
                              </div>
                            </td>
                            <td>{log.action}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '2px 6px', background: 'var(--color-surface-hover)', borderRadius: '4px' }}>
                                {log.eventId || 'SYSTEM'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No audit trail logs matched your filter.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* --- GLOBAL USER LOOKUP TOOL --- */}
        {activeTab === 'lookup' && (
          <div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Universal User Lookup Directory</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Search platform-wide hosts and guests by email or phone to view detail files.</p>

            <Card style={{ padding: 'var(--spacing-lg)', maxWidth: '600px', marginBottom: '24px' }}>
              <form onSubmit={handleUserLookup} className="flex gap-sm">
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Enter email address or phone (e.g. alice@example.com)..."
                    required
                    value={lookupSearch}
                    onChange={(e) => setLookupSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-muted)' }} />
                </div>
                <Button type="submit" variant="primary" style={{ padding: '12px 24px', fontWeight: 600 }}>Lookup</Button>
              </form>
            </Card>

            {lookupResult ? (
              <Card style={{ padding: 'var(--spacing-lg)', maxWidth: '800px' }} className="animate-fade-in glass-surface">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={getAvatar(lookupResult.email || lookupResult.name)} alt={lookupResult.name} className="avatar-img avatar-lg" />
                    <div>
                      <div className="flex items-center gap-xs" style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', background: lookupResult.type === 'Host' ? 'rgba(14,165,233,0.12)' : 'rgba(234,179,8,0.1)', color: lookupResult.type === 'Host' ? '#0369a1' : '#ca8a04' }}>
                          {lookupResult.type.toUpperCase()} PROFILE
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Created: {new Date(lookupResult.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>{lookupResult.name}</h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                    <div className="flex items-center gap-xs"><Mail size={14} className="text-muted" /> {lookupResult.email}</div>
                    <div className="flex items-center gap-xs"><Phone size={14} className="text-muted" /> {lookupResult.phone || 'No phone number'}</div>
                  </div>
                </div>

                {lookupResult.type === 'Host' ? (
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>Hosted Events list ({lookupResult.details.length})</h4>
                    {lookupResult.details.length > 0 ? (
                      <div className="flex flex-col gap-sm">
                        {lookupResult.details.map(evt => (
                          <div key={evt.id} style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={getEventCover(evt)} alt={evt.title} className="thumb-img" />
                              <div>
                                <strong style={{ fontSize: '0.9rem' }}>{evt.title}</strong>
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{evt.date} • {evt.location}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: evt.status === 'Published' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: evt.status === 'Published' ? '#16a34a' : 'var(--color-text-muted)' }}>{evt.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>This host has not created any events yet.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>Event Registrations list ({lookupResult.details.length})</h4>
                    <div className="flex flex-col gap-sm">
                      {lookupResult.details.map((reg, idx) => (
                        <div key={idx} style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={getEventCover({ id: reg.eventId, title: reg.eventTitle })} alt={reg.eventTitle} className="thumb-img" />
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{reg.eventTitle}</strong>
                              <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>Pass ID: {reg.rsvpId} • Registered: {new Date(reg.timestamp).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-sm" style={{ fontSize: '0.75rem' }}>
                            <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: reg.status === 'going' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: reg.status === 'going' ? '#16a34a' : '#ef4444' }}>{reg.status.toUpperCase()} ({reg.guestCount} tix)</span>
                            <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: reg.checkedIn ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: reg.checkedIn ? '#16a34a' : 'var(--color-text-muted)' }}>{reg.checkedIn ? 'Checked-In' : 'Absent'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <div className="empty-state" style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', background: '#fff', maxWidth: '600px' }}>
                <img src={EVENT_COVERS.meetup[2]} alt="People connecting" className="empty-state-img" />
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Find anyone on the platform</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, maxWidth: '380px' }}>Enter a host or guest email address (or phone number) above to pull up their full profile, events and registrations.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* REJECTION COMMENT MODAL */}
      {rejectionHostId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '450px',
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="flex items-center gap-xs">
                <UserX size={20} style={{ color: '#ef4444' }} /> Reject Application
              </h3>
              <button onClick={() => setRejectionHostId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-md">
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500 }}>Specify Rejection Reason *</label>
                <textarea 
                  required 
                  placeholder="e.g. Document upload proof is illegible or EIN matches another account." 
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '12px' }}>
                <Button variant="ghost" type="button" onClick={() => setRejectionHostId(null)}>Cancel</Button>
                <Button variant="primary" type="submit" style={{ background: '#ef4444', borderColor: '#ef4444' }}>Reject Registration</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {documentPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px',
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
            border: '1px solid var(--color-border)', color: 'var(--color-text)'
          }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }} className="flex items-center gap-xs">
                <FileText size={18} style={{ color: 'var(--color-primary)' }} /> Document Viewer
              </h3>
              <button onClick={() => setDocumentPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Simulated document representation */}
            <div style={{
              background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '32px 16px',
              textAlign: 'center', flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px'
            }}>
              <FileText size={48} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{documentPreview}</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Simulated File Size: 1.4 MB | Upload Type: PDF/Document</p>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} /> Safe Verification Scan Passed
              </div>
            </div>

            <div className="flex justify-end" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <Button variant="ghost" onClick={() => setDocumentPreview(null)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      </div>
    </PageShell>
  );
}
