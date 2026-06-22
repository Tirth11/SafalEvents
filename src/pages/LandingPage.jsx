import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Calendar, Ticket, Send, QrCode, BarChart3, Webhook,
  Users, Link2, Repeat, Check, MapPin, Heart, Star, Clock
} from 'lucide-react';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import { AVATARS, EVENT_COVERS, getAvatar, getEventCover } from '../utils/images';
import { mockStore } from '../utils/mockStore';
import { PricingSection } from './PricingPage';

export default function LandingPage() {
  const modules = [
    {
      icon: <Calendar size={22} />,
      chip: 'chip-primary',
      title: 'Event Pages',
      desc: 'Beautiful pages with all the details guests need.',
    },
    {
      icon: <Ticket size={22} />,
      chip: 'chip-primary',
      featured: true,
      title: 'RSVP & Registration',
      desc: 'Simple, password-free RSVPs. Guest data stays clean.',
    },
    {
      icon: <Send size={22} />,
      chip: 'chip-blue',
      title: 'Reminders',
      desc: 'Send updates to everyone at once. No group chats.',
    },
    {
      icon: <QrCode size={22} />,
      chip: 'chip-green',
      title: 'Check-in',
      desc: 'QR codes at the door. Know who actually showed up.',
    },
    {
      icon: <BarChart3 size={22} />,
      chip: 'chip-violet',
      title: 'Analytics',
      desc: 'See registrations, attendance, and capacity at a glance.',
    },
    {
      icon: <Webhook size={22} />,
      chip: 'chip-ink',
      title: 'Integrations',
      desc: 'Connect your favorite tools via our simple API.',
    },
  ];

  const trustPoints = [
    { icon: <Check size={20} />, title: 'No passwords', desc: 'OTP-only login for you and your guests.' },
    { icon: <Heart size={20} />, title: 'Privacy first', desc: 'Guest data only you can see.' },
    { icon: <Repeat size={20} />, title: 'Recurring events', desc: 'Save templates and reuse them every time.' },
  ];

  // Live preview: the next few real public events on the platform
  const upcomingEvents = mockStore.getEvents()
    .filter(e => e.status === 'Published' && e.privacy === 'Public' && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <PageShell>
      <div style={{ background: 'var(--color-bg)' }}>

        {/* ───────── HERO ───────── */}
        <section className="platform-hero">
          <div className="hero-blob hero-blob-1" aria-hidden="true"></div>
          <div className="hero-blob hero-blob-2" aria-hidden="true"></div>
          <div
            className="container"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: 'clamp(48px, 7vw, 88px) var(--spacing-sm) clamp(40px, 6vw, 72px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'clamp(32px, 5vw, 64px)',
              alignItems: 'center',
            }}
          >
            {/* Copy */}
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }}>
              <h1
                style={{
                  fontSize: 'clamp(2.7rem, 6vw, 4.6rem)',
                  lineHeight: 1.04,
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                The effortless way to{' '}
                <span className="text-gradient">host</span>.
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  maxWidth: '560px',
                  lineHeight: 1.65,
                  margin: 0,
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                }}
              >
                Design refined invitations, manage guest responses, and coordinate every detail from a single, beautiful dashboard. Start at no cost.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <Link to="/login?signup=true">
                  <Button
                    variant="primary"
                    style={{
                      padding: '15px 28px',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Join Safal Events <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/e/1">
                  <Button
                    variant="outline"
                    style={{
                      padding: '15px 28px',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-surface)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    See an example
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div className="avatar-stack">
                  {AVATARS.slice(0, 4).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`User ${i + 1}`}
                      className="avatar-img avatar-sm"
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Loved by <strong style={{ color: 'var(--color-text)' }}>10,000+ hosts</strong>
                </span>
              </div>
            </div>

            {/* Product mockup */}
            <div className="animate-fade-in animate-delay-1" style={{ position: 'relative' }}>
              <div className="hero-mockup hero-mockup-tilt">
                <div className="hero-mockup-bar">
                  <span className="hero-mockup-dot" style={{ background: '#ff5f57' }}></span>
                  <span className="hero-mockup-dot" style={{ background: '#febc2e' }}></span>
                  <span className="hero-mockup-dot" style={{ background: '#28c840' }}></span>
                  <span
                    style={{
                      marginLeft: '10px',
                      flex: 1,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      padding: '4px 12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    app.safalevents.com
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {/* mini dashboard */}
                  <div
                    style={{
                      flex: '1 1 200px',
                      minWidth: '200px',
                      padding: '16px',
                      borderRight: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        My Events
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: '#fff',
                          background: 'var(--color-primary)',
                          padding: '4px 9px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        + New
                      </span>
                    </div>
                    {[
                      { t: 'Birthday Party', d: 'Mar 15 · 42 going', s: 'Live', c: 'var(--color-accent)' },
                      { t: 'Team Lunch', d: 'Mar 22 · 18 going', s: 'Published', c: 'var(--color-primary)' },
                      { t: 'Wedding Prep', d: 'Apr 1 · Draft', s: 'Draft', c: 'var(--color-text-muted)' },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={Object.values(EVENT_COVERS).flat()[i * 3]}
                          alt=""
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--color-text)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.t}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{row.d}</div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            color: row.c,
                            background: 'var(--color-surface-hover)',
                            padding: '3px 7px',
                            borderRadius: 'var(--radius-full)',
                            flexShrink: 0,
                          }}
                        >
                          {row.s}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* mini public event page */}
                  <div
                    style={{
                      flex: '1 1 200px',
                      minWidth: '200px',
                      background: 'var(--color-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <img
                      src={EVENT_COVERS.festival[0]}
                      alt="Event cover"
                      style={{ width: '100%', height: '92px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        Birthday Party
                      </div>
                      <div
                        style={{
                          fontSize: '0.66rem',
                          color: 'var(--color-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Calendar size={12} style={{ color: 'var(--color-primary)' }} /> Sat, Mar 15
                        <span style={{ color: 'var(--color-border-hover)' }}>·</span>
                        <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> NYC
                      </div>
                      <button
                        style={{
                          marginTop: '4px',
                          width: '100%',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '9px',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Ticket size={13} /> RSVP Now
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <div className="avatar-stack">
                          {AVATARS.slice(2, 5).map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="avatar-img avatar-sm"
                              style={{ width: '22px', height: '22px' }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                          42 going
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating proof */}
              <div
                className="glass-surface float-gentle"
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '-12px',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.95)',
                }}
              >
                <div className="feature-chip chip-green" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                  <QrCode size={17} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    QR check-in
                  </div>
                  <div style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    No door-line chaos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── STATS STRIP ───────── */}
        <section style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-md) 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { value: '10,000+', label: 'Events created' },
              { value: '1M+', label: 'Guests invited' },
              { value: '< 2 min', label: 'Setup time' },
              { value: '100%', label: 'Password-free' },
            ].map((s, i) => (
              <div key={i} className="stat-cell" style={{ textAlign: 'center', padding: '8px 4px' }}>
                <div
                  style={{
                    fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {s.value}
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── HOW IT WORKS ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'var(--color-bg)' }}>
          <div className="container">
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-lg)' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
How it works — simple, refined
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                  maxWidth: '560px',
                  lineHeight: 1.55,
                }}
              >
                Create, share, done. No phone calls. No spreadsheets.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { num: '1', title: 'Create your invite', desc: 'Set the date, time, location. Pick a nice cover photo.' },
                { num: '2', title: 'Share the link', desc: 'Text it, email it, post it. One link to everything.' },
                { num: '3', title: "See who's coming", desc: 'RSVPs flow in. Send updates whenever. Check people in at the door.' },
              ].map((s, i) => (
                <div key={i} className={`animate-fade-in animate-delay-${i + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                  <span className="step-circle">{s.num}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.55 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FEATURES / MODULES ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
Everything you need to host
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: 0, maxWidth: '560px' }}>
                All the refined tools you need to throw a seamless, beautiful event. Nothing unnecessary.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {modules.map((m, i) => (
                <div key={i} className={`module-tile ${m.featured ? 'is-featured' : ''}`}>
                  {m.featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        color: 'var(--color-primary)',
                        background: 'rgba(242, 84, 27, 0.1)',
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Most used
                    </span>
                  )}
                  <div className={`feature-chip ${m.chip}`}>{m.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.55 }}>
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── WHY IT WORKS ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
            {/* Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
Designed with intention
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '4px' }}>
                {trustPoints.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div className="feature-chip chip-primary" style={{ width: '40px', height: '40px', borderRadius: '11px' }}>
                      {t.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote card */}
            <div
              className="quote-card"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <p
                style={{
                  fontSize: '1.15rem',
                  lineHeight: 1.5,
                  color: 'var(--color-text)',
                  margin: 0,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                "I set up my event in 5 minutes and forgot I even used SafalEvents. That's the point."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px', borderTop: '1px solid var(--color-border)', marginTop: '2px' }}>
                <img src={getAvatar('alex.event.pro')} alt="Alex M." className="avatar-img" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    Alex M.
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Hosts monthly events
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── EXPLORE EVENTS ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Happening now on SafalEvents
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: 0, maxWidth: '560px' }}>
                Real events, real people. See who's going and grab your spot before it fills up.
              </p>
            </div>

            {/* Live event preview cards */}
            {upcomingEvents.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                  width: '100%',
                  maxWidth: '960px',
                  margin: '12px 0 4px',
                }}
              >
                {upcomingEvents.map((evt, i) => {
                  const going = mockStore.getRSVPs(evt.id).filter(r => r.status === 'going').length;
                  const evtDate = new Date(evt.date + 'T00:00:00');
                  return (
                    <Link key={evt.id} to={`/e/${evt.id}`} style={{ textDecoration: 'none' }}>
                      <div
                        className={`card-hover-lift animate-fade-in animate-delay-${i + 1}`}
                        style={{
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          textAlign: 'left',
                          height: '100%',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
                          <img
                            src={getEventCover(evt)}
                            alt={evt.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '10px',
                              left: '10px',
                              background: 'rgba(255,255,255,0.95)',
                              borderRadius: '10px',
                              padding: '5px 11px',
                              textAlign: 'center',
                              lineHeight: 1.1,
                              boxShadow: 'var(--shadow-md)',
                            }}
                          >
                            <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {evtDate.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                              {evtDate.getDate()}
                            </span>
                          </span>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                            {evt.title}
                          </h3>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontWeight: 600 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} style={{ color: 'var(--color-primary)' }} /> {evt.time}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {evt.location.split(',')[0]}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="avatar-stack">
                                {AVATARS.slice(i * 2, i * 2 + 3).map((src, j) => (
                                  <img key={j} src={src} alt="" className="avatar-img avatar-sm" style={{ width: '22px', height: '22px' }} />
                                ))}
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                {going > 0 ? `${going} going` : 'Be the first'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              RSVP <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <Link to="/explore">
              <Button
                variant="primary"
                style={{
                  padding: '15px 30px',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                Explore all events <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>

        {/* ───────── PRICING ───────── */}
        <div id="pricing">
          <PricingSection />
        </div>

        {/* ───────── CLOSING CTA ───────── */}
        <section style={{ padding: '0 0 var(--spacing-xl)', background: 'var(--color-bg)' }}>
          <div className="container">
            <div className="cta-band">
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Ready to host with ease?
                </h2>
                <p style={{ fontSize: '1.05rem', maxWidth: '480px', margin: 0, color: 'rgba(255,255,255,0.8)' }}>
                  Create your first refined event in minutes. No credit card required.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                  <Link to="/login?signup=true">
                    <Button
                      variant="primary"
                      style={{
                        padding: '15px 30px',
                        fontSize: '0.95rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      Join Safal Events <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link to="/e/1">
                    <Button
                      variant="outline"
                      style={{
                        padding: '15px 30px',
                        fontSize: '0.95rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                      }}
                    >
                      See example
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '40px 0' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '32px',
                marginBottom: '32px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Product
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/explore" className="footer-link">
                    Explore events
                  </Link>
                  <Link to="/login?signup=true" className="footer-link">
                    Join Safal Events
                  </Link>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Company
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="#" className="footer-link">
                    About
                  </a>
                  <a href="#" className="footer-link">
                    Blog
                  </a>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Legal
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="#" className="footer-link">
                    Privacy
                  </a>
                  <a href="#" className="footer-link">
                    Terms
                  </a>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                © {new Date().getFullYear()} Safalvir Inc. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}
