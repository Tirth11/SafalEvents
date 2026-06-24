import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Zap, ArrowRight, Check, Star, ShoppingCart, Clock, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Crown } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function BillingPanel({ hostEmail }) {
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [topUpBalances, setTopUpBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showTopUps, setShowTopUps] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [processing, setProcessing] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);

  const loadData = () => {
    let sub = mockStore.getSubscription(hostEmail);
    if (!sub) {
      // Find hostType from user or default to individual
      const users = mockStore.getUsers ? mockStore.getUsers() : [];
      const user = users.find(u => u.email === hostEmail);
      const hostType = user?.hostType || 'individual';
      sub = mockStore.autoAssignFreePlan(hostEmail, hostType);
    }
    setSubscription(sub);
    if (sub) {
      const p = mockStore.getPlanById(sub.planId);
      setPlan(p);
    }
    setUsage(mockStore.getHostUsage(hostEmail));
    setTopUpBalances(mockStore.getTopUpBalances(hostEmail));
    setTransactions(mockStore.getTransactions(hostEmail));
  };

  useEffect(() => {
    loadData();
  }, [hostEmail]);

  if (!subscription || !plan) {
    return (
      <div className="flex flex-col gap-lg">
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Billing & Plans</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  const hostType = plan.hostType;
  const allPlans = mockStore.getPlans(hostType);
  const allTopUps = mockStore.getTopUps(hostType);
  const currentPlanIndex = allPlans.findIndex(p => p.id === plan.id);

  const handleUpgrade = (planId) => {
    setProcessing(true);
    setTimeout(() => {
      mockStore.upgradeSubscription(hostEmail, planId, selectedCycle);
      setProcessing(false);
      setShowUpgrade(false);
      loadData();
    }, 1200);
  };

  const handleBuyTopUp = (topUpId) => {
    setProcessing(true);
    setTimeout(() => {
      mockStore.purchaseTopUp(hostEmail, topUpId, null);
      setProcessing(false);
      loadData();
    }, 800);
  };

  const usageBars = usage?.usage ? [
    { label: 'Active Events', current: usage.usage.activeEvents.current, max: usage.usage.activeEvents.max === -1 ? '∞' : usage.usage.activeEvents.max, pct: usage.usage.activeEvents.max === -1 ? 15 : Math.round((usage.usage.activeEvents.current / usage.usage.activeEvents.max) * 100), color: '#3b82f6' },
    { label: 'Max Attendees', current: '-', max: usage.usage.totalAttendees.max === -1 ? '∞' : usage.usage.totalAttendees.max, pct: 0, color: '#8b5cf6', hideBar: true },
    { label: 'Staff Members', current: usage.usage.staffMembers.current, max: usage.usage.staffMembers.max === -1 ? '∞' : usage.usage.staffMembers.max, pct: usage.usage.staffMembers.max === -1 ? 10 : Math.round((usage.usage.staffMembers.current / Math.max(usage.usage.staffMembers.max, 1)) * 100), color: '#f59e0b' },
    { label: 'Guest Photos', current: usage.usage.photos.current, max: usage.usage.photos.max === -1 ? '∞' : usage.usage.photos.max, pct: usage.usage.photos.max === -1 ? 8 : Math.round((usage.usage.photos.current / Math.max(usage.usage.photos.max, 1)) * 100), color: '#ec4899' }
  ] : [];

  // Photo-limit awareness: surface the Photo Pack top-up when the album is nearly full (US-UI-004)
  const photoPct = usage?.usage?.photos && usage.usage.photos.max !== -1
    ? Math.round((usage.usage.photos.current / Math.max(usage.usage.photos.max, 1)) * 100)
    : 0;
  const photoPack = allTopUps.find(t => t.category === 'photos');

  const displayedTx = showAllTx ? transactions : transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-xl">
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Billing & Plans</h1>
        <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage your subscription, top-ups, and view transaction history.</p>
      </div>

      {/* Current Plan Card */}
      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        <Card className="glass-surface" style={{ padding: '28px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
            background: 'linear-gradient(135deg, rgba(31, 58, 99,0.08), rgba(255,60,172,0.05))',
            borderRadius: '0 0 0 100%'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', position: 'relative' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Current Plan</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '4px 0 0', fontFamily: 'var(--font-heading)' }}>
                {plan.emoji} {plan.name}
              </h2>
            </div>
            <span style={{
              background: subscription.status.toUpperCase() === 'ACTIVE' ? 'rgba(0,200,83,0.12)' : 'rgba(245,158,11,0.12)',
              color: subscription.status.toUpperCase() === 'ACTIVE' ? '#16a34a' : '#ca8a04',
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700
            }}>
              {subscription.status.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            {plan.monthlyPrice === 0 ? 'Free' : `$${subscription.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}`}
            {plan.monthlyPrice > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/mo</span>}
          </div>

          {plan.monthlyPrice > 0 && (
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
              Billed {subscription.billingCycle} · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          {plan.commission > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '16px' }}>
              {plan.commission}% commission on paid tickets
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={() => setShowUpgrade(!showUpgrade)} style={{ flex: 1, fontSize: '0.85rem' }}>
              <Zap size={14} /> {showUpgrade ? 'Hide Plans' : 'Change Plan'}
            </Button>
            <Link to="/pricing" style={{ textDecoration: 'none' }}>
              <Button variant="outline" style={{ fontSize: '0.85rem' }}>Compare All</Button>
            </Link>
          </div>

          {subscription.pendingDowngrade && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.8rem', color: '#92600a'
            }}>
              <AlertCircle size={14} style={{ marginRight: '6px' }} />
              Downgrade to <strong>{subscription.pendingDowngrade}</strong> scheduled at end of billing cycle.
            </div>
          )}
        </Card>

        {/* Usage Card */}
        <Card className="glass-surface" style={{ padding: '24px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>
            <TrendingUp size={16} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
            Usage & Limits
          </h4>
          <div className="flex flex-col gap-md">
            {usageBars.map(bar => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{bar.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {bar.hideBar ? bar.max : `${bar.current} / ${bar.max}`}
                    {bar.hideBar && <span style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}> per event</span>}
                  </span>
                </div>
                {!bar.hideBar && (
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px', width: `${Math.min(bar.pct, 100)}%`,
                      background: bar.pct >= 90 ? '#ef4444' : bar.pct >= 70 ? '#f59e0b' : bar.color,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Photo limit nudge → Photo Pack top-up (US-UI-004) */}
          {photoPct >= 80 && photoPack && (
            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>📸</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Photo album {photoPct}% full</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{photoPack.name} — {photoPack.description}</div>
              </div>
              <Button variant="outline" disabled={processing} onClick={() => handleBuyTopUp(photoPack.id)} style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                ${photoPack.price}
              </Button>
            </div>
          )}

          {/* Active Top-Ups */}
          {topUpBalances.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Active Top-Ups</h5>
              {topUpBalances.map(tb => (
                <div key={tb.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: 'rgba(0,200,83,0.06)', borderRadius: '8px',
                  marginBottom: '6px', fontSize: '0.8rem'
                }}>
                  <span style={{ fontWeight: 600 }}>{tb.topUpName}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{tb.remaining} remaining</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Upgrade/Downgrade Panel */}
      {showUpgrade && (
        <Card className="glass-surface animate-fade-in" style={{ padding: '28px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
            <Crown size={18} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
            Choose a Plan
          </h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            Upgrades take effect immediately with prorated credits applied.
          </p>

          {/* Billing cycle toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedCycle === 'monthly' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Monthly</span>
            <button
              onClick={() => setSelectedCycle(c => c === 'monthly' ? 'annual' : 'monthly')}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
                background: selectedCycle === 'annual' ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s'
              }}
            >
              <span style={{
                position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                transition: 'left 0.3s', left: selectedCycle === 'annual' ? '22px' : '2px', boxShadow: 'var(--shadow-sm)'
              }} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedCycle === 'annual' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              Annual <span style={{ background: 'rgba(0,200,83,0.12)', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, marginLeft: '4px' }}>-20%</span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {allPlans.map((p, i) => {
              const isCurrent = p.id === plan.id;
              const isDowngrade = i < currentPlanIndex;
              const price = selectedCycle === 'annual' ? p.annualPrice : p.monthlyPrice;
              return (
                <div
                  key={p.id}
                  onClick={() => !isCurrent && setSelectedPlanId(p.id)}
                  style={{
                    padding: '16px', borderRadius: '14px', cursor: isCurrent ? 'default' : 'pointer',
                    border: selectedPlanId === p.id ? '2px solid var(--color-primary)' : isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    opacity: isCurrent ? 0.6 : 1, background: selectedPlanId === p.id ? 'rgba(31, 58, 99,0.04)' : 'var(--color-surface)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{p.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    {price === 0 ? 'Free' : price === null ? 'Custom' : `$${price}`}
                    {price > 0 && <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/mo</span>}
                  </div>
                  {isCurrent && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent)' }}>Current Plan</span>}
                  {isDowngrade && !isCurrent && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Downgrade</span>}
                </div>
              );
            })}
          </div>

          {selectedPlanId && selectedPlanId !== plan.id && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button
                variant="primary"
                disabled={processing}
                onClick={() => handleUpgrade(selectedPlanId)}
                style={{ padding: '10px 24px', fontSize: '0.9rem' }}
              >
                {processing ? 'Processing...' : allPlans.findIndex(p => p.id === selectedPlanId) > currentPlanIndex ? 'Upgrade Now' : 'Request Downgrade'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedPlanId(null)}>Cancel</Button>
            </div>
          )}
        </Card>
      )}

      {/* Top-Ups Marketplace */}
      <Card className="glass-surface" style={{ padding: '28px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            <ShoppingCart size={16} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
            Top-Up Add-ons
          </h3>
          <button
            onClick={() => setShowTopUps(!showTopUps)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {showTopUps ? 'Hide' : 'Browse Top-Ups'} {showTopUps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showTopUps && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }} className="animate-fade-in">
            {allTopUps.map(tu => (
              <div key={tu.id} style={{
                padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--color-surface)'
              }}>
                <span style={{
                  width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', background: 'rgba(31, 58, 99,0.08)', flexShrink: 0
                }}>
                  {tu.category === 'attendees' ? '👥' : tu.category === 'events' ? '📅' : tu.category === 'staff' ? '🎫' : tu.category === 'photos' ? '📸' : tu.category === 'sms' ? '💬' : '⭐'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>{tu.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{tu.description}</div>
                </div>
                <Button
                  variant="outline"
                  disabled={processing || !tu.enabled}
                  onClick={() => handleBuyTopUp(tu.id)}
                  style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  ${tu.price}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transaction History */}
      <Card className="glass-surface" style={{ padding: '24px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          <Clock size={16} style={{ marginRight: '8px', color: 'var(--color-primary)' }} />
          Transaction History
        </h3>
        {transactions.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>No transactions yet.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Type</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTx.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                          background: tx.type === 'subscription' ? 'rgba(59,130,246,0.1)' : tx.type === 'topup' ? 'rgba(139,92,246,0.1)' : tx.type === 'refund' ? 'rgba(239,68,68,0.1)' : 'rgba(0,200,83,0.1)',
                          color: tx.type === 'subscription' ? '#3b82f6' : tx.type === 'topup' ? '#8b5cf6' : tx.type === 'refund' ? '#ef4444' : '#16a34a'
                        }}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{tx.description}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: tx.type === 'refund' ? '#ef4444' : 'var(--color-text)' }}>
                        {tx.type === 'refund' ? '-' : ''}${tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                          background: tx.status === 'success' ? 'rgba(0,200,83,0.1)' : tx.status === 'refunded' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: tx.status === 'success' ? '#16a34a' : tx.status === 'refunded' ? '#ef4444' : '#ca8a04'
                        }}>
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length > 5 && (
              <button
                onClick={() => setShowAllTx(!showAllTx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.82rem', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {showAllTx ? 'Show Less' : `Show All (${transactions.length})`} {showAllTx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
