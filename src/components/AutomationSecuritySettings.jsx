import React, { useState } from 'react';
import AutoRepliesTab from './AutoRepliesTab';
import MessageTemplatesTab from './MessageTemplatesTab';
import NotificationLogsTab from './NotificationLogsTab';

export default function AutomationSecuritySettings({ isStaffViewer }) {
  const [activeTab, setActiveTab] = useState('auto_replies');

  const tabs = [
    { id: 'auto_replies', label: 'Auto-Replies & Automation' },
    { id: 'message_templates', label: 'Message Templates' },
    { id: 'notification_logs', label: 'Notification Logs' }
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-md">
      {/* Tabs Navigation */}
      <div className="flex" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '16px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'auto_replies' && <AutoRepliesTab isStaffViewer={isStaffViewer} />}
        {activeTab === 'message_templates' && <MessageTemplatesTab isStaffViewer={isStaffViewer} />}
        {activeTab === 'notification_logs' && <NotificationLogsTab isStaffViewer={isStaffViewer} />}
      </div>
    </div>
  );
}
