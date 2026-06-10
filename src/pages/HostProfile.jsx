import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, ArrowLeft, ArrowUpRight, Mail, Phone, Star, BadgeCheck } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { getEventCover, getAvatar, HERO_IMAGES } from '../utils/images';
import PageShell from '../components/PageShell';
import Card from '../components/Card';
import Button from '../components/Button';

export default function HostProfile() {
  const { hostName } = useParams();
  const [events, setEvents] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(128); // seeded followers count

  const hostEmail = 'alex@safalevent.com';
  const hostPhone = '+1 (555) 999-8888';
  const hostBio = 'Hey! I am Alex Rivera, a community organizer based in New York. I organize tech meetups, mixers, and community gatherings. Follow me to stay updated on future gatherings!';

  useEffect(() => {
    // Filter events belonging to this host that are Published or Completed
    const hostEvents = mockStore.getEvents().filter(e =>
      (e.status === 'Published' || e.status === 'Completed') && e.privacy === 'Public'
    );
    setEvents(hostEvents);

    // Load following status from localStorage if set
    const following = localStorage.getItem(`follow_${hostName}`);
    if (following === 'true') {
      setIsFollowing(true);
      setFollowersCount(129);
    }
  }, [hostName]);

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      localStorage.setItem(`follow_${hostName}`, 'false');
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      localStorage.setItem(`follow_${hostName}`, 'true');
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'Published' && new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => e.status === 'Completed' || (e.status === 'Published' && new Date(e.date) < new Date()));

  // Display-only stats derived from already-loaded events
  const totalGuests = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const ratedEvents = events.filter(e => e.rating);
  const avgRating = ratedEvents.length
    ? (ratedEvents.reduce((sum, e) => sum + e.rating, 0) / ratedEvents.length).toFixed(1)
    : '—';
  const coverImage = events.length > 0 ? getEventCover(events[0]) : HERO_IMAGES.hosting;

  const stats = [
    { icon: Calendar, tile: 'stat-icon-orange', value: events.length, label: 'Events Hosted' },
    { icon: Users, tile: 'stat-icon-blue', value: totalGuests.toLocaleString(), label: 'Total Guests' },
    { icon: Star, tile: 'stat-icon-green', value: avgRating, label: 'Avg Rating' },
  ];

  const renderEventGrid = (list, past = false) => (
    <div className="grid-3" style={{ gap: '20px' }}>
      {list.map(evt => (
        <Link key={evt.id} to={`/e/${evt.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="event-photo-card" style={{ height: '100%', opacity: past ? 0.92 : 1 }}>
            <div style={{ position: 'relative' }}>
              <img className="event-photo-card-img" src={getEventCover(evt)} alt={evt.title} style={past ? { filter: 'saturate(0.7)' } : undefined} />
              {evt.rating && (
                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: 'var(--color-accent)', color: 'white',
                  borderRadius: '8px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Star size={11} fill="white" /> {evt.rating}
                </span>
              )}
              {past && (
                <span style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'rgba(8, 8, 12, 0.65)', color: 'white',
                  borderRadius: '8px', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px'
                }}>
                  PAST
                </span>
              )}
            </div>
            <div className="event-photo-card-body">
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>{evt.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} /> {evt.date} • {evt.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} /> {evt.location.split(',')[0]}
                </span>
              </div>
              <span style={{
                marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px',
                color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem'
              }}>
                {past ? 'See details' : 'View event'} <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <PageShell>
      <div className="mesh-bg" style={{ minHeight: '90vh', padding: 'var(--spacing-xl) 0' }}>
        <div className="container" style={{ maxWidth: '900px', textAlign: 'left' }}>

          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '24px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Explore
          </Link>

          {/* Cover Photo Header */}
          <div className="page-hero" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', minHeight: '240px' }}>
            <img className="page-hero-img" src={coverImage} alt={`${hostName} hosting`} />
            <div className="page-hero-overlay" />
          </div>

          {/* Profile Card overlapping the cover */}
          <Card style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)', borderRadius: '0 0 24px 24px', borderTop: 'none', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '-72px', position: 'relative', zIndex: 4 }}>
              <img
                className="avatar-img avatar-xl"
                src={getAvatar(hostName)}
                alt={hostName}
                style={{ width: '112px', height: '112px', boxShadow: 'var(--shadow-md)' }}
              />
              <div style={{ flex: 1, minWidth: '220px', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hostName}
                      <BadgeCheck size={24} color="var(--color-accent)" />
                    </h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      Verified Organizer • <strong>{followersCount}</strong> followers
                    </span>
                  </div>
                  <Button
                    onClick={handleToggleFollow}
                    variant={isFollowing ? 'outline' : 'primary'}
                    style={{ borderRadius: '24px', padding: '8px 24px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Heart size={14} fill={isFollowing ? 'currentColor' : 'none'} />
                    {isFollowing ? 'Following' : 'Follow Host'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid-3" style={{ gap: '14px', marginTop: '24px' }}>
              {stats.map(({ icon: Icon, tile, value, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px'
                }}>
                  <div className={`stat-icon-tile ${tile}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--color-text)' }}>{value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--color-text-muted)' }}>About the Host</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: '1.6', margin: 0 }}>{hostBio}</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> <span>{hostEmail}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> <span>{hostPhone}</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-text)' }}>
              Upcoming Events ({upcomingEvents.length})
            </h2>
            {upcomingEvents.length > 0 ? (
              renderEventGrid(upcomingEvents)
            ) : (
              <Card style={{ padding: 0 }}>
                <div className="empty-state">
                  <img className="empty-state-img" src={HERO_IMAGES.toast} alt="No upcoming events" />
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    Nothing on the calendar yet — follow {hostName} to hear about the next one first!
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Past Events */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-text)' }}>
              Past Events ({pastEvents.length})
            </h2>
            {pastEvents.length > 0 ? (
              renderEventGrid(pastEvents, true)
            ) : (
              <Card style={{ padding: 0 }}>
                <div className="empty-state">
                  <img className="empty-state-img" src={HERO_IMAGES.crowd} alt="No past events" />
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>No past events recorded yet.</p>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
