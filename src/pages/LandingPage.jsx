import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MapPin, Sparkles, ArrowRight, Shield, Zap, Heart, Search, Calendar,
  Star, CheckCircle, Ticket, TrendingUp, Award, Clock, Globe
} from 'lucide-react';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import { mockStore } from '../utils/mockStore';
import { HERO_IMAGES, AVATARS, getEventCover, getAvatar } from '../utils/images';

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
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
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

  const scrollToDiscover = () => {
    const disc = document.getElementById('discover');
    if (disc) disc.scrollIntoView({ behavior: 'smooth' });
  };

  const trendingSearches = ["Mixer", "Startup", "Yoga", "Comedy"];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Hosted 14 mixers',
      quote: 'I set up my launch party page in five minutes and the QR check-ins made the door line vanish. Guests kept asking what app we used.',
      seed: 'priya.sharma'
    },
    {
      name: 'Marcus Lee',
      role: 'Comedy night regular',
      quote: 'The Apple-style ticket pass is gorgeous. One tap to RSVP, no passwords, and my pass just lives in my email. Booking takes seconds.',
      seed: 'marcus.lee'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Yoga community host',
      quote: 'Capacity tracking and self-edit deadlines saved me hours of back-and-forth. SafalEvents feels like it was built by people who actually host.',
      seed: 'elena.rodriguez'
    }
  ];

  return (
    <PageShell>
      <div style={{ overflow: 'hidden', background: 'var(--color-bg)' }}>

        {/* ───────── HERO: full-bleed photo with dark overlay ───────── */}
        <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <img
            src={HERO_IMAGES.landing}
            alt="Confetti celebration at a live event"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
          />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to right, rgba(10, 10, 16, 0.88) 0%, rgba(10, 10, 16, 0.72) 45%, rgba(10, 10, 16, 0.35) 100%)'
          }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 3, padding: 'var(--spacing-xl) var(--spacing-md)', width: '100%' }}>
            <div className="animate-fade-in" style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }}>

              {/* Location pill + state switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255, 107, 53, 0.18)', border: '1px solid rgba(255, 107, 53, 0.45)',
                  color: '#ffb699', padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.6px', backdropFilter: 'blur(6px)'
                }}>
                  <MapPin size={13} /> EVENTS IN {simulatedState}
                </span>
                <select
                  value={simulatedState}
                  onChange={(e) => setSimulatedState(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    outline: 'none', padding: '6px 10px', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(6px)'
                  }}
                >
                  <option value="NY" style={{ color: '#1d1d1f' }}>New York (NY)</option>
                  <option value="CA" style={{ color: '#1d1d1f' }}>California (CA)</option>
                  <option value="MA" style={{ color: '#1d1d1f' }}>Massachusetts (MA)</option>
                </select>
              </div>

              {/* Headline with rotating phrase */}
              <h1 style={{
                fontSize: 'clamp(2.6rem, 6vw, 4.6rem)', lineHeight: 1.04, fontWeight: 800,
                fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em', color: 'white', margin: 0
              }}>
                Discover events<br />
                that <span className="text-gradient" style={{ transition: 'opacity 0.3s ease-in-out' }}>{phrases[phraseIdx]}</span>.
              </h1>

              <p style={{ fontSize: '1.15rem', maxWidth: '540px', lineHeight: 1.55, margin: 0, color: 'rgba(255,255,255,0.85)' }}>
                Create beautiful invite pages, claim Apple-style ticket passes, and coordinate guest check-ins. Simple, gorgeous, and lightning-fast.
              </p>

              {/* Spotlight search bar */}
              <div style={{ maxWidth: '560px', width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', background: 'white',
                  borderRadius: '18px', padding: '6px 6px 6px 16px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)', transition: 'box-shadow 0.2s'
                }}>
                  <Search size={20} style={{ color: 'var(--color-text-muted)', marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search events, comedy, mixers, dates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1, border: 'none', background: 'none', fontSize: '0.95rem',
                      fontFamily: 'inherit', outline: 'none', padding: '10px 0', color: 'var(--color-text)', minWidth: 0
                    }}
                  />
                  <Button
                    onClick={scrollToDiscover}
                    variant="primary"
                    style={{ borderRadius: '13px', padding: '11px 22px', fontSize: '0.85rem', flexShrink: 0 }}
                  >
                    Search
                  </Button>
                </div>

                {/* Trending tags */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Trending:</span>
                  {trendingSearches.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      style={{
                        background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px', padding: '4px 10px', fontWeight: 600, cursor: 'pointer',
                        color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                <Button
                  variant="primary"
                  onClick={scrollToDiscover}
                  style={{
                    padding: '15px 30px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 10px 28px rgba(255, 107, 53, 0.4)'
                  }}
                >
                  Explore events <ArrowRight size={18} />
                </Button>
                <Link to="/login?signup=true">
                  <Button
                    variant="outline"
                    style={{
                      padding: '15px 30px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.6)',
                      display: 'inline-flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <Sparkles size={16} /> Host an event
                  </Button>
                </Link>
                <Link to="/e/1" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  See a live event page
                </Link>
              </div>

              {/* Trust signals: avatar stack + rating + live ticker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar-stack">
                    {AVATARS.slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt={`Happy host ${i + 1}`} className="avatar-img avatar-sm" />
                    ))}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#fbbf24" stroke="#fbbf24" />
                      ))}
                      <span style={{ color: 'white', fontWeight: 800, fontSize: '0.8rem', marginLeft: '4px' }}>4.9</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', fontWeight: 600 }}>Trusted by 10,000+ hosts</span>
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(0, 200, 83, 0.16)', border: '1px solid rgba(0, 200, 83, 0.4)',
                  borderRadius: 'var(--radius-full)', padding: '8px 16px',
                  fontSize: '0.8rem', fontWeight: 700, color: '#7dffb0', backdropFilter: 'blur(6px)'
                }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--color-accent)', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }}></span>
                  {bookingsCount} spots claimed today in {simulatedState}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ───────── STATS STRIP ───────── */}
        <section style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: 'var(--spacing-md) 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: <Calendar size={20} />, tile: 'stat-icon-orange', value: '2,400+', label: 'Events this week' },
              { icon: <Globe size={20} />, tile: 'stat-icon-blue', value: '150+', label: 'Cities covered' },
              { icon: <Heart size={20} />, tile: 'stat-icon-red', value: '1M+', label: 'Happy guests' },
              { icon: <Zap size={20} />, tile: 'stat-icon-green', value: '< 2 min', label: 'Average RSVP time' }
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 4px', textAlign: 'left' }}>
                <div className={`stat-icon-tile ${s.tile}`}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>{s.value}</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── CURATED COLLECTIONS ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'white' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--spacing-md)', textAlign: 'left' }}>
              <div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px', letterSpacing: '-0.02em' }}>Curated Collections</h2>
                <p className="text-muted" style={{ fontSize: '0.95rem', margin: 0 }}>Explore events by mood, theme, or group dynamics. Curated weekly.</p>
              </div>
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} /> Fresh picks every Monday
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {collections.map(col => (
                <div
                  key={col.id}
                  className="collection-card card-hover-lift"
                  onClick={() => handleSelectCollection(col.category)}
                >
                  <img src={col.cover} alt={col.title} className="collection-card-img" />
                  <div className="collection-card-overlay"></div>

                  {/* Floating attendee avatar stack */}
                  <div className="avatar-stack" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 4 }}>
                    {col.avatarImgs.map((seed, idx) => (
                      <img key={idx} src={getAvatar(`${col.id}-${seed}`)} alt="Attendee" className="avatar-img avatar-sm" />
                    ))}
                    <div className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.6rem', background: 'var(--color-primary)' }}>+50</div>
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

        {/* ───────── EVENT DISCOVERY GRID ───────── */}
        <section id="discover" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <div className="container">

            {/* Header + filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px', letterSpacing: '-0.02em' }}>🔥 Happening Near You</h2>
                <p className="text-muted" style={{ fontSize: '0.95rem', margin: 0 }}>Top-rated gatherings sorted by local proximity and simulated location.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  style={{
                    background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px',
                    padding: '9px 12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    outline: 'none', boxShadow: 'var(--shadow-sm)'
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
                    background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px',
                    padding: '9px 12px', fontSize: '0.85rem', fontWeight: 500, outline: 'none',
                    width: '150px', boxShadow: 'var(--shadow-sm)'
                  }}
                />
              </div>
            </div>

            {/* Category pills */}
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

            {/* Cards grid */}
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
                  <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <img src={HERO_IMAGES.crowd} alt="People at an event" className="empty-state-img" />
                    <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>No public events match your filters.</p>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Try switching categories or expanding your location settings.</p>
                    <Link to="/login?signup=true" style={{ color: 'var(--color-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Host an event yourself <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                  {filtered.map(evt => {
                    const rsvpList = mockStore.getRSVPs(evt.id).filter(r => r.status === 'going' || r.status === 'maybe');
                    const totalAttending = rsvpList.length;
                    const spotsLeft = evt.capacity - totalAttending;
                    const evtDate = new Date(evt.date);

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
                      <div key={evt.id} className="event-photo-card">
                        {/* Cover image with badges */}
                        <div className="zoom-image-container" style={{ height: '190px', position: 'relative' }}>
                          {badge}
                          <img
                            src={getEventCover(evt)}
                            alt={evt.title}
                            className="zoom-image-hover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                          {/* Date badge */}
                          <div style={{
                            position: 'absolute', bottom: '12px', left: '12px', zIndex: 3,
                            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)',
                            borderRadius: '12px', padding: '6px 12px', textAlign: 'center',
                            boxShadow: 'var(--shadow-md)', lineHeight: 1.1
                          }}>
                            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {evtDate.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>
                              {evtDate.toLocaleDateString('en-US', { day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="event-photo-card-body" style={{ textAlign: 'left' }}>

                          {/* Rating & proximity */}
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
                            <h3 style={{ fontSize: '1.12rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.01em', color: 'var(--color-text)' }}>{evt.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                              {evt.location.split(',')[0]}
                            </p>
                          </div>

                          {/* Date & time row */}
                          <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '10px 14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-text)' }}>
                              <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                              {evtDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              <span style={{ color: 'var(--color-border)' }}>•</span>
                              <Clock size={14} style={{ color: 'var(--color-text-muted)' }} /> {evt.time}
                            </span>
                          </div>

                          {/* Attendee avatar stack */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {totalAttending > 0 ? (
                                <>
                                  <div className="avatar-stack">
                                    {rsvpList.slice(0, 3).map((r, i) => (
                                      <img key={i} src={getAvatar(r.email || r.name || `${evt.id}-${i}`)} alt={r.name || 'Guest'} className="avatar-img avatar-sm" />
                                    ))}
                                    {totalAttending > 3 && (
                                      <div className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.6rem' }}>+{totalAttending - 3}</div>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{totalAttending} going</span>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Sparkles size={13} /> Be the first to RSVP
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={13} /> {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
                            </span>
                          </div>

                          {/* Price + RSVP */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
                            {evt.enablePayments ? (
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-accent)' }}>${evt.ticketPrice} USD</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', background: 'rgba(0, 200, 83, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>FREE</span>
                            )}

                            <Link to={`/e/${evt.id}${spotsLeft > 0 ? '?rsvp=true' : ''}`}>
                              <Button
                                variant={spotsLeft > 0 ? 'primary' : 'ghost'}
                                style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                {spotsLeft > 0 ? <><Ticket size={14} /> Quick RSVP</> : 'Full Invite'}
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

        {/* ───────── HOW IT WORKS ───────── */}
        <section id="how-it-works" style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)', background: 'white' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={13} /> Friction-free by design
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', margin: 0 }}>Book in 3 simple steps</h2>
              <p className="text-muted" style={{ fontSize: '1.05rem', maxWidth: '520px', margin: 0 }}>SafalEvents eliminates friction. No passwords or heavy setups needed.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                {
                  icon: <Search size={22} />,
                  tile: 'stat-icon-orange',
                  step: 'STEP 1',
                  title: 'Find your event',
                  desc: 'Browse high-visual gatherings happening nearby. Filter by simulated proximity or specific genres.'
                },
                {
                  icon: <Zap size={22} />,
                  tile: 'stat-icon-green',
                  step: 'STEP 2',
                  title: 'One-click RSVP',
                  desc: 'Register in under 2 minutes. Authenticate instantly using a secure email/SMS verification code.'
                },
                {
                  icon: <Ticket size={22} />,
                  tile: 'stat-icon-purple',
                  step: 'STEP 3',
                  title: 'Access instantly',
                  desc: 'Receive an Apple-style ticket pass containing a live QR check-in code directly to your email.'
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`card-hover-lift animate-fade-in animate-delay-${idx + 1}`}
                  style={{
                    padding: '28px', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    background: 'var(--color-bg)', border: '1.5px solid var(--color-border)', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className={`stat-icon-tile ${step.tile}`}>{step.icon}</div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1.2px', color: 'var(--color-text-muted)' }}>{step.step}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800, color: 'var(--color-text)' }}>{step.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── WHY SAFALEVENTS: photo + feature band ───────── */}
        <section id="features" style={{ background: 'var(--color-bg)', padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--color-border)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: 'var(--spacing-xl)' }}>

            {/* Photo side */}
            <div style={{ position: 'relative' }}>
              <img
                src={HERO_IMAGES.hosting}
                alt="A host presenting on stage at a live event"
                style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', display: 'block' }}
                loading="lazy"
              />
              {/* Floating proof card */}
              <div className="glass-surface" style={{
                position: 'absolute', bottom: '-18px', left: '20px', right: 'auto',
                borderRadius: '16px', padding: '14px 18px', boxShadow: 'var(--shadow-lg)',
                display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.95)'
              }}>
                <div className="avatar-stack">
                  {AVATARS.slice(4, 7).map((src, i) => (
                    <img key={i} src={src} alt="Host" className="avatar-img avatar-sm" />
                  ))}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>10,000+ hosts onboard</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={11} fill="#fbbf24" stroke="#fbbf24" /> 4.9 average host rating
                  </div>
                </div>
              </div>
              {/* Floating badge top-right */}
              <div className="glass-surface" style={{
                position: 'absolute', top: '18px', right: '18px',
                borderRadius: '12px', padding: '10px 14px', fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.92)',
                boxShadow: 'var(--shadow-md)', color: 'var(--color-text)'
              }}>
                <Shield size={14} style={{ color: 'var(--color-accent)' }} /> Dual-channel OTP secure
              </div>
            </div>

            {/* Copy side */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <span className="badge badge-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={13} /> Why SafalEvents
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', lineHeight: 1.15, margin: 0 }}>
                Powerful event logistics.<br />Beautiful guest invitations.
              </h2>
              <p className="text-muted" style={{ fontSize: '1.05rem', margin: 0 }}>
                All dashboards, communications, and check-in tools coordinate seamlessly behind the scenes — so you can focus on the room, not the spreadsheet.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', marginTop: '6px' }}>
                {[
                  'High-aesthetic curated collection themes',
                  'Loginless guest flows with persistent token bypasses',
                  'Configurable self-edit deadlines and cutoff policies',
                  'Multi-channel OTP verification audit logging'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={20} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link to="/login?signup=true" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                <Button variant="primary" style={{ padding: '13px 26px', fontSize: '0.9rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Start hosting free <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ───────── TESTIMONIALS ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0', background: 'white', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={13} /> Loved by hosts & guests
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', margin: 0 }}>People keep coming back</h2>
              <p className="text-muted" style={{ fontSize: '1.05rem', maxWidth: '520px', margin: 0 }}>Real words from the community throwing (and attending) better gatherings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="card-hover-lift"
                  style={{
                    background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '26px', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--color-text)', margin: 0, fontStyle: 'italic' }}>
                    “{t.quote}”
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '6px' }}>
                    <img src={getAvatar(t.seed)} alt={t.name} className="avatar-img" />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FINAL CTA BANNER ───────── */}
        <section style={{ padding: '0 0 var(--spacing-xl) 0', background: 'white' }}>
          <div className="container">
            <div className="page-hero" style={{ minHeight: '320px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <img src={HERO_IMAGES.toast} alt="Friends toasting at a celebration" className="page-hero-img" />
              <div className="page-hero-overlay"></div>
              <div className="page-hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: 'var(--spacing-lg) var(--spacing-md)' }}>
                <div className="avatar-stack">
                  {AVATARS.slice(5, 9).map((src, i) => (
                    <img key={i} src={src} alt="Community member" className="avatar-img" />
                  ))}
                  <div className="avatar-stack-more">10k+</div>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
                  Ready to host something unforgettable?
                </h2>
                <p style={{ fontSize: '1.05rem', maxWidth: '520px', margin: 0 }}>
                  Spin up a stunning invite page, share one link, and watch the RSVPs roll in. Free to start — gorgeous by default.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
                  <Link to="/login?signup=true">
                    <Button variant="primary" style={{ padding: '15px 32px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 28px rgba(255, 107, 53, 0.4)' }}>
                      <Sparkles size={16} /> Create your event
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={scrollToDiscover}
                    style={{ padding: '15px 32px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.95)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Browse events <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
