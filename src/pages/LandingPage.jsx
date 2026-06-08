import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Share2, Users, MapPin, Sparkles, LayoutDashboard, QrCode } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

export default function LandingPage() {
  return (
    <div className="mesh-bg">
      {/* Header */}
      <header className="glass-surface" style={{ padding: 'var(--spacing-sm) 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container flex justify-between items-center">
          <div className="logo flex items-center gap-xs">
            <img src="/logo.png" alt="SafalEvents" style={{ height: '44px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
          </div>
          
          <nav className="desktop-only flex gap-lg items-center" style={{ fontWeight: 500 }}>
            <a href="#how-it-works" className="text-muted hover:text-text">How it works</a>
            <a href="#features" className="text-muted hover:text-text">Features</a>
            <a href="#faq" className="text-muted hover:text-text">FAQ</a>
          </nav>
          
          <div className="flex gap-sm">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/login?signup=true">
              <Button variant="primary">Become a Host</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero container flex items-center" style={{ padding: 'var(--spacing-2xl) var(--spacing-sm)', minHeight: '90vh', gap: 'var(--spacing-xl)' }}>
        <div className="flex-1 animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244,63,94,0.1)', color: 'var(--color-accent)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
            <Sparkles size={16} /> Modern Event RSVPs
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: 'var(--spacing-md)' }}>
            Plan. Invite. <br />
            <span className="text-gradient">RSVP. Done.</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)', maxWidth: '540px' }}>
            The most beautiful way to collect RSVPs. Whether it's a house party, corporate offsite, or cultural festival, SafalEvent makes every gathering successful.
          </p>
          <div className="flex gap-sm items-center">
            <Link to="/login?signup=true">
              <Button variant="primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>Create your first event</Button>
            </Link>
          </div>
          <div className="flex gap-md items-center" style={{ marginTop: 'var(--spacing-lg)', opacity: 0.8 }}>
            <div className="flex -gap-xs">
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', border: '3px solid white', marginLeft: i > 1 ? '-12px' : 0, backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})`, backgroundSize: 'cover' }}></div>
              ))}
            </div>
            <span className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Join 10,000+ successful hosts</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center animate-fade-in animate-delay-1" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', zIndex: -1 }}></div>
          <img 
            src="/hero_mockup.jpg" 
            alt="SafalEvent RSVP Mockup" 
            style={{
              width: '100%', 
              maxWidth: '600px', 
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
              transition: 'transform var(--transition-normal)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'}
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-sm)' }}>
        <div className="text-center animate-fade-in animate-delay-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: 'var(--spacing-xs)' }}>How it works</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>Three simple steps to a successful gathering.</p>
        </div>
        
        <div className="flex gap-lg justify-center animate-fade-in animate-delay-3" style={{ flexWrap: 'wrap' }}>
          {[
            { icon: <CalendarPlus size={40} />, title: "1. Create an event", desc: "Fill in details, upload an image, and set capacity rules in our gorgeous editor." },
            { icon: <Share2 size={40} />, title: "2. Share your invite", desc: "Share one universal link across WhatsApp, SMS, email, and social media." },
            { icon: <Users size={40} />, title: "3. Manage RSVPs", desc: "See exactly who's coming, manage cancellations, and send broadcast updates." }
          ].map((feature, idx) => (
            <Card key={idx} className="flex-1 text-center" style={{ minWidth: '300px', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ 
                width: '80px', height: '80px', margin: '0 auto var(--spacing-md)', 
                background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', 
                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: 'rotate(-5deg)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.5rem' }}>{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section id="features" style={{ background: 'var(--color-surface)', padding: 'var(--spacing-2xl) 0', marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
            <div className="flex-1" style={{ minWidth: '300px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>Everything you need. <br/><span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Nothing you don't.</span></h2>
              <div className="flex flex-col gap-sm">
                <div className="flex items-center gap-sm"><CheckIcon /> Visual event pages that wow guests</div>
                <div className="flex items-center gap-sm"><CheckIcon /> Custom RSVP questions & forms</div>
                <div className="flex items-center gap-sm"><CheckIcon /> Self-edit & cancellation for guests</div>
                <div className="flex items-center gap-sm"><CheckIcon /> 100% Free for personal events</div>
              </div>
            </div>
            <div className="flex-1 flex gap-md justify-center">
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', textAlign: 'center', width: '200px' }}>
                <LayoutDashboard size={32} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-sm)' }} />
                <h4 style={{ marginBottom: '4px' }}>Host Dashboard</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Analytics & Guest list</p>
              </div>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', textAlign: 'center', width: '200px', transform: 'translateY(30px)' }}>
                <QrCode size={32} style={{ color: 'var(--color-accent)', margin: '0 auto var(--spacing-sm)' }} />
                <h4 style={{ marginBottom: '4px' }}>QR Check-in</h4>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Fast door entry</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: 'white', padding: 'var(--spacing-xl) 0' }}>
        <div className="container flex justify-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
          <div>
            <div className="logo flex items-center gap-xs" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <img src="/logo.png" alt="SafalEvents" style={{ height: '36px', borderRadius: '6px' }} />
            </div>
            <p style={{ color: '#94A3B8', maxWidth: '300px' }}>Make every event successful with beautiful RSVPs and effortless hosting.</p>
          </div>
          <div className="flex gap-xl">
            <div className="flex flex-col gap-xs">
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Product</h4>
              <a href="#" style={{ color: '#94A3B8' }}>Features</a>
              <a href="#" style={{ color: '#94A3B8' }}>Pricing</a>
            </div>
            <div className="flex flex-col gap-xs">
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Company</h4>
              <a href="#" style={{ color: '#94A3B8' }}>About</a>
              <a href="#" style={{ color: '#94A3B8' }}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <div style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', borderRadius: '50%', padding: '4px' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  )
}
