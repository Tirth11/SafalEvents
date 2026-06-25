import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, Trash2, Edit2, Shield, Settings, AlertTriangle } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from './Button';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', roleId: '', accessScope: 'ALL', eventIds: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStaff(mockStore.getAllStaff());
    setRoles(mockStore.getRoles());
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.roleId) return alert('Email and Role are required.');
    
    mockStore.addStaff(formData);
    setShowInviteForm(false);
    setFormData({ name: '', email: '', roleId: '', accessScope: 'ALL', eventIds: [] });
    loadData();
  };

  const handleRemove = (staffId) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      mockStore.removeStaff(staffId);
      loadData();
    }
  };

  const getRoleName = (roleId) => {
    if (!roleId) return 'Host Admin'; // fallback if no role ID
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Staff & Team</h2>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Manage your team members and their organization-wide or event-specific access.</p>
        </div>
        {!showInviteForm && (
          <Button variant="primary" onClick={() => setShowInviteForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Invite Team Member
          </Button>
        )}
      </div>

      {showInviteForm && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 700 }}>Invite new staff member</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Name</label>
                <input 
                  required
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Jane Doe" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Email Address</label>
                <input 
                  required
                  type="email"
                  className="input" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="jane@example.com" 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Assign Role</label>
              <select 
                required
                className="input"
                value={formData.roleId}
                onChange={e => setFormData({...formData, roleId: e.target.value})}
              >
                <option value="" disabled>Select a role...</option>
                {roles.filter(r => r.name !== 'Host Admin').map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: '16px', background: 'rgba(31,58,99,0.05)', borderRadius: '8px', border: '1px solid rgba(31,58,99,0.1)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={14} /> Access Scope
              </h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={formData.accessScope === 'ALL'} 
                    onChange={() => setFormData({...formData, accessScope: 'ALL'})} 
                  />
                  All Events (Organization-wide)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={formData.accessScope === 'SPECIFIC'} 
                    onChange={() => setFormData({...formData, accessScope: 'SPECIFIC'})} 
                  />
                  Specific Events Only
                </label>
              </div>
              {formData.accessScope === 'SPECIFIC' && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Select events to assign:</div>
                  {mockStore.getEvents().map(evt => (
                    <label key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={formData.eventIds.includes(evt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, eventIds: [...formData.eventIds, evt.id] });
                          } else {
                            setFormData({ ...formData, eventIds: formData.eventIds.filter(id => id !== evt.id) });
                          }
                        }}
                      />
                      {evt.title}
                    </label>
                  ))}
                  {mockStore.getEvents().length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No events available.</div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} /> Send Invite
              </Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Role</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  No team members added yet. Invite someone to get started!
                </td>
              </tr>
            ) : staff.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(31,58,99,0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Shield size={12} /> {getRoleName(member.roleId)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {member.accessScope === 'ALL' ? 'Organization-wide' : `${member.eventIds?.length || 0} Events`}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
                    background: member.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                    color: member.status === 'ACTIVE' ? '#166534' : '#b45309'
                  }}>
                    {member.status === 'ACTIVE' ? 'Active' : 'Pending Invite'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleRemove(member.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }} title="Remove Staff">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
