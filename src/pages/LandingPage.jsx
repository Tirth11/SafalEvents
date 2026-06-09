import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, Share2, Users, MapPin, Sparkles, LayoutDashboard, QrCode,
  ArrowRight, ShieldCheck, Zap, Heart, Check, Search, Filter, Calendar
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
        <section className="container grid-2" style={{ padding: 'var(--spacing-xl) 0', minHeight: '80vh', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(0, 113, 227, 0.08)', 
              color: 'var(--color-primary)', 
              padding: '6px 16px', 
              borderRadius: 'var(--radius-full)', 
              fontWeight: 600, 
              width: 'fit-content',
              fontSize: '0.85rem'
            }}>
              <Sparkles size={14} /> Modern Event RSVPs
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', 
              lineHeight: 1.1, 
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              color: 'var(--color-text)'
            }}>
              Host events. <br />
              Collect RSVPs. <span style={{ color: 'var(--color-primary)' }}>Easily.</span>
            </h1>
            
            <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '540px', margin: '8px 0' }}>
              Create a clean event page, share a single link, and see who’s coming — without spreadsheets or chaos.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              <Link to="/login?signup=true">
                <Button variant="primary" style={{ background: '#000000', color: '#ffffff', padding: '14px 28px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Become a Host <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/e/1">
                <Button variant="outline" style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '14px 28px', fontSize: '1rem' }}>
                  View Sample Event
                </Button>
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', opacity: 0.9 }}>
              <div style={{ display: 'flex', marginLeft: '6px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: '#1e293b', 
                      border: '2px solid var(--color-bg)', 
                      marginLeft: i > 1 ? '-10px' : 0, 
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 22})`, 
                      backgroundSize: 'cover' 
                    }}
                  />
                ))}
              </div>
              <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                Trusted by <strong>10,000+</strong> hosts and event planners
              </span>
            </div>
          </div>
          
          {/* Visual Mockup - Custom stacked Event Cards */}
          <div className="animate-fade-in animate-delay-1" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, transparent 70%)', zIndex: -1 }}></div>
            
            <div style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg) rotateZ(-2deg)',
              transition: 'transform var(--transition-normal)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) rotateZ(0deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(4deg) rotateZ(-2deg)'}
            >
              {/* Event Cover Image Mock */}
              <div style={{
                height: '160px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
                color: 'white',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(29, 29, 31, 0.7)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  August 15
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '4px' }}>Tech Mixer</span>
                  <h3 style={{ fontSize: '1.25rem', margin: '4px 0 0 0', fontWeight: 600, color: 'white' }}>Summer Rooftop Networking</h3>
                </div>
              </div>

              {/* Event Details mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px dashed var(--color-border)', paddingBottom: '16px', marginBottom: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '8px' }}><MapPin size={16} /> Penthouse Lounge, New York</div>
                <div style={{ display: 'flex', gap: '8px' }}><Users size={16} /> 64 Attending (Capacity: 100)</div>
              </div>

              {/* Interactive RSVP Mock form */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>RSVP Status: Open</span>
                </div>
                <Button variant="primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>RSVP Now</Button>
              </div>
            </div>

            {/* Float badge 1 */}
            <div style={{
              position: 'absolute',
              top: '-16px',
              right: '-12px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text)'
            }}>
              <ShieldCheck size={14} style={{ color: '#22c55e' }} /> OTP Verified Details
            </div>
            
            {/* Float badge 2 */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '-24px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text)'
            }}>
              <QrCode size={14} style={{ color: 'var(--color-primary)' }} /> Mobile Ticket QR
            </div>
          </div>
        </section>

        {/* Event Discovery Section */}
        <section id="discover" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '8px', fontWeight: 600 }}>Discover Events Near You</h2>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>Search public events by name, date, or location.</p>
            </div>

            {/* Search + Filter bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search events by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '0.95rem', background: 'white', minWidth: '180px' }}
              >
                <option value="">All States</option>
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
                    <p>No public events found. Try a different search or <Link to="/login?signup=true" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>host your own event</Link>.</p>
                  </div>
                );
              }

              return (
                <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                  {filtered.map(evt => {
                    const themes = {
                      'mesh-gradient-sunset': 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)',
                      'mesh-gradient-ocean': 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      'mesh-gradient-forest': 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
                      'mesh-gradient-midnight': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    };
                    const spotsLeft = evt.capacity - (mockStore.getRSVPs(evt.id).filter(r => r.status === 'going' || r.status === 'maybe').length);
                    return (
                      <div key={evt.id} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ height: '140px', background: evt.cover ? `url(${evt.cover}) center/cover` : (themes[evt.theme] || themes['mesh-gradient-sunset']), position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{evt.eventType}</div>
                          {spotsLeft <= 10 && spotsLeft > 0 && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(249,115,22,0.9)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>Only {spotsLeft} left!</div>
                          )}
                          {spotsLeft <= 0 && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239,68,68,0.9)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>SOLD OUT</div>
                          )}
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{evt.title}</h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {evt.time}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> {evt.location}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={13} /> {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Full capacity'} of {evt.capacity}</span>
                          </div>
                          {evt.enablePayments ? (
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>Ticket: ${evt.ticketPrice} per person</div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>Free Event</div>
                          )}
                          <Link to={`/e/${evt.id}`} style={{ marginTop: 'auto' }}>
                            <button style={{ width: '100%', padding: '10px', background: spotsLeft > 0 ? 'var(--color-primary)' : '#e2e8f0', color: spotsLeft > 0 ? 'white' : 'var(--color-text-muted)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: spotsLeft > 0 ? 'pointer' : 'not-allowed', fontSize: '0.9rem', transition: 'background 0.2s' }}>
                              {spotsLeft > 0 ? 'View & RSVP' : 'Fully Booked'}
                            </button>
                          </Link>
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
        <section id="how-it-works" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>How it works</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Three simple steps to planning and filling your rooms.</p>
          </div>
          
          <div className="container grid-3" style={{ gap: 'var(--spacing-md)' }}>
            {[
              { icon: <CalendarPlus size={28} />, title: "1. Create Invitation", desc: "Define details, themes, and configure notification settings in our split-screen live preview builder." },
              { icon: <Share2 size={28} />, title: "2. Dispatch Universal Link", desc: "Share one smart link via WhatsApp, SMS, or email. Returning guests skip OTP verification dynamically." },
              { icon: <Users size={28} />, title: "3. Monitor & Check-in", desc: "Manage waitlists, export CSV rosters, edit details, and run simulated offset reminder broadcasts." }
            ].map((feature, idx) => (
              <Card key={idx} style={{ padding: 'var(--spacing-md)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
                <div style={{ 
                  width: '60px', height: '60px', margin: '0 auto', 
                  background: 'rgba(0,113,227,0.08)', color: 'var(--color-primary)', 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>{feature.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Dynamic Stripe section */}
        <section id="features" style={{ background: '#f9fafb', padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container grid-2" style={{ alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Everything you need.<br /><span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Nothing you don't.</span></h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px', borderRadius: '50%' }}><Check size={14} /></div>
                  Visual event invitation templates that wow guests
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px', borderRadius: '50%' }}><Check size={14} /></div>
                  Same-code multi-channel OTP verification (Email + SMS)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px', borderRadius: '50%' }}><Check size={14} /></div>
                  Self-edit and cancellation cutoff rules for guests
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px', borderRadius: '50%' }}><Check size={14} /></div>
                  Simulated cron reminders scheduler simulator
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Card style={{ padding: '24px', width: '180px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
                <LayoutDashboard size={28} style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Host Console</h4>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Rosters &amp; Logs</p>
              </Card>
              <Card style={{ padding: '24px', width: '180px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
                <QrCode size={28} style={{ color: 'var(--color-accent)', margin: '0 auto' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>QR Check-in</h4>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Instant Entry</p>
              </Card>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
