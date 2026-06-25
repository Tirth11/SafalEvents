import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit, Trash2, Shield, Settings2, PlayCircle, AlertTriangle } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function AutoRepliesTab({ isStaffViewer }) {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', trigger: 'Guest Registered', actions: 'Send Email: Registration Confirmation' });

  const handleCreate = () => {
    const rule = {
      id: 'rule_' + Date.now(),
      name: newRule.name || 'New Automation Rule',
      description: 'Custom user-defined rule.',
      scope: 'All Events',
      trigger: newRule.trigger,
      conditions: [],
      actions: [newRule.actions],
      status: 'Active'
    };
    mockStore.addAutomationRule(rule);
    setRules(mockStore.getAutomationRules());
    setIsModalOpen(false);
    setNewRule({ name: '', trigger: 'Guest Registered', actions: 'Send Email: Registration Confirmation' });
  };

  useEffect(() => {
    setRules(mockStore.getAutomationRules());
  }, []);

  return (
    <div className="flex flex-col gap-md animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>Automation Rules</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Configure triggers and actions for automated event notifications.</p>
        </div>
        {!isStaffViewer && (
          <Button variant="primary" className="flex items-center gap-xs" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Auto Rule
          </Button>
        )}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px' }}>Rule Name</th>
              <th style={{ padding: '16px' }}>Trigger</th>
              <th style={{ padding: '16px' }}>Scope</th>
              <th style={{ padding: '16px' }}>Status</th>
              {!isStaffViewer && <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{rule.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '2px' }}>{rule.actions.join(', ')}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="badge" style={{ background: 'rgba(31,58,99,0.1)', color: 'var(--color-primary)' }}>
                    <PlayCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {rule.trigger}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem' }}>{rule.scope}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge ${rule.status === 'Active' ? 'badge-primary' : 'badge-ghost'}`}>
                    {rule.status}
                  </span>
                </td>
                {!isStaffViewer && (
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px' }} title="Edit"><Edit size={16} /></button>
                      <button className="btn btn-ghost" style={{ padding: '6px', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={isStaffViewer ? 4 : 5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Settings2 size={32} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
                  <p style={{ margin: 0 }}>No automation rules configured.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={() => setIsModalOpen(false)} />
          <Card style={{ position: 'relative', width: '100%', maxWidth: '500px', zIndex: 101, padding: '24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Create Auto Rule</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={20} color="var(--color-text-muted)" /></button>
            </div>
            
            <div className="flex flex-col gap-md">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Rule Name</label>
                <input 
                  type="text" 
                  value={newRule.name} 
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} 
                  placeholder="e.g. VIP Welcome Email" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>When this happens (Trigger)</label>
                <select 
                  value={newRule.trigger} 
                  onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  <option value="Guest Registered">Guest Registered</option>
                  <option value="RSVP Submitted">RSVP Submitted</option>
                  <option value="Waitlisted">Waitlisted</option>
                  <option value="QR Check-In">QR Check-In</option>
                  <option value="Event Completed">Event Completed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Do this (Action)</label>
                <select 
                  value={newRule.actions} 
                  onChange={(e) => setNewRule({ ...newRule, actions: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  <option value="Send Email: Registration Confirmation">Send Email: Registration Confirmation</option>
                  <option value="Send Email: RSVP Confirmation">Send Email: RSVP Confirmation</option>
                  <option value="Send Email: Feedback Request">Send Email: Feedback Request</option>
                  <option value="Send SMS: Event Reminder">Send SMS: Event Reminder</option>
                  <option value="Notify Assigned Staff">Notify Assigned Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm" style={{ marginTop: '12px' }}>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreate}>Save Rule</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
