import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, AlertTriangle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { mockStore } from '../utils/mockStore';

export default function SecurityAuditLogsTab({ isStaffViewer }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLogs(mockStore.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(filter.toLowerCase()) || 
    l.action.toLowerCase().includes(filter.toLowerCase()) ||
    l.eventName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-md animate-fade-in">
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>Security Audit Logs</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Monitor all critical system actions, role changes, and event updates.</p>
        </div>
        <div className="flex gap-xs">
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search user, action, or event..." 
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
              <th style={{ padding: '16px' }}>Timestamp</th>
              <th style={{ padding: '16px' }}>User</th>
              <th style={{ padding: '16px' }}>Action</th>
              <th style={{ padding: '16px' }}>Event Context</th>
              <th style={{ padding: '16px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.userName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.role}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{log.action}</div>
                  {log.previousValue !== log.newValue && log.previousValue !== 'None' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      <span style={{ textDecoration: 'line-through' }}>{log.previousValue}</span> &rarr; {log.newValue}
                    </div>
                  )}
                  {log.previousValue === 'None' && log.newValue && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {log.newValue}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem' }}>{log.eventName}</td>
                <td style={{ padding: '16px', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  <span className="badge badge-ghost" style={{ fontSize: '0.7rem' }}>{log.ip || '192.168.1.1'}</span>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No audit logs found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
