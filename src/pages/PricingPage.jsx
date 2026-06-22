import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Sparkles, Zap, Crown, Star, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';

const individualPlans = [
  {
    id: 'ind_free', name: 'Free', emoji: '🌱', monthlyPrice: 0, annualPrice: 0, commission: 0,
    highlights: ['1 Active Event', '50 Attendees / Event', 'Public Events Only', 'Manual Check-in', 'Community Support'],
    cta: 'Get Started Free', popular: false,
    features: {
      'Active Events': '1', 'Attendees / Event': '50', 'Max Guests per RSVP': '2', 'Draft Events': true, 'Duplicate Events': false,
      'Event Privacy': 'Public', 'Guest List Controls': false, 'Waitlist & Approval': true, 'Paid Tickets': false, 'Commission': '—',
      'Custom RSVP Questions': false, 'Manual Invitations': false, 'Staff Members': '0', 'Custom Roles': false, 'QR Check-in': 'Manual',
      'Guest Messaging': false, 'Comments': true, 'Polls': false, 'Photo Gallery': false, 'Broadcast': false,
      'Custom Templates': false, 'Delivery Logs': false, 'Activity Inbox': false, 'Custom Branding': false,
      'Remove Branding': false, 'Custom Domain': false, 'Analytics': 'Event Summary', 'CSV Export': false, 'Support': 'Community'
    }
  },
  {
    id: 'ind_basic', name: 'Basic', emoji: '⭐', monthlyPrice: 3.99, annualPrice: 3.19, commission: 5,
    highlights: ['3 Active Events', '200 Attendees / Event', 'All Privacy Options', 'Paid Tickets (5%)', 'Email Support (48h)'],
    cta: 'Upgrade to Basic', popular: false,
    features: {
      'Active Events': '3', 'Attendees / Event': '200', 'Max Guests per RSVP': '5', 'Draft Events': true, 'Duplicate Events': false,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '5%',
      'Custom RSVP Questions': '5 / Event', 'Manual Invitations': false, 'Staff Members': '0', 'Custom Roles': false, 'QR Check-in': 'Manual',
      'Guest Messaging': true, 'Comments': true, 'Polls': false, 'Photo Gallery': '20 Photos', 'Broadcast': true,
      'Custom Templates': false, 'Delivery Logs': false, 'Activity Inbox': false, 'Custom Branding': false,
      'Remove Branding': false, 'Custom Domain': false, 'Analytics': 'RSVP Funnel', 'CSV Export': false, 'Support': 'Email (48h)'
    }
  },
  {
    id: 'ind_advanced', name: 'Advanced', emoji: '🚀', monthlyPrice: 9.99, annualPrice: 7.99, commission: 3,
    highlights: ['10 Active Events', '500 Attendees / Event', 'Staff + QR Scanner', 'Custom Branding', 'Email Support (24h)'],
    cta: 'Upgrade to Advanced', popular: true,
    features: {
      'Active Events': '10', 'Attendees / Event': '500', 'Max Guests per RSVP': '10', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '3%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': '1', 'Custom Roles': false, 'QR Check-in': 'QR Scanner',
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': '100 Photos', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': false, 'Activity Inbox': true, 'Custom Branding': true,
      'Remove Branding': false, 'Custom Domain': false, 'Analytics': 'Attendance + Feedback', 'CSV Export': false, 'Support': 'Email (24h)'
    }
  },
  {
    id: 'ind_premium', name: 'Premium', emoji: '💎', monthlyPrice: 24.99, annualPrice: 19.99, commission: 2,
    highlights: ['Unlimited Events', '1,500 Attendees', 'Remove Branding', 'Priority Chat Support', 'CSV Export'],
    cta: 'Upgrade to Premium', popular: false,
    features: {
      'Active Events': 'Unlimited', 'Attendees / Event': '1,500', 'Max Guests per RSVP': '25', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '2%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': '2', 'Custom Roles': false, 'QR Check-in': 'QR Scanner',
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': '500 Photos', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': true, 'Activity Inbox': true, 'Custom Branding': true,
      'Remove Branding': true, 'Custom Domain': false, 'Analytics': 'Revenue + Export', 'CSV Export': true, 'Support': 'Priority Chat'
    }
  },
  {
    id: 'ind_premium_plus', name: 'Premium Plus', emoji: '👑', monthlyPrice: 49.99, annualPrice: 39.99, commission: 1,
    highlights: ['Unlimited Everything', '5,000 Attendees', 'Custom Domain', 'Built-in Roles', 'Priority Chat'],
    cta: 'Go Premium Plus', popular: false,
    features: {
      'Active Events': 'Unlimited', 'Attendees / Event': '5,000', 'Max Guests per RSVP': 'Unlimited', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '1%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': '5', 'Custom Roles': 'Built-in', 'QR Check-in': 'QR Scanner',
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': 'Unlimited', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': true, 'Activity Inbox': true, 'Custom Branding': true,
      'Remove Branding': true, 'Custom Domain': true, 'Analytics': 'Full + API', 'CSV Export': true, 'Support': 'Priority Chat'
    }
  }
];

const orgPlans = [
  {
    id: 'org_free', name: 'Free Trial', emoji: '🌱', monthlyPrice: 0, annualPrice: 0, commission: 0,
    highlights: ['2 Active Events', '100 Attendees / Event', '2 Staff Members', 'QR Check-in', 'Email Support'],
    cta: 'Start Free Trial', popular: false,
    features: {
      'Active Events': '2', 'Attendees / Event': '100', 'Max Guests per RSVP': '2', 'Draft Events': true, 'Duplicate Events': false,
      'Event Privacy': 'Public', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': false, 'Commission': '—',
      'Custom RSVP Questions': '3 / Event', 'Manual Invitations': true, 'Staff Members': '2', 'Custom Roles': false, 'QR Check-in': true,
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': '50 Photos', 'Broadcast': true,
      'Custom Templates': false, 'Delivery Logs': false, 'Activity Inbox': 'Basic', 'Custom Branding': false,
      'Remove Branding': false, 'Custom Domain': false, 'Analytics': 'Basic', 'CSV Export': false, 'Support': 'Email',
      'Payout Speed': 'Standard (7 Days)'
    }
  },
  {
    id: 'org_basic', name: 'Basic', emoji: '⭐', monthlyPrice: 19.99, annualPrice: 15.99, commission: 4,
    highlights: ['5 Active Events', '500 Attendees', '5 Staff Members', 'Built-in Roles', 'Email Support (24h)'],
    cta: 'Upgrade to Basic', popular: false,
    features: {
      'Active Events': '5', 'Attendees / Event': '500', 'Max Guests per RSVP': '5', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '4%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': '5', 'Custom Roles': 'Built-in', 'QR Check-in': true,
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': '200 Photos', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': 'Basic', 'Activity Inbox': true, 'Custom Branding': 'Enhanced',
      'Remove Branding': false, 'Custom Domain': false, 'Analytics': 'Event Analytics', 'CSV Export': false, 'Support': 'Email (24h)',
      'Payout Speed': 'Standard (7 Days)'
    }
  },
  {
    id: 'org_advanced', name: 'Advanced', emoji: '🚀', monthlyPrice: 49.99, annualPrice: 39.99, commission: 2.5,
    highlights: ['30 Active Events', '2,000 Attendees', '15 Staff', 'Custom Domain', 'Priority Chat'],
    cta: 'Upgrade to Advanced', popular: true,
    features: {
      'Active Events': '30', 'Attendees / Event': '2,000', 'Max Guests per RSVP': '15', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '2.5%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': '15', 'Custom Roles': 'Full Custom', 'QR Check-in': true,
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': '1,000 Photos', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': true, 'Activity Inbox': true, 'Custom Branding': 'Full',
      'Remove Branding': true, 'Custom Domain': true, 'Analytics': 'Advanced + Export', 'CSV Export': true, 'Support': 'Priority Chat',
      'Payout Speed': 'Express (3 Days)'
    }
  },
  {
    id: 'org_premium', name: 'Premium', emoji: '💎', monthlyPrice: 99.99, annualPrice: 79.99, commission: 1,
    highlights: ['Unlimited Events', '5,000 Attendees', 'Unlimited Staff', 'White-label', 'Dedicated Manager'],
    cta: 'Upgrade to Premium', popular: false,
    features: {
      'Active Events': 'Unlimited', 'Attendees / Event': '5,000', 'Max Guests per RSVP': '50', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '1%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': 'Unlimited', 'Custom Roles': 'Full Custom', 'QR Check-in': true,
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': 'Unlimited', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': true, 'Activity Inbox': true, 'Custom Branding': 'White-label',
      'Remove Branding': true, 'Custom Domain': true, 'Analytics': 'Full + API', 'CSV Export': true, 'Support': 'Dedicated Manager',
      'Payout Speed': 'Express (3 Days)'
    }
  },
  {
    id: 'org_premium_plus', name: 'Premium Plus', emoji: '👑', monthlyPrice: null, annualPrice: null, commission: 0,
    highlights: ['Everything Unlimited', 'Custom Pricing', '0% Commission', 'SSO + API', 'Dedicated + SLA'],
    cta: 'Contact Sales', popular: false,
    features: {
      'Active Events': 'Unlimited', 'Attendees / Event': 'Unlimited', 'Max Guests per RSVP': 'Unlimited', 'Draft Events': true, 'Duplicate Events': true,
      'Event Privacy': 'All', 'Guest List Controls': true, 'Waitlist & Approval': true, 'Paid Tickets': true, 'Commission': '0%',
      'Custom RSVP Questions': 'Unlimited', 'Manual Invitations': true, 'Staff Members': 'Unlimited', 'Custom Roles': 'Full Custom', 'QR Check-in': true,
      'Guest Messaging': true, 'Comments': true, 'Polls': true, 'Photo Gallery': 'Unlimited', 'Broadcast': true,
      'Custom Templates': true, 'Delivery Logs': true, 'Activity Inbox': true, 'Custom Branding': 'White-label',
      'Remove Branding': true, 'Custom Domain': true, 'Analytics': 'Full + API + SSO', 'CSV Export': true, 'Support': 'Dedicated + SLA',
      'Payout Speed': 'Instant (1 Day)'
    }
  }
];

const indTopUps = [
  { name: 'Extra 250 Attendees', desc: 'Add 250 attendees to one event', price: 2.99, icon: '👥' },
  { name: 'Extra Event Slot', desc: 'One additional active event for one month', price: 1.99, icon: '📅' },
  { name: 'Assistant Pass', desc: 'One extra staff member for one event', price: 1.49, icon: '🎫' },
  { name: 'Photo Pack', desc: 'Additional 50 guest photo uploads', price: 0.99, icon: '📸' },
  { name: 'SMS Pack', desc: '500 SMS notifications', price: 3.99, icon: '💬' },
  { name: 'Featured Event', desc: 'Featured in Explore for 7 days', price: 4.99, icon: '⭐' },
  { name: 'Premium Event Pass', desc: 'Unlock Premium features for one event (7 days)', price: 6.99, icon: '👑' }
];

const orgTopUps = [
  { name: 'Extra 1,000 Attendees', desc: 'Increase capacity for one event', price: 8.99, icon: '👥' },
  { name: 'Extra Event Slot', desc: 'One additional active event for one month', price: 4.99, icon: '📅' },
  { name: 'Extra Staff Member', desc: 'One additional staff seat for one month', price: 2.99, icon: '🎫' },
  { name: 'SMS Pack', desc: '1,000 SMS notifications', price: 5.99, icon: '💬' },
  { name: 'Featured Event', desc: 'Featured in Explore for 7 days', price: 7.99, icon: '⭐' },
  { name: 'Premium Event Pass', desc: 'Unlock Premium features for one event (7 days)', price: 19.99, icon: '👑' }
];

const featureKeys = [
  'Active Events', 'Attendees / Event', 'Max Guests per RSVP', 'Staff Members', 'Commission',
  'Paid Tickets', 'Custom RSVP Questions', 'Manual Invitations', 'Custom Roles', 'QR Check-in',
  'Guest Messaging', 'Polls', 'Photo Gallery', 'Broadcast', 'Custom Templates',
  'Delivery Logs', 'Activity Inbox', 'Custom Branding', 'Remove Branding', 'Custom Domain',
  'Analytics', 'CSV Export', 'Support'
];

function renderFeatureValue(val) {
  if (val === true) return <Check size={16} style={{ color: '#22c55e' }} />;
  if (val === false) return <X size={14} style={{ color: '#d4d4d8' }} />;
  return <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>{val}</span>;
}

export default function PricingPage() {
  const [hostType, setHostType] = useState('individual');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  const plans = hostType === 'individual' ? individualPlans : orgPlans;
  const topUps = hostType === 'individual' ? indTopUps : orgTopUps;

  const getPrice = (plan) => {
    if (plan.monthlyPrice === null) return 'Custom';
    if (plan.monthlyPrice === 0) return 'Free';
    return billingCycle === 'annual' ? `$${plan.annualPrice}` : `$${plan.monthlyPrice}`;
  };

  const getSuffix = (plan) => {
    if (plan.monthlyPrice === null || plan.monthlyPrice === 0) return '';
    return '/mo';
  };

  return (
    <PageShell>
      <div className="mesh-bg" style={{ minHeight: '100vh', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="container animate-fade-in" style={{ maxWidth: '1200px', paddingTop: 'var(--spacing-xl)' }}>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,60,172,0.12))',
              color: 'var(--color-primary)', padding: '8px 20px', borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px'
            }}>
              <Sparkles size={16} /> Transparent Pricing
            </span>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, fontFamily: 'var(--font-heading)',
              lineHeight: 1.1, margin: '16px 0 12px',
              background: 'linear-gradient(135deg, var(--color-text), var(--color-primary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Plans that grow with you
            </h1>
            <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Start free, scale effortlessly. Whether you're hosting a birthday party or managing corporate conferences — there's a plan for you.
            </p>

            {/* Host Type Toggle */}
            <div style={{
              display: 'inline-flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)', padding: '4px', gap: '4px', marginBottom: '20px'
            }}>
              <button
                onClick={() => setHostType('individual')}
                style={{
                  padding: '10px 24px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s',
                  background: hostType === 'individual' ? 'var(--color-primary)' : 'transparent',
                  color: hostType === 'individual' ? 'white' : 'var(--color-text-muted)'
                }}
              >
                👤 Individual Hosts
              </button>
              <button
                onClick={() => setHostType('organization')}
                style={{
                  padding: '10px 24px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s',
                  background: hostType === 'organization' ? 'var(--color-primary)' : 'transparent',
                  color: hostType === 'organization' ? 'white' : 'var(--color-text-muted)'
                }}
              >
                🏢 Organization Hosts
              </button>
            </div>

            {/* Billing Cycle Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: billingCycle === 'monthly' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>Monthly</span>
              <button
                onClick={() => setBillingCycle(b => b === 'monthly' ? 'annual' : 'monthly')}
                style={{
                  width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', position: 'relative',
                  background: billingCycle === 'annual' ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s'
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                  transition: 'left 0.3s', left: billingCycle === 'annual' ? '27px' : '3px', boxShadow: 'var(--shadow-sm)'
                }} />
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: billingCycle === 'annual' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                Annual
                <span style={{
                  display: 'inline-block', marginLeft: '6px', background: 'rgba(0,200,83,0.12)', color: '#16a34a',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800
                }}>
                  SAVE 20%
                </span>
              </span>
            </div>
          </div>

          {/* Plan Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
            gap: '16px',
            marginBottom: '48px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {plans.map(plan => (
              <Card
                key={plan.id}
                className="glass-surface card-hover-lift"
                style={{
                  padding: '28px 20px', textAlign: 'center', position: 'relative', overflow: 'visible',
                  border: plan.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  minWidth: '200px'
                }}
              >
                {plan.popular && (
                  <span style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--color-primary), #ff3cac)',
                    color: 'white', padding: '4px 16px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                    whiteSpace: 'nowrap'
                  }}>
                    Most Popular
                  </span>
                )}

                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{plan.emoji}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>{plan.name}</h3>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    fontSize: plan.monthlyPrice === null ? '1.5rem' : '2.2rem',
                    fontWeight: 900, color: 'var(--color-text)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {getPrice(plan)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {getSuffix(plan)}
                  </span>
                  {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginTop: '2px' }}>
                      ${plan.monthlyPrice}/mo
                    </div>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', textAlign: 'left' }}>
                  {plan.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '5px 0', color: 'var(--color-text)' }}>
                      <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {h}
                    </li>
                  ))}
                </ul>

                <Link to={plan.monthlyPrice === null ? '#' : '/login?signup=true'} style={{ textDecoration: 'none' }}>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    style={{ width: '100%', padding: '10px 0', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    {plan.cta} {plan.popular && <ArrowRight size={14} />}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Compare All Features */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <button
              onClick={() => setShowComparison(!showComparison)}
              style={{
                background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
                padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                color: 'var(--color-primary)', transition: 'all 0.2s'
              }}
            >
              {showComparison ? 'Hide' : 'Compare All'} Features
            </button>
          </div>

          {/* Feature Comparison Table */}
          {showComparison && (
            <Card className="glass-surface animate-fade-in" style={{ padding: 0, overflow: 'auto', marginBottom: '48px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, position: 'sticky', left: 0, background: 'var(--color-bg)', zIndex: 1 }}>Feature</th>
                    {plans.map(p => (
                      <th key={p.id} style={{
                        padding: '14px 12px', textAlign: 'center', fontWeight: 700,
                        background: p.popular ? 'rgba(255,107,53,0.04)' : 'transparent',
                        minWidth: '120px'
                      }}>
                        {p.emoji} {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureKeys.map((fk, i) => (
                    <tr key={fk} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--color-text-muted)', position: 'sticky', left: 0, background: i % 2 === 0 ? 'var(--color-bg)' : '#fafbfc', zIndex: 1 }}>{fk}</td>
                      {plans.map(p => (
                        <td key={p.id} style={{
                          padding: '10px 12px', textAlign: 'center',
                          background: p.popular ? 'rgba(255,107,53,0.02)' : 'transparent'
                        }}>
                          {renderFeatureValue(p.features[fk])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Top-Ups Section */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: 'var(--font-heading)',
                marginBottom: '8px'
              }}>
                🛒 Need a little extra?
              </h2>
              <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
                Top-ups let you stretch your current plan for a specific event without upgrading.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {topUps.map((tu, i) => (
                <Card key={i} className="card-hover-lift" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', background: 'rgba(255,107,53,0.08)', flexShrink: 0
                  }}>
                    {tu.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{tu.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{tu.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>${tu.price}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>one-time</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Transaction Fees Section */}
          <Card className="glass-surface" style={{ padding: '32px', textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>💳 Transaction Fees on Paid Tickets</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
              We only charge a commission on paid ticket sales. Free events are always free.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {(hostType === 'individual'
                ? [{ plan: 'Basic', fee: '5%' }, { plan: 'Advanced', fee: '3%' }, { plan: 'Premium', fee: '2%' }, { plan: 'Premium Plus', fee: '1%' }]
                : [{ plan: 'Basic', fee: '4%' }, { plan: 'Advanced', fee: '2.5%' }, { plan: 'Premium', fee: '1%' }, { plan: 'Premium Plus', fee: '0%' }]
              ).map(f => (
                <div key={f.plan} style={{
                  padding: '14px 24px', borderRadius: '16px', border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', minWidth: '120px'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{f.plan}</div>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--color-primary)' }}>{f.fee}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* CTA */}
          <div style={{
            textAlign: 'center', padding: '48px 24px', borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.06), rgba(255,60,172,0.06))',
            border: '1px solid rgba(255,107,53,0.15)'
          }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
              Ready to host your next event?
            </h2>
            <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '24px', maxWidth: '450px', margin: '0 auto 24px' }}>
              Start with a free plan, no credit card required. Upgrade anytime as your events grow.
            </p>
            <Link to="/login?signup=true" style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ padding: '14px 40px', fontSize: '1.05rem', fontWeight: 700 }}>
                <Sparkles size={18} /> Get Started Free <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
