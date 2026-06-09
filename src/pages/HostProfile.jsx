import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Heart, ArrowLeft, ArrowUpRight, Mail, Phone, Sparkles } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
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

  return (
    <PageShell>
      <div className="mesh-bg" style={{ minHeight: '90vh', padding: 'var(--spacing-xl) 0' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'left' }}>
          
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '24px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Explore
          </Link>

          {/* Profile Card */}
          <Card className="glass-surface" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: 'var(--shadow-md)',
                border: '3px solid white'
              }}></div>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>{hostName}</h1>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Verified Organizer</span>
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
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem' }}>
                  <span><strong>{events.length}</strong> Events Hosted</span>
                  <span><strong>{followersCount}</strong> Followers</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Biography</h3>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-text)' }}>Upcoming Events ({upcomingEvents.length})</h2>
            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {upcomingEvents.map(evt => (
                  <Card key={evt.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', flexShrink: 0 }}></div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{evt.title}</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>{evt.date} • {evt.time} • {evt.location.split(',')[0]}</p>
                      </div>
                    </div>
                    <Link to={`/e/${evt.id}`}>
                      <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        View Event <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card style={{ padding: '32px', textAlign: 'center', background: 'var(--color-surface-soft)' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>No upcoming events scheduled right now.</p>
              </Card>
            )}
          </div>

          {/* Past Events */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px', color: 'var(--color-text)' }}>Past Events ({pastEvents.length})</h2>
            {pastEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pastEvents.map(evt => (
                  <Card key={evt.id} className="flex justify-between items-center" style={{ padding: 'var(--spacing-md)', opacity: 0.8 }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--color-border)', flexShrink: 0 }}></div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-text-muted)' }}>{evt.title}</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>{evt.date} • {evt.time} • {evt.location.split(',')[0]}</p>
                      </div>
                    </div>
                    <Link to={`/e/${evt.id}`}>
                      <Button variant="ghost" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        Details <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card style={{ padding: '32px', textAlign: 'center', background: 'var(--color-surface-soft)' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>No past events recorded yet.</p>
              </Card>
            )}
          </div>

        </div>
      </div>
    </PageShell>
  );
}
