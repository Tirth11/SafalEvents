import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus, Share2, Users, MapPin, Sparkles, LayoutDashboard, QrCode,
  ArrowRight, ShieldCheck, Zap, Heart, Check, Search, Filter, Calendar, ArrowUpRight, CheckCircle2, Star
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { mockStore } from '../utils/mockStore';

export default function LandingPage() {
  const [events, setEvents] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterState, setFilterState] = React.useState('');
  const [filterCity, setFilterCity] = React.useState('');
  const [simulatedState, setSimulatedState] = React.useState('NY');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Animated headline typing phrases
  const phrases = ["move you", "inspire you", "bring you joy", "connect you"];
  const [phraseIdx, setPhraseIdx] = React.useState(0);

  // Live ticking bookings counter (Blinkit style social proof)
  const [bookingsCount, setBookingsCount] = React.useState(2847);

  React.useEffect(() => {
    setEvents(mockStore.getEvents().filter(e => e.status === 'Published' && e.privacy === 'Public'));

    // Rotate hero phrase
    const phraseInterval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % phrases.length);
    }, 2500);

    // Live bookings increments
    const bookingsInterval = setInterval(() => {
      setBookingsCount(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 4500);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(bookingsInterval);
    };
  }, []);

  const categories = [
    { id: 'All', name: 'All Gatherings', icon: '✨' },
    { id: 'Party', name: 'Parties & Mixers', icon: '🎉' },
    { id: 'Meetup', name: 'Tech & Startups', icon: '💻' },
    { id: 'Fitness', name: 'Yoga & Health', icon: '🧘' },
    { id: 'Comedy', name: 'Comedy Shows', icon: '🎭' }
  ];

  const collections = [
    {
      id: 'comedy',
      title: 'Comedy Nights',
      desc: 'Stand-up & improv. Get ready to laugh.',
      cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=600&q=80',
      icon: '🎭',
      category: 'Comedy',
      avatarImgs: ['25', '26', '27']
    },
    {
      id: 'music',
      title: 'Concerts & DJs',
      desc: 'High-fidelity audio & live beats.',
      cover: 'https://images.unsplash.com/photo-1533174000243-cb84210f443b?auto=format&fit=crop&w=600&q=80',
      icon: '🎵',
      category: 'Party',
      avatarImgs: ['11', '12', '13']
    },
    {
      id: 'food',
      title: 'Wine & Dine',
      desc: 'Chef mixers & elegant tastings.',
      cover: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
      icon: '🍷',
      category: 'Food',
      avatarImgs: ['31', '32', '33']
    }
  ];

  const handleSelectCollection = (cat) => {
    setSelectedCategory(cat);
    // Scroll smoothly to discover section
    const discoverSection = document.getElementById('discover');
    if (discoverSection) {
      discoverSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trendingSearches = ["Mixer", "Startup", "Yoga", "Comedy"];

  return (
    <PageShell>
      <div className="mesh-bg" style={{ overflow: 'hidden' }}>
        
        {/* --- HERO SECTION --- */}
        <section className="container" style={{ padding: 'var(--spacing-xl) 0 var(--spacing-lg) 0', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            
            {/* Hero Left Content */}
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              
              {/* Location Selector Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: 'rgba(255, 107, 53, 0.08)', 
                  color: 'var(--color-primary)', 
                  padding: '6px 14px', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 700, 
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ animation: 'pulse-glow 1.5s infinite' }}>📍</span> EVENTS IN {simulatedState}
                </span>
                
                <select
                  value={simulatedState}
                  onChange={(e) => setSimulatedState(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '2px 4px'
                  }}
                >
                  <option value="NY">New York (NY)</option>
                  <option value="CA">California (CA)</option>
                  <option value="MA">Massachusetts (MA)</option>
                </select>
              </div>
              
              {/* Typography with animated text */}
              <h1 style={{ 
                fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)', 
                lineHeight: 1.05, 
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.04em',
                color: 'var(--color-text)'
              }}>
                Discover events<br />
                that <span className="text-gradient" style={{ transition: 'opacity 0.3s ease-in-out' }}>{phrases[phraseIdx]}</span>.
              </h1>
              
              <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '520px', lineHeight: '1.5', margin: '4px 0' }}>
                Create beautiful invite pages, claim Apple-style ticket passes, and coordinate guest check-ins. Simple, gorgeous, and lightning-fast.
              </p>
              
              {/* Spotlight Search Bar */}
              <div style={{ position: 'relative', maxWidth: '540px', marginTop: '8px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'white', 
                  borderRadius: '20px', 
                  border: '1.5px solid var(--color-border)', 
                  padding: '6px 6px 6px 16px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'border-color 0.2s'
                }}
                  onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <Search size={20} style={{ color: 'var(--color-text-muted)', marginRight: '10px' }} />
                  <input
                    type="text"
                    placeholder="Search events, comedy, mixers, dates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      background: 'none', 
                      fontSize: '0.95rem', 
                      fontFamily: 'inherit',
                      outline: 'none',
                      padding: '8px 0',
                      color: 'var(--color-text)'
                    }}
                  />
                  <Button 
                    onClick={() => {
                      const disc = document.getElementById('discover');
                      if (disc) disc.scrollIntoView({ behavior: 'smooth' });
                    }}
                    variant="primary" 
                    style={{ borderRadius: '14px', padding: '10px 20px', fontSize: '0.85rem' }}
                  >
                    Search
                  </Button>
                </div>

                {/* Search suggestion tags */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
                  <span className="text-muted">Trending:</span>
                  {trendingSearches.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      style={{ background: 'rgba(0,0,0,0.04)', border: 'none', borderRadius: '6px', padding: '4px 8px', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                <Link to="/login?signup=true">
                  <Button variant="primary" style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(255, 107, 53, 0.2)' }}>
                    Become a Host <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/e/1">
                  <Button variant="outline" style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: 'white' }}>
                    View Live Preview
                  </Button>
                </Link>
              </div>

              {/* Stats Counters (Blinkit style) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', maxWidth: '440px' }}>
                <div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>2,400+</h4>
                  <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Events This Week</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>150+</h4>
                  <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Cities Covered</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-accent)' }}>1M+</h4>
                  <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Happy Guests</span>
                </div>
              </div>

            </div>
            
            {/* Hero Right Visual: Apple Wallet Ticket mockup */}
            <div className="animate-fade-in animate-delay-1" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 65%)', zIndex: -1, top: '-10%' }}></div>
              
              <div style={{
                width: '100%',
                maxWidth: '380px',
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
                  height: '170px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #d84b15 100%)',
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
                  <div style={{ display: 'flex', justifyContainer: 'space-between', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>SE</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>SAFAL PASS</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>FRI 10 JUL</span>
                  </div>
                  
                  <div style={{ zIndex: 2 }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>🎭 COMEDY SHOWCASE</span>
                    <h3 style={{ fontSize: '1.35rem', margin: '2px 0 0 0', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Stand-up Comedy Night</h3>
                  </div>
                  
                  {/* Decorative mesh circle */}
                  <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', top: '-50px', right: '-50px', zIndex: 1 }}></div>
                </div>

                {/* Event Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--color-text)', borderBottom: '1px dashed var(--color-border)', paddingBottom: '20px', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={16} style={{ color: 'var(--color-primary)' }} /> 
                    <span style={{ fontWeight: 600 }}>The Comedy Club, Manhattan, NY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} style={{ color: 'var(--color-accent)' }} />
                    <span><strong>68 Guests Booked</strong> <span style={{ color: 'var(--color-text-muted)' }}>(Capacity 80)</span></span>
                  </div>
                </div>

                {/* Barcode & Scan */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px', height: '36px', width: '80%', background: '#1d1d1f', opacity: 0.85, mask: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 6px)', WebkitMask: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 6px)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>PASS CODE: #SE-COM-0710</span>
                    <Link to="/e/5?rsvp=true">
                      <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '12px' }}>Book Ticket ⚡</Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Overlays floating badges */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-16px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text)',
                zIndex: 3
              }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-accent)' }} /> Dual-Channel OTP Secure
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '-28px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-text)',
                zIndex: 3
              }}>
                <QrCode size={14} style={{ color: 'var(--color-primary)' }} /> Live-Scanner QR Checkins
              </div>
            </div>

          </div>
        </section>

        {/* --- URGENCY SOCIAL PROOF TICKER (Blinkit style) --- */}
        <section style={{ background: 'var(--color-text)', color: 'white', padding: '12px 0', borderTop: '1px solid #2d2d2d', borderBottom: '1px solid #2d2d2d' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-primary)' }}>⚡</span>
              <span>Blinkit speed RSVP guarantee: Register and claim tickets in under 2 minutes.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--color-accent)', borderRadius: '50%', marginRight: '4px', animation: 'pulse-glow 1s infinite' }}></span>
              <span>{bookingsCount} spots claimed today in {simulatedState}</span>
            </div>
          </div>
        </section>

        {/* --- CURATED COLLECTIONS (Zomato style) --- */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>Curated Collections</h2>
              <p className="text-muted" style={{ fontSize: '0.95rem' }}>Explore events by mood, theme, or group dynamics. Curated weekly.</p>
            </div>

            <div className="grid-3" style={{ gap: '20px' }}>
              {collections.map(col => (
                <div 
                  key={col.id} 
                  className="collection-card card-hover-lift"
                  onClick={() => handleSelectCollection(col.category)}
                >
                  <img src={col.cover} alt={col.title} className="collection-card-img" />
                  <div className="collection-card-overlay"></div>
                  
                  {/* Floating Attendees Overlapping Stack */}
                  <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', zIndex: 4 }}>
                    {col.avatarImgs.map((imgId, idx) => (
                      <div 
                        key={idx}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundImage: `url(https://i.pravatar.cc/100?img=${imgId})`,
                          backgroundSize: 'cover',
                          border: '2px solid white',
                          marginLeft: idx > 0 ? '-8px' : 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                      />
                    ))}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      marginLeft: '-8px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}>+50</div>
                  </div>

                  <div className="collection-card-content">
                    <span style={{ fontSize: '1.5rem', marginBottom: '6px', display: 'block' }}>{col.icon}</span>
                    <h3>{col.title}</h3>
                    <p>{col.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '10px' }}>
                      Explore Collection <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- EVENT DISCOVERY GRID (District style) --- */}
        <section id="discover" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <div className="container">
            
            {/* Header + Simulated location banner info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>🔥 Happening Near You</h2>
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Top-rated gatherings sorted by local proximity and simulated location.</p>
              </div>

              {/* State & City Filter Controls */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="">All States</option>
                  <option value="NY">New York (NY)</option>
                  <option value="CA">California (CA)</option>
                  <option value="MA">Massachusetts (MA)</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    outline: 'none',
                    width: '150px'
                  }}
                />
              </div>
            </div>

            {/* Horizontal scrolling Categories Ribbon */}
            <div className="scrollbar-hidden" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            {(() => {
              const filtered = events
                .filter(evt => {
                  const q = searchQuery.toLowerCase();
                  const matchesSearch = !q || evt.title.toLowerCase().includes(q) || evt.location.toLowerCase().includes(q) || evt.date.includes(q) || (evt.eventType && evt.eventType.toLowerCase().includes(q));
                  const matchesState = !filterState || evt.state === filterState;
                  const matchesCity = !filterCity || (evt.city && evt.city.toLowerCase().includes(filterCity.toLowerCase()));
                  const matchesCategory = selectedCategory === 'All' || evt.eventType === selectedCategory;
                  return matchesSearch && matchesState && matchesCity && matchesCategory;
                })
                .sort((a, b) => {
                  const aLocal = a.state === simulatedState;
                  const bLocal = b.state === simulatedState;
                  if (aLocal && !bLocal) return -1;
                  if (!aLocal && bLocal) return 1;
                  return 0;
                });

              if (filtered.length === 0) {
                return (
                  <div className="text-center text-muted" style={{ padding: 'var(--spacing-xl) 0', background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No public events match your filters.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try switching categories or expanding your location settings.</p>
                    <Link to="/login?signup=true" style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                      Host an event yourself <ArrowUpRight size={16} />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="grid-3" style={{ gap: '24px' }}>
                  {filtered.map(evt => {
                    const rsvpList = mockStore.getRSVPs(evt.id).filter(r => r.status === 'going' || r.status === 'maybe');
                    const totalAttending = rsvpList.length;
                    const spotsLeft = evt.capacity - totalAttending;
                    
                    // District-style badges logic
                    const badge = spotsLeft <= 0 ? (
                      <span className="district-badge district-badge-closed">SOLD OUT</span>
                    ) : evt.id === '1' ? (
                      <span className="district-badge district-badge-live">LIVE NOW</span>
                    ) : spotsLeft <= 15 ? (
                      <span className="district-badge district-badge-filling">{spotsLeft} SPOTS LEFT</span>
                    ) : (
                      <span className="district-badge district-badge-trending">TRENDING</span>
                    );

                    return (
                      <div 
                        key={evt.id} 
                        className="card-hover-lift"
                        style={{ 
                          background: 'white', 
                          borderRadius: '24px', 
                          border: '1.5px solid var(--color-border)', 
                          overflow: 'hidden', 
                          boxShadow: 'var(--shadow-sm)', 
                          display: 'flex', 
                          flexDirection: 'column' 
                        }}
                      >
                        {/* Cover Image Container */}
                        <div className="zoom-image-container" style={{ height: '180px' }}>
                          {badge}
                          
                          <img 
                            src={evt.cover || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'} 
                            alt={evt.title} 
                            className="zoom-image-hover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Card Content Details */}
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                          
                          {/* Rating & Proximity Row (District-style) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                              <span>{evt.rating || '4.8'}</span>
                            </div>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>({evt.reviewsCount || '120'})</span>
                            <span style={{ color: 'var(--color-border)' }}>•</span>
                            <span style={{ color: 'var(--color-primary)' }}>{evt.distance || '2.3'} km away</span>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.01em', color: 'var(--color-text)' }}>{evt.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} /> 
                              {evt.location.split(',')[0]}
                            </p>
                          </div>
                          
                          {/* Event date details */}
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '10px 14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-text)' }}>
                              <Calendar size={14} style={{ color: 'var(--color-primary)' }} /> 
                              {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {evt.time}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={14} style={{ color: 'var(--color-text-muted)' }} /> 
                              {spotsLeft > 0 ? `${spotsLeft} spots left (capacity ${evt.capacity})` : 'Sold Out'}
                            </span>
                          </div>
                          
                          {/* Ticket pricing & Fast Action button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                            {evt.enablePayments ? (
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#00C853' }}>${evt.ticketPrice} USD</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00C853', background: 'rgba(0, 200, 83, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>FREE</span>
                            )}
                            
                            <Link to={`/e/${evt.id}${spotsLeft > 0 ? '?rsvp=true' : ''}`}>
                              <Button 
                                variant={spotsLeft > 0 ? 'primary' : 'ghost'} 
                                style={{ 
                                  padding: '8px 18px', 
                                  fontSize: '0.8rem', 
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {spotsLeft > 0 ? <>Quick RSVP ⚡</> : 'Full Invite'}
                              </Button>
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

        {/* --- HOW IT WORKS (Blinkit simplicity) --- */}
        <section id="how-it-works" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', background: 'white' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>Book in 3 simple steps</h2>
              <p className="text-muted" style={{ fontSize: '1.05rem', maxWidth: '520px' }}>SafalEvents eliminates friction. No passwords or heavy setups needed.</p>
            </div>
            
            <div className="grid-3" style={{ gap: '24px' }}>
              {[
                { 
                  icon: <Search size={22} />, 
                  title: "1. Find Your Event", 
                  desc: "Browse high-visual gatherings happening nearby. Filter by simulated proximity or specific genres.",
                  bg: 'rgba(255, 107, 53, 0.04)',
                  color: 'var(--color-primary)'
                },
                { 
                  icon: <Zap size={22} />, 
                  title: "2. One-Click RSVP", 
                  desc: "Register in under 2 minutes. Authenticate instantly using a secure email/SMS verification code.",
                  bg: 'rgba(0, 200, 83, 0.04)',
                  color: 'var(--color-accent)'
                },
                { 
                  icon: <QrCode size={22} />, 
                  title: "3. Access Instantly", 
                  desc: "Receive an Apple-style ticket pass containing a live QR check-in code directly to your email.",
                  bg: 'rgba(124, 58, 237, 0.04)',
                  color: '#7c3aed'
                }
              ].map((step, idx) => (
                <div key={idx} style={{ 
                  padding: '28px', 
                  borderRadius: '20px', 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  background: 'white', 
                  border: '1.5px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.3s'
                }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    width: '46px', height: '46px', 
                    background: step.bg, color: step.color, 
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{step.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PREMIUM UTILITIES HIGHLIGHTS --- */}
        <section id="features" style={{ background: 'var(--color-bg)', padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container grid-2" style={{ alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', lineHeight: 1.15 }}>Powerful event logistics.<br />Beautiful guest invitations.</h2>
              <p className="text-muted" style={{ fontSize: '1.05rem', margin: 0 }}>All dashboards, communications, and check-in tools coordinate seamlessly behind the scenes.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={12} /></div>
                  <span style={{ fontWeight: 600 }}>High-aesthetic curated collection themes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={12} /></div>
                  <span style={{ fontWeight: 600 }}>Loginless guest flows with persistent token bypasses</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={12} /></div>
                  <span style={{ fontWeight: 600 }}>Configurable self-edit deadlines and cutoff policies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--color-primary)', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><Check size={12} /></div>
                  <span style={{ fontWeight: 600 }}>Multi-channel OTP verification audit logging</span>
                </div>
              </div>
            </div>
            
            {/* Widget Previews */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ 
                padding: '24px', width: '200px', borderRadius: '24px', border: '1px solid var(--color-border)', 
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', 
                boxShadow: 'var(--shadow-md)' 
              }}>
                <LayoutDashboard size={24} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 750 }}>Host Console</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>Track conversion analytics, download CSV lists, and edit templates.</p>
              </div>
              <div style={{ 
                padding: '24px', width: '200px', borderRadius: '24px', border: '1px solid var(--color-border)', 
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', background: '#ffffff', 
                boxShadow: 'var(--shadow-md)' 
              }}>
                <QrCode size={24} style={{ color: 'var(--color-accent)' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 750 }}>QR Check-in</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>Instant gateway scanning with verified SVG tickets at the door.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
