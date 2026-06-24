import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, UserPlus, CreditCard, CheckCircle, Inbox } from 'lucide-react';
import { getAvatar } from '../utils/images';

// Shared dashboard top bar shown for every role (host / guest / staff / admin).
// Right-aligned cluster: [subscription / role badge] [notifications] [profile] [logout].
// Pass planLabel=null to hide the subscription chip (e.g. guests have no plan).
export default function DashboardTopBar({
  userName,
  orgName,
  roleLabel,
  planLabel,
  planTone = 'primary', // 'primary' | 'free' | 'admin'
  notifCount = 0,
  notifications = null, // array → renders an in-bar dropdown; null → falls back to onBell
  onMarkAllRead,
  avatarUrl = null, // explicit uploaded image; if null + initials set, shows initials placeholder
  initials = null,
  onBell,
  onProfile,
  onPlan,
  onLogout,
  embedded = false, // true when rendered inside the global header bar
}) {
  const tones = {
    primary: { bg: 'rgba(31,58,99,0.12)', fg: 'var(--color-primary)' },
    free: { bg: 'var(--color-surface-hover)', fg: 'var(--color-text-muted)' },
    admin: { bg: 'rgba(124,58,237,0.12)', fg: '#7c3aed' },
  };
  const t = tones[planTone] || tones.primary;

  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const hasDropdown = Array.isArray(notifications);

  // Close the dropdown on any outside click
  useEffect(() => {
    if (!showNotifs) return;
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotifs]);

  const handleBell = () => {
    if (hasDropdown) setShowNotifs(v => !v);
    else if (onBell) onBell();
  };

  const typeIcon = (type) =>
    type === 'rsvp' ? <UserPlus size={14} /> : type === 'payment' ? <CreditCard size={14} /> : <CheckCircle size={14} />;
  const typeTint = (type) =>
    type === 'rsvp'
      ? { bg: 'rgba(31,58,99,0.1)', fg: 'var(--color-primary)' }
      : type === 'payment'
      ? { bg: 'rgba(0,200,83,0.12)', fg: '#16a34a' }
      : { bg: 'rgba(194,140,50,0.16)', fg: '#936a1d' };

  const fmtTime = (ts) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: embedded ? 0 : '16px', flexWrap: 'wrap' }}>
      {planLabel && (
        <button
          onClick={onPlan || onProfile}
          title="View billing & plan"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: t.bg, color: t.fg, border: 'none', borderRadius: '999px', padding: '8px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {planLabel}
        </button>
      )}

      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={handleBell}
          aria-label="Notifications"
          style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--color-border)', background: showNotifs ? 'var(--color-surface-hover)' : 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span style={{ position: 'absolute', top: '-3px', right: '-3px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, minWidth: '17px', height: '17px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {hasDropdown && showNotifs && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '340px', maxWidth: 'calc(100vw - 32px)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px',
              boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>Notifications</span>
              {notifCount > 0 && onMarkAllRead && (
                <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const tint = typeTint(n.type);
                  return (
                    <div key={n.id} style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--color-border)', background: n.read ? 'transparent' : 'rgba(31,58,99,0.04)', alignItems: 'flex-start' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: tint.bg, color: tint.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        {typeIcon(n.type)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>{n.title}</div>
                        {n.message && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.35 }}>{n.message}</div>}
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{fmtTime(n.timestamp)}</div>
                      </div>
                      {!n.read && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: '6px' }} />}
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                  <Inbox size={28} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>You're all caught up</span>
                  <span style={{ fontSize: '0.75rem' }}>New RSVPs, payments and alerts show up here.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onProfile}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: '999px', padding: '4px 12px 4px 4px', cursor: 'pointer' }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : initials ? (
          <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(31,58,99,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{initials}</span>
        ) : (
          <img src={getAvatar(userName || 'User')} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
        )}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)' }}>{(userName || 'Account').split(' ')[0]}</span>
          {(orgName || roleLabel) && <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{orgName || roleLabel}</span>}
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
