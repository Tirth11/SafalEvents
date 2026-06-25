import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, AlertTriangle, Calendar } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from './Button';
import Card from './Card';
import { useNavigate } from 'react-router-dom';

export default function EventApprovalQueue() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    // Both 'Under Approval' status and 'UNDER_APPROVAL' approvalState are checked to be safe.
    const all = mockStore.getEvents();
    setPendingEvents(all.filter(e => e.approvalState === 'UNDER_APPROVAL' || e.status === 'Under Approval'));
  };

  const handleApprove = (eventId) => {
    if (window.confirm("Approve and publish this event?")) {
      mockStore.updateEvent(eventId, { status: 'Published', approvalState: 'APPROVED' });
      const evt = mockStore.getEvent(eventId);
      const currentUser = mockStore.getCurrentUser();
      mockStore.addAuditLog({
        id: 'al_' + Date.now(),
        timestamp: new Date().toISOString(),
        eventName: evt?.title || 'Unknown Event',
        userName: currentUser?.name || 'System',
        role: currentUser?.role === 'staff' ? 'Staff' : 'Host Admin',
        action: 'Event Published',
        previousValue: 'Under Approval',
        newValue: 'Published',
        status: 'Success',
        ip: '192.168.1.1'
      });
      loadEvents();
    }
  };

  const handleReject = (eventId) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason !== null) {
      mockStore.updateEvent(eventId, { status: 'Draft', approvalState: 'REJECTED', rejectionReason: reason });
      loadEvents();
    }
  };

  if (pendingEvents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div style={{ textAlign: 'left', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Event Approvals 
          <span style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
            {pendingEvents.length} pending
          </span>
        </h2>
        <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Review events created by staff members before they go live.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {pendingEvents.map(event => (
          <Card key={event.id} style={{ padding: '20px', textAlign: 'left', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: 'var(--color-surface-hover)', overflow: 'hidden', flexShrink: 0 }}>
              {event.cover ? (
                <img src={event.cover} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
                  <Calendar size={32} />
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0' }}>{event.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {event.date} at {event.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} color="#d97706" /> 
                      Created by {event.hostName} ({event.hostEmail})
                      {(() => {
                        const staff = mockStore.getAllStaff().find(s => s.email === event.hostEmail);
                        return staff && staff.phone ? ` • ${staff.phone}` : '';
                      })()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 16px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="outline" onClick={() => navigate(`/e/${event.id}?preview=true`)} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} /> Preview Page
                </Button>
                <div style={{ flex: 1 }}></div>
                <Button variant="outline" onClick={() => handleReject(event.id)} style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={14} /> Reject
                </Button>
                <Button variant="primary" onClick={() => handleApprove(event.id)} style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#16a34a', borderColor: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Approve &amp; Publish
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
