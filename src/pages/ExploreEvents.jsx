import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Users, Calendar, Clock, Ticket, Star, ArrowRight, Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import { mockStore } from '../utils/mockStore';
import { getEventCover, getAvatar } from '../utils/images';

export default function ExploreEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Get all published public events
  const allEvents = mockStore.getEvents().filter(e => e.status === 'Published' && e.privacy === 'Public');

  // Extract unique locations and states
  const uniqueLocations = [...new Set(allEvents.map(e => e.location.split(',')[0]))].sort();
  const uniqueStates = [...new Set(allEvents.map(e => e.state))].sort();

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(evt => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        (evt.eventType && evt.eventType.toLowerCase().includes(q));

      const matchesLocation = !selectedLocation || evt.location.split(',')[0] === selectedLocation;
      const matchesState = !selectedState || evt.state === selectedState;

      return matchesSearch && matchesLocation && matchesState;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchQuery, selectedLocation, selectedState, allEvents]);

  return (
    <PageShell>
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

        {/* ───────── EXPLORE HEADER ───────── */}
        <section style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'clamp(40px, 6vw, 60px) 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                margin: '0 0 8px 0',
                lineHeight: 1.1
              }}>
                Discover upcoming events
              </h1>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.5
              }}>
                Find and join events hosted by communities near you. RSVP, connect, and attend.
              </p>
            </div>

            {/* Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              borderRadius: '16px',
              padding: '8px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '20px',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <Search size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search events, locations, types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'none',
                  fontSize: '0.95rem',
                  outline: 'none',
                  padding: '12px 14px',
                  color: 'var(--color-text)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">All Cities</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              {(searchQuery || selectedLocation || selectedState) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('');
                    setSelectedState('');
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ───────── EVENTS GRID ───────── */}
        <section style={{ padding: 'var(--spacing-xl) 0' }}>
          <div className="container">
            {/* Results count */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                margin: 0
              }}>
                {filteredEvents.length === 0 ? 'No events found' : `${filteredEvents.length} event${filteredEvents.length === 1 ? '' : 's'} available`}
              </p>
            </div>

            {filteredEvents.length === 0 ? (
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center'
              }}>
                <Sparkles size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                <p style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: '0 0 8px 0'
                }}>No events match your search</p>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                  marginBottom: '20px'
                }}>Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('');
                    setSelectedState('');
                  }}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  View all events
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '24px'
              }}>
                {filteredEvents.map(evt => {
                  const rsvpList = mockStore.getRSVPs(evt.id).filter(r => r.status === 'going' || r.status === 'maybe');
                  const totalAttending = rsvpList.length;
                  const spotsLeft = evt.capacity - totalAttending;
                  const evtDate = new Date(evt.date);
                  const isUpcoming = evtDate > new Date();

                  return (
                    <Link
                      key={evt.id}
                      to={`/e/${evt.id}?rsvp=true`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="event-photo-card"
                        style={{
                          height: '100%',
                          cursor: 'pointer',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          background: 'var(--color-surface)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                      >
                        {/* Event Cover */}
                        <div
                          className="zoom-image-container"
                          style={{
                            height: '200px',
                            position: 'relative',
                            background: 'var(--color-bg)',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={getEventCover(evt)}
                            alt={evt.title}
                            className="zoom-image-hover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />

                          {/* Status Badge */}
                          {isUpcoming ? (
                            <span
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(0, 200, 83, 0.9)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Upcoming
                            </span>
                          ) : (
                            <span
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(107, 114, 128, 0.9)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              Past
                            </span>
                          )}

                          {/* Date Badge */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '12px',
                              left: '12px',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(6px)',
                              borderRadius: '12px',
                              padding: '6px 12px',
                              textAlign: 'center',
                              boxShadow: 'var(--shadow-md)',
                              lineHeight: 1.1
                            }}
                          >
                            <div style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              color: 'var(--color-primary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {evtDate.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: 'var(--color-text)'
                            }}>
                              {evtDate.toLocaleDateString('en-US', { day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div style={{
                          padding: 'var(--spacing-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>

                          {/* Host Info */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)'
                          }}>
                            <img
                              src={getAvatar(evt.hostEmail || evt.hostName)}
                              alt={evt.hostName}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{ fontWeight: 600 }}>{evt.hostName || 'Organizer'}</span>
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            margin: 0,
                            color: 'var(--color-text)',
                            lineHeight: 1.2
                          }}>
                            {evt.title}
                          </h3>

                          {/* Location */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)'
                          }}>
                            <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                            <span>{evt.location}</span>
                          </div>

                          {/* Time */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)',
                            background: 'var(--color-bg)',
                            padding: '8px 12px',
                            borderRadius: '10px'
                          }}>
                            <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                            <span>{evt.time}</span>
                          </div>

                          {/* Attending & Spots */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: 600
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={13} />
                              {totalAttending > 0 ? `${totalAttending} attending` : 'Be first to RSVP'}
                            </div>
                            <span style={{
                              color: spotsLeft > 0 ? 'var(--color-accent)' : '#ef4444',
                              fontWeight: 700
                            }}>
                              {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
                            </span>
                          </div>

                          {/* CTA */}
                          <button
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: isUpcoming ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' : 'var(--color-surface-hover)',
                              color: isUpcoming ? 'white' : 'var(--color-text-muted)',
                              border: 'none',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              marginTop: 'auto',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            {isUpcoming ? (
                              <>
                                <Ticket size={14} /> RSVP Now
                              </>
                            ) : (
                              <>
                                <ArrowRight size={14} /> View Event
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
