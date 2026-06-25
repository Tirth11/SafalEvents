import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, MessageSquare, Bell } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export default function NotificationLogsTab({ isStaffViewer }) {
  const [logs, setLogs] = useState([
    { id: 'log_1', type: 'Registration Confirmation', channel: 'Email', recipient: 'john@example.com', eventName: 'Design Systems Workshop', date: new Date().toISOString(), status: 'Delivered' },
    { id: 'log_2', type: 'Waitlist Notification', channel: 'SMS', recipient: '+15550001234', eventName: 'Design Systems Workshop', date: new Date(Date.now() - 3600000).toISOString(), status: 'Sent' },
  ]);

  const [filter, setFilter] = useState('');

  const getIconForChannel = (ch) => {
    switch (ch) {
      case 'Email': return <Mail size={14} />;
      case 'SMS': return <MessageSquare size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const filteredLogs = logs.filter(l => 
    l.recipient.toLowerCase().includes(filter.toLowerCase()) || 
    l.eventName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-md animate-fade-in">
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>Notification Logs</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>View the delivery history of all automated communications.</p>
        </div>
        <div className="flex gap-xs">
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search recipient or event..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-xs" style={{ padding: '8px 12px' }}>
            <Filter size={14} /> Filters
          </Button>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px' }}>Date &amp; Time</th>
              <th style={{ padding: '16px' }}>Event Name</th>
              <th style={{ padding: '16px' }}>Notification Type</th>
              <th style={{ padding: '16px' }}>Recipient</th>
              <th style={{ padding: '16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {new Date(log.date).toLocaleString()}
                </td>
                <td style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem' }}>{log.eventName}</td>
                <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getIconForChannel(log.channel)} {log.type}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem' }}>{log.recipient}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge ${log.status === 'Delivered' ? 'badge-primary' : 'badge-ghost'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No logs found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
