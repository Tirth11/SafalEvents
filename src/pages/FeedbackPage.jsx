import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle2, MessageSquare, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import Card from '../components/Card';

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

  const themes = {
    'mesh-gradient-sunset': 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)',
    'mesh-gradient-ocean': 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    'mesh-gradient-forest': 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
    'mesh-gradient-midnight': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  };

  useEffect(() => {
    const evt = mockStore.getEventById(eventId);
    if (evt) {
      setEvent(evt);
    }
    setLoading(false);
  }, [eventId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide your email.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    mockStore.submitFeedback(eventId, {
      name,
      email,
      rating,
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

  const backgroundStyle = event.cover 
    ? `url(${event.cover}) center/cover` 
    : (themes[event.theme] || themes['mesh-gradient-sunset']);

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', padding: 'var(--spacing-lg) var(--spacing-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Event Banner Header */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(`/e/${event.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '16px', fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back to Event Page
        </button>

        <div style={{
          height: '140px',
          background: backgroundStyle,
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {event.cover && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)', zIndex: 1 }} />}
          <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Feedback Survey
            </span>
            <h1 style={{ fontSize: '1.5rem', margin: '6px 0 2px 0', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{event.title}</h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', opacity: 0.9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {event.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {event.location}</span>
            </div>
          </div>
        </div>

        {/* Survey Content */}
        <Card style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: 'var(--spacing-lg)', borderTop: 'none', boxShadow: 'var(--shadow-md)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }} className="animate-fade-in">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Thank You!</h2>
              <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                Your feedback has been successfully submitted. We appreciate you taking the time to share your experience with the organizer!
              </p>
              <Button variant="primary" onClick={() => navigate(`/e/${event.id}`)}>
                Back to Event Details
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', fontWeight: 600 }}>How was your experience?</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                  Please rate the event and leave your comments below to help us improve future gatherings.
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {/* Rating Star Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', borderY: '1px solid var(--color-border)', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>YOUR RATING</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: active ? '#fbbf24' : '#cbd5e1',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Star size={36} fill={active ? '#fbbf24' : 'none'} strokeWidth={1.5} />
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, minHeight: '20px', color: '#475569' }}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 600 }}>Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alice@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 600 }}>Comments & Suggestions (Optional)</label>
                <textarea
                  placeholder="What did you enjoy most? What could we do better?"
                  rows="4"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <Button variant="primary" type="submit" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <MessageSquare size={18} /> Submit Feedback
              </Button>
            </form>
          )}
        </Card>
      </div>

    </div>
  );
}
