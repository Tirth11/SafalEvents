import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { Search, Filter, X, Mail, MessageSquare, Clock, AlertTriangle, Eye, Shield, Users, Bell, FileText, ChevronRight } from 'lucide-react';
import { getAvatar } from '../utils/images';

// ----------------------------------------------------------------------------
// Dummy Data
// ----------------------------------------------------------------------------
const MOCK_GUESTS = [
  {
    id: 1,
    name: 'Alice Vance',
    email: 'alice@example.com',
    phone: '+1 555-0101',
    eventsRsvpd: 8,
    totalAttendees: 10,
    actualAttendees: 10,
    trustScore: 92,
    pattern: 'Consistent Attendee',
    remindersSent: 0,
    history: [
      { event: 'Summer Mixer', rsvpCount: 2, actual: 2, diff: 0 },
      { event: 'Startup Meetup', rsvpCount: 1, actual: 1, diff: 0 },
      { event: 'Founder Dinner', rsvpCount: 2, actual: 2, diff: 0 }
    ]
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 555-0102',
    eventsRsvpd: 12,
    totalAttendees: 68,
    actualAttendees: 24,
    trustScore: 35,
    pattern: 'Over-RSVP Pattern',
    remindersSent: 2,
    history: [
      { event: 'Summer Mixer', rsvpCount: 10, actual: 2, diff: -8 },
      { event: 'Startup Meetup', rsvpCount: 8, actual: 1, diff: -7 },
      { event: 'Product Launch', rsvpCount: 12, actual: 3, diff: -9 },
      { event: 'Founder Dinner', rsvpCount: 6, actual: 2, diff: -4 }
    ]
  },
  {
    id: 3,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '+1 555-0103',
    eventsRsvpd: 6,
    totalAttendees: 12,
    actualAttendees: 8,
    trustScore: 65,
    pattern: 'Partial Attendance',
    remindersSent: 1,
    history: [
      { event: 'Summer Mixer', rsvpCount: 4, actual: 2, diff: -2 },
      { event: 'Startup Meetup', rsvpCount: 2, actual: 1, diff: -1 }
    ]
  },
  {
    id: 4,
    name: 'Diana Prince',
    email: 'diana@example.com',
    phone: '+1 555-0104',
    eventsRsvpd: 3,
    totalAttendees: 3,
    actualAttendees: 0,
    trustScore: 10,
    pattern: 'Frequent No-Show',
    remindersSent: 3,
    history: [
      { event: 'Summer Mixer', rsvpCount: 1, actual: 0, diff: -1 },
      { event: 'Startup Meetup', rsvpCount: 1, actual: 0, diff: -1 },
      { event: 'Product Launch', rsvpCount: 1, actual: 0, diff: -1 }
    ]
  }
];

// Helpers for badges
const getTrustBadge = (score) => {
  if (score >= 95) return { color: '#22c55e', bg: '#22c55e15', text: 'Excellent' };
  if (score >= 80) return { color: '#22c55e', bg: '#22c55e15', text: 'Good' };
  if (score >= 60) return { color: '#eab308', bg: '#eab30815', text: 'Moderate' };
  return { color: '#ef4444', bg: '#ef444415', text: 'High Risk' };
};

const getPatternBadge = (pattern) => {
  switch (pattern) {
    case 'Consistent Attendee': return { color: '#22c55e', bg: '#22c55e15' };
    case 'Frequent Partial Attendance':
    case 'Partial Attendance': return { color: '#eab308', bg: '#eab30815' };
    case 'Frequent No-Show': return { color: '#f97316', bg: '#f9731615' }; // Orange
    case 'Over-RSVP Pattern': return { color: '#ef4444', bg: '#ef444415' }; // Red
    default: return { color: '#94a3b8', bg: '#94a3b815' };
  }
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export default function GuestsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);

  // Filters state (mock)
  const [filterEvent, setFilterEvent] = useState('All');
  const [filterReliability, setFilterReliability] = useState('All');
  const [filterPattern, setFilterPattern] = useState('All');
  
  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      <div style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Guests Directory & Intelligence</h1>
        <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Deeply understand your audience's attendance habits and RSVP reliability.</p>
      </div>

      <Card className="glass-surface text-left" style={{ padding: '24px' }}>
        {/* FILTERS SECTION */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Name, Email, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Event</label>
              <select className="premium-select" value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <option value="All">All Events</option>
                <option value="Summer Mixer">Summer Mixer</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Attendance Reliability</label>
              <select className="premium-select" value={filterReliability} onChange={(e) => setFilterReliability(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <option value="All">All</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Attendance Pattern</label>
              <select className="premium-select" value={filterPattern} onChange={(e) => setFilterPattern(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <option value="All">All</option>
                <option value="Consistent">Consistent Attendee</option>
                <option value="Partial">Frequent Partial Attendance</option>
                <option value="NoShow">Frequent No-Show</option>
                <option value="OverRsvp">Over-RSVP Pattern</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Events RSVP'd</label>
              <select className="premium-select" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <option value="All">All</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-25">11-25</option>
                <option value="25+">25+</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Comm Status</label>
              <select className="premium-select" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <option value="All">All</option>
                <option value="Reminded">Reminder Sent</option>
                <option value="NoReminder">No Reminder Sent</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button variant="ghost" style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}>
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* DATA GRID */}
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Guest Name</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Events RSVP'd</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>RSVP Trust Score</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pattern</th>
                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GUESTS.map(guest => {
                const trustBadge = getTrustBadge(guest.trustScore);
                const patternBadge = getPatternBadge(guest.pattern);
                
                return (
                  <tr key={guest.id} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      <div className="flex items-center gap-sm">
                        <img src={getAvatar(guest.name)} alt={guest.name} className="avatar-img avatar-sm" />
                        {guest.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.85rem' }}><a href={`mailto:${guest.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{guest.email}</a></td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{guest.phone}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{guest.eventsRsvpd}</td>
                    
                    {/* Trust Score Badge */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{guest.trustScore}%</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trustBadge.bg, color: trustBadge.color, padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: trustBadge.color }} />
                          {trustBadge.text}
                        </div>
                      </div>
                    </td>

                    {/* Pattern Badge */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: patternBadge.bg, color: patternBadge.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: patternBadge.color }} />
                        {guest.pattern}
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <Button variant="ghost" onClick={() => setSelectedGuest(guest)} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* GUEST DETAILS DRAWER (OVERLAY) */}
      {/* --------------------------------------------------------------------- */}
      {selectedGuest && (
        <>
          <div onClick={() => setSelectedGuest(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', maxWidth: '100%', background: 'var(--color-surface)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 101, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out' }}>
            
            {/* Drawer Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={getAvatar(selectedGuest.name)} alt={selectedGuest.name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{selectedGuest.name}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedGuest.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedGuest(null)} style={{ background: 'var(--color-surface-hover)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Pattern Warning Banner */}
              {selectedGuest.pattern === 'Over-RSVP Pattern' && (
                <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, marginBottom: '8px' }}>
                    <AlertTriangle size={18} />
                    Repeated Attendance Variance Detected
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-text)' }}>
                    Guest has attended with significantly fewer people than RSVP'd in multiple recent events.
                    <br/><br/>
                    <span style={{ color: 'var(--color-text-muted)' }}>This may impact venue capacity planning, food preparation, seating allocation, and event material distribution.</span>
                  </p>
                </div>
              )}

              {/* Summary Stats */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Guest Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Events RSVP'd</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedGuest.eventsRsvpd}</div>
                  </div>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>RSVP Trust Score</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getTrustBadge(selectedGuest.trustScore).color }}>{selectedGuest.trustScore}%</div>
                  </div>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Attendees RSVP'd</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedGuest.totalAttendees}</div>
                  </div>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Actual Check-ins</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedGuest.actualAttendees}</div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Automatic Reminders Sent</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>Yes ({selectedGuest.remindersSent} Times)</div>
                  </div>
                  <Bell size={20} color="var(--color-text-muted)" />
                </div>
              </div>

              {/* Attendance History */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Attendance History</h3>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '10px 4px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Event</th>
                      <th style={{ padding: '10px 4px', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>RSVP Count</th>
                      <th style={{ padding: '10px 4px', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>Actual</th>
                      <th style={{ padding: '10px 4px', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGuest.history.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                        <td style={{ padding: '12px 4px', fontWeight: 600 }}>{h.event}</td>
                        <td style={{ padding: '12px 4px', textAlign: 'center' }}>{h.rsvpCount}</td>
                        <td style={{ padding: '12px 4px', textAlign: 'center' }}>{h.actual}</td>
                        <td style={{ padding: '12px 4px', textAlign: 'center', fontWeight: 700, color: h.diff < 0 ? '#ef4444' : 'inherit' }}>
                          {h.diff < 0 ? h.diff : (h.diff > 0 ? `+${h.diff}` : '0')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Button variant="outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', gap: '12px' }}>
                    <Bell size={16} /> Send Reminder
                  </Button>
                  <Button variant="outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', gap: '12px' }}>
                    <MessageSquare size={16} /> Send Message
                  </Button>
                  <Button variant="outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', gap: '12px' }}>
                    <FileText size={16} /> View Full RSVP History
                  </Button>
                  <Button variant="outline" style={{ display: 'flex', justifyContent: 'flex-start', padding: '12px 16px', gap: '12px' }}>
                    <Users size={16} /> View Check-In History
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
