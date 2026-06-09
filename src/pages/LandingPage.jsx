import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, Share2, Users, MapPin, Sparkles, LayoutDashboard, QrCode,
  ArrowRight, ShieldCheck, Zap, Heart, Check, Search, Filter, Calendar, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { mockStore } from '../utils/mockStore';

export default function LandingPage() {
  const [events, setEvents] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterState, setFilterState] = React.useState('');

  React.useEffect(() => {
    setEvents(mockStore.getEvents().filter(e => e.status === 'Published' && e.privacy === 'Public'));
  }, []);

  return (
    <PageShell>
      <div className="mesh-bg" style={{ overflow: 'hidden' }}>
        
        {/* Hero Section */}
        <section className="container grid-2" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-xl) 0', minHeight: '85vh', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(0, 113, 227, 0.08)', 
              color: 'var(--color-primary)', 
              padding: '6px 14px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: 600, 
              width: 'fit-content',
              fontSize: '0.8rem',
              letterSpacing: '0.5px'
            }}>
              <Sparkles size={12} /> MODERN EVENTS PLATFORM
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(3rem, 6vw, 4.8rem)', 
              lineHeight: 1.05, 
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.04em',
              color: 'var(--color-text)'
            }}>
              Host gatherings.<br />
              Collect RSVPs.<br />
              <span className="text-gradient">Effortlessly.</span>
            </h1>
            
            <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '520px', lineHeight: '1.5', margin: '4px 0' }}>
              Create a gorgeous event page, share a single invite link, and track your guest list in real time. Simple, sleek, and verification-secure.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px' }}>
              <Link to="/login?signup=true">
                <Button variant="primary" style={{ background: '#1d1d1f', color: '#ffffff', padding: '14px 32px', fontSize: '1rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Become a Host <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/e/1">
                <Button variant="outline" style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '14px 32px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}>
                  View Sample Event
                </Button>
              </Link>
            </div>
 
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', marginLeft: '4px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    style={{ 
                      width: '34px', 
                      height: '34px', 
                      borderRadius: '50%', 
                      background: '#1d1d1f', 
                      border: '2px solid var(--color-bg)', 
                      marginLeft: i > 1 ? '-10px' : 0, 
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 22})`, 
                      backgroundSize: 'cover',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                ))}
              </div>
              <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                Trusted by <strong>10,000+</strong> hosts and planners globally
              </span>
            </div>
          </div>
          
          {/* Visual Mockup - Apple Wallet Ticket style */}
          <div className="animate-fade-in animate-delay-1" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(0, 113, 227, 0.06) 0%, transparent 65%)', zIndex: -1, top: '-10%' }}></div>
            
            <div style={{
              width: '100%',
              maxWidth: '400px',
              background: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg) rotateZ(-1.5deg)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1200px) rotateY(-8deg) rotateX(4deg) rotateZ(-1.5deg) scale(1)'}
            >
              {/* Apple Wallet Style Ticket Header */}
              <div style={{
                height: '180px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #0056b3 100%)',
                borderRadius: '18px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>SE</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>SAFAL PASS</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>MON 15 AUG</span>
                </div>
                
                <div style={{ zIndex: 2 }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>EXCLUSIVE GATHERING</span>
                  <h3 style={{ fontSize: '1.4rem', margin: '2px 0 0 0', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Summer Rooftop Mixer</h3>
                </div>
                
                {/* Decorative mesh circle */}
                <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', top: '-50px', right: '-50px', zIndex: 1 }}></div>
              </div>

              {/* Event Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--color-text)', borderBottom: '1px dashed var(--color-border)', paddingBottom: '20px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary)' }} /> 
                  <span style={{ fontWeight: 500 }}>Penthouse Lounge, New York</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <span><strong>64 Guests Attending</strong> <span style={{ color: 'var(--color-text-muted)' }}>(Capacity 100)</span></span>
                </div>
              </div>

              {/* Barcode/Scan Simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Mock Barcode lines */}
                <div style={{ display: 'flex', gap: '2px', height: '36px', width: '80%', background: '#1d1d1f', opacity: 0.85, mask: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 6px)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TICKET ID: #MIX-0815</span>
                  <Button variant="primary" style={{ padding: '8px 20px', fontSize: '0.85rem', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }}>RSVP Now</Button>
                </div>
              </div>
            </div>

            {/* Float badge 1 */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-16px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text)',
              zIndex: 3
            }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} /> Double-Channel OTP Verified
            </div>
            
            {/* Float badge 2 */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '-28px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text)',
              zIndex: 3
            }}>
              <QrCode size={14} style={{ color: 'var(--color-accent)' }} /> Smart Wallet QR Passes
            </div>
          </div>
        </section>

        {/* Event Discovery Section */}
        <section id="discover" style={{ padding: 'var(--spacing-2xl) 0', borderTop: '1px solid var(--color-border)', background: '#ffffff' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>Find gatherings. Share links.</h2>
              <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '560px' }}>Search and explore upcoming verified events in the directory.</p>
            </div>

            {/* Spotlight Search & Filter bar */}
            <div style={{ 
              display: 'flex', 
              gap: '14px', 
              marginBottom: 'var(--spacing-xl)', 
              flexWrap: 'wrap', 
              alignItems: 'center',
              background: 'var(--color-bg)',
              padding: '12px',
              borderRadius: '24px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Spotlight search events by title, venue, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 46px', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontFamily: 'inherit', 
                    fontSize: '0.95rem', 
                    outline: 'none',
                    background: 'white',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
              </div>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  fontFamily: 'inherit', 
                  fontSize: '0.95rem', 
                  background: 'white', 
                  minWidth: '200px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Regions</option>
                {['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Massachusetts', 'Washington', 'Colorado', 'Georgia', 'Arizona'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Event Cards Grid */}
            {(() => {
              const filtered = events.filter(evt => {
                const q = searchQuery.toLowerCase();
                const matchesSearch = !q || evt.title.toLowerCase().includes(q) || evt.location.toLowerCase().includes(q) || evt.date.includes(q);
                const matchesState = !filterState || evt.location.toLowerCase().includes(filterState.toLowerCase());
                return matchesSearch && matchesState;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0' }}>
                    <p style={{ fontSize: '1.1rem' }}>No public events match your search.</p>
                    <Link to="/login?signup=true" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                      Host one yourself <ArrowUpRight size={16} />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="grid-3" style={{ gap: '24px' }}>
                  {filtered.map(evt => {
                    const themes = {
                      'mesh-gradient-sunset': 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)',
                      'mesh-gradient-ocean': 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      'mesh-gradient-forest': 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
                      'mesh-gradient-midnight': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    };
                    const spotsLeft = evt.capacity - (mockStore.getRSVPs(evt.id).filter(r => r.status === 'going' || r.status === 'maybe').length);
                    return (
                      <div key={evt.id} style={{ 
                        background: 'var(--color-surface)', 
                        borderRadius: '24px', 
                        border: '1px solid var(--color-border)', 
                        overflow: 'hidden', 
                        boxShadow: 'var(--shadow-md)', 
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                        display: 'flex', 
                        flexDirection: 'column' 
                      }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'translateY(-6px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                      >
                        <div style={{ height: '160px', background: evt.cover ? `url(${evt.cover}) center/cover` : (themes[evt.theme] || themes['mesh-gradient-sunset']), position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', color: 'var(--color-text)', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{evt.eventType}</div>
                          {spotsLeft <= 10 && spotsLeft > 0 && (
                            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(249,115,22,0.95)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>Only {spotsLeft} left!</div>
                          )}
                          {spotsLeft <= 0 && (
                            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239,68,68,0.95)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>SOLD OUT</div>
                          )}
                        </div>
                        
                        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.01em', color: 'var(--color-text)' }}>{evt.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {evt.location.split(',')[0]}</p>
                          </div>
                          
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'var(--color-bg)', padding: '10px 14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} style={{ color: 'var(--color-primary)' }} /> {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {evt.time}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> {spotsLeft > 0 ? `${spotsLeft} spots available` : 'Roster is full'}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                            {evt.enablePayments ? (
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a' }}>${evt.ticketPrice} USD</span>
                            ) : (
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)', padding: '3px 8px', borderRadius: '6px' }}>FREE</span>
                            )}
                            
                            <Link to={`/e/${evt.id}`}>
                              <button style={{ 
                                padding: '8px 20px', 
                                background: spotsLeft > 0 ? 'var(--color-primary)' : 'var(--color-bg)', 
                                color: spotsLeft > 0 ? 'white' : 'var(--color-text-muted)', 
                                border: 'none', 
                                borderRadius: 'var(--radius-full)', 
                                fontWeight: 600, 
                                cursor: spotsLeft > 0 ? 'pointer' : 'default', 
                                fontSize: '0.85rem', 
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {spotsLeft > 0 ? <>View Invite <ArrowRight size={14} /></> : 'Full'}
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{ padding: 'var(--spacing-2xl) 0', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>Simplifying event coordination</h2>
              <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '520px' }}>SafalEvents automates your logistics so you can focus on your guests.</p>
            </div>
            
            <div className="grid-3" style={{ gap: '24px' }}>
              {[
                { icon: <CalendarPlus size={24} />, title: "1. Build Your Invite Page", desc: "Input date, venue capacity rules, and custom questions. View instant layouts in the side-by-side live editor." },
                { icon: <Share2 size={24} />, title: "2. Dispatch Smart Code Link", desc: "Guests register with a simple verification code. Returning attendees bypass verify checks automatically." },
                { icon: <Users size={24} />, title: "3. Check-in & Reminders", desc: "Automate offset reminders (24h/3h before), message rosters, download CSVs, and verify entries at the gate." }
              ].map((feature, idx) => (
                <div key={idx} style={{ 
                  padding: '32px 24px', 
                  borderRadius: '24px', 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px', 
                  background: '#ffffff', 
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ 
                    width: '52px', height: '52px', 
                    background: 'rgba(0, 113, 227, 0.08)', color: 'var(--color-primary)', 
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{feature.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights section */}
        <section id="features" style={{ background: '#ffffff', padding: 'var(--spacing-2xl) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container grid-2" style={{ alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', lineHeight: 1.1 }}>Powerful event utilities.<br />No spreadsheets required.</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem', margin: 0 }}>All dashboards, communications, and check-in tools coordinate seamlessly behind the scenes.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={14} /></div>
                  <span style={{ fontWeight: 500 }}>High-aesthetic custom cover templates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={14} /></div>
                  <span style={{ fontWeight: 500 }}>Loginless guest flows with persistent token bypasses</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={14} /></div>
                  <span style={{ fontWeight: 500 }}>Configurable self-edit deadlines and cutoff policies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={14} /></div>
                  <span style={{ fontWeight: 500 }}>Multi-channel OTP service verification audit logging</span>
                </div>
              </div>
            </div>
            
            {/* iOS Widget Style Previews */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                padding: '24px', width: '200px', borderRadius: '24px', border: '1px solid var(--color-border)', 
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', 
                boxShadow: 'var(--shadow-md)' 
              }}>
                <LayoutDashboard size={24} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Host Console</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>Track conversion analytics, download CSV lists, and edit templates.</p>
              </div>
              <div style={{ 
                padding: '24px', width: '200px', borderRadius: '24px', border: '1px solid var(--color-border)', 
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', background: '#ffffff', 
                boxShadow: 'var(--shadow-md)' 
              }}>
                <QrCode size={24} style={{ color: 'var(--color-accent)' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>QR Check-in</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>Instant gateway scanning with verified SVG tickets at the door.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
