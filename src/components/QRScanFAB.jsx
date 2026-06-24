import React, { useState } from 'react';
import { Camera, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function QRScanFAB({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null); // { type, event, rsvp, history, message }

  // Check global permissions
  const isStaffViewer = currentUser?.role === 'staff';
  const hasGlobalCheckin = !isStaffViewer || (
    isStaffViewer && mockStore.getStaffForEmail(currentUser?.email).some(s => {
      const p = mockStore.getPermissionsForEvent(currentUser.email, s.eventId) || {};
      return p.checkin;
    })
  );

  if (!hasGlobalCheckin) return null;

  const calculateHistory = (email) => {
    const allEvents = mockStore.getEvents();
    const history = [];
    let totalRsvps = 0;
    let totalAttended = 0;
    let overRsvpPattern = 0;

    allEvents.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      const guestRsvp = rsvps.find(r => r.email === email);
      if (guestRsvp && (evt.status === 'Completed' || evt.status === 'Ongoing')) {
        const promised = guestRsvp.guestCount || 1;
        const attended = guestRsvp.checkedIn ? (guestRsvp.guestCount || 1) : 0; // simplistic assumption for mockup
        const diff = attended - promised;
        if (diff < 0) overRsvpPattern++;
        
        totalRsvps += promised;
        totalAttended += attended;

        history.push({
          eventName: evt.title,
          date: evt.date,
          rsvpCount: promised,
          attended,
          diff
        });
      }
    });

    const score = totalRsvps > 0 ? Math.round((totalAttended / totalRsvps) * 100) : 100;
    const hasWarning = overRsvpPattern >= 2;

    return { history: history.sort((a,b) => new Date(b.date) - new Date(a.date)), score, hasWarning };
  };

  const handleScan = (overrideId) => {
    const passId = (typeof overrideId === 'string' ? overrideId : scanInput).trim();
    if (!passId) return;

    // Search for RSVP globally across events user has access to
    const allEvents = mockStore.getEvents();
    let foundRsvp = null;
    let foundEvent = null;
    let authorized = false;

    for (const evt of allEvents) {
      const rsvps = mockStore.getRSVPs(evt.id);
      const rsvp = rsvps.find(r => r.id === passId);
      if (rsvp) {
        foundRsvp = rsvp;
        foundEvent = evt;
        const p = mockStore.getPermissionsForEvent(currentUser.email, evt.id) || {};
        if (p.checkin) authorized = true;
        break;
      }
    }

    if (!foundRsvp) {
      setScanResult({ type: 'error', message: `Pass "${passId}" not found in any event.` });
      return;
    }

    if (!authorized) {
      setScanResult({ type: 'error', message: `You do not have check-in permissions for "${foundEvent.title}".` });
      return;
    }

    if (foundRsvp.approvalState === 'REJECTED' || foundRsvp.approvalState === 'UNDER_APPROVAL' || foundRsvp.status === 'waitlist' || foundRsvp.status !== 'going') {
      setScanResult({ type: 'error', event: foundEvent, rsvp: foundRsvp, message: 'Guest is not approved/confirmed for this event.' });
      return;
    }

    const hist = calculateHistory(foundRsvp.email);
    setScanResult({ type: 'preview', event: foundEvent, rsvp: foundRsvp, history: hist });
    setScanInput('');
  };

  const performCheckIn = () => {
    if (!scanResult?.rsvp || !scanResult?.event) return;
    
    if (scanResult.rsvp.checkedIn) {
       alert('Guest is already checked in.');
       return;
    }

    const scanner = currentUser?.role === 'staff' ? `${currentUser.name} (Staff)` : (currentUser?.name || 'Host');
    mockStore.updateRSVP(scanResult.event.id, scanResult.rsvp.id, { checkedIn: true, checkedInAt: new Date().toISOString() }, scanner);
    
    setScanResult({ ...scanResult, type: 'success', message: 'Check-in successful!' });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => { setIsOpen(true); setScanResult(null); setScanInput(''); }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '16px 24px',
          fontSize: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(31,58,99,0.3)',
          cursor: 'pointer',
          zIndex: 999
        }}
        className="hover-lift"
      >
        <Camera size={22} />
        Scan QR Code
      </button>

      {/* Full Modal Overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '700px', background: 'var(--color-surface)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} /> QR Code Scanner
              </h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Scan State */}
              {!scanResult && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '120px', height: '120px', border: '2px dashed var(--color-primary)', borderRadius: '16px', margin: '0 auto 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(31,58,99,0.05)' }}>
                    <Camera size={40} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Ready to Scan</h3>
                  <p className="text-muted" style={{ marginBottom: '24px' }}>Simulate a scan by pasting a guest's RSVP ID below.</p>
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="e.g. r2"
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                      />
                      <Button variant="primary" onClick={handleScan}>Simulate</Button>
                    </div>
                    <Button variant="outline" onClick={() => handleScan('r2')} style={{ marginTop: '8px' }}>
                      ✨ Try Demo (Preview Result UI)
                    </Button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {scanResult?.type === 'error' && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc2626' }}>
                  <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Scan Failed</h3>
                  <p>{scanResult.message}</p>
                  <Button variant="outline" style={{ marginTop: '24px' }} onClick={() => setScanResult(null)}>Scan Another Code</Button>
                </div>
              )}

              {/* Success / Preview State */}
              {(scanResult?.type === 'preview' || scanResult?.type === 'success') && scanResult.rsvp && scanResult.event && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Current Event Info */}
                  <Card style={{ padding: '20px', background: 'linear-gradient(to right, rgba(31,58,99,0.05), rgba(31,58,99,0.02))' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Current Event Information</h4>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{scanResult.event.title}</h3>
                        <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{scanResult.event.date} at {scanResult.event.time}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', padding: '16px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Guest</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{scanResult.rsvp.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{scanResult.rsvp.email}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{scanResult.rsvp.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Ticket Details</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{scanResult.rsvp.ticketType || 'General Admission'}</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>RSVP Count: <strong>{scanResult.rsvp.guestCount || 1}</strong></div>
                        <div style={{ fontSize: '0.9rem' }}>Already Checked In: <strong>{scanResult.rsvp.checkedIn ? (scanResult.rsvp.guestCount || 1) : 0}</strong></div>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span>Attendance Progress</span>
                        <span>{scanResult.rsvp.checkedIn ? '100%' : '0%'}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: scanResult.rsvp.checkedIn ? '#22c55e' : 'var(--color-primary)', width: scanResult.rsvp.checkedIn ? '100%' : '0%', transition: 'width 0.5s' }}></div>
                      </div>
                    </div>
                  </Card>

                  {/* Historical Attendance Summary */}
                  {scanResult.history && (
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} /> Historical Attendance Summary
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        
                        <Card style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>RSVP Trust Score</div>
                          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: scanResult.history.score >= 80 ? '#16a34a' : scanResult.history.score >= 50 ? '#d97706' : '#dc2626' }}>
                            {scanResult.history.score}%
                          </div>
                          {scanResult.history.hasWarning && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>
                              <AlertTriangle size={12} /> Repeated Over-RSVP Pattern
                            </div>
                          )}
                        </Card>

                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                          {scanResult.history.history.length > 0 ? (
                            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead style={{ background: 'var(--color-surface-hover)', position: 'sticky', top: 0 }}>
                                  <tr>
                                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Event</th>
                                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>RSVP</th>
                                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Attended</th>
                                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Diff</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {scanResult.history.history.map((h, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{h.eventName}</td>
                                      <td style={{ padding: '8px 12px' }}>{h.rsvpCount}</td>
                                      <td style={{ padding: '8px 12px' }}>{h.attended}</td>
                                      <td style={{ padding: '8px 12px', color: h.diff < 0 ? '#dc2626' : (h.diff > 0 ? '#16a34a' : 'inherit'), fontWeight: 700 }}>
                                        {h.diff}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                              No past attendance history found.
                            </div>
                          )}
                        </Card>

                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {scanResult.type === 'preview' ? (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button variant="outline" onClick={() => setScanResult(null)}>Cancel</Button>
                      <Button variant="primary" onClick={performCheckIn} style={{ fontSize: '1.05rem', padding: '12px 24px' }}>
                        Confirm Check-In
                      </Button>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(34,197,94,0.1)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#16a34a', fontWeight: 700 }}>
                        <CheckCircle size={24} />
                        {scanResult.message}
                      </div>
                      <Button variant="outline" onClick={() => setScanResult(null)}>Scan Next</Button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
