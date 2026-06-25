import React, { useState } from 'react';
import {
  Camera, X, CheckCircle, AlertTriangle, Clock, Users, Plus, Minus, QrCode,
  History, TrendingUp, Calendar, Mail, Phone, UserCheck, ShieldCheck
} from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

// A self-contained demo scan so "Try Demo" always showcases the full
// partial-check-in workflow + historical intelligence (guest RSVP'd for 5).
const DEMO_SCAN = () => ({
  type: 'checkin',
  demo: true,
  event: { id: 'demo', title: 'Summer Rooftop Mixer', date: '2026-08-15', time: '7:00 PM', approvalRequired: false },
  rsvp: { id: 'demo_r', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 555-0102', guestCount: 5, ticketType: 'Group Pass', status: 'going', approvalState: 'APPROVED' },
  checkedInCount: 0,
  checkInLog: [],
  history: {
    score: 35, totalEventsRsvpd: 12, noShowEvents: 1, partialEvents: 7, hasWarning: true,
    history: [
      { eventName: 'Startup Meetup', date: '2026-05-15', rsvpCount: 8, attended: 3 },
      { eventName: 'Founder Dinner', date: '2026-04-12', rsvpCount: 5, attended: 5 },
      { eventName: 'Tech Mixer',     date: '2026-03-08', rsvpCount: 6, attended: 2 },
    ],
  },
});

export default function QRScanFAB({ currentUser }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [scanInput, setScanInput]   = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [arrivingNow, setArrivingNow] = useState(1);

  // Permission gate — only authorized roles see the button at all
  const isStaffViewer = currentUser?.role === 'staff';
  const hasGlobalCheckin = !isStaffViewer || (
    isStaffViewer && mockStore.getStaffForEmail(currentUser?.email).some(s => {
      const p = mockStore.getPermissionsForEvent(currentUser.email, s.eventId) || {};
      return p.checkin;
    })
  );
  if (!hasGlobalCheckin) return null;

  // ----- Historical attendance intelligence for a guest -----
  const calculateHistory = (email) => {
    const allEvents = mockStore.getEvents();
    const history = [];
    let totalRsvps = 0, totalAttended = 0, overRsvpPattern = 0;
    let noShowEvents = 0, partialEvents = 0, totalEventsRsvpd = 0;

    allEvents.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      const guestRsvp = rsvps.find(r => r.email === email);
      if (!guestRsvp) return;
      totalEventsRsvpd++;
      if (evt.status === 'Completed' || evt.status === 'Ongoing') {
        const promised = guestRsvp.guestCount || 1;
        const attended = guestRsvp.checkedInCount != null
          ? guestRsvp.checkedInCount
          : (guestRsvp.checkedIn ? promised : 0);
        const diff = attended - promised;
        if (diff < 0) overRsvpPattern++;
        if (attended === 0) noShowEvents++;
        else if (attended < promised) partialEvents++;
        totalRsvps += promised;
        totalAttended += attended;
        history.push({ eventName: evt.title, date: evt.date, rsvpCount: promised, attended, diff });
      }
    });

    const score = totalRsvps > 0 ? Math.round((totalAttended / totalRsvps) * 100) : 100;
    return {
      history: history.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      score, hasWarning: overRsvpPattern >= 2,
      totalEventsRsvpd, noShowEvents, partialEvents,
    };
  };

  const handleScan = (overrideId) => {
    const passId = (typeof overrideId === 'string' ? overrideId : scanInput).trim();
    if (!passId) return;

    const allEvents = mockStore.getEvents();
    let foundRsvp = null, foundEvent = null, authorized = false;
    for (const evt of allEvents) {
      const rsvp = mockStore.getRSVPs(evt.id).find(r => r.id === passId);
      if (rsvp) {
        foundRsvp = rsvp; foundEvent = evt;
        const p = mockStore.getPermissionsForEvent(currentUser.email, evt.id) || {};
        if (p.checkin) authorized = true;
        break;
      }
    }

    if (!foundRsvp) { setScanResult({ type: 'error', message: `Pass "${passId}" not found in any event.` }); return; }
    if (!authorized) { setScanResult({ type: 'error', message: `You do not have check-in permissions for "${foundEvent.title}".` }); return; }
    if (foundRsvp.approvalState === 'REJECTED' || foundRsvp.approvalState === 'UNDER_APPROVAL' || foundRsvp.status === 'waitlist' || foundRsvp.status !== 'going') {
      setScanResult({ type: 'error', event: foundEvent, rsvp: foundRsvp, message: 'Guest is not approved/confirmed for this event.' });
      return;
    }

    const total = foundRsvp.guestCount || 1;
    const checkedInCount = foundRsvp.checkedInCount != null ? foundRsvp.checkedInCount : (foundRsvp.checkedIn ? total : 0);
    setScanResult({
      type: 'checkin', event: foundEvent, rsvp: foundRsvp,
      checkedInCount, checkInLog: foundRsvp.checkInLog || [],
      history: calculateHistory(foundRsvp.email),
    });
    setScanInput('');
    setArrivingNow(1);
  };

  // ----- Record a batch of arriving attendees -----
  const recordArrival = (count) => {
    if (!scanResult) return;
    const total = scanResult.rsvp.guestCount || 1;
    const current = scanResult.checkedInCount || 0;
    const next = Math.min(total, current + count);
    if (next === current) return;

    const stamp = new Date();
    const entry = { time: stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), iso: stamp.toISOString(), count: next - current };
    const newLog = [...(scanResult.checkInLog || []), entry];

    setScanResult({ ...scanResult, checkedInCount: next, checkInLog: newLog });
    setArrivingNow(1);

    if (!scanResult.demo) {
      const scanner = currentUser?.role === 'staff' ? `${currentUser.name} (Staff)` : (currentUser?.name || 'Host');
      mockStore.updateRSVP(scanResult.event.id, scanResult.rsvp.id, {
        checkedIn: next > 0,
        checkedInCount: next,
        fullyCheckedIn: next >= total,
        checkedInAt: stamp.toISOString(),
        checkInLog: newLog,
      }, scanner);
    }
  };

  const closeAll = () => { setIsOpen(false); setScanResult(null); setScanInput(''); setArrivingNow(1); };

  // Status helper
  const statusOf = (checked, total) => {
    if (checked >= total) return { label: 'Complete Attendance', color: '#16a34a', bg: '#16a34a15' };
    if (checked > 0)      return { label: 'Partial Check-In',     color: '#d97706', bg: '#d9770615' };
    return                       { label: 'Not Checked In',       color: 'var(--color-text-muted)', bg: 'var(--color-surface-hover)' };
  };

  // Render values for the active check-in
  const r = scanResult?.rsvp;
  const total = r ? (r.guestCount || 1) : 0;
  const checked = scanResult?.checkedInCount || 0;
  const remaining = total - checked;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const st = statusOf(checked, total);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => { setIsOpen(true); setScanResult(null); setScanInput(''); setArrivingNow(1); }}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 18px',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 16px rgba(31,58,99,0.3)',
          cursor: 'pointer',
          zIndex: 999
        }}
        className="hover-lift"
      >
        <QrCode size={18} />
        Scan QR
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '720px', background: 'var(--color-surface)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} /> Smart Check-In Scanner
              </h2>
              <button onClick={closeAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>

              {/* ── SCAN ENTRY ── */}
              {!scanResult && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '120px', height: '120px', border: '2px dashed var(--color-primary)', borderRadius: '16px', margin: '0 auto 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(31,58,99,0.05)' }}>
                    <Camera size={40} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Ready to Scan</h3>
                  <p className="text-muted" style={{ marginBottom: '24px' }}>Point the camera at a guest's QR pass, or paste their RSVP ID to simulate.</p>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text" value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        placeholder="e.g. r2"
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        onKeyDown={e => e.key === 'Enter' && handleScan()}
                      />
                      <Button variant="primary" onClick={handleScan}>Scan</Button>
                    </div>
                    <Button variant="outline" onClick={() => setScanResult(DEMO_SCAN())} style={{ marginTop: '8px' }}>
                      ✨ Try Demo — Partial Check-In Walkthrough
                    </Button>
                  </div>
                </div>
              )}

              {/* ── ERROR ── */}
              {scanResult?.type === 'error' && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc2626' }}>
                  <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Scan Failed</h3>
                  <p>{scanResult.message}</p>
                  <Button variant="outline" style={{ marginTop: '24px' }} onClick={() => setScanResult(null)}>Scan Another Code</Button>
                </div>
              )}

              {/* ── CHECK-IN WORKFLOW ── */}
              {scanResult?.type === 'checkin' && r && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Guest + Event details */}
                  <Card style={{ padding: '20px', background: 'linear-gradient(to right, rgba(31,58,99,0.06), rgba(31,58,99,0.02))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 800,  letterSpacing: '0.5px' }}>Guest</h4>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{r.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {r.email}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {r.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h4 style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 800,  letterSpacing: '0.5px' }}>Event</h4>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{scanResult.event.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <Calendar size={12} /> {scanResult.event.date} · {scanResult.event.time}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {scanResult.event.approvalRequired ? 'Approval-based' : 'Open RSVP'} · {r.ticketType || 'General Admission'}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Current attendance status */}
                  <Card style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={18} /> Current Attendance</h4>
                      <span style={{ background: st.bg, color: st.color, padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>{st.label}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                      {[
                        { label: 'RSVP Total',        value: total,     color: 'var(--color-text)' },
                        { label: 'Checked-In So Far', value: checked,   color: '#16a34a' },
                        { label: 'Remaining',         value: remaining, color: remaining > 0 ? '#d97706' : 'var(--color-text-muted)' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '6px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: remaining > 0 ? '18px' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                        <span>Attendance Progress</span><span>{pct}%</span>
                      </div>
                      <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: checked >= total ? '#16a34a' : 'var(--color-primary)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>

                    {/* Arrival stepper */}
                    {remaining > 0 ? (
                      <div style={{ background: 'var(--color-surface-hover)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>Additional attendees arriving now</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', background: 'var(--color-surface)' }}>
                            <button onClick={() => setArrivingNow(Math.max(1, arrivingNow - 1))} style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', color: 'var(--color-text)' }}><Minus size={16} /></button>
                            <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}>{Math.min(arrivingNow, remaining)}</span>
                            <button onClick={() => setArrivingNow(Math.min(remaining, arrivingNow + 1))} style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', color: 'var(--color-text)' }}><Plus size={16} /></button>
                          </div>
                          <Button variant="primary" onClick={() => recordArrival(Math.min(arrivingNow, remaining))} style={{ flex: 1, minWidth: '140px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle size={16} /> Check In {Math.min(arrivingNow, remaining)}
                          </Button>
                          {remaining > 1 && (
                            <Button variant="outline" onClick={() => recordArrival(remaining)} style={{ whiteSpace: 'nowrap' }}>
                              Check in all {remaining}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#16a34a12', border: '1px solid #16a34a30', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', fontWeight: 700 }}>
                        <CheckCircle size={20} /> All {total} attendees checked in — Complete Attendance recorded.
                      </div>
                    )}
                  </Card>

                  {/* Current event check-in timeline */}
                  {scanResult.checkInLog && scanResult.checkInLog.length > 0 && (
                    <Card style={{ padding: '20px' }}>
                      <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> This Event — Check-In Timeline</h4>
                      <div style={{ position: 'relative', paddingLeft: '20px' }}>
                        <div style={{ position: 'absolute', left: '5px', top: '6px', bottom: '6px', width: '2px', background: 'var(--color-border)' }} />
                        {scanResult.checkInLog.map((l, i) => (
                          <div key={i} style={{ position: 'relative', paddingBottom: i < scanResult.checkInLog.length - 1 ? '14px' : 0 }}>
                            <div style={{ position: 'absolute', left: '-19px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', border: '2px solid var(--color-surface)' }} />
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{l.time}</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Checked in {l.count} attendee{l.count > 1 ? 's' : ''}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--color-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Total Attendance: <span style={{ color: 'var(--color-text)' }}>{checked} of {total}</span>
                      </div>
                    </Card>
                  )}

                  {/* Historical guest intelligence */}
                  {scanResult.history && (
                    <Card style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} /> Guest Attendance History</h4>
                        {scanResult.history.hasWarning && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                            <AlertTriangle size={12} /> Repeated Over-RSVP
                          </span>
                        )}
                      </div>

                      {/* Summary cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {[
                          { label: "Events RSVP'd",   value: scanResult.history.totalEventsRsvpd, color: 'var(--color-text)', icon: <Calendar size={14} /> },
                          { label: 'Accuracy',         value: `${scanResult.history.score}%`, color: scanResult.history.score >= 80 ? '#16a34a' : scanResult.history.score >= 50 ? '#d97706' : '#dc2626', icon: <TrendingUp size={14} /> },
                          { label: 'No-Shows',         value: scanResult.history.noShowEvents, color: scanResult.history.noShowEvents > 0 ? '#dc2626' : 'var(--color-text)', icon: <X size={14} /> },
                          { label: 'Partial Events',   value: scanResult.history.partialEvents, color: scanResult.history.partialEvents > 0 ? '#d97706' : 'var(--color-text)', icon: <AlertTriangle size={14} /> },
                        ].map((s, i) => (
                          <div key={i} style={{ background: 'var(--color-surface-hover)', borderRadius: '10px', padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ color: s.color, opacity: 0.85, display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '4px',  letterSpacing: '0.3px' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent attendance table */}
                      {scanResult.history.history.length > 0 ? (
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                            <thead style={{ background: 'var(--color-surface-hover)' }}>
                              <tr>
                                <th style={{ padding: '9px 12px', fontWeight: 700, fontSize: '0.7rem',  color: 'var(--color-text-muted)' }}>Event</th>
                                <th style={{ padding: '9px 12px', fontWeight: 700, fontSize: '0.7rem',  color: 'var(--color-text-muted)', textAlign: 'center' }}>RSVP</th>
                                <th style={{ padding: '9px 12px', fontWeight: 700, fontSize: '0.7rem',  color: 'var(--color-text-muted)', textAlign: 'center' }}>Actual</th>
                                <th style={{ padding: '9px 12px', fontWeight: 700, fontSize: '0.7rem',  color: 'var(--color-text-muted)', textAlign: 'center' }}>Δ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scanResult.history.history.map((h, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                                  <td style={{ padding: '9px 12px', fontWeight: 600 }}>{h.eventName}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>{h.rsvpCount}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700 }}>{h.attended}</td>
                                  <td style={{ padding: '9px 12px', textAlign: 'center', color: h.diff < 0 ? '#dc2626' : h.diff > 0 ? '#16a34a' : 'var(--color-text-muted)', fontWeight: 700 }}>{h.diff === 0 ? '—' : h.diff}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--color-surface-hover)', borderRadius: '10px' }}>
                          <ShieldCheck size={28} style={{ opacity: 0.4 }} />
                          First-time attendee — no past attendance history yet.
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Footer actions */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="outline" onClick={() => { setScanResult(null); setArrivingNow(1); }}>Scan Next Guest</Button>
                    <Button variant="primary" onClick={closeAll}>Done</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
