import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, HelpCircle, MessageSquare, ArrowRight, X, CheckCircle, Smile, Plus, ArrowLeft, Send, Check, Timer } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput } from '../components/FormField';

export default function EventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Core Event States
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [polls, setPolls] = useState([]);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);

  // RSVP Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1); // 1: auth, 2: details
  const [rsvpForm, setRsvpForm] = useState({
    emailOrPhone: '',
    otp: '',
    name: '',
    status: 'going',
    answers: {}
  });
  const [authError, setAuthError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // New Guest OTP States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpSession, setRsvpSession] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rsvpOtp, setRsvpOtp] = useState('');

  // Resend Cooldown Effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // Guest actions state (if logged in/already RSVP'd)
  const [existingRsvp, setExistingRsvp] = useState(null);
  const [currentUser, setCurrentUser] = useState(mockStore.getCurrentUser());

  // Comment board states
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState(currentUser?.name || '');

  // Theme gradient selection
  const themes = {
    'mesh-gradient-sunset': 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)',
    'mesh-gradient-ocean': 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    'mesh-gradient-forest': 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
    'mesh-gradient-midnight': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  };

  const loadEventData = () => {
    const evt = mockStore.getEventById(eventId);
    if (!evt) {
      // If event doesn't exist, redirect or load first mock event
      setEvent(null);
      return;
    }
    
    // Increment views once on mount
    mockStore.incrementViews(evt.id);
    
    setEvent(evt);
    setViews(mockStore.getViews(evt.id));
    
    const eventRsvps = mockStore.getRSVPs(evt.id);
    setRsvps(eventRsvps);
    setPolls(mockStore.getPolls(evt.id));
    setComments(mockStore.getComments(evt.id));

    // Check if current user is already RSVP'd
    const user = mockStore.getCurrentUser();
    setCurrentUser(user);
    if (user && user.email) {
      const userRsvp = eventRsvps.find(r => r.email === user.email);
      if (userRsvp) {
        setExistingRsvp(userRsvp);
      } else {
        setExistingRsvp(null);
      }
    }
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  if (!event) {
    return (
      <div className="container text-center flex flex-col justify-center items-center" style={{ minHeight: '100vh', gap: 'var(--spacing-md)' }}>
        <h2>Invitation Not Found</h2>
        <p className="text-muted">The event invitation link you followed does not exist or has been removed.</p>
        <Link to="/"><Button variant="primary">Return to Home</Button></Link>
      </div>
    );
  }

  // Count going / maybe
  const goingGuests = rsvps.filter(r => r.status === 'going');
  const maybeGuests = rsvps.filter(r => r.status === 'maybe');
  const waitlistGuests = rsvps.filter(r => r.status === 'waitlist');
  const totalAttending = goingGuests.length + maybeGuests.length;
  const deadlinePassed = event.rsvpDeadline ? new Date() > new Date(event.rsvpDeadline) : false;
  const isRsvpClosed = event.rsvpStatus === 'Closed' || deadlinePassed;

  const handleOpenRsvpDrawer = () => {
    const user = mockStore.getCurrentUser();
    if (user && user.email && user.role === 'guest') {
      const names = user.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email);
      setPhone(user.phone || '');
      setRsvpForm({
        ...rsvpForm,
        emailOrPhone: user.email,
        name: user.name
      });
      setDrawerStep(2);
    } else {
      setDrawerStep(1);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRsvpSession(null);
      setRsvpOtp('');
    }
    setAuthError('');
    setShowDrawer(true);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const fn = firstName.trim() || 'Guest';
    const ln = lastName.trim() || '';
    const em = email.trim() || `guest${Date.now()}@example.com`;
    const ph = phone.trim() || '+1 (555) 000-0000';

    const skipOtp = mockStore.checkRecentRsvpVerification(event.id, em, ph);
    if (skipOtp) {
      setRsvpForm(prev => ({
        ...prev,
        name: `${fn} ${ln}`.trim(),
        emailOrPhone: em
      }));
      setDrawerStep(2);
      return;
    }

    const session = mockStore.createRsvpSession(event.id, {
      firstName: fn,
      lastName: ln,
      email: em,
      phone: ph
    });

    setRsvpSession(session);
    setResendCooldown(30);
    setRsvpOtp('');
    setDrawerStep(1.5);

    alert(`[Simulated Multi-Channel Delivery]\nVerification code sent to:\nEmail (${em}) & SMS (${ph})\n\nOTP Code: ${session.otpCode}`);
  };

  const handleRsvpOtpVerifySubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const code = rsvpOtp.trim() || rsvpSession.otpCode;
    const res = mockStore.verifyRsvpSession(rsvpSession.id, code);
    if (!res.success) {
      setAuthError(res.error);
      return;
    }

    setRsvpForm(prev => ({
      ...prev,
      name: `${firstName} ${lastName}`,
      emailOrPhone: email
    }));

    setVerificationSuccess(true);
    setTimeout(() => {
      setVerificationSuccess(false);
      setDrawerStep(2);
    }, 1000);
  };

  const handleResendRsvpOtp = () => {
    if (resendCooldown > 0 || !rsvpSession) return;

    const newSession = mockStore.createRsvpSession(event.id, rsvpSession.guestData);
    setRsvpSession(newSession);
    setResendCooldown(30);
    setRsvpOtp('');
    setAuthError('');

    alert(`[SMS/Email Resent] OTP Code: ${newSession.otpCode}`);
  };

  const handleConfirmRsvpSubmit = (e) => {
    e.preventDefault();
    
    mockStore.setCurrentUser({
      role: 'guest',
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone
    });

    const finalStatus = (event.approvalRequired && rsvpForm.status === 'going') ? 'waitlist' : rsvpForm.status;

    mockStore.addRSVP(event.id, {
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      status: finalStatus,
      answers: rsvpForm.answers
    });

    setShowDrawer(false);
    loadEventData();
  };

  // Poll voting
  const handleVote = (pollId, optionId) => {
    const user = mockStore.getCurrentUser();
    if (!user || !user.email) {
      alert('Please RSVP or log in to vote in polls!');
      return;
    }
    const updated = mockStore.voteInPoll(event.id, pollId, optionId, user.email);
    setPolls(updated);
  };

  // Comments Feed Submit
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentName.trim()) return;

    mockStore.addComment(event.id, {
      name: commentName,
      text: commentText
    });

    setCommentText('');
    loadEventData();
  };

  const handleReactToComment = (commentId, emoji) => {
    const updated = mockStore.reactToComment(event.id, commentId, emoji);
    setComments(updated);
  };

  return (
    <PageShell>
      <div className="mesh-bg" style={{ minHeight: '80vh', paddingBottom: 'var(--spacing-xl)' }}>
        {/* Main Container */}
        <div className="container flex flex-col items-center animate-fade-in" style={{ marginTop: 'var(--spacing-md)' }}>
        
        {/* Banner Cover */}
        <div style={{
          width: '100%',
          maxWidth: '850px',
          height: '280px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: event.cover ? `url(${event.cover}) center/cover` : (themes[event.theme] || themes['mesh-gradient-sunset']),
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(0,0,0,0) 80%)', zIndex: 1 }}></div>
          <div style={{ zIndex: 2 }}>
            <h1 style={{ color: 'white', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>{event.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>Hosted by Alex Rivera</p>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid-2" style={{ width: '100%', maxWidth: '850px', gap: 'var(--spacing-md)', alignItems: 'start' }}>
          
          {/* LEFT SIDE: Info, Polls, Comments */}
          <div className="flex flex-col gap-md">
            
            {/* Event Description Card */}
            <Card style={{ padding: 'var(--spacing-md)' }} className="glass-surface">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>About this gathering</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {event.description}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Date & Time</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>Location</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="flex items-center gap-xs"><MapPin size={14} className="text-accent" /> {event.location}</span>
                </div>
              </div>
            </Card>

            {/* Guest list bubbles card */}
            <Card style={{ padding: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }} className="flex justify-between items-center">
                <span>Guest List</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>{totalAttending} attending</span>
              </h3>
              
              {/* Capacity progress */}
              <div style={{ marginBottom: '16px' }}>
                <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  <span>Progress to limit</span>
                  <span>{totalAttending} / {event.capacity} capacity</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', width: `${Math.min((totalAttending / event.capacity) * 100, 100)}%`, borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Guests bubble list */}
              {event.showGuestList ? (
                goingGuests.length > 0 || maybeGuests.length > 0 ? (
                  <div className="flex flex-col gap-sm">
                    {goingGuests.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#16a34a', marginBottom: '6px' }}>Going ({goingGuests.length})</p>
                        <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                          {goingGuests.map(g => (
                            <span key={g.id} style={{ fontSize: '0.8rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)', color: '#15803d', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {maybeGuests.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#ca8a04', marginBottom: '6px' }}>Maybe ({maybeGuests.length})</p>
                        <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                          {maybeGuests.map(g => (
                            <span key={g.id} style={{ fontSize: '0.8rem', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.1)', color: '#a16207', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {waitlistGuests.length > 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#4f46e5', marginBottom: '6px' }}>Waitlist ({waitlistGuests.length})</p>
                        <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                          {waitlistGuests.map(g => (
                            <span key={g.id} style={{ fontSize: '0.8rem', background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>No RSVPs yet. Be the first to join!</p>
                )
              ) : (
                <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  🔒 The host has kept the guest list private.
                </div>
              )}
            </Card>

            {/* Polls Widget */}
            {event.allowComments && polls.length > 0 && (
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Event Polls</h3>
                <div className="flex flex-col gap-md">
                  {polls.map(poll => {
                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                    return (
                      <div key={poll.id} style={{ background: 'var(--color-surface-hover)', borderRadius: '12px', padding: '14px', border: '1px solid var(--color-border)' }}>
                        <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Q: {poll.question}</h5>
                        <div className="flex flex-col gap-xs">
                          {poll.options.map(opt => {
                            const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            // Check if current user voted for this option
                            const hasVoted = currentUser && opt.voters.includes(currentUser.email);
                            
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleVote(poll.id, opt.id)}
                                style={{
                                  display: 'block', width: '100%', border: 'none', background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer'
                                }}
                              >
                                <div style={{
                                  padding: '8px 12px', borderRadius: '6px', border: hasVoted ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                  background: hasVoted ? 'rgba(0, 113, 227, 0.1)' : 'var(--color-surface)', transition: 'background var(--transition-fast)',
                                  position: 'relative', overflow: 'hidden'
                                }}>
                                  {/* Progress fill */}
                                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: 'rgba(0, 113, 227, 0.1)', zIndex: 1, borderRadius: '6px' }}></div>
                                  <div className="flex justify-between items-center" style={{ position: 'relative', zIndex: 2, fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: hasVoted ? 600 : 500 }}>{opt.text}</span>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{opt.votes} ({percent}%)</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Comments Board Feed */}
            {event.allowComments && (
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-xs">
                  <MessageSquare size={18} /> Guest Board
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-sm" style={{ marginBottom: '20px', background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  {!currentUser || !currentUser.name ? (
                    <div className="flex gap-xs" style={{ marginBottom: '4px' }}>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={commentName} 
                        onChange={(e) => setCommentName(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', flex: 1 }}
                      />
                    </div>
                  ) : null}

                  <div className="flex gap-xs items-center">
                    <input 
                      type="text" 
                      placeholder="Leave a message or greeting..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                    />
                    <Button variant="primary" type="submit" style={{ padding: '8px 12px' }}><Send size={16} /></Button>
                  </div>
                </form>

                {/* Comments list */}
                {comments.length > 0 ? (
                  <div className="flex flex-col gap-md">
                    {comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                        <div className="flex items-center gap-xs">
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem' }}>{c.text}</p>
                        
                        {/* Reactions buttons */}
                        <div className="flex gap-xs" style={{ marginTop: '4px' }}>
                          {['🎉', '❤️', '👍'].map(emoji => {
                            const count = c.reactions[emoji] || 0;
                            return (
                              <button 
                                key={emoji}
                                onClick={() => handleReactToComment(c.id, emoji)}
                                style={{ 
                                  background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', 
                                  padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' 
                                }}
                              >
                                <span>{emoji}</span>
                                <span style={{ fontWeight: 600 }}>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>No greetings posted yet. Drop a message to say hi!</p>
                )}
              </Card>
            )}

          </div>

          {/* RIGHT SIDE: RSVP Checkout Box */}
          <div style={{ position: 'sticky', top: '90px' }} className="flex flex-col gap-md">
            
            <Card style={{ padding: 'var(--spacing-md)' }} className="glass-surface">
              {existingRsvp ? (
                <div className="text-center">
                  <CheckCircle size={40} style={{ color: '#16a34a', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>You are RSVP'd!</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Status: <strong style={{ color: 'var(--color-primary)' }}>{existingRsvp.status.toUpperCase()}</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    Show your event ticket pass at the door for entry check-in.
                  </p>
                  <Link to="/dashboard">
                    <Button variant="primary" style={{ width: '100%' }}>View Ticket Pass</Button>
                  </Link>
                </div>
              ) : isRsvpClosed ? (
                <div className="text-center">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>RSVPs Closed</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                    {deadlinePassed ? 'The registration deadline has passed.' : 'The host has closed registrations for this event.'}
                  </p>
                  <Button variant="outline" disabled style={{ width: '100%', padding: '12px 0' }}>
                    Registration Closed
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>Join gathering</h3>
                  
                  {event.enablePayments && (
                    <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, marginBottom: '12px', background: 'rgba(34,197,94,0.06)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>
                      🎟️ Ticket Cost: ${event.ticketPrice} USD
                    </div>
                  )}

                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                    {event.approvalRequired 
                      ? 'This event requires organizer approval. Request to join the waitlist.' 
                      : 'RSVP now to save your spot. Capacity is limited!'}
                  </p>

                  <Button variant="primary" onClick={handleOpenRsvpDrawer} style={{ width: '100%', padding: '12px 0' }} className="flex justify-center items-center gap-xs">
                    {event.approvalRequired ? 'Request to Join (Waitlist)' : 'RSVP Now'} <ArrowRight size={18} />
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Contacts Info */}
            <Card style={{ padding: 'var(--spacing-sm)' }} className="flex flex-col gap-xs text-muted">
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Questions?</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>Email: alex@safalevent.com</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>Direct Phone: +1 (555) 999-8888</span>
            </Card>

          </div>

        </div>

      </div>

      {/* --- SLIDE OUT RSVP DRAWER --- */}
      {showDrawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setShowDrawer(false)}></div>
          
          <div className="drawer-content">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                {event.approvalRequired ? 'Join Event Waitlist' : 'RSVP details'}
              </h3>
              <button onClick={() => setShowDrawer(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>

            {/* Drawer Step 1: Guest Contact details */}
            {drawerStep === 1 && (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-md">
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Share what you're comfortable with — all fields are optional.</p>
                
                {authError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {authError}
                  </div>
                )}

                <div className="grid-2">
                  <FormField label="First name">
                    <FormInput type="text" placeholder="Alice" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </FormField>
                  <FormField label="Last name">
                    <FormInput type="text" placeholder="Vance" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Email">
                  <FormInput type="email" placeholder="alice@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormField>
                <FormField label="Phone">
                  <FormInput type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FormField>

                <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)', padding: '12px' }}>
                  Continue to Verification
                </Button>
              </form>
            )}

            {/* Drawer Step 1.5: OTP Verification */}
            {drawerStep === 1.5 && rsvpSession && (
              <form onSubmit={handleRsvpOtpVerifySubmit} className="flex flex-col gap-md">
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Enter the 6-digit verification code we sent to your email and phone.
                  </p>
                  <div style={{ margin: '12px auto', background: 'rgba(0, 113, 227, 0.08)', border: '1px dashed rgba(0, 113, 227, 0.3)', borderRadius: '8px', padding: '8px 12px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Active Code: {rsvpSession.otpCode}
                  </div>
                </div>

                {authError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {authError}
                  </div>
                )}

                {verificationSuccess && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <Check size={16} /> Spot Verified! Loading RSVP details...
                  </div>
                )}

                <FormField label="Verification code" hint="Leave blank in demo mode to auto-verify.">
                  <FormInput type="text" maxLength={6} value={rsvpOtp} onChange={(e) => setRsvpOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456" style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }} />
                </FormField>

                <Button variant="primary" type="submit" style={{ width: '100%', padding: '12px', fontWeight: 600 }}>
                  Verify Verification Code
                </Button>

                <div className="flex justify-between items-center" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setDrawerStep(1); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={14} /> Back to details
                  </button>

                  <button 
                    type="button" 
                    disabled={resendCooldown > 0}
                    onClick={handleResendRsvpOtp}
                    style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary)', fontWeight: 600, cursor: resendCooldown > 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Timer size={14} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* Drawer Step 2: Attendance details */}
            {drawerStep === 2 && (
              <form onSubmit={handleConfirmRsvpSubmit} className="flex flex-col gap-md">
                
                <FormField label="Your name">
                  <FormInput type="text" placeholder="Enter name" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} />
                </FormField>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Will you be attending?</label>
                  <div className="flex gap-sm">
                    <button 
                      type="button" 
                      onClick={() => setRsvpForm({ ...rsvpForm, status: 'going' })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '8px', border: rsvpForm.status === 'going' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: rsvpForm.status === 'going' ? 'rgba(0, 113, 227, 0.05)' : 'white', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      {event.approvalRequired ? 'Request to Join' : 'Going'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRsvpForm({ ...rsvpForm, status: 'maybe' })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '8px', border: rsvpForm.status === 'maybe' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: rsvpForm.status === 'maybe' ? 'rgba(0, 113, 227, 0.05)' : 'white', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Maybe
                    </button>
                  </div>
                </div>

                {/* Render Host Custom Questions */}
                {event.questions && event.questions.map(q => (
                  <FormField key={q} label={q}>
                    <FormInput
                      type="text"
                      placeholder="Your answer..."
                      value={rsvpForm.answers[q] || ''}
                      onChange={(e) => {
                        const answers = { ...rsvpForm.answers };
                        answers[q] = e.target.value;
                        setRsvpForm({ ...rsvpForm, answers });
                      }}
                    />
                  </FormField>
                ))}

                <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                  Confirm & Submit RSVP
                </Button>
              </form>
            )}

          </div>
        </>
      )}

      </div>
    </PageShell>
  );
}
