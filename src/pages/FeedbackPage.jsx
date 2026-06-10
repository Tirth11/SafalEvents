import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, MessageSquare, Calendar, MapPin, ArrowLeft, Sparkles } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { getEventCover, AVATARS } from '../utils/images';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormTextarea } from '../components/FormField';

export default function FeedbackPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const evt = mockStore.getEventById(eventId);
    if (evt) {
      setEvent(evt);
    }
    setLoading(false);
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mockStore.submitFeedback(eventId, {
      name: name.trim() || 'Anonymous Guest',
      email: email.trim() || 'guest@example.com',
      rating: rating || 3,
      comments
    });

    setSubmitted(true);
    setError('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Card style={{ maxWidth: '450px', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Event Not Found</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>The feedback survey link you followed is invalid or has expired.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <PageShell>
      <div className="mesh-bg" style={{ minHeight: '80vh', padding: 'var(--spacing-lg) var(--spacing-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ width: '100%', maxWidth: '620px' }}>
          <button
            onClick={() => navigate(`/e/${event.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '16px', fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Back to Event Page
          </button>

          {/* Event Cover Banner */}
          <div className="page-hero" style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', minHeight: '200px' }}>
            <img className="page-hero-img" src={getEventCover(event)} alt={event.title} />
            <div className="page-hero-overlay" />
            <div className="page-hero-content">
              <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Post-Event Feedback
              </span>
              <h1 style={{ fontSize: '1.7rem', margin: '6px 0 4px 0', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                How was {event.title}?
              </h1>
              <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', opacity: 0.9, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {event.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} /> {event.location}</span>
              </div>
            </div>
          </div>

          {/* Survey Content */}
          <Card style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: 'var(--spacing-lg)', borderTop: 'none', boxShadow: 'var(--shadow-md)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '28px 8px' }} className="animate-fade-in">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), #ff9a6b)',
                  color: 'white', marginBottom: '16px', boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)'
                }}>
                  <Heart size={36} fill="white" />
                </div>
                <h2 style={{ fontSize: '1.9rem', marginBottom: '8px', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Thanks for the love!
                </h2>
                <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 8px auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {rating >= 4
                    ? `A ${rating}-star night — we're so glad you had a great time!`
                    : 'Your honest feedback helps the host make the next one even better.'}
                </p>
                {rating > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} strokeWidth={1.5}
                        fill={star <= rating ? '#fbbf24' : 'none'}
                        color={star <= rating ? '#fbbf24' : 'var(--color-border)'} />
                    ))}
                  </div>
                )}

                <div style={{
                  background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
                  padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  margin: '0 auto 24px auto', maxWidth: '360px'
                }}>
                  <div className="avatar-stack">
                    {AVATARS.slice(0, 5).map((src, i) => (
                      <img key={i} className="avatar-img" src={src} alt="Attendee" />
                    ))}
                    <span className="avatar-stack-more">+27</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    You and 31 other guests shared their experience
                  </span>
                </div>

                <Button variant="primary" onClick={() => navigate(`/e/${event.id}`)} style={{ borderRadius: '24px', padding: '10px 28px' }}>
                  Back to Event Details
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '6px', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    Tell us about your night
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    Share as much or as little as you like — everything here is optional.
                  </p>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                {/* Rating Star Selection */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '20px 16px'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--color-text-muted)' }}>
                    TAP TO RATE
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            color: active ? '#fbbf24' : 'var(--color-border)',
                            transform: active ? 'scale(1.18)' : 'scale(1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Star size={42} fill={active ? '#fbbf24' : 'none'} strokeWidth={1.5} />
                        </button>
                      );
                    })}
                  </div>
                  <span style={{
                    fontSize: '0.95rem', fontWeight: 700, minHeight: '22px',
                    color: rating ? 'var(--color-primary)' : 'var(--color-text-muted)'
                  }}>
                    {ratingLabels[hoverRating || rating] || 'How many stars was it?'}
                  </span>
                </div>

                <div className="grid-2">
                  <FormField label="Your name">
                    <FormInput type="text" placeholder="Alice Vance" value={name} onChange={(e) => setName(e.target.value)} />
                  </FormField>
                  <FormField label="Email">
                    <FormInput type="email" placeholder="alice@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Anything you'd like the host to know?">
                  <FormTextarea
                    placeholder="The playlist was amazing... the snack table ran out too fast... tell us everything!"
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}
                  />
                </FormField>

                <Button
                  variant="primary"
                  type="submit"
                  style={{
                    width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    marginTop: '6px', borderRadius: '14px', boxShadow: '0 6px 18px rgba(255, 107, 53, 0.3)'
                  }}
                >
                  <MessageSquare size={18} /> Send My Feedback
                </Button>
                <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.75rem', margin: 0 }}>
                  Your feedback goes straight to the host — thanks for helping them improve!
                </p>
              </form>
            )}
          </Card>
        </div>

      </div>
    </PageShell>
  );
}
