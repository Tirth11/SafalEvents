import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { getAvatar } from '../utils/images';

// Shared dashboard top bar shown for every role (host / guest / staff / admin).
// Right-aligned cluster: [subscription / role badge] [notifications] [profile] [logout].
// Pass planLabel=null to hide the subscription chip (e.g. guests have no plan).
export default function DashboardTopBar({
  userName,
  roleLabel,
  planLabel,
  planTone = 'primary', // 'primary' | 'free' | 'admin'
  notifCount = 0,
  onBell,
  onProfile,
  onLogout,
}) {
  const tones = {
    primary: { bg: 'rgba(255,107,53,0.12)', fg: 'var(--color-primary)' },
    free: { bg: 'var(--color-surface-hover)', fg: 'var(--color-text-muted)' },
    admin: { bg: 'rgba(124,58,237,0.12)', fg: '#7c3aed' },
  };
  const t = tones[planTone] || tones.primary;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {planLabel && (
        <button
          onClick={onProfile}
          title={roleLabel ? `${roleLabel} · current plan` : 'Current plan'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: t.bg, color: t.fg, border: 'none', borderRadius: '999px', padding: '8px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {planLabel}
        </button>
      )}

      <button
        onClick={onBell}
        aria-label="Notifications"
        style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
      >
        <Bell size={18} />
        {notifCount > 0 && (
          <span style={{ position: 'absolute', top: '-3px', right: '-3px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, minWidth: '17px', height: '17px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
            {notifCount > 9 ? '9+' : notifCount}
          </span>
        )}
      </button>

      <button
        onClick={onProfile}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}
      >
        <img src={getAvatar(userName || 'User')} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)' }}>{(userName || 'Account').split(' ')[0]}</span>
          {roleLabel && <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{roleLabel}</span>}
        </span>
      </button>

      <button
        onClick={onLogout}
        aria-label="Log out"
        title="Log out"
        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
