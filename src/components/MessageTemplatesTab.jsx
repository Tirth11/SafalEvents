import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, MessageSquare, Bell } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function MessageTemplatesTab({ isStaffViewer }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates(mockStore.getMessageTemplates());
  }, []);

  const getIconForCategory = (cat) => {
    switch (cat) {
      case 'Email': return <Mail size={16} />;
      case 'SMS': return <MessageSquare size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-md animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>Message Templates</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Manage reusable email, SMS, and push notification templates.</p>
        </div>
        {!isStaffViewer && (
          <Button variant="primary" className="flex items-center gap-xs">
            <Plus size={16} /> Create Template
          </Button>
        )}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px' }}>Template Name</th>
              <th style={{ padding: '16px' }}>Category</th>
              <th style={{ padding: '16px' }}>Default Trigger</th>
              <th style={{ padding: '16px' }}>Status</th>
              {!isStaffViewer && <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {templates.map(tpl => (
              <tr key={tpl.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>
                  {tpl.name}
                  {tpl.isSystem && <span className="badge" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>SYSTEM</span>}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getIconForCategory(tpl.category)} {tpl.category}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{tpl.trigger}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge ${tpl.status === 'Active' ? 'badge-primary' : 'badge-ghost'}`}>
                    {tpl.status}
                  </span>
                </td>
                {!isStaffViewer && (
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px' }} title="Edit"><Edit size={16} /></button>
                      {!tpl.isSystem && (
                        <button className="btn btn-ghost" style={{ padding: '6px', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
