import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, MessageSquare, ArrowRight, X, CheckCircle, ArrowLeft, Send, Check, Timer, Share2, Mail, Phone, Ticket, Lock, Sparkles, QrCode, Download, Eye } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { getEventCover, getAvatar } from '../utils/images';
import { meetsAge } from '../utils/age';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput } from '../components/FormField';
import PhotosTab from '../components/PhotosTab';

export default function EventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Core Event States
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [polls, setPolls] = useState([]);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [activeTab, setActiveTab] = useState('about');

  // RSVP Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1); // 1: auth, 2: details, 3: checkout, 4: confirmation
  const [rsvpForm, setRsvpForm] = useState({
    emailOrPhone: '',
    otp: '',
    name: '',
    status: 'going',
    answers: {},
    guestCount: 1,
    dob: '',                 // primary guest DOB (age-restricted events)
    additionalGuests: []     // [{ firstName, lastName, dob }] — length = guestCount - 1
  });
  const [authError, setAuthError] = useState('');
  const [rsvpError, setRsvpError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // New Guest OTP States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpSession, setRsvpSession] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rsvpOtp, setRsvpOtp] = useState('');

  // Payment Checkout States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Sharing States
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Ticket pass modal
  const [showTicketModal, setShowTicketModal] = useState(false);

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
    if (window.location.search.includes('rsvp=true')) {
      const timer = setTimeout(() => {
        handleOpenRsvpDrawer();
      }, 300);
      return () => clearTimeout(timer);
    }
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
  const maybeGuests = [];
  const waitlistGuests = rsvps.filter(r => r.status === 'waitlist');
  const totalAttending = goingGuests.length + maybeGuests.length;
  const deadlinePassed = event.rsvpDeadline ? new Date() > new Date(event.rsvpDeadline) : false;
  const isRsvpClosed = event.rsvpStatus === 'Closed' || deadlinePassed;
  const isPreviewMode = window.location.search.includes('preview=true') || event.status === 'Under Approval';

  // Presentation-only derived values
  const coverImg = getEventCover(event);
  const hostName = 'Alex Rivera';
  const eventDateObj = new Date(event.date);
  const spotsLeft = Math.max(0, event.capacity - totalAttending);
  const capacityPct = Math.min((totalAttending / event.capacity) * 100, 100);
  const fillingFast = !isRsvpClosed && spotsLeft <= Math.max(5, Math.ceil(event.capacity * 0.15));
  const statusLabel = isRsvpClosed ? 'Closed' : fillingFast ? 'Filling fast' : 'Open';
  const statusColor = isRsvpClosed ? '#64748b' : fillingFast ? 'var(--color-primary)' : 'var(--color-accent)';
  const sectionTitleStyle = { fontSize: '1.15rem', marginBottom: '14px', fontFamily: 'var(--font-heading)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' };

  function handleOpenRsvpDrawer() {
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

    const fn = 'Guest';
    const ln = '';
    const em = email.trim() || `guest${Date.now()}@example.com`;
    const ph = phone.trim() || '+1 (555) 000-0000';

    const skipOtp = mockStore.checkRecentRsvpVerification(event.id, em, ph);
    if (skipOtp) {
      setRsvpForm(prev => ({
        ...prev,
        name: prev.name || '',
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
      name: prev.name || '',
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

  // Keep the additional-guest sub-forms in sync with the chosen party size.
  const handleGuestCountChange = (n) => {
    const count = Math.max(1, Number(n) || 1);
    setRsvpForm(prev => {
      const extraNeeded = count - 1;
      const ag = [...(prev.additionalGuests || [])];
      while (ag.length < extraNeeded) ag.push({ firstName: '', lastName: '', dob: '' });
      ag.length = extraNeeded;
      return { ...prev, guestCount: count, additionalGuests: ag };
    });
    setRsvpError('');
  };

  const updateAdditionalGuest = (idx, field, value) => {
    setRsvpForm(prev => {
      const ag = [...(prev.additionalGuests || [])];
      ag[idx] = { ...ag[idx], [field]: value };
      return { ...prev, additionalGuests: ag };
    });
    setRsvpError('');
  };

  // Builds the RSVP payload after running name + age validation (US-EVENT-014/015).
  // Returns { ok: true, payload } or { ok: false, error }.
  const buildValidatedRsvp = () => {
    // A "No" response needs no party size or age check — just record the decline.
    if (rsvpForm.status === 'declined') {
      if (!rsvpForm.declineReason?.trim()) {
        return { ok: false, error: 'Please let the host know why you cannot attend.' };
      }
      return {
        ok: true,
        payload: {
          name: rsvpForm.name || 'Guest',
          email,
          phone,
          status: 'declined',
          declineReason: rsvpForm.declineReason,
          guestCount: 1,
          answers: rsvpForm.answers,
          dob: '',
          additionalGuests: [],
          ageVerified: null,
        }
      };
    }

    const guestCount = rsvpForm.guestCount || 1;
    const extras = (rsvpForm.additionalGuests || []).slice(0, Math.max(0, guestCount - 1));

    // Every additional guest needs a name regardless of age restriction.
    for (let i = 0; i < extras.length; i++) {
      const g = extras[i];
      if (!g.firstName?.trim() || !g.lastName?.trim()) {
        return { ok: false, error: `Please enter the first and last name for Guest ${i + 2}.` };
      }
    }

    if (event.ageRestricted) {
      if (!rsvpForm.dob) return { ok: false, error: 'Please enter your date of birth to verify your age.' };
      if (!meetsAge(rsvpForm.dob, event.minimumAge)) {
        return { ok: false, error: `Sorry, you must be at least ${event.minimumAge} years old to attend this event.` };
      }
      for (let i = 0; i < extras.length; i++) {
        const g = extras[i];
        if (!g.dob) return { ok: false, error: `Please enter the date of birth for Guest ${i + 2}.` };
        if (!meetsAge(g.dob, event.minimumAge)) {
          return { ok: false, error: `Guest ${i + 2} (${g.firstName || '—'}) doesn't meet the ${event.minimumAge}+ requirement. Correct the date of birth or reduce your guest count.` };
        }
      }
    }

    return {
      ok: true,
      payload: {
        name: rsvpForm.name || 'Guest',
        email,
        phone,
        status: rsvpForm.status,
        guestCount,
        answers: rsvpForm.answers,
        dob: rsvpForm.dob || '',
        additionalGuests: extras,
        ageVerified: event.ageRestricted ? true : null
      }
    };
  };

  const handleConfirmRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpError('');

    const result = buildValidatedRsvp();
    if (!result.ok) {
      setRsvpError(result.error);
      return;
    }

    mockStore.setCurrentUser({
      role: 'guest',
      name: rsvpForm.name || 'Guest',
      email: email,
      phone: phone
    });

    // UC-01: the RSVP itself is held UNDER_APPROVAL by the store when the event
    // requires approval — we keep the guest's chosen response as-is.
    const finalStatus = rsvpForm.status;

    // Approval-required events skip upfront payment (collected after approval).
    if (event.enablePayments && finalStatus === 'going' && !event.approvalRequired) {
      setDrawerStep(3);
    } else {
      mockStore.addRSVP(event.id, result.payload);
      setDrawerStep(4);
      loadEventData();
    }
  };

  const handleProcessPayment = () => {
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setCheckoutError('Please enter all credit card fields.');
      return;
    }
    setCheckoutError('');
    setProcessingPayment(true);

    setTimeout(() => {
      // Complete mock checkout payment — reuse the validated RSVP payload
      const result = buildValidatedRsvp();
      mockStore.addRSVP(event.id, { ...(result.payload || {}), status: 'going' });

      setProcessingPayment(false);
      setDrawerStep(4);
      loadEventData();
    }, 1200);
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
        <div className="container animate-fade-in" style={{ marginTop: 'var(--spacing-md)', maxWidth: '1060px' }}>

        {/* Page-scoped responsive layout helpers (UI only) */}
        <style>{`
          .evt-layout { display: grid; grid-template-columns: 1fr; gap: var(--spacing-md); align-items: start; }
          .evt-side { order: -1; display: flex; flex-direction: column; gap: var(--spacing-md); }
          @media (min-width: 920px) {
            .evt-layout { grid-template-columns: minmax(0, 1fr) 380px; gap: var(--spacing-lg); }
            .evt-side { order: 0; position: sticky; top: 90px; }
          }
          .evt-chip { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); color: white; padding: 7px 14px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; white-space: nowrap; }
        `}</style>

        {/* Hero Cover Banner */}
        <div className="page-hero" style={{ minHeight: 'clamp(320px, 42vw, 380px)', marginBottom: 'var(--spacing-md)', boxShadow: 'var(--shadow-lg)' }}>
          <img src={coverImg} alt={event.title} className="page-hero-img" />
          <div className="page-hero-overlay"></div>

          {/* Status badge */}
          <span style={{
            position: 'absolute', top: '18px', right: '18px', zIndex: 3,
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(255,255,255,0.95)', color: 'var(--color-text)',
            padding: '7px 14px', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: 700, boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0 }}></span>
            {statusLabel}
          </span>

          <div className="page-hero-content" style={{ width: '100%' }}>
            <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginBottom: '14px' }}>
              <span className="evt-chip" style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}>
                {event.eventType === 'Other' ? event.customEventType : event.eventType}
              </span>
              <span className="evt-chip">
                <Calendar size={15} />
                {eventDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {event.time}
              </span>
              {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && (
                <span className="evt-chip">
                  <MapPin size={15} /> {event.venueName ? `${event.venueName}, ${event.city}` : event.location}
                </span>
              )}
              {event.eventMode === 'Virtual' && (
                <span className="evt-chip" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: '#8b5cf6' }}>
                  Virtual Event
                </span>
              )}
              {event.eventMode === 'Hybrid' && (
                <span className="evt-chip" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: '#10b981' }}>
                  Hybrid Event
                </span>
              )}
              {event.ageRestricted && (
                <span className="evt-chip" style={{ background: 'rgba(239,68,68,0.28)', borderColor: 'rgba(255,255,255,0.45)' }}>
                  <Lock size={14} /> {event.minimumAge}+ Event
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.35)', marginBottom: '12px' }}>{event.title}</h1>
            <div className="flex items-center gap-xs">
              <img src={getAvatar(hostName)} alt={hostName} className="avatar-img avatar-sm" />
              <p style={{ fontSize: '0.95rem', margin: 0 }}>
                Hosted by <Link to="/host/Alex Rivera" style={{ color: 'white', textDecoration: 'underline', fontWeight: 600 }}>{hostName}</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="evt-layout">
          
          {/* LEFT SIDE: Info, Polls, Comments */}
          <div className="flex flex-col gap-md">
            
            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              <button
                onClick={() => setActiveTab('about')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', fontSize: '1rem', fontWeight: 700,
                  color: activeTab === 'about' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBottom: activeTab === 'about' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                About
              </button>
              
              {!isPreviewMode && event.enablePhotoAlbum && (event.privacy === 'Public' || existingRsvp || (currentUser && currentUser.email === event.hostEmail)) && (
                <button
                  onClick={() => setActiveTab('photos')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', fontSize: '1rem', fontWeight: 700,
                    color: activeTab === 'photos' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === 'photos' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  Photos
                </button>
              )}
            </div>

            {activeTab === 'photos' ? (
              <PhotosTab event={event} currentUser={currentUser} existingRsvp={existingRsvp} />
            ) : (
              <>
                {/* Event Description Card */}
            <Card style={{ padding: 'var(--spacing-md)' }} className="glass-surface">
              <h3 style={sectionTitleStyle}>
                <span className="stat-icon-tile stat-icon-orange" style={{ width: '36px', height: '36px' }}><Sparkles size={18} /></span>
                About this gathering
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                {event.description}
              </p>
            </Card>

            {/* Date & Time + Location Card */}
            <Card style={{ padding: 'var(--spacing-md)' }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '16px' }}>
                {/* Calendar tile */}
                <div style={{ width: '54px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--color-border)', textAlign: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '4px 0' }}>
                    {eventDateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, padding: '4px 0', background: 'white', color: 'var(--color-text)' }}>
                    {eventDateObj.getDate()}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{eventDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div className="text-muted flex items-center gap-xs" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                    <Clock size={14} /> {event.time}
                    {event.rsvpDeadline && !deadlinePassed && (
                      <span style={{ marginLeft: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        · RSVP by {new Date(event.rsvpDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && (
                <>
                  <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
                    <span className="stat-icon-tile stat-icon-green" style={{ width: '54px', height: '54px', borderRadius: '14px' }}><MapPin size={22} /></span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{event.venueName || event.location}</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                        {existingRsvp ? (event.addressLine1 ? `${event.addressLine1}, ${event.city}, ${event.state}` : event.location) : 'Full address shared after RSVP'}
                      </div>
                    </div>
                  </div>
                  {event.mapLink && (
                    <div style={{ marginBottom: '16px' }}>
                      <a href={event.mapLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                        <MapPin size={14} /> View Location on Map
                      </a>
                    </div>
                  )}
                  {!event.mapLink && (
                    <div style={{
                      height: '130px', borderRadius: '16px', border: '1px dashed var(--color-border)',
                      background: 'repeating-linear-gradient(45deg, #f1f3f5, #f1f3f5 14px, #eef1f4 14px, #eef1f4 28px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-text-muted)', marginBottom: '16px'
                    }}>
                      <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Map preview</span>
                    </div>
                  )}
                </>
              )}

              {(event.eventMode === 'Virtual' || event.eventMode === 'Hybrid') && (
                <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
                    <span className="stat-icon-tile" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Link2 size={20} /></span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#6d28d9' }}>Virtual Meeting</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>{event.meetingPlatform || 'Online Platform'}</div>
                    </div>
                  </div>
                  {existingRsvp ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href={event.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textAlign: 'center', display: 'block', padding: '10px', borderRadius: '8px', textDecoration: 'none' }}>
                        Join Meeting
                      </a>
                      {event.meetingId && <div style={{ fontSize: '0.85rem' }}><strong>Meeting ID:</strong> {event.meetingId}</div>}
                      {event.meetingPasscode && <div style={{ fontSize: '0.85rem' }}><strong>Passcode:</strong> {event.meetingPasscode}</div>}
                      {event.joiningInstructions && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{event.joiningInstructions}</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px' }}>
                      <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Meeting link will be visible after your RSVP is confirmed.
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Dress Code Card */}
            {event.dressCode && event.dressCode !== 'No Dress Code' && (
              <Card style={{ padding: 'var(--spacing-md)' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: '12px' }}>
                  <span className="stat-icon-tile" style={{ width: '36px', height: '36px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}><Sparkles size={18} /></span>
                  Dress Code: {event.dressCode === 'Other' ? event.customDressCode : event.dressCode}
                </h3>
                {event.dressCodeDetails && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: event.dressCodeImage ? '12px' : 0, whiteSpace: 'pre-line' }}>
                    {event.dressCodeDetails}
                  </p>
                )}
                {event.dressCodeImage && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '12px', border: '1px solid var(--color-border)' }}>
                    <img src={event.dressCodeImage} alt="Dress Code Inspiration" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}
              </Card>
            )}

            {/* Host Card */}
            <Card style={{ padding: 'var(--spacing-md)' }}>
              <div className="flex items-center justify-between gap-sm" style={{ flexWrap: 'wrap' }}>
                <div className="flex items-center gap-sm">
                  <img src={getAvatar(hostName)} alt={hostName} className="avatar-img avatar-lg" />
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Hosted by</span>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{hostName}</div>
                    <div className="text-muted flex items-center gap-xs" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                      <Mail size={13} /> alex@safalevent.com
                    </div>
                  </div>
                </div>
                <Link to="/host/Alex Rivera" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" style={{ fontSize: '0.85rem' }}>View profile</Button>
                </Link>
              </div>
            </Card>
            </>
            )}

          </div>

          {/* RIGHT SIDE: RSVP Checkout Box */}
          <div className="evt-side">

            <Card style={{ padding: 0, overflow: 'hidden' }} className="glass-surface">
              {/* Ticket cover strip */}
              <div style={{ position: 'relative' }}>
                <img src={coverImg} alt="" style={{ width: '100%', height: '96px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,12,0.55), rgba(8,8,12,0.05))' }}></div>
                <span style={{ position: 'absolute', left: '16px', bottom: '10px', color: 'white', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Ticket size={14} /> Event Pass
                </span>
              </div>
              <div style={{ padding: 'var(--spacing-md)', borderTop: '2px dashed var(--color-border)' }}>
              {isPreviewMode ? (
                <div className="text-center" style={{ padding: '20px 0' }}>
                  <Eye size={40} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Event Preview</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                    This is a preview of the event page. RSVPs are disabled in preview mode.
                  </p>
                  <Button variant="outline" disabled style={{ width: '100%', padding: '12px 0' }}>
                    RSVPs Disabled
                  </Button>
                </div>
              ) : existingRsvp && existingRsvp.status === 'waitlist' && existingRsvp.approvalState !== 'REJECTED' ? (
                <div className="text-center">
                  <Clock size={40} style={{ color: '#ca8a04', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>You're on the waitlist</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Status: <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#ca8a04' }}>● WAITLISTED</span>
                  </p>
                  <p style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.08)', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', color: '#92600a' }}>
                    This event is currently full. If a spot opens up, the host will review the waitlist and approve guests — we'll email you if you're in.
                  </p>
                  <Link to="/dashboard">
                    <Button variant="outline" style={{ width: '100%' }}>Track My Request</Button>
                  </Link>
                </div>
              ) : existingRsvp && existingRsvp.approvalState === 'UNDER_APPROVAL' ? (
                <div className="text-center">
                  <Clock size={40} style={{ color: '#ca8a04', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Request received!</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Status: <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#ca8a04' }}>● UNDER APPROVAL</span>
                  </p>
                  <p style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.08)', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', color: '#92600a' }}>
                    The organizer is reviewing your request. We'll email you as soon as they approve it.
                  </p>
                  <Link to="/dashboard">
                    <Button variant="outline" style={{ width: '100%' }}>Track My Request</Button>
                  </Link>
                </div>
              ) : existingRsvp && existingRsvp.approvalState === 'REJECTED' ? (
                <div className="text-center">
                  <X size={40} style={{ color: '#dc2626', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Not approved</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Status: <span className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>● NOT APPROVED</span>
                  </p>
                  {existingRsvp.rejectionReason && (
                    <p style={{ fontSize: '0.8rem', background: 'var(--color-surface-hover)', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                      Reason: {existingRsvp.rejectionReason}
                    </p>
                  )}
                  <Link to="/dashboard">
                    <Button variant="outline" style={{ width: '100%' }}>View in Dashboard</Button>
                  </Link>
                </div>
              ) : existingRsvp ? (
                <div className="text-center">
                  <CheckCircle size={40} style={{ color: 'var(--color-accent)', margin: '0 auto var(--spacing-sm) auto' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>You're on the list!</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                    Status: <span className="badge badge-primary">{existingRsvp.status.toUpperCase()}</span>
                  </p>
                  <p style={{ fontSize: '0.8rem', background: 'var(--color-surface-hover)', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                    Show your event ticket pass at the door for entry check-in.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowTicketModal(true)}
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <QrCode size={16} /> View Ticket Pass
                  </Button>
                  {/* Add to Calendar buttons */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g,'')}T${(event.time||'180000').replace(':','')}00/${event.date.replace(/-/g,'')}T220000&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.description)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(31, 58, 99,0.1)', color: 'var(--color-primary)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      + Google Calendar
                    </a>
                    <a
                      href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(event.title)}%0ALOCATION:${encodeURIComponent(event.location)}%0ADESCRIPTION:${encodeURIComponent(event.description)}%0ADTSTART:${event.date.replace(/-/g,'')}T${(event.time||'18:00').replace(':','')}00%0ADTEND:${event.date.replace(/-/g,'')}T220000%0AEND:VEVENT%0AEND:VCALENDAR`}
                      download={`${event.title.replace(/\s+/g,'-')}.ics`}
                      style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'rgba(0,200,83,0.1)', color: 'var(--color-accent)', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      + Apple Calendar
                    </a>
                  </div>
                </div>
              ) : isRsvpClosed ? (
                <div className="text-center">
                  <span className="stat-icon-tile stat-icon-red" style={{ margin: '0 auto 12px' }}><Lock size={20} /></span>
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
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '4px', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                    {event.approvalRequired ? 'Request your spot' : 'Reserve your spot'}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
                    {event.approvalRequired
                      ? 'This event requires organizer approval. Submit your request and the host will review it.'
                      : 'RSVP now to save your spot. Capacity is limited!'}
                  </p>

                  {event.ageRestricted && (
                    <div className="flex items-center gap-xs" style={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 700, marginBottom: '14px', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: '10px' }}>
                      <Lock size={15} /> {event.minimumAge}+ only · age verified at RSVP
                    </div>
                  )}

                  {event.enablePayments && (
                    <div className="flex items-center gap-xs" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '14px', background: 'rgba(0,200,83,0.08)', padding: '8px 12px', borderRadius: '10px' }}>
                      <Ticket size={16} /> Ticket Cost: ${event.ticketPrice} USD
                    </div>
                  )}

                  {/* Deadline note */}
                  {event.rsvpDeadline && (
                    <div className="flex items-center gap-xs text-muted" style={{ fontSize: '0.78rem', marginBottom: '16px' }}>
                      <Timer size={14} style={{ color: 'var(--color-primary)' }} />
                      RSVPs close {new Date(event.rsvpDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </div>
                  )}

                  <Button variant="primary" onClick={handleOpenRsvpDrawer} style={{ width: '100%', padding: '14px 0', fontSize: '1rem', fontWeight: 700 }} className="flex justify-center items-center gap-xs">
                    {event.approvalRequired ? 'Request to Join' : 'RSVP Now'} <ArrowRight size={18} />
                  </Button>
                </div>
              )}
              </div>
            </Card>

            {/* Quick Contacts Info */}
            <Card style={{ padding: 'var(--spacing-md)' }} className="flex flex-col gap-xs">
              <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>Questions?</span>
              <span className="flex items-center gap-xs" style={{ fontSize: '0.85rem' }}><Mail size={15} style={{ color: 'var(--color-primary)' }} /> {event.hostEmail || 'alex@safalevent.com'}</span>
              <span className="flex items-center gap-xs" style={{ fontSize: '0.85rem' }}><Phone size={15} style={{ color: 'var(--color-accent)' }} /> +1 (555) 999-8888</span>
              {/* UC-10: guests only see the in-app messaging option when the host enabled it */}
              {event.messagingEnabled && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-xs"
                  style={{ marginTop: '8px', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <MessageSquare size={15} style={{ color: 'var(--color-primary)' }} /> Message Host
                </button>
              )}
            </Card>

             {/* Share Event Card */}
            <Card style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Share This Event</span>
              <Button
                onClick={() => setShowShareModal(true)}
                variant="outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
              >
                <Share2 size={16} /> Open Share Link & OG Preview
              </Button>
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

                <FormField label="Email">
                  <FormInput type="email" placeholder="alice@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </FormField>
                <FormField label="Phone">
                  <FormInput type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
                  <div style={{ margin: '12px auto', background: 'rgba(31, 58, 99, 0.08)', border: '1px dashed rgba(31, 58, 99, 0.35)', borderRadius: '8px', padding: '8px 12px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
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

                {event.ageRestricted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600 }}>
                    <Lock size={15} /> This is an {event.minimumAge}+ event. We need a date of birth for every attendee.
                  </div>
                )}

                <FormField label="Your name">
                  <FormInput type="text" placeholder="Enter name" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} />
                </FormField>

                <FormField label="Will you attend?">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'going', label: 'Yes' },
                      ...(event.allowMaybeRsvp ? [{ key: 'maybe', label: 'Maybe' }] : []),
                      ...(event.allowNoRsvp !== false ? [{ key: 'declined', label: 'No' }] : []),
                    ].map(opt => {
                      const active = rsvpForm.status === opt.key;
                      const tone = opt.key === 'going' ? 'var(--color-primary)' : opt.key === 'maybe' ? 'var(--color-gold)' : '#ef4444';
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setRsvpForm({ ...rsvpForm, status: opt.key })}
                          style={{
                            flex: 1, minWidth: '80px', padding: '10px 12px', fontSize: '0.85rem', fontWeight: 700,
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            border: active ? `2px solid ${tone}` : '1px solid var(--color-border)',
                            background: active ? tone : 'var(--color-surface)',
                            color: active ? '#fff' : 'var(--color-text)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </FormField>

                {rsvpForm.status === 'declined' && (
                  <FormField label="Reason for declining *">
                    <FormTextarea
                      placeholder="Let the host know why you cannot attend..."
                      value={rsvpForm.declineReason || ''}
                      onChange={(e) => { setRsvpForm({ ...rsvpForm, declineReason: e.target.value }); setRsvpError(''); }}
                      rows={2}
                      required
                    />
                  </FormField>
                )}

                {event.ageRestricted && rsvpForm.status !== 'declined' && (
                  <FormField label="Your date of birth" hint="Used only to verify you meet the age requirement. Never shown publicly.">
                    <FormInput
                      type="date"
                      value={rsvpForm.dob}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => { setRsvpForm({ ...rsvpForm, dob: e.target.value }); setRsvpError(''); }}
                      required
                    />
                  </FormField>
                )}

                {rsvpForm.status !== 'declined' && (
                <FormField label="Number of guests (including yourself)" hint={`Max ${event.maxGuestsPerRsvp} per RSVP`}>
                  <select
                    value={rsvpForm.guestCount || 1}
                    onChange={(e) => handleGuestCountChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  >
                    {Array.from({ length: Math.min(event.maxGuestsPerRsvp, Math.max(1, event.capacity - totalAttending)) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'person (just me)' : 'people'}</option>
                    ))}
                  </select>
                </FormField>
                )}

                {/* Additional guest details (US-EVENT-015) */}
                {(rsvpForm.additionalGuests || []).length > 0 && (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px', background: 'var(--color-surface-hover)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                      Additional guests
                    </div>
                    <div className="flex flex-col gap-md">
                      {rsvpForm.additionalGuests.map((g, i) => (
                        <div key={i} style={{ borderTop: i > 0 ? '1px dashed var(--color-border)' : 'none', paddingTop: i > 0 ? '12px' : 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Guest {i + 2} <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>(+{i + 1})</span></div>
                          <div className="grid-2" style={{ gap: '8px' }}>
                            <FormField label="First name">
                              <FormInput type="text" placeholder="Jane" value={g.firstName} onChange={(e) => updateAdditionalGuest(i, 'firstName', e.target.value)} required />
                            </FormField>
                            <FormField label="Last name">
                              <FormInput type="text" placeholder="Doe" value={g.lastName} onChange={(e) => updateAdditionalGuest(i, 'lastName', e.target.value)} required />
                            </FormField>
                          </div>
                          {event.ageRestricted && (
                            <FormField label="Date of birth">
                              <FormInput
                                type="date"
                                value={g.dob}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => updateAdditionalGuest(i, 'dob', e.target.value)}
                                required
                              />
                            </FormField>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {rsvpError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {rsvpError}
                  </div>
                )}

                <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                  {rsvpForm.status === 'declined'
                    ? 'Submit response (Not attending)'
                    : rsvpForm.status === 'maybe'
                    ? 'Submit response (Maybe)'
                    : event.approvalRequired ? 'Request to Join' : 'Register'}
                </Button>
              </form>
            )}

            {drawerStep === 3 && (
              <div className="flex flex-col gap-md" style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Ticket Checkout</h4>
                <div style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Ticket Price:</span>
                    <strong>${event.ticketPrice}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Quantity:</span>
                    <strong>{rsvpForm.guestCount || 1} tickets</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '6px', fontWeight: 700 }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#16a34a' }}>${(rsvpForm.guestCount || 1) * event.ticketPrice} USD</span>
                  </div>
                </div>

                {checkoutError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    {checkoutError}
                  </div>
                )}

                <div className="flex flex-col gap-sm">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444 (Mock Card)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div className="grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>CVC Security</label>
                      <input
                        type="password"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  variant="primary"
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                >
                  {processingPayment ? 'Processing Secure Checkout...' : `Pay & Confirm RSVP ($${(rsvpForm.guestCount || 1) * event.ticketPrice})`}
                </Button>

                <button
                  type="button"
                  onClick={() => setDrawerStep(2)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', alignSelf: 'center', marginTop: '6px' }}
                >
                  Back to Details
                </button>
              </div>
            )}

            {drawerStep === 4 && (
              <div className="text-center flex flex-col items-center gap-md" style={{ padding: '12px 0' }}>
                {rsvpForm.status === 'declined' ? (
                  <>
                    <div style={{ padding: '24px', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <span className="stat-icon-tile" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '50%', padding: '12px' }}>
                        <X size={28} />
                      </span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>Response Saved</h4>
                      <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>You have declined the invitation for "{event.title}".</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Celebratory ticket */}
                    <div className="animate-fade-in" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', textAlign: 'left', background: 'white' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={coverImg} alt={event.title} style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,12,0.75), rgba(8,8,12,0.1))' }}></div>
                        <div style={{ position: 'absolute', left: '16px', bottom: '12px', right: '16px', color: 'white' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.9, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Ticket size={13} /> Admit {rsvpForm.guestCount || 1}
                          </span>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{event.title}</div>
                        </div>
                      </div>
                      <div style={{ padding: '14px 16px', borderTop: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="stat-icon-tile stat-icon-green" style={{ borderRadius: '50%' }}><Check size={22} /></span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rsvpForm.name || 'Guest'}</div>
                          <div className="text-muted flex items-center gap-xs" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                            <Calendar size={12} /> {eventDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {event.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>🎉 RSVP Confirmed!</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
                        You have successfully registered for "{event.title}". An email ticket invoice and details have been sent to <strong>{email}</strong>.
                      </p>
                    </div>
                  </>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', width: '100%', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Add to Calendar</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g,'')}T${(event.time||'180000').replace(':','')}00/${event.date.replace(/-/g,'')}T220000&location=${encodeURIComponent(event.location)}&details=${encodeURIComponent(event.description)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(31, 58, 99,0.1)', color: 'var(--color-primary)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Google
                    </a>
                    <a
                      href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(event.title)}%0ALOCATION:${encodeURIComponent(event.location)}%0ADESCRIPTION:${encodeURIComponent(event.description)}%0ADTSTART:${event.date.replace(/-/g,'')}T${(event.time||'18:00').replace(':','')}00%0ADTEND:${event.date.replace(/-/g,'')}T220000%0AEND:VEVENT%0AEND:VCALENDAR`}
                      download={`${event.title.replace(/\s+/g,'-')}.ics`}
                      style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(0,200,83,0.1)', color: 'var(--color-accent)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      iCal / .ics
                    </a>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDrawer(false)}
                  variant="primary"
                  style={{ width: '100%', padding: '12px', marginTop: '12px' }}
                >
                  Close & View Event
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {showShareModal && event && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px'
            }}>
              <Card className="glass-surface animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: 'var(--spacing-md)', borderRadius: '24px', textAlign: 'left', background: 'white', boxShadow: 'var(--shadow-lg)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Share Gathering</h3>
                  <button onClick={() => setShowShareModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
                </div>

                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>Copy the invitation link below to share with your friends:</p>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: '#f5f5f7', color: 'var(--color-text-muted)', outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    style={{ padding: '10px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'space-around' }}>
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(event.title + ': ' + window.location.href)}`, '_blank')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>W</span>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1DA1F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>T</span>
                    Twitter
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>F</span>
                    Facebook
                  </button>
                </div>

                {/* OG Interactive Preview */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Rich link preview (Open Graph)</h5>
                  
                  <div style={{ background: '#e5ddd5', borderRadius: '12px', padding: '12px', border: '1px solid #cbd5e1', maxWidth: '340px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'white', borderRadius: '8px', padding: '8px', borderLeft: '4px solid #00a884', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.65rem', color: '#8696a0', display: 'block' }}>safalevents.com</span>
                          <strong style={{ fontSize: '0.8rem', color: '#111b21', display: 'block', margin: '2px 0' }}>{event.title}</strong>
                          <p style={{ fontSize: '0.7rem', color: '#667781', margin: 0, lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {event.description || 'Join us for this exciting gathering!'}
                          </p>
                        </div>
                        <img src={coverImg} alt="" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>
                </div>

              </Card>
            </div>
          )}

      {/* ================================================================= */}
      {/* QR TICKET PASS MODAL                                              */}
      {/* ================================================================= */}
      {showTicketModal && event && existingRsvp && (
        <div
          onClick={() => setShowTicketModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,12,0.65)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-fade-in"
            style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}
          >
            {/* Ticket top — event cover + gradient */}
            <div style={{ position: 'relative', height: '160px' }}>
              <img src={coverImg} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,12,0.9) 0%, rgba(8,8,12,0.3) 60%, transparent 100%)' }} />
              <button
                onClick={() => setShowTicketModal(false)}
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              >
                <X size={16} />
              </button>
              <div style={{ position: 'absolute', bottom: '14px', left: '18px', right: '18px', color: 'white' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, marginBottom: '4px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Ticket size={11} /> Event Pass
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{event.title}</div>
              </div>
            </div>

            {/* Ticket body */}
            <div style={{ background: 'white' }}>
              {/* Tear line */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderTop: '2px dashed #e2e8f0', position: 'relative', margin: '0 -1px' }}>
                <div style={{ position: 'absolute', left: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(8,8,12,0.65)' }} />
                <div style={{ position: 'absolute', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(8,8,12,0.65)' }} />
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Guest name + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Attendee</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{existingRsvp.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{existingRsvp.email}</div>
                  </div>
                  <span style={{
                    background: '#16a34a15', color: '#16a34a',
                    fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                    padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                    {existingRsvp.status}
                  </span>
                </div>

                {/* Event details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: '#f8fafc', borderRadius: '12px', padding: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Time</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{event.time || '—'}</div>
                  </div>
                  {(event.eventMode === 'Onsite' || event.eventMode === 'Hybrid') && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Venue</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{event.venueName || event.location}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{event.addressLine1 || event.location}</div>
                    </div>
                  )}
                  {(event.eventMode === 'Virtual' || event.eventMode === 'Hybrid') && (
                    <div style={{ gridColumn: '1 / -1', background: 'rgba(139, 92, 246, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)', marginTop: '8px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Virtual Meeting</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6d28d9', marginBottom: '6px' }}>{event.meetingPlatform || 'Online'}</div>
                      <a href={event.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#8b5cf6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>Join Meeting</a>
                      {event.meetingId && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>ID: {event.meetingId} {event.meetingPasscode && `| Pass: ${event.meetingPasscode}`}</div>}
                    </div>
                  )}
                  {event.dressCode && event.dressCode !== 'No Dress Code' && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Dress Code</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ec4899' }}>{event.dressCode === 'Other' ? event.customDressCode : event.dressCode}</div>
                    </div>
                  )}
                </div>

                {/* QR Code (Hidden for purely virtual) */}
                {event.eventMode !== 'Virtual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                      <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '140px', height: '140px', display: 'block' }}>
                        {/* Top-left finder */}
                        <rect x="6" y="6" width="44" height="44" rx="4" fill="#1F3A63"/>
                        <rect x="12" y="12" width="32" height="32" rx="2" fill="white"/>
                        <rect x="18" y="18" width="20" height="20" rx="1" fill="#1F3A63"/>
                        {/* Top-right finder */}
                        <rect x="110" y="6" width="44" height="44" rx="4" fill="#1F3A63"/>
                        <rect x="116" y="12" width="32" height="32" rx="2" fill="white"/>
                        <rect x="122" y="18" width="20" height="20" rx="1" fill="#1F3A63"/>
                        {/* Bottom-left finder */}
                        <rect x="6" y="110" width="44" height="44" rx="4" fill="#1F3A63"/>
                        <rect x="12" y="116" width="32" height="32" rx="2" fill="white"/>
                        <rect x="18" y="122" width="20" height="20" rx="1" fill="#1F3A63"/>
                        {/* Data dots (centre region) */}
                        <rect x="58" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="70" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="82" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="94" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="58" y="68" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="82" y="68" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="70" y="80" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="94" y="80" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="58" y="92" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="70" y="92" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="94" y="92" width="7" height="7" rx="1" fill="#1F3A63"/>
                        {/* Right column data */}
                        <rect x="112" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="124" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="136" y="56" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="112" y="68" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="136" y="68" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="124" y="80" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="112" y="92" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="136" y="92" width="7" height="7" rx="1" fill="#1F3A63"/>
                        {/* Bottom-right data */}
                        <rect x="58" y="112" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="70" y="112" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="94" y="112" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="82" y="124" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="58" y="124" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="58" y="136" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="82" y="136" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="94" y="136" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="112" y="112" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="136" y="112" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="124" y="124" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="112" y="136" width="7" height="7" rx="1" fill="#1F3A63"/>
                        <rect x="136" y="136" width="7" height="7" rx="1" fill="#1F3A63"/>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Show this QR at the door
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px', fontFamily: 'monospace' }}>
                        #{String(existingRsvp.email || 'guest').slice(0, 6).toUpperCase()}-{event.id}
                      </div>
                    </div>
                  </div>
                )}

                {/* Download button */}
                <button
                  type="button"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    border: '2px solid #1F3A63', background: 'transparent',
                    color: '#1F3A63', fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => alert('Pass saved to your device.')}
                >
                  <Download size={15} /> Save Pass to Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </PageShell>
  );
}
