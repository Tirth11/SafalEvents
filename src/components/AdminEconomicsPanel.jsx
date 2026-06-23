import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Zap, Crown, Edit2, Check, X, Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function AdminEconomicsPanel() {
  const [economicsTab, setEconomicsTab] = useState('revenue'); // revenue, plans, topups, subscriptions
  const [plans, setPlans] = useState([]);
  const [topUps, setTopUps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingTopUp, setEditingTopUp] = useState(null);
  const [subSearch, setSubSearch] = useState('');
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overridePlanId, setOverridePlanId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [hostTypeFilter, setHostTypeFilter] = useState('individual');

  const loadData = () => {
    const allPlans = [...(mockStore.getPlans('individual') || []), ...(mockStore.getPlans('organization') || [])];
    setPlans(allPlans);
    const allTopUps = [...(mockStore.getTopUps('individual') || []), ...(mockStore.getTopUps('organization') || [])];
    setTopUps(allTopUps);
    setSubs(mockStore.getAllSubscriptions ? mockStore.getAllSubscriptions() : []);
    setMetrics(mockStore.getRevenueMetrics ? mockStore.getRevenueMetrics() : null);
  };

  useEffect(() => { loadData(); }, []);

  const filteredPlans = plans.filter(p => p.hostType === hostTypeFilter);
  const filteredTopUps = topUps.filter(t => t.hostType === hostTypeFilter || t.hostType === 'both');
  const filteredSubs = subs.filter(s => 
    !subSearch || (s.hostEmail || '').toLowerCase().includes(subSearch.toLowerCase()) || (s.hostName || '').toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleSavePlan = () => {
    if (!editingPlan) return;
    mockStore.updatePlan(editingPlan.id, editingPlan);
    setEditingPlan(null);
    loadData();
  };

  const handleSaveTopUp = () => {
    if (!editingTopUp) return;
    mockStore.updateTopUp(editingTopUp.id, editingTopUp);
    setEditingTopUp(null);
    loadData();
  };

  const handleOverride = () => {
    if (!overrideTarget || !overridePlanId || !overrideReason) return;
    mockStore.overrideSubscription(overrideTarget.hostEmail, overridePlanId, overrideReason, 'Super Admin');
    setOverrideTarget(null);
    setOverridePlanId('');
    setOverrideReason('');
    loadData();
  };

  const tabs = [
    { key: 'revenue', label: 'Revenue Dashboard' },
    { key: 'plans', label: 'Pricing Catalog' },
    { key: 'topups', label: 'Top-Up Catalog' },
    { key: 'subscriptions', label: 'Host Subscriptions' }
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Economics & Plans</h1>
        <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage pricing catalog, subscriptions, and view platform revenue.</p>
      </div>

      {/* Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setEconomicsTab(t.key)}
            style={{
              background: 'none', border: 'none', padding: '0 0 12px 0', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap',
              color: economicsTab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: economicsTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* REVENUE DASHBOARD */}
      {economicsTab === 'revenue' && metrics && (
        <div className="flex flex-col gap-lg animate-fade-in">
          <div className="grid-3" style={{ gap: '16px' }}>
            <Card className="glass-surface card-hover-lift" style={{ padding: '20px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-green" style={{ marginBottom: '12px' }}><DollarSign size={20} /></div>
              <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Monthly Recurring Revenue</h4>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>${metrics.mrr.toLocaleString()}</p>
            </Card>
            <Card className="glass-surface card-hover-lift" style={{ padding: '20px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-blue" style={{ marginBottom: '12px' }}><TrendingUp size={20} /></div>
              <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Annual Recurring Revenue</h4>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#3b82f6' }}>${metrics.arr.toLocaleString()}</p>
            </Card>
            <Card className="glass-surface card-hover-lift" style={{ padding: '20px', textAlign: 'left' }}>
              <div className="stat-icon-tile stat-icon-orange" style={{ marginBottom: '12px' }}><Zap size={20} /></div>
              <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Top-Up Revenue</h4>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>${metrics.topUpRevenue.toLocaleString()}</p>
            </Card>
          </div>

          {/* Plan Distribution */}
          <Card className="glass-surface" style={{ padding: '24px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Plan Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {Object.entries(metrics.planDistribution).map(([planName, count]) => (
                <div key={planName} style={{
                  padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border)',
                  textAlign: 'center', background: 'var(--color-surface)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>{count}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '2px' }}>{planName}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Conversion */}
          <div className="grid-2" style={{ gap: '16px' }}>
            <Card className="glass-surface" style={{ padding: '24px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Free → Paid Conversion</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                {metrics.conversionRate}%
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {metrics.paidHosts} of {metrics.totalHosts} hosts on paid plans
              </p>
            </Card>
            <Card className="glass-surface" style={{ padding: '24px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Revenue Split</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Individual</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6' }}>${metrics.individualRevenue?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Organization</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#8b5cf6' }}>${metrics.orgRevenue?.toLocaleString() || 0}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PRICING CATALOG */}
      {economicsTab === 'plans' && (
        <div className="flex flex-col gap-lg animate-fade-in">
          {/* Host type toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '3px', gap: '4px', alignSelf: 'flex-start' }}>
            <button onClick={() => setHostTypeFilter('individual')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', background: hostTypeFilter === 'individual' ? 'var(--color-primary)' : 'transparent', color: hostTypeFilter === 'individual' ? 'white' : 'var(--color-text-muted)' }}>
              Individual
            </button>
            <button onClick={() => setHostTypeFilter('organization')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', background: hostTypeFilter === 'organization' ? 'var(--color-primary)' : 'transparent', color: hostTypeFilter === 'organization' ? 'white' : 'var(--color-text-muted)' }}>
              Organization
            </button>
          </div>

          <Card className="glass-surface" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Plan</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Monthly</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Annual</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Commission</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Events</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Attendees</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Staff</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Photos</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{p.emoji} {p.name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.monthlyPrice === null ? 'Custom' : `$${p.monthlyPrice}`}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.annualPrice === null ? 'Custom' : `$${p.annualPrice}`}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.commission}%</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.limits.activeEvents === -1 ? '∞' : p.limits.activeEvents}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.limits.attendeesPerEvent === -1 ? '∞' : p.limits.attendeesPerEvent}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.limits.staffMembers === -1 ? '∞' : p.limits.staffMembers}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{p.limits.photos === -1 ? '∞' : p.limits.photos}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setEditingPlan({ ...p })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Plan Edit Modal */}
          {editingPlan && (
            <Card className="glass-surface animate-fade-in" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontWeight: 700 }}>Edit: {editingPlan.emoji} {editingPlan.name}</h4>
                <button onClick={() => setEditingPlan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Monthly Price ($)</label>
                  <input type="number" step="0.01" value={editingPlan.monthlyPrice || ''} onChange={e => setEditingPlan({ ...editingPlan, monthlyPrice: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Annual Price ($/mo)</label>
                  <input type="number" step="0.01" value={editingPlan.annualPrice || ''} onChange={e => setEditingPlan({ ...editingPlan, annualPrice: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Commission (%)</label>
                  <input type="number" step="0.5" value={editingPlan.commission} onChange={e => setEditingPlan({ ...editingPlan, commission: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Active Events Limit</label>
                  <input type="number" value={editingPlan.limits.activeEvents} onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, activeEvents: parseInt(e.target.value) || -1 } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>-1 = unlimited</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Attendees / Event</label>
                  <input type="number" value={editingPlan.limits.attendeesPerEvent} onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, attendeesPerEvent: parseInt(e.target.value) || -1 } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Staff Members</label>
                  <input type="number" value={editingPlan.limits.staffMembers} onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, staffMembers: parseInt(e.target.value) || -1 } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Guest Photos</label>
                  <input type="number" value={editingPlan.limits.photos} onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, photos: parseInt(e.target.value) || -1 } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>-1 = unlimited</span>
                </div>
              </div>
              {/* Feature toggles (US-UI-003) */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Feature toggles</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
                  {[
                    ['paidTickets', 'Paid Tickets'],
                    ['polls', 'Polls & Voting'],
                    ['guestMessaging', 'Guest Messaging'],
                    ['duplicateEvents', 'Duplicate Events'],
                    ['qrCheckin', 'QR Check-in'],
                    ['csvExport', 'CSV Export'],
                    ['removeBranding', 'Remove Branding'],
                    ['customDomain', 'Custom Domain'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: editingPlan[key] ? 'rgba(0,200,83,0.06)' : 'var(--color-surface)' }}>
                      <input type="checkbox" checked={!!editingPlan[key]} onChange={e => setEditingPlan({ ...editingPlan, [key]: e.target.checked })} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={handleSavePlan}><Check size={14} /> Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TOP-UP CATALOG */}
      {economicsTab === 'topups' && (
        <div className="flex flex-col gap-lg animate-fade-in">
          <div style={{ display: 'inline-flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '3px', gap: '4px', alignSelf: 'flex-start' }}>
            <button onClick={() => setHostTypeFilter('individual')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', background: hostTypeFilter === 'individual' ? 'var(--color-primary)' : 'transparent', color: hostTypeFilter === 'individual' ? 'white' : 'var(--color-text-muted)' }}>Individual</button>
            <button onClick={() => setHostTypeFilter('organization')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', background: hostTypeFilter === 'organization' ? 'var(--color-primary)' : 'transparent', color: hostTypeFilter === 'organization' ? 'white' : 'var(--color-text-muted)' }}>Organization</button>
          </div>

          <Card className="glass-surface" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopUps.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{t.name}</td>
                    <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{t.description}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>${t.price}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                        background: t.enabled ? 'rgba(0,200,83,0.1)' : 'rgba(239,68,68,0.1)',
                        color: t.enabled ? '#16a34a' : '#ef4444'
                      }}>
                        {t.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setEditingTopUp({ ...t })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {editingTopUp && (
            <Card className="glass-surface animate-fade-in" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontWeight: 700 }}>Edit: {editingTopUp.name}</h4>
                <button onClick={() => setEditingTopUp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Price ($)</label>
                  <input type="number" step="0.01" value={editingTopUp.price} onChange={e => setEditingTopUp({ ...editingTopUp, price: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                  <input type="text" value={editingTopUp.description} onChange={e => setEditingTopUp({ ...editingTopUp, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={editingTopUp.enabled} onChange={e => setEditingTopUp({ ...editingTopUp, enabled: e.target.checked })} />
                    Enabled
                  </label>
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={handleSaveTopUp}><Check size={14} /> Save</Button>
                <Button variant="outline" onClick={() => setEditingTopUp(null)}>Cancel</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* HOST SUBSCRIPTIONS */}
      {economicsTab === 'subscriptions' && (
        <div className="flex flex-col gap-lg animate-fade-in">
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text" placeholder="Search by host name or email..."
              value={subSearch} onChange={e => setSubSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <Card className="glass-surface" style={{ padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Host</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>MRR</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Cycle</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Renews</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(s => {
                  const plan = plans.find(p => p.id === s.planId);
                  const isOrg = (s.planId || '').startsWith('org_');
                  const mrr = plan ? (s.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice) : null;
                  return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.hostName || s.hostEmail}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{s.hostEmail}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: isOrg ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)', color: isOrg ? '#8b5cf6' : '#3b82f6' }}>{isOrg ? 'Org' : 'Ind'}</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{s.planName || s.planId}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>{mrr === null ? 'Custom' : mrr === 0 ? '—' : `$${mrr}`}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem' }}>{s.billingCycle}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                        background: (s.status || '').toUpperCase() === 'ACTIVE' ? 'rgba(0,200,83,0.1)' : 'rgba(245,158,11,0.1)',
                        color: (s.status || '').toUpperCase() === 'ACTIVE' ? '#16a34a' : '#ca8a04'
                      }}>{(s.status || '').toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.78rem' }}>
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => { setOverrideTarget(s); setOverridePlanId(''); setOverrideReason(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Override Modal */}
          {overrideTarget && (
            <Card className="glass-surface animate-fade-in" style={{ padding: '24px', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 12px 0', fontWeight: 700 }}>Manage Host: {overrideTarget.hostName || overrideTarget.hostEmail}</h4>

              {/* Live usage vs limits, active top-ups & recent transactions for this host */}
              {(() => {
                const ou = mockStore.getHostUsage ? mockStore.getHostUsage(overrideTarget.hostEmail) : null;
                const obal = mockStore.getTopUpBalances ? mockStore.getTopUpBalances(overrideTarget.hostEmail) : [];
                const otx = mockStore.getTransactions ? mockStore.getTransactions(overrideTarget.hostEmail) : [];
                const fmt = (v) => v === -1 ? '∞' : v;
                const rows = ou?.usage ? [
                  { label: 'Active Events', u: ou.usage.activeEvents },
                  { label: 'Attendees', u: ou.usage.totalAttendees },
                  { label: 'Staff', u: ou.usage.staffMembers },
                  { label: 'Photos', u: ou.usage.photos }
                ] : [];
                return (
                  <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Usage vs Limits</div>
                      {rows.map(r => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '2px 0' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                          <span style={{ fontWeight: 700 }}>{r.u?.current ?? '—'} / {fmt(r.u?.max)}</span>
                        </div>
                      ))}
                      {obal.length > 0 && (
                        <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>ACTIVE TOP-UPS</div>
                          {obal.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span>{b.topUpName}</span><span style={{ color: '#16a34a', fontWeight: 700 }}>{b.remaining} left</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Recent Transactions</div>
                      {otx.length === 0 ? (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>No transactions.</div>
                      ) : otx.slice(0, 5).map(tx => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '2px 0' }}>
                          <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{tx.description}</span>
                          <span style={{ fontWeight: 700, color: tx.type === 'refund' ? '#ef4444' : 'var(--color-text)' }}>{tx.type === 'refund' ? '-' : ''}${(tx.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>New Plan</label>
                  <select value={overridePlanId} onChange={e => setOverridePlanId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <option value="">Select plan...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name} ({p.hostType})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Reason</label>
                  <select value={overrideReason} onChange={e => setOverrideReason(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <option value="">Select reason...</option>
                    <option value="Support Escalation">Support Escalation</option>
                    <option value="Promotional Grant">Promotional Grant</option>
                    <option value="Penalty Downgrade">Penalty Downgrade</option>
                    <option value="Partnership Deal">Partnership Deal</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={handleOverride} disabled={!overridePlanId || !overrideReason}>
                  <Crown size={14} /> Apply Override
                </Button>
                <Button variant="outline" onClick={() => setOverrideTarget(null)}>Cancel</Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
