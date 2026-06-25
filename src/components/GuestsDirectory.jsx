import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Card from './Card';
import Button from './Button';
import {
  Search, X, Mail, MessageSquare, AlertTriangle, Eye, Users, Bell,
  FileText, Send, Phone, CheckCircle, ShieldCheck, Activity, Clock,
  TrendingUp, CalendarDays, StickyNote, History, QrCode, UserCheck, Calendar,
  Plus, Minus, Camera
} from 'lucide-react';
import { getAvatar } from '../utils/images';
import { mockStore } from '../utils/mockStore';

// ----------------------------------------------------------------------------
// Mock Data — each guest carries full RSVP / attendance history
// ----------------------------------------------------------------------------
export const MOCK_GUESTS = [
  {
    id: 1, name: 'Alice Vance', email: 'alice@example.com', phone: '+1 555-0101',
    eventsRsvpd: 8, totalAttendees: 10, actualAttendees: 10, trustScore: 92,
    pattern: 'Consistent Attendee', remindersSent: 0, firstRsvp: 'Jan 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer',   rsvpCount: 2, actual: 2, date: '22 Jun 2026', rsvpDate: '15 Jun 2026' },
      { event: 'Startup Meetup',  rsvpCount: 1, actual: 1, date: '15 May 2026', rsvpDate: '08 May 2026' },
      { event: 'Founder Dinner',  rsvpCount: 2, actual: 2, date: '12 Apr 2026', rsvpDate: '02 Apr 2026' },
    ],
    communications: [],
  },
  {
    id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 555-0102',
    eventsRsvpd: 12, totalAttendees: 68, actualAttendees: 24, trustScore: 35,
    pattern: 'Over-RSVP Pattern', remindersSent: 2, firstRsvp: 'Mar 2025',
    notes: 'Frequently reserves large groups. Typically attends with 1-3 guests. Monitor future RSVPs.',
    history: [
      { event: 'Summer Mixer',   rsvpCount: 10, actual: 2, date: '22 Jun 2026', rsvpDate: '14 Jun 2026' },
      { event: 'Startup Meetup',  rsvpCount: 8,  actual: 1, date: '15 May 2026', rsvpDate: '06 May 2026' },
      { event: 'Product Launch',  rsvpCount: 12, actual: 0, date: '12 Apr 2026', rsvpDate: '05 Apr 2026' },
      { event: 'Founder Dinner',  rsvpCount: 6,  actual: 2, date: '08 Mar 2026', rsvpDate: '01 Mar 2026' },
    ],
    communications: [
      { type: 'Reminder Email',       date: '22 Jun 2026', status: 'Delivered' },
      { type: 'Attendance Reminder',  date: '15 May 2026', status: 'Opened' },
      { type: 'SMS Reminder',         date: '10 Apr 2026', status: 'Delivered' },
    ],
  },
  {
    id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 555-0103',
    eventsRsvpd: 6, totalAttendees: 12, actualAttendees: 8, trustScore: 65,
    pattern: 'Partial Attendance', remindersSent: 1, firstRsvp: 'Feb 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer',   rsvpCount: 4, actual: 2, date: '22 Jun 2026', rsvpDate: '16 Jun 2026' },
      { event: 'Startup Meetup',  rsvpCount: 2, actual: 1, date: '15 May 2026', rsvpDate: '09 May 2026' },
    ],
    communications: [
      { type: 'Attendance Reminder', date: '14 May 2026', status: 'Opened' },
    ],
  },
  {
    id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '+1 555-0104',
    eventsRsvpd: 3, totalAttendees: 3, actualAttendees: 0, trustScore: 10,
    pattern: 'Frequent No-Show', remindersSent: 3, firstRsvp: 'Apr 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer',   rsvpCount: 1, actual: 0, date: '22 Jun 2026', rsvpDate: '18 Jun 2026' },
      { event: 'Startup Meetup',  rsvpCount: 1, actual: 0, date: '15 May 2026', rsvpDate: '11 May 2026' },
      { event: 'Product Launch',  rsvpCount: 1, actual: 0, date: '12 Apr 2026', rsvpDate: '07 Apr 2026' },
    ],
    communications: [
      { type: 'Reminder Email',      date: '21 Jun 2026', status: 'Delivered' },
      { type: 'Attendance Reminder', date: '14 May 2026', status: 'Not Opened' },
      { type: 'SMS Reminder',        date: '11 Apr 2026', status: 'Delivered' },
    ],
  },
  {
    id: 5, name: 'Ethan Cole', email: 'ethan@example.com', phone: '+1 555-0105',
    eventsRsvpd: 5, totalAttendees: 7, actualAttendees: 7, trustScore: 88,
    pattern: 'Consistent Attendee', remindersSent: 0, firstRsvp: 'May 2025',
    notes: '',
    history: [
      { event: 'Summer Mixer',   rsvpCount: 3, actual: 3, date: '22 Jun 2026', rsvpDate: '15 Jun 2026' },
      { event: 'Product Launch',  rsvpCount: 2, actual: 2, date: '12 Apr 2026', rsvpDate: '04 Apr 2026' },
    ],
    communications: [],
  },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const getTrustBadge = (score) => {
  if (score >= 85) return { color: '#16a34a', bg: '#16a34a12', text: 'Excellent' };
  if (score >= 70) return { color: '#22c55e', bg: '#22c55e12', text: 'Good' };
  if (score >= 50) return { color: '#eab308', bg: '#eab30812', text: 'Moderate' };
  return { color: '#ef4444', bg: '#ef444412', text: 'High Risk' };
};

const getPatternBadge = (pattern) => {
  switch (pattern) {
    case 'Consistent Attendee': return { color: '#16a34a', bg: '#16a34a12' };
    case 'Partial Attendance':
    case 'Frequent Partial Attendance': return { color: '#eab308', bg: '#eab30812' };
    case 'Frequent No-Show': return { color: '#f97316', bg: '#f9731612' };
    case 'Over-RSVP Pattern': return { color: '#ef4444', bg: '#ef444412' };
    default: return { color: '#94a3b8', bg: '#94a3b812' };
  }
};

const PARTY_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery', 'Skyler'];
const getPartyMembers = (guestName, count) => {
  if (count <= 1) return [guestName];
  const lastName = guestName.split(' ').pop();
  return [guestName, ...Array.from({ length: count - 1 }, (_, i) => `${PARTY_NAMES[i % PARTY_NAMES.length]} ${lastName} (+1)`)];
};

// Per-event attendance status
const getEventStatus = (rsvpCount, actual) => {
  if (actual === 0)            return { label: 'No Show',         icon: '✕', color: '#ef4444', bg: '#ef444412' };
  if (actual >= rsvpCount)     return { label: 'Fully Attended',  icon: '✓', color: '#16a34a', bg: '#16a34a12' };
  return                              { label: 'Partial',         icon: '⚠', color: '#eab308', bg: '#eab30812' };
};

const TrustBar = ({ score, color }) => (
  <div style={{ width: '72px', height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
  </div>
);

// Small section heading
const SectionLabel = ({ icon, children }) => (
  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)',  letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
    {icon} {children}
  </div>
);

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export default function GuestsDirectory({ eventId, hideHeader }) {
  const [searchTerm, setSearchTerm]               = useState('');
  const [selectedGuest, setSelectedGuest]         = useState(null);
  const [filterReliability, setFilterReliability] = useState('All');
  const [filterPattern, setFilterPattern]         = useState('All');
  const [selectedEvents, setSelectedEvents]       = useState([]);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const allEvents = useMemo(() => {
    try {
      return mockStore.getEvents() || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, []);

  const GUESTS_DATA = useMemo(() => {
    if (!eventId) return MOCK_GUESTS;

    const rsvps = mockStore.getRSVPs(eventId);
    return rsvps.filter(r => r.status === 'going' && r.approvalState !== 'REJECTED').map(rsvp => {
      const existing = MOCK_GUESTS.find(g => g.email === rsvp.email);
      return {
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email,
        phone: rsvp.phone,
        eventsRsvpd: existing ? existing.eventsRsvpd : 1,
        totalAttendees: existing ? existing.totalAttendees : (rsvp.guestCount || 1),
        actualAttendees: existing ? existing.actualAttendees : (rsvp.checkedIn ? 1 : 0),
        trustScore: existing ? existing.trustScore : 85,
        pattern: existing ? existing.pattern : 'New Attendee',
        remindersSent: 0,
        firstRsvp: existing ? existing.firstRsvp : new Date(rsvp.timestamp).toLocaleDateString(),
        notes: existing ? existing.notes : '',
        history: existing ? existing.history : [],
        communications: existing ? existing.communications : [],
        
        // RSVP specifics
        answers: rsvp.answers,
        checkedIn: rsvp.checkedIn,
        guestCount: rsvp.guestCount || 1,
      };
    });
  }, [eventId]);

  // History sub-modal: null | 'rsvp' | 'checkin'
  const [historyModal, setHistoryModal]           = useState(null);
  // Editable host notes, keyed by guest id
  const [notesMap, setNotesMap]                   = useState({});
  // Check-in panel inside drawer
  const [showCheckinPanel, setShowCheckinPanel]   = useState(false);
  const [checkinState, setCheckinState]           = useState({});  // { eventIdx: checkedInCount }
  const [arrivingNow, setArrivingNow]             = useState(1);

  // Broadcast modal
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bChannel, setBChannel]           = useState('email');
  const [bTarget, setBTarget]             = useState('all');
  const [bSubject, setBSubject]           = useState('');
  const [bMessage, setBMessage]           = useState('');
  const [bSent, setBSent]                 = useState(false);
  const [showAllHistory, setShowAllHistory]       = useState(false);

  const stats = useMemo(() => ({
    total:     GUESTS_DATA.length,
    highTrust: GUESTS_DATA.filter(g => g.trustScore >= 70).length,
    atRisk:    GUESTS_DATA.filter(g => g.trustScore < 50).length,
    reminded:  GUESTS_DATA.filter(g => g.remindersSent > 0).length,
  }), [GUESTS_DATA]);

  const filteredGuests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return GUESTS_DATA.filter(g => {
      if (q && !g.name.toLowerCase().includes(q) && !g.email.toLowerCase().includes(q) && !g.phone.includes(q)) return false;
      if (filterReliability !== 'All' && getTrustBadge(g.trustScore).text !== filterReliability) return false;
      if (filterPattern !== 'All') {
        const match =
          (filterPattern === 'Consistent' && g.pattern === 'Consistent Attendee') ||
          (filterPattern === 'Partial'    && (g.pattern === 'Partial Attendance' || g.pattern === 'Frequent Partial Attendance')) ||
          (filterPattern === 'NoShow'     && g.pattern === 'Frequent No-Show') ||
          (filterPattern === 'OverRsvp'   && g.pattern === 'Over-RSVP Pattern');
        if (!match) return false;
      }
      if (selectedEvents.length > 0) {
        let matchesSelectedEvent = false;
        for (const evtId of selectedEvents) {
          // Check if guest has RSVP in this event
          const rsvps = mockStore.getRSVPs(evtId) || [];
          if (rsvps.some(r => r.email.toLowerCase() === g.email.toLowerCase() && r.status === 'going')) {
            matchesSelectedEvent = true;
            break;
          }
          // Also check fuzzy history
          const targetEvt = allEvents.find(e => e.id === evtId);
          if (targetEvt && g.history) {
            const titleNorm = targetEvt.title.toLowerCase();
            if (g.history.some(h => {
              const histNorm = h.event.toLowerCase();
              return titleNorm.includes(histNorm) || histNorm.includes(titleNorm);
            })) {
              matchesSelectedEvent = true;
              break;
            }
          }
        }
        if (!matchesSelectedEvent) return false;
      }
      return true;
    });
  }, [searchTerm, filterReliability, filterPattern, selectedEvents, GUESTS_DATA, allEvents]);

  const hasActiveFilters = searchTerm || filterReliability !== 'All' || filterPattern !== 'All' || selectedEvents.length > 0;
  const resetFilters = () => { setSearchTerm(''); setFilterReliability('All'); setFilterPattern('All'); setSelectedEvents([]); };

  const handleSendBroadcast = () => {
    setBSent(true);
    setTimeout(() => {
      setBSent(false); setShowBroadcast(false);
      setBSubject(''); setBMessage(''); setBChannel('email'); setBTarget('all');
    }, 2200);
  };

  const channels = [
    { value: 'email', label: 'Email',        icon: <Mail size={14} /> },
    { value: 'sms',   label: 'SMS',          icon: <Phone size={14} /> },
    { value: 'both',  label: 'Email + SMS',  icon: <Send size={14} /> },
  ];

  // -------- Derived intelligence for the selected guest --------
  const insight = useMemo(() => {
    if (!selectedGuest) return null;
    const g = selectedGuest;
    const evCount = g.history.length || 1;
    const accuracy = Math.round((g.actualAttendees / (g.totalAttendees || 1)) * 100);
    const noShows = g.history.filter(h => h.actual === 0).length;
    const partials = g.history.filter(h => h.actual > 0 && h.actual < h.rsvpCount).length;
    const isReliable = g.trustScore >= 70;
    const isRisky = g.trustScore < 50 || g.pattern === 'Over-RSVP Pattern';
    const lastAttended = [...g.history].reverse().find(h => h.actual > 0)?.event || '—';
    return {
      accuracy,
      avgRsvp: (g.totalAttendees / evCount).toFixed(1),
      avgActual: (g.actualAttendees / evCount).toFixed(1),
      noShows, partials, isReliable, isRisky, lastAttended,
      overRsvpEvents: g.history.filter(h => h.rsvpCount - h.actual >= 3).length,
    };
  }, [selectedGuest]);

  const guestNotes = selectedGuest ? (notesMap[selectedGuest.id] ?? selectedGuest.notes) : '';

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>

      {/* ── Page Header ── */}
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Guest Directory</h1>
            <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Audience intelligence — track habits, reliability, and engagement.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowBroadcast(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}>
            <Send size={15} /> Broadcast
          </Button>
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Guests', value: stats.total,     color: 'var(--color-primary)', icon: <Users size={18} /> },
          { label: 'High Trust',   value: stats.highTrust,  color: '#16a34a',              icon: <CheckCircle size={18} /> },
          { label: 'At-Risk',      value: stats.atRisk,     color: '#ef4444',              icon: <AlertTriangle size={18} /> },
          { label: 'Reminded',     value: stats.reminded,   color: '#eab308',              icon: <Bell size={18} /> },
        ].map((s, i) => (
          <Card key={i} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: `color-mix(in srgb, ${s.color} 12%, transparent)`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text)' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Search by name, email, phone…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 10px 9px 34px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        <select value={filterReliability} onChange={e => setFilterReliability(e.target.value)} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.84rem', cursor: 'pointer' }}>
          <option value="All">Trust: All</option>
          <option value="Excellent">Excellent (85%+)</option>
          <option value="Good">Good (70–84%)</option>
          <option value="Moderate">Moderate (50–69%)</option>
          <option value="High Risk">High Risk (&lt;50%)</option>
        </select>
        <select value={filterPattern} onChange={e => setFilterPattern(e.target.value)} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.84rem', cursor: 'pointer' }}>
          <option value="All">Pattern: All</option>
          <option value="Consistent">Consistent Attendee</option>
          <option value="Partial">Partial Attendance</option>
          <option value="NoShow">Frequent No-Show</option>
          <option value="OverRsvp">Over-RSVP</option>
        </select>
        {/* Multi-select Event Filter */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '150px',
              justifyContent: 'space-between',
              outline: 'none'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              <CalendarDays size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              {selectedEvents.length === 0
                ? 'Events: All'
                : `Events: ${selectedEvents.length} selected`}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{isEventDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {isEventDropdownOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsEventDropdownOpen(false)} />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  padding: '8px',
                  zIndex: 999,
                  minWidth: '220px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {allEvents.map(evt => {
                  const isChecked = selectedEvents.includes(evt.id);
                  return (
                    <label
                      key={evt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: 'var(--color-text)',
                        background: isChecked ? 'rgba(31,58,99,0.08)' : 'transparent',
                        userSelect: 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isChecked ? 'rgba(31,58,99,0.12)' : 'var(--color-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = isChecked ? 'rgba(31,58,99,0.08)' : 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedEvents(selectedEvents.filter(id => id !== evt.id));
                          } else {
                            setSelectedEvents([...selectedEvents, evt.id]);
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.title}</span>
                    </label>
                  );
                })}
                {selectedEvents.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvents([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={resetFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <X size={13} /> Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{filteredGuests.length} of {GUESTS_DATA.length} guests</span>
        {hasActiveFilters && <span style={{ fontSize: '0.72rem', background: 'rgba(31,58,99,0.08)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>Filtered</span>}
      </div>

      {/* ── Data Table ── */}
      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '680px' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '2px solid var(--color-border)' }}>
                {eventId ? (
                  ['Guest', 'Contact', 'Trust & Pattern', 'Check-in Status', 'Custom Answers', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.72rem',  fontWeight: 700, letterSpacing: '0.6px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))
                ) : (
                  ['Guest', 'Contact', 'Events', 'Trust Score', 'Pattern', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.72rem',  fontWeight: 700, letterSpacing: '0.6px', textAlign: i === 2 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '56px 16px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Users size={36} style={{ opacity: 0.25 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No guests match your filters</div>
                      <button type="button" onClick={resetFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : filteredGuests.map((guest, idx) => {
                const trust = getTrustBadge(guest.trustScore);
                const pattern = getPatternBadge(guest.pattern);
                return (
                  <tr key={guest.id} style={{ borderBottom: idx < filteredGuests.length - 1 ? '1px solid var(--color-border)' : 'none', background: idx % 2 === 1 ? 'var(--color-surface-hover)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <img src={getAvatar(guest.name)} alt={guest.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--color-border)' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{guest.name}</div>
                          {guest.remindersSent > 0 && (
                            <div style={{ fontSize: '0.68rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <Bell size={9} /> {guest.remindersSent} reminder{guest.remindersSent > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <a href={`mailto:${guest.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>{guest.email}</a>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{guest.phone}</span>
                      </div>
                    </td>
                    {eventId ? (
                      <>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: trust.bg, color: trust.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, width: 'fit-content' }}>
                              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: trust.color }} />{trust.text}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: pattern.bg, color: pattern.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, width: 'fit-content' }}>
                              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: pattern.color, flexShrink: 0 }} />{guest.pattern}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '12px', background: guest.checkedIn ? 'rgba(22,163,74,0.1)' : 'rgba(148,163,184,0.1)', color: guest.checkedIn ? '#16a34a' : '#64748b' }}>
                            {guest.checkedIn ? '✓ Checked in' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {guest.answers && Object.keys(guest.answers).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem' }}>
                              {Object.entries(guest.answers).map(([q, a]) => (
                                <div key={q}><span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{q.substring(0,18)}...:</span> {a}</div>
                              ))}
                            </div>
                          ) : <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None</span>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>{guest.eventsRsvpd}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>RSVPs</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '5px', minWidth: '110px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <TrustBar score={guest.trustScore} color={trust.color} />
                              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: trust.color }}>{guest.trustScore}%</span>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: trust.bg, color: trust.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, width: 'fit-content' }}>
                              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: trust.color }} />{trust.text}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: pattern.bg, color: pattern.color, padding: '5px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: pattern.color, flexShrink: 0 }} />{guest.pattern}
                          </div>
                        </td>
                      </>
                    )}
                    <td style={{ padding: '14px 16px' }}>
                      <button type="button" onClick={() => { setSelectedGuest(guest); setShowCheckinPanel(false); setCheckinState({}); setArrivingNow(1); setShowAllHistory(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* BROADCAST MODAL                                                           */}
      {/* ========================================================================= */}
      {showBroadcast && createPortal(
        <>
          <div onClick={() => !bSent && setShowBroadcast(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,12,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', zIndex: 1001, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--color-primary) 0%, #2d5a9e 100%)' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>Broadcast to Guests</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Reach your audience via Email or SMS</p>
              </div>
              <button onClick={() => setShowBroadcast(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {bSent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#16a34a15', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 0 8px #16a34a10' }}><CheckCircle size={30} /></div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', margin: '0 0 8px', color: 'var(--color-text)' }}>Broadcast Sent!</h4>
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>Your message is on its way to {bTarget === 'all' ? GUESTS_DATA.length : bTarget === 'high_trust' ? stats.highTrust : stats.atRisk} guests.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)',  letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Channel</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {channels.map(ch => (
                        <button key={ch.value} type="button" onClick={() => setBChannel(ch.value)} style={{ flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer', border: bChannel === ch.value ? '2px solid var(--color-primary)' : '2px solid var(--color-border)', background: bChannel === ch.value ? 'rgba(31,58,99,0.07)' : 'var(--color-surface)', color: bChannel === ch.value ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>{ch.icon} {ch.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)',  letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Recipients</label>
                    <select value={bTarget} onChange={e => setBTarget(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem' }}>
                      <option value="all">All Guests ({GUESTS_DATA.length})</option>
                      <option value="high_trust">High Trust Guests ({stats.highTrust})</option>
                      <option value="at_risk">At-Risk Guests ({stats.atRisk})</option>
                    </select>
                  </div>
                  {(bChannel === 'email' || bChannel === 'both') && (
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)',  letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Subject</label>
                      <input type="text" placeholder="e.g. New event just announced — grab your spot!" value={bSubject} onChange={e => setBSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)',  letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Message</label>
                    <textarea placeholder="Write your announcement, event details, or update here…" value={bMessage} onChange={e => setBMessage(e.target.value.slice(0, 500))} rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.875rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}><span style={{ fontSize: '0.72rem', color: bMessage.length > 450 ? '#ef4444' : 'var(--color-text-muted)' }}>{bMessage.length}/500</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '4px', borderTop: '1px solid var(--color-border)' }}>
                    <button type="button" onClick={() => setShowBroadcast(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={handleSendBroadcast} disabled={!bMessage.trim()} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: bMessage.trim() ? 'var(--color-primary)' : 'var(--color-border)', color: bMessage.trim() ? 'white' : 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.875rem', cursor: bMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Send size={15} /> Send Broadcast</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* GUEST DETAIL DRAWER                                                       */}
      {/* ========================================================================= */}
      {selectedGuest && insight && createPortal(
        <>
          <div onClick={() => setSelectedGuest(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100%', background: 'var(--color-surface)', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', zIndex: 1001, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.28s ease-out' }}>

            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={getAvatar(selectedGuest.name)} alt={selectedGuest.name} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid var(--color-border)', objectFit: 'cover' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{selectedGuest.name}</h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{selectedGuest.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedGuest(null)} style={{ background: 'var(--color-surface-hover)', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={18} /></button>
            </div>

            {/* Drawer body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* ─────────── TOP VERDICT BANNER ─────────── */}
              {insight.isReliable ? (
                <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderRadius: '14px', padding: '18px 20px', color: 'white', boxShadow: '0 8px 24px rgba(22,163,74,0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>
                    <ShieldCheck size={20} /> Reliable Guest
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{insight.accuracy}% <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>attendance accuracy</span></div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.92, marginTop: '6px' }}>Consistent attendance across {selectedGuest.eventsRsvpd} events.</div>
                </div>
              ) : insight.isRisky ? (
                <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', borderRadius: '14px', padding: '18px 20px', color: 'white', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.05rem', marginBottom: '10px' }}>
                    <AlertTriangle size={20} /> {selectedGuest.pattern === 'Over-RSVP Pattern' ? 'Over-RSVP Pattern Detected' : 'High No-Show Risk'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div><div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{selectedGuest.totalAttendees}</div><div style={{ fontSize: '0.68rem', opacity: 0.9, marginTop: '3px' }}>Seats reserved</div></div>
                    <div><div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{selectedGuest.actualAttendees}</div><div style={{ fontSize: '0.68rem', opacity: 0.9, marginTop: '3px' }}>Actual attended</div></div>
                    <div><div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{insight.accuracy}%</div><div style={{ fontSize: '0.68rem', opacity: 0.9, marginTop: '3px' }}>Accuracy</div></div>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(0,0,0,0.18)', padding: '6px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    🍽 Food &amp; capacity planning risk
                  </div>
                </div>
              ) : (
                <div style={{ background: '#eab30815', border: '1px solid #eab30840', borderLeft: '4px solid #eab308', borderRadius: '12px', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem', color: '#a16207', marginBottom: '4px' }}>
                    <AlertTriangle size={17} /> Partial Attendance
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{insight.accuracy}% accuracy across {selectedGuest.eventsRsvpd} events — monitor future RSVPs.</div>
                </div>
              )}

              {/* ─────────── SUMMARY ─────────── */}
              <div>
                <SectionLabel icon={<TrendingUp size={13} />}>Summary</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: "Events RSVP'd",         value: selectedGuest.eventsRsvpd },
                    { label: 'Trust Score',            value: `${selectedGuest.trustScore}%`, color: getTrustBadge(selectedGuest.trustScore).color },
                    { label: "Total Attendees RSVP'd", value: selectedGuest.totalAttendees },
                    { label: 'Actual Check-ins',       value: selectedGuest.actualAttendees },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color || 'var(--color-text)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─────────── BEHAVIOR INSIGHTS ─────────── */}
              <div>
                <SectionLabel icon={<Activity size={13} />}>Behavior Insights</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Attendance Accuracy',     value: `${insight.accuracy}%`, color: getTrustBadge(selectedGuest.trustScore).color },
                    { label: 'Avg RSVP / Event',        value: insight.avgRsvp },
                    { label: 'Avg Actual Attendance',   value: insight.avgActual },
                    selectedGuest.pattern === 'Over-RSVP Pattern'
                      ? { label: 'Repeated Over-RSVP', value: `${insight.overRsvpEvents} events`, color: '#ef4444' }
                      : { label: 'Last Attended', value: insight.lastAttended },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '12px 14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '5px' }}>{s.label}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color || 'var(--color-text)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={11} /> First RSVP: <strong style={{ color: 'var(--color-text)' }}>{selectedGuest.firstRsvp}</strong>
                </div>
              </div>

              {/* ─────────── ATTENDANCE HISTORY (with status) ─────────── */}
              <div>
                <SectionLabel icon={<History size={13} />}>Attendance History</SectionLabel>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                        {['Event', 'RSVP', 'Actual', 'Δ', 'Status'].map((h, i) => (
                          <th key={i} style={{ padding: '9px 10px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.68rem',  textAlign: i === 0 ? 'left' : i === 4 ? 'right' : 'center' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllHistory ? selectedGuest.history : selectedGuest.history.slice(0, 3)).map((h, i, arr) => {
                        const diff = h.actual - h.rsvpCount;
                        const st = getEventStatus(h.rsvpCount, h.actual);
                        return (
                          <tr key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{h.event}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{h.rsvpCount}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{h.actual}</td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: diff < 0 ? '#ef4444' : diff > 0 ? '#16a34a' : 'var(--color-text-muted)' }}>{diff === 0 ? '—' : diff}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: st.bg, color: st.color, padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{st.icon} {st.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─────────── RECENT ACTIVITY TIMELINE ─────────── */}
              <div>
                <SectionLabel icon={<CalendarDays size={13} />}>Recent Activity</SectionLabel>
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '6px', bottom: '6px', width: '2px', background: 'var(--color-border)' }} />
                  {(showAllHistory ? selectedGuest.history : selectedGuest.history.slice(0, 3)).map((h, i, arr) => {
                    const st = getEventStatus(h.rsvpCount, h.actual);
                    return (
                      <div key={i} style={{ position: 'relative', paddingBottom: i < arr.length - 1 ? '16px' : 0 }}>
                        <div style={{ position: 'absolute', left: '-19px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', background: st.color, border: '2px solid var(--color-surface)' }} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{h.date}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>{h.event}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          RSVP {h.rsvpCount} · {h.actual === 0 ? <span style={{ color: '#ef4444', fontWeight: 700 }}>No Show</span> : <>Checked In {h.actual}</>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedGuest.history.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-primary)',
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginTop: '12px',
                      padding: 0, display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {showAllHistory ? 'Show Less' : `Show All History (${selectedGuest.history.length} events)`}
                  </button>
                )}
              </div>

              {/* ─────────── COMMUNICATION HISTORY ─────────── */}
              <div>
                <SectionLabel icon={<Mail size={13} />}>Communication History</SectionLabel>
                {selectedGuest.communications.length === 0 ? (
                  <div style={{ background: 'var(--color-surface-hover)', borderRadius: '10px', padding: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    No reminders or messages sent yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
                    {selectedGuest.communications.map((c, i) => {
                      const delivered = c.status === 'Delivered';
                      const opened = c.status === 'Opened';
                      const stColor = opened ? '#16a34a' : delivered ? 'var(--color-primary)' : '#ef4444';
                      const Icon = c.type.includes('SMS') ? MessageSquare : c.type.includes('Email') || c.type.includes('Reminder') ? Mail : Bell;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-surface-hover)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--color-text)' }}>{c.type}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{c.date}</div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: stColor, background: `color-mix(in srgb, ${stColor} 12%, transparent)`, padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{c.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ─────────── RISK ANALYSIS (poor behaviour only) ─────────── */}
              {!insight.isReliable && (
                <div>
                  <SectionLabel icon={<AlertTriangle size={13} />}>Attendance Analysis</SectionLabel>
                  <div style={{ background: '#ef44440a', border: '1px solid #ef444425', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    {[
                      { label: 'RSVP Seats Reserved', value: selectedGuest.totalAttendees },
                      { label: 'Actual Attendance',   value: selectedGuest.actualAttendees },
                      { label: 'Accuracy',            value: `${insight.accuracy}%`, color: getTrustBadge(selectedGuest.trustScore).color },
                      { label: 'No Shows',            value: insight.noShows },
                      { label: 'Partial Events',      value: insight.partials },
                      { label: 'Reminders Sent',      value: selectedGuest.remindersSent },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color || 'var(--color-text)', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─────────── HOST NOTES ─────────── */}
              <div>
                <SectionLabel icon={<StickyNote size={13} />}>Host Notes</SectionLabel>
                <textarea
                  value={guestNotes}
                  onChange={e => setNotesMap(prev => ({ ...prev, [selectedGuest.id]: e.target.value }))}
                  placeholder="Add a private note about this guest — RSVP habits, preferences, things to watch…"
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: '#fffbeb', color: 'var(--color-text)', fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Notes are private to your team.</div>
              </div>

              {/* ─────────── CHECK-IN PANEL ─────────── */}
              {showCheckinPanel && (
                <div>
                  <SectionLabel icon={<QrCode size={13} />}>Event Check-In</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedGuest.history.map((h, idx) => {
                      const total = h.rsvpCount;
                      const checked = checkinState[idx] != null ? checkinState[idx] : h.actual;
                      const remaining = total - checked;
                      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                      const members = getPartyMembers(selectedGuest.name, total);
                      const evSt = checked >= total
                        ? { label: 'All Checked In', color: '#16a34a', bg: '#16a34a12' }
                        : checked > 0
                        ? { label: `${checked}/${total} Arrived`, color: '#d97706', bg: '#d9770612' }
                        : { label: 'Not Checked In', color: 'var(--color-text-muted)', bg: 'var(--color-surface-hover)' };

                      return (
                        <Card key={idx} style={{ padding: '16px', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{h.event}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{h.date}</div>
                            </div>
                            <span style={{ background: evSt.bg, color: evSt.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{evSt.label}</span>
                          </div>

                          {/* Progress bar */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '5px' }}>
                              <span>{checked} of {total} attendees</span><span>{pct}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: checked >= total ? '#16a34a' : 'var(--color-primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                            </div>
                          </div>

                          {/* Party members scanner list */}
                          {total > 1 && (
                            <div style={{ background: 'var(--color-bg)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Party Members</div>
                              {members.map((m, mIdx) => {
                                const isArrived = mIdx < checked;
                                return (
                                  <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isArrived ? '#16a34a15' : 'var(--color-surface-hover)', color: isArrived ? '#16a34a' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                                        {isArrived ? <CheckCircle size={12} /> : mIdx + 1}
                                      </div>
                                      <span style={{ fontSize: '0.8rem', color: isArrived ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: isArrived ? 600 : 500 }}>{m}</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isArrived ? '#16a34a' : 'var(--color-text-muted)' }}>{isArrived ? 'Arrived' : 'Absent'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick manual adjust slider */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                              <button
                                type="button"
                                disabled={checked <= 0}
                                onClick={() => setCheckinState(prev => ({ ...prev, [idx]: checked - 1 }))}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: checked <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                              >
                                <Minus size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={checked >= total}
                                onClick={() => setCheckinState(prev => ({ ...prev, [idx]: checked + 1 }))}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: checked >= total ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            {remaining > 0 ? (
                              <button
                                type="button"
                                onClick={() => setCheckinState(prev => ({ ...prev, [idx]: checked + arrivingNow }))}
                                style={{ flex: 2, padding: '7px 12px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              >
                                <CheckCircle size={13} /> Check In {Math.min(arrivingNow, remaining)}
                              </button>
                            ) : (
                              <div style={{ flex: 2, padding: '7px 12px', background: '#16a34a10', border: '1px solid #16a34a20', borderRadius: '8px', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center' }}>Checked In</div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─────────── QUICK ACTIONS ─────────── */}
              <div>
                <SectionLabel icon={<Send size={13} />}>Quick Actions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: <QrCode size={15} />,        label: showCheckinPanel ? 'Hide Check-In Panel' : 'Check-In Scanner', onClick: () => { setShowCheckinPanel(!showCheckinPanel); setCheckinState({}); setArrivingNow(1); }, highlight: true },
                    { icon: <Bell size={15} />,          label: 'Send Reminder',         onClick: () => {} },
                    { icon: <MessageSquare size={15} />, label: 'Send Message',          onClick: () => {} },
                    { icon: <FileText size={15} />,      label: 'View Full RSVP History', onClick: () => setHistoryModal('rsvp') },
                    { icon: <Users size={15} />,         label: 'View Check-In History',  onClick: () => setHistoryModal('checkin') },
                  ].map((a, i) => (
                    <button key={i} type="button" onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: a.highlight ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', background: a.highlight ? 'rgba(31,58,99,0.06)' : 'var(--color-surface)', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ color: 'var(--color-primary)' }}>{a.icon}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────── HISTORY SUB-MODALS ─────────── */}
          {historyModal && (
            <>
              <div onClick={() => setHistoryModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,12,0.6)', backdropFilter: 'blur(6px)', zIndex: 1100 }} />
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '560px', maxWidth: 'calc(100vw - 32px)', maxHeight: '88vh', background: 'var(--color-surface)', borderRadius: '18px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', zIndex: 1101, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem' }}>{historyModal === 'rsvp' ? 'Full RSVP History' : 'Check-In History'}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{selectedGuest.name}</p>
                  </div>
                  <button onClick={() => setHistoryModal(null)} style={{ background: 'var(--color-surface-hover)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                </div>
                <div style={{ padding: '20px 22px', overflowY: 'auto' }}>
                  {historyModal === 'rsvp' ? (
                    <>
                      <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                              {['Event', 'RSVP Date', 'RSVP Count', 'Status'].map((h, i) => (
                                <th key={i} style={{ padding: '10px 12px', textAlign: i >= 2 ? 'center' : 'left', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.68rem', }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedGuest.history.map((h, i) => (
                              <tr key={i} style={{ borderBottom: i < selectedGuest.history.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <td style={{ padding: '11px 12px', fontWeight: 600 }}>{h.event}</td>
                                <td style={{ padding: '11px 12px', color: 'var(--color-text-muted)' }}>{h.rsvpDate}</td>
                                <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 700 }}>{h.rsvpCount}</td>
                                <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(31,58,99,0.08)', padding: '3px 9px', borderRadius: '20px' }}>Confirmed</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.7, background: 'var(--color-surface-hover)', borderRadius: '10px', padding: '12px 14px' }}>
                        Each RSVP record tracks: <strong style={{ color: 'var(--color-text)' }}>initial RSVP count</strong>, <strong style={{ color: 'var(--color-text)' }}>updated count</strong>, full <strong style={{ color: 'var(--color-text)' }}>modification history</strong>, event type, and the event organizer.
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                              {['Event', 'RSVP', 'Checked-In', 'Attendance %'].map((h, i) => (
                                <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.68rem', }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedGuest.history.map((h, i) => {
                              const pct = Math.round((h.actual / (h.rsvpCount || 1)) * 100);
                              const pc = pct >= 80 ? '#16a34a' : pct >= 40 ? '#eab308' : '#ef4444';
                              return (
                                <tr key={i} style={{ borderBottom: i < selectedGuest.history.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                  <td style={{ padding: '11px 12px', fontWeight: 600 }}>{h.event}</td>
                                  <td style={{ padding: '11px 12px', textAlign: 'center' }}>{h.rsvpCount}</td>
                                  <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 700 }}>{h.actual}</td>
                                  <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 800, color: pc }}>{pct}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        {[
                          { label: 'Lifetime Accuracy', value: `${insight.accuracy}%`, color: getTrustBadge(selectedGuest.trustScore).color },
                          { label: 'Total RSVP Seats',  value: selectedGuest.totalAttendees },
                          { label: 'Total Attended',    value: selectedGuest.actualAttendees },
                        ].map((s, i) => (
                          <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || 'var(--color-text)', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '5px' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </>,
        document.body
      )}
    </div>
  );
}
