import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, CheckCircle, Save, X } from 'lucide-react';
import { mockStore, PERMISSION_KEYS } from '../utils/mockStore';
import Button from './Button';

// Group permissions for better UI
const PERMISSION_GROUPS = [
  { label: 'Events', prefix: 'event_' },
  { label: 'Guests & Check-In', prefix: ['guests_', 'checkin_'] },
  { label: 'Communication', prefix: 'comm_' },
  { label: 'Analytics', prefix: 'analytics_' },
  { label: 'Staff & Roles', prefix: ['staff_', 'roles_'] },
  { label: 'Organization', prefix: 'org_' }
];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: {} });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    setRoles(mockStore.getRoles());
  };

  const handleEdit = (role) => {
    setEditingRole(role.id);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: { ...role.permissions }
    });
  };

  const handleCreate = () => {
    setEditingRole('new');
    const emptyPerms = PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {});
    setFormData({ name: '', description: '', permissions: emptyPerms });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert("Role name is required");
    
    if (editingRole === 'new') {
      mockStore.addRole(formData);
    } else {
      mockStore.updateRole(editingRole, formData);
    }
    setEditingRole(null);
    loadRoles();
  };

  const handleDelete = (role) => {
    if (role.name === 'Host Admin' || role.name === 'Event Manager') {
      return alert("Default roles cannot be deleted");
    }
    if (window.confirm(`Are you sure you want to delete the ${role.name} role?`)) {
      mockStore.removeRole(role.id);
      loadRoles();
    }
  };

  const togglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const toggleGroup = (group) => {
    const groupKeys = PERMISSION_KEYS.filter(k => 
      Array.isArray(group.prefix) ? group.prefix.some(p => k.startsWith(p)) : k.startsWith(group.prefix)
    );
    const allChecked = groupKeys.every(k => formData.permissions[k]);
    
    const updated = { ...formData.permissions };
    groupKeys.forEach(k => { updated[k] = !allChecked; });
    
    setFormData(prev => ({ ...prev, permissions: updated }));
  };

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Role Management</h2>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Create custom roles and define granular permissions for your team.</p>
        </div>
        {!editingRole && (
          <Button variant="primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Create Role
          </Button>
        )}
      </div>

      {editingRole ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {editingRole === 'new' ? 'Create New Role' : 'Edit Role'}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={15} /> Save Role
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', maxWidth: '500px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Role Name</label>
              <input
                className="input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Door Staff, Marketing Manager"
                disabled={['Host Admin', 'Event Manager', 'Check-in Staff'].includes(formData.name)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Description</label>
              <input
                className="input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of responsibilities"
              />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              Permissions Configuration
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {PERMISSION_GROUPS.map(group => {
                const keys = PERMISSION_KEYS.filter(k => Array.isArray(group.prefix) ? group.prefix.some(p => k.startsWith(p)) : k.startsWith(group.prefix));
                const allChecked = keys.every(k => formData.permissions[k]);
                const someChecked = keys.some(k => formData.permissions[k]);
                
                return (
                  <div key={group.label} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <div 
                      onClick={() => toggleGroup(group)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <input 
                        type="checkbox" 
                        checked={allChecked} 
                        ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                        onChange={() => {}} // handled by parent div
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>{group.label}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '24px' }}>
                      {keys.map(key => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={!!formData.permissions[key]}
                            onChange={() => togglePermission(key)}
                          />
                          {key.replace(/^[^_]+_/, '').replace(/_/g, ' ')}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {roles.map(role => {
            const isSystem = role.name === 'Host Admin';
            return (
              <div key={role.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(31,58,99,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{role.name}</h3>
                      {isSystem && <span style={{ fontSize: '0.65rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>System Role</span>}
                    </div>
                  </div>
                  {!isSystem && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(role)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit Role">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(role)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Role">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                  {role.description || 'No description provided.'}
                </p>
                
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {Object.values(role.permissions || {}).filter(Boolean).length} / {PERMISSION_KEYS.length} Permissions
                  </span>
                  <button onClick={() => handleEdit(role)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    View details &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
