import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormSelect } from '../components/FormField';
import {
  CheckCircle2, ArrowLeft, Sparkles, User, Users,
  Building2, Check, Lock, Timer, AlertCircle,
  Mail, ShieldCheck, Zap, Heart, Star
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import { HERO_IMAGES, AVATARS, getAvatar } from '../utils/images';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignup, setIsSignup] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login States
  const [showOtp, setShowOtp] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [loginOtpCode, setLoginOtpCode] = useState('');

  // Host Signup Core State
  const [hostType, setHostType] = useState('individual'); // individual or organization

  // Individual Fields
  const [individualForm, setIndividualForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'USA',
    city: '',
    agreeTerms: false
  });

  // Organization Fields
  const [orgForm, setOrgForm] = useState({
    orgName: '',
    orgType: 'NGO', // NGO, Temple, Company, Community, Other
    website: '',
    country: 'USA',
    city: '',
    state: '',
    firstName: '', // contact person
    lastName: '',
    email: '',
    phone: '',
    agreeRepresentation: false,
    agreeTerms: false
  });

  // OTP Verification screen state
  const [signupSession, setSignupSession] = useState(null);
  const [signupOtp, setSignupOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation / Error Messages
  const [errorMsg, setErrorMsg] = useState('');

  // UC-12: account-type chooser for signup ('guest' | 'host' | null)
  const [signupRole, setSignupRole] = useState(null);
  const [guestForm, setGuestForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // UC-13: "Login as Staff" path (Invite ID + email/phone)
  const [staffMode, setStaffMode] = useState(false);
  const [staffForm, setStaffForm] = useState({ inviteId: '', contact: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsSignup(true);
    }
  }, [location]);

  // Resend Timer Effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleHostSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    let formData = hostType === 'individual' ? { ...individualForm } : { ...orgForm };

    if (hostType === 'individual') {
      formData.firstName = formData.firstName.trim() || 'New';
      formData.lastName = formData.lastName.trim() || 'Host';
      formData.email = formData.email.trim() || `host${Date.now()}@example.com`;
      formData.phone = formData.phone.trim() || '+1 (555) 000-0000';
    } else {
      formData.orgName = formData.orgName.trim() || 'My Organization';
      formData.firstName = formData.firstName.trim() || 'Contact';
      formData.lastName = formData.lastName.trim() || 'Person';
      formData.email = formData.email.trim() || `org${Date.now()}@example.com`;
      formData.phone = formData.phone.trim() || '+1 (555) 000-0000';
      formData.city = formData.city.trim() || 'City';
      formData.state = formData.state.trim() || 'State';
    }

    const existingUsers = mockStore.getUsers();
    if (formData.email && existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase().trim())) {
      setErrorMsg('A host account with this email already exists. Try logging in instead.');
      return;
    }

    const session = mockStore.createSignupSession(hostType, formData);
    setSignupSession(session);
    setResendCooldown(30);
    setSignupOtp('');
  };

  // UC-12: guest signup — provisions a guest account, then lands in the guest flow
  const handleGuestSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formData = {
      firstName: guestForm.firstName.trim() || 'New',
      lastName: guestForm.lastName.trim() || 'Guest',
      email: guestForm.email.trim() || `guest${Date.now()}@example.com`,
      phone: guestForm.phone.trim() || '+1 (555) 000-0000',
    };

    const existingUsers = mockStore.getUsers();
    if (formData.email && existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setErrorMsg('An account with this email already exists. Try logging in instead.');
      return;
    }

    const session = mockStore.createSignupSession('individual', formData, 'guest');
    setSignupSession(session);
    setResendCooldown(30);
    setSignupOtp('');
  };

  // UC-13: validate an Invite ID against the email/phone it was issued to
  const handleStaffLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = mockStore.loginAsStaff(staffForm.inviteId, staffForm.contact);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    mockStore.setCurrentUser({ role: 'staff', name: res.staff.name, email: res.staff.email, phone: res.staff.phone });
    navigate('/dashboard');
  };

  const handleOtpVerifySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (signupOtp.trim().length > 0 && signupOtp.trim().length !== 6) {
      setErrorMsg('OTP should be 6 digits — or leave blank to skip verification in demo mode.');
      return;
    }

    const code = signupOtp.trim() || signupSession.otpCode;
    const res = mockStore.verifySignupSession(signupSession.id, code);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    // UC-12: a verified guest is logged straight into the guest flow
    if (res.user && res.user.role === 'guest') {
      mockStore.setCurrentUser({ role: 'guest', name: res.user.name, email: res.user.email, phone: res.user.phone });
      navigate('/dashboard');
      return;
    }

    setSignupSuccess(true);
  };

  const handleResendSignupOtp = () => {
    if (resendCooldown > 0 || !signupSession) return;

    const newSession = mockStore.createSignupSession(signupSession.hostType, signupSession.formData, signupSession.accountType || 'host');
    setSignupSession(newSession);
    setResendCooldown(30);
    setSignupOtp('');
    setErrorMsg('');

    alert(`[SMS/Email Resent] OTP Code: ${newSession.otpCode}`);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const registeredUsers = mockStore.getUsers();
    const user = registeredUsers.find(
      u => u.email.toLowerCase() === inputVal.toLowerCase().trim() ||
           u.phone.replace(/\D/g, '') === inputVal.replace(/\D/g, '')
    );

    if (!showOtp) {
      if (!user) {
        setErrorMsg('No registered host or admin account found with this email/phone. Sign up below.');
        return;
      }

      // Organization hosts in PENDING_ADMIN_APPROVAL may log in so they can upload
      // verification documents inside; the dashboard stays locked until an admin approves.
      if (user.status === 'REJECTED') {
        setErrorMsg(`Your host registration was rejected. Reason: ${user.rejectReason || 'Details not provided'}`);
        return;
      }

      // Generate login OTP
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setLoginOtpCode(generatedCode);
      setShowOtp(true);
      setOtpVal('');

      // Create simulated notification log
      mockStore.addNotificationLog(null, {
        rsvpId: null,
        guestEmail: user.email,
        type: 'rsvp',
        channel: 'Email',
        subject: 'Your SafalEvent Login Code',
        body: `SafalEvent Login Code: ${generatedCode}. Valid for 10 minutes.`
      });

      mockStore.logVerificationAttempt({
        type: 'login',
        targetEmail: user.email,
        targetPhone: user.phone,
        otpCode: generatedCode,
        success: true,
        message: 'Login OTP dispatched'
      });

      alert(`[SMS/Email Dispatched] Login OTP Code: ${generatedCode}`);
    } else {
      if (otpVal.trim() === loginOtpCode || otpVal.trim() === '123456') {
        mockStore.setCurrentUser({
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          hostType: user.hostType,
          orgProfile: user.orgProfile,
          status: user.status
        });
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid verification code. Please check and try again.');
      }
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'host') {
      mockStore.setCurrentUser({
        role: 'host',
        name: 'Alex Rivera',
        email: 'alex@safalevent.com',
        phone: '+1 (555) 999-8888'
      });
    } else if (role === 'admin') {
      mockStore.setCurrentUser({
        role: 'admin',
        name: 'Super Admin',
        email: 'admin@safalevent.com',
        phone: '+1 (555) 000-0000'
      });
    } else if (role === 'staff') {
      mockStore.setCurrentUser({
        role: 'staff',
        name: 'Sam Carter',
        email: 'sam@safalevent.com',
        phone: '+1 (555) 444-3333'
      });
    } else {
      mockStore.setCurrentUser({
        role: 'guest',
        name: 'Alice Vance',
        email: 'alice@example.com',
        phone: '+1 (555) 123-4567'
      });
    }
    navigate('/dashboard');
  };


  // ─── UI-only helpers (no logic) ───
  const orangeTint = 'rgba(255, 107, 53, 0.1)';
  const greenTint = 'rgba(0, 200, 83, 0.1)';

  const sectionLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    letterSpacing: '0.02em'
  };

  const demoPersonas = [
    {
      role: 'host',
      name: 'Alex Rivera',
      title: 'Alex Rivera · Host',
      desc: 'Manage events, guest lists, and deep analytics.',
      tag: 'Host Dashboard',
      color: 'var(--color-primary)',
      tint: orangeTint,
      avatar: getAvatar('alex@safalevent.com')
    },
    {
      role: 'admin',
      name: 'Super Admin',
      title: 'Super Admin · System Review',
      desc: 'Approve org hosts, view audit logs & security metrics.',
      tag: 'Admin Portal',
      color: '#0ea5e9',
      tint: 'rgba(14,165,233,0.1)',
      avatar: getAvatar('admin@safalevent.com')
    },
    {
      role: 'staff',
      name: 'Sam Carter',
      title: 'Sam Carter · Team Member',
      desc: 'Help run events with role-limited access (approvals, check-in).',
      tag: 'Team Portal',
      color: '#7c3aed',
      tint: 'rgba(124,58,237,0.1)',
      avatar: getAvatar('sam@safalevent.com')
    },
    {
      role: 'guest',
      name: 'Alice Vance',
      title: 'Alice Vance · Guest',
      desc: 'View RSVP tickets, QR codes, explore public events.',
      tag: 'Guest Board',
      color: 'var(--color-accent)',
      tint: greenTint,
      avatar: getAvatar('alice@example.com')
    }
  ];

  const benefits = [
    { icon: Zap, title: 'Launch in minutes', desc: 'Beautiful event pages, zero setup headaches.' },
    { icon: ShieldCheck, title: 'Verified & secure', desc: 'OTP sign-in and admin-reviewed organizations.' },
    { icon: Heart, title: 'Guests love it', desc: 'RSVPs, reminders, and QR check-in built right in.' }
  ];

  return (
    <PageShell>
      <div className="auth-page" style={{ padding: 'var(--spacing-xl) var(--spacing-sm)' }}>
        <div
          className="animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '1080px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}
        >
          {/* ── Mobile slim photo banner ── */}
          <div className="mobile-only" style={{ position: 'relative', height: '120px', gridColumn: '1 / -1', overflow: 'hidden' }}>
            <img
              src={HERO_IMAGES.loginSide}
              alt="Sparkler celebration"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,20,25,0.25) 0%, rgba(20,20,25,0.75) 100%)' }} />
            <div style={{ position: 'absolute', left: '20px', bottom: '14px', color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Where great events begin</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Trusted by 2,000+ hosts &amp; guests</div>
            </div>
          </div>

          {/* ── Left panel: the form ── */}
          <div style={{ padding: 'clamp(28px, 4.5vw, 52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {signupSuccess ? (
            <div className="text-center animate-fade-in" style={{ padding: 'var(--spacing-sm) 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: greenTint, color: 'var(--color-accent)', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <CheckCircle2 size={38} />
              </div>
              <h2 style={{ marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>You're in! 🎉</h2>
              {hostType === 'individual' ? (
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '0.95rem', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Verification successful. Your host account is active. You can now log in using your contact details.
                </p>
              ) : (
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '0.95rem', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Verification successful! Your organization application is now pending admin review. An administrator will review your documents and activate your account shortly.
                </p>
              )}
              <Button variant="primary" onClick={() => { setIsSignup(false); setSignupSuccess(false); setSignupSession(null); setSignupRole(null); }} style={{ width: '100%', padding: '13px', fontWeight: 600 }}>Proceed to Login</Button>
            </div>
          ) : signupSession ? (
            /* SIGNUP OTP VERIFICATION VIEW */
            <div className="animate-fade-in">
              <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: orangeTint, color: 'var(--color-primary)', marginBottom: '14px' }}>
                  <Mail size={26} />
                </div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>Check your inbox</h1>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  We sent a 6-digit OTP code to {signupSession.formData.email} and {signupSession.formData.phone}.
                </p>
                <div style={{ margin: '12px auto 0', background: orangeTint, border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <Sparkles size={14} /> Active Code: {signupSession.otpCode}
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-md">
                <FormField label="Verification code" hint="Leave blank in demo mode to auto-verify.">
                  <FormInput
                    type="text"
                    maxLength={6}
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.35rem', fontWeight: 700 }}
                  />
                </FormField>

                <Button variant="primary" type="submit" style={{ width: '100%', padding: '13px', fontWeight: 600, fontSize: '1rem' }}>
                  <Check size={18} /> Confirm Verification
                </Button>

                <div className="flex justify-between items-center" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                  <button
                    type="button"
                    onClick={() => { setSignupSession(null); setErrorMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={14} /> Back to details
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendSignupOtp}
                    style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary)', fontWeight: 600, cursor: resendCooldown > 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Timer size={14} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* LOGIN AND WIZARD SIGNUP FORMS */
            <>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <span className="badge badge-primary" style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} /> SafalEvents
                </span>
                <h1 style={{ fontSize: '1.9rem', marginBottom: '6px', fontFamily: 'var(--font-heading)', lineHeight: 1.15 }}>
                  {!isSignup
                    ? 'Welcome back 👋'
                    : !signupRole
                    ? 'Join SafalEvents'
                    : signupRole === 'guest'
                    ? 'Create your guest account'
                    : 'Become a Host'}
                </h1>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {!isSignup
                    ? 'Sign in with your email or phone. No password needed — we’ll text you a code.'
                    : !signupRole
                    ? 'How would you like to use SafalEvents?'
                    : signupRole === 'guest'
                    ? 'RSVP to events, get your tickets, and message hosts.'
                    : 'Share only what you want — every field is optional.'}
                </p>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isSignup && !signupRole ? (
                /* UC-12: account-type chooser — Host vs Guest */
                <div className="flex flex-col gap-md">
                  <button type="button" onClick={() => { setSignupRole('host'); setErrorMsg(''); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', flexShrink: 0 }}><Building2 size={20} /></span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: '1rem' }}>Host an event</span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Create &amp; manage events, approvals, staff, and settings.</span>
                    </span>
                    <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                  </button>
                  <button type="button" onClick={() => { setSignupRole('guest'); setErrorMsg(''); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: '#fff', flexShrink: 0 }}><User size={20} /></span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: '1rem' }}>Attend an event</span>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>RSVP, view tickets &amp; QR passes, message hosts.</span>
                    </span>
                    <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
                  </button>
                  <p className="text-muted" style={{ fontSize: '0.78rem', textAlign: 'center', marginTop: '2px' }}>
                    Team member? You join via an Invite ID from your host — use “Login as Staff”.
                  </p>
                  <div className="text-center" style={{ fontSize: '0.875rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <button type="button" onClick={() => { setIsSignup(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Log in</button>
                  </div>
                </div>
              ) : isSignup && signupRole === 'guest' ? (
                /* UC-12: guest signup form */
                <form onSubmit={handleGuestSignupSubmit} className="flex flex-col gap-md">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FormField label="First name"><FormInput value={guestForm.firstName} onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })} placeholder="Alice" /></FormField>
                    <FormField label="Last name"><FormInput value={guestForm.lastName} onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })} placeholder="Vance" /></FormField>
                  </div>
                  <FormField label="Email"><FormInput type="email" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} placeholder="you@email.com" /></FormField>
                  <FormField label="Phone"><FormInput value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></FormField>
                  <Button variant="primary" type="submit" style={{ width: '100%', padding: '13px', fontWeight: 700, fontSize: '1rem' }}><Mail size={16} /> Send verification code</Button>
                  <button type="button" onClick={() => { setSignupRole(null); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', alignSelf: 'center' }}><ArrowLeft size={14} /> Back</button>
                </form>
              ) : isSignup ? (
                /* HOST SIGNUP FORMS */
                <form onSubmit={handleHostSignupSubmit} className="flex flex-col gap-md">

                  <button type="button" onClick={() => { setSignupRole(null); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', alignSelf: 'flex-start' }}><ArrowLeft size={14} /> Back to account type</button>

                  <div>
                    <div style={{ ...sectionLabelStyle, marginBottom: '10px' }}>
                      <Users size={15} style={{ color: 'var(--color-primary)' }} /> Who's hosting?
                    </div>
                    <div className="host-type-toggle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label
                        className={`host-type-option ${hostType === 'individual' ? 'selected' : ''}`}
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '14px',
                          position: 'relative',
                          borderRadius: 'var(--radius-md)',
                          borderWidth: '2px',
                          borderColor: hostType === 'individual' ? 'var(--color-primary)' : 'var(--color-border)',
                          background: hostType === 'individual' ? orangeTint : '#fff',
                          boxShadow: hostType === 'individual' ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <input type="radio" name="hostType" checked={hostType === 'individual'} onChange={() => { setHostType('individual'); setErrorMsg(''); }} />
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: hostType === 'individual' ? 'var(--color-primary)' : 'var(--color-surface-hover)', color: hostType === 'individual' ? '#fff' : 'var(--color-text-muted)' }}>
                          <User size={17} />
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>Individual</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 400, lineHeight: 1.35 }}>Birthdays, meetups &amp; personal events</span>
                        {hostType === 'individual' && (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff' }}>
                            <Check size={12} />
                          </span>
                        )}
                      </label>
                      <label
                        className={`host-type-option ${hostType === 'organization' ? 'selected' : ''}`}
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '14px',
                          position: 'relative',
                          borderRadius: 'var(--radius-md)',
                          borderWidth: '2px',
                          borderColor: hostType === 'organization' ? 'var(--color-primary)' : 'var(--color-border)',
                          background: hostType === 'organization' ? orangeTint : '#fff',
                          boxShadow: hostType === 'organization' ? 'var(--shadow-sm)' : 'none',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <input type="radio" name="hostType" checked={hostType === 'organization'} onChange={() => { setHostType('organization'); setErrorMsg(''); }} />
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: hostType === 'organization' ? 'var(--color-primary)' : 'var(--color-surface-hover)', color: hostType === 'organization' ? '#fff' : 'var(--color-text-muted)' }}>
                          <Building2 size={17} />
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>Organization</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 400, lineHeight: 1.35 }}>NGOs, temples, companies &amp; clubs</span>
                        {hostType === 'organization' && (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff' }}>
                            <Check size={12} />
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {hostType === 'individual' ? (
                    <div className="flex flex-col gap-sm animate-fade-in">
                      <div style={sectionLabelStyle}>
                        <User size={15} style={{ color: 'var(--color-primary)' }} /> About you
                      </div>
                      <div className="grid-2">
                        <FormField label="First name">
                          <FormInput type="text" placeholder="Alex" value={individualForm.firstName} onChange={(e) => setIndividualForm({ ...individualForm, firstName: e.target.value })} />
                        </FormField>
                        <FormField label="Last name">
                          <FormInput type="text" placeholder="Rivera" value={individualForm.lastName} onChange={(e) => setIndividualForm({ ...individualForm, lastName: e.target.value })} />
                        </FormField>
                      </div>
                      <div className="grid-2">
                        <FormField label="Email">
                          <FormInput type="email" placeholder="alex@example.com" value={individualForm.email} onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })} />
                        </FormField>
                        <FormField label="Phone">
                          <FormInput type="tel" placeholder="+1 (555) 000-0000" value={individualForm.phone} onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })} />
                        </FormField>
                      </div>
                      <FormField label="City">
                        <FormInput type="text" placeholder="New York" value={individualForm.city} onChange={(e) => setIndividualForm({ ...individualForm, city: e.target.value })} />
                      </FormField>
                      <label style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={individualForm.agreeTerms} onChange={(e) => setIndividualForm({ ...individualForm, agreeTerms: e.target.checked })} style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }} />
                        <span>I agree to the Terms and Privacy Policy</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-sm animate-fade-in">
                      <div style={sectionLabelStyle}>
                        <Building2 size={15} style={{ color: 'var(--color-primary)' }} /> Organization details
                      </div>
                      <div className="grid-2">
                        <FormField label="Organization name">
                          <FormInput type="text" placeholder="Temple Community Group" value={orgForm.orgName} onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })} />
                        </FormField>
                        <FormField label="Organization type">
                          <FormSelect value={orgForm.orgType} onChange={(e) => setOrgForm({ ...orgForm, orgType: e.target.value })}>
                            <option value="NGO">NGO (Non-Profit)</option>
                            <option value="Temple">Temple / Religious</option>
                            <option value="Community">Community / Club</option>
                            <option value="Company">Company / Corporate</option>
                            <option value="Other">Other</option>
                          </FormSelect>
                        </FormField>
                      </div>
                      <div className="grid-2">
                        <FormField label="Website">
                          <FormInput type="url" placeholder="https://yoursite.org" value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} />
                        </FormField>
                        <FormField label="City">
                          <FormInput type="text" placeholder="San Francisco" value={orgForm.city} onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })} />
                        </FormField>
                      </div>
                      <div className="flex flex-col gap-sm" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                        <span style={sectionLabelStyle}>
                          <User size={15} style={{ color: 'var(--color-primary)' }} /> Primary contact
                        </span>
                        <div className="grid-2">
                          <FormField label="First name">
                            <FormInput type="text" placeholder="Alex" value={orgForm.firstName} onChange={(e) => setOrgForm({ ...orgForm, firstName: e.target.value })} />
                          </FormField>
                          <FormField label="Last name">
                            <FormInput type="text" placeholder="Rivera" value={orgForm.lastName} onChange={(e) => setOrgForm({ ...orgForm, lastName: e.target.value })} />
                          </FormField>
                        </div>
                        <div className="grid-2">
                          <FormField label="Email">
                            <FormInput type="email" placeholder="alex@org.com" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} />
                          </FormField>
                          <FormField label="Phone">
                            <FormInput type="tel" placeholder="+1 (555) 777-6666" value={orgForm.phone} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} />
                          </FormField>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)', padding: '13px', fontSize: '1rem', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
                    Create Account &amp; Send OTP
                  </Button>

                  <div className="text-center" style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                    <span className="text-muted">Already registered? </span>
                    <button type="button" onClick={() => { setIsSignup(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Log in here</button>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM (UC-13) */
                <>
                  {staffMode ? (
                    /* "Login as Staff" — Invite ID + email/phone */
                    <form onSubmit={handleStaffLogin} className="flex flex-col gap-md">
                      <div style={{ background: orangeTint, border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} /> Team member sign-in — use the Invite ID your host shared with you.
                      </div>
                      <FormField label="Invite ID" hint="Demo: INV-GATE-1 (QR Scanner) or INV-SAM-2026 (Coordinator).">
                        <FormInput type="text" value={staffForm.inviteId} onChange={(e) => setStaffForm({ ...staffForm, inviteId: e.target.value })} placeholder="INV-XXXXXX" />
                      </FormField>
                      <FormField label="Email or phone" hint="The email/phone the invite was issued to.">
                        <FormInput type="text" value={staffForm.contact} onChange={(e) => setStaffForm({ ...staffForm, contact: e.target.value })} placeholder="you@email.com" />
                      </FormField>
                      <Button variant="primary" type="submit" style={{ width: '100%', padding: '13px', fontWeight: 700, fontSize: '1rem', boxShadow: 'var(--shadow-md)' }}>
                        <Lock size={16} /> Sign in as Staff
                      </Button>
                      <button type="button" onClick={() => { setStaffMode(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', alignSelf: 'center' }}>
                        <ArrowLeft size={14} /> Back to normal login
                      </button>
                    </form>
                  ) : (
                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-md">
                    {!showOtp ? (
                      <FormField label="Email or phone" hint="Or use a demo profile below to skip this step.">
                        <FormInput type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="you@email.com" />
                      </FormField>
                    ) : (
                      <FormField label="Verification code" hint={`Sent to ${inputVal}. Use 123456 in demo mode.`}>
                        <FormInput type="text" maxLength={6} value={otpVal} onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))} placeholder="123456" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.35rem', fontWeight: 700 }} />
                      </FormField>
                    )}

                    <Button variant="primary" type="submit" style={{ width: '100%', padding: '13px', fontWeight: 700, fontSize: '1rem', boxShadow: 'var(--shadow-md)' }}>
                      {showOtp ? (<><Lock size={16} /> Verify &amp; Login</>) : (<><Mail size={16} /> Send Login OTP</>)}
                    </Button>

                    <button type="button" onClick={() => { setStaffMode(true); setErrorMsg(''); setShowOtp(false); }} style={{ width: '100%', padding: '11px', fontWeight: 700, fontSize: '0.9rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <ShieldCheck size={15} /> Login as Staff
                    </button>

                    <div className="text-center" style={{ fontSize: '0.875rem' }}>
                      <span className="text-muted">Want to host events? </span>
                      <button type="button" onClick={() => { setIsSignup(true); setSignupRole('host'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Apply here</button>
                    </div>
                  </form>
                  )}

                  {/* Demo Quick Logins */}
                  <div style={{ marginTop: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <Sparkles size={13} style={{ color: 'var(--color-primary)' }} /> Or try a demo profile
                      </span>
                      <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                    </div>
                    <div className="flex flex-col gap-sm">
                      {demoPersonas.map((p) => (
                        <button key={p.role} type="button" onClick={() => handleQuickLogin(p.role)} className="demo-login-btn">
                          <div className="flex items-center gap-sm">
                            <img src={p.avatar} alt={p.name} className="avatar-img" style={{ border: `2px solid ${p.color}` }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.title}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.desc}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: p.color, padding: '3px 10px', background: p.tint, borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>{p.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          </div>

          {/* ── Right panel: full-height celebration photo (desktop) ── */}
          <div className="desktop-only" style={{ position: 'relative', minHeight: '640px', overflow: 'hidden' }}>
            <img
              src={HERO_IMAGES.loginSide}
              alt="Friends celebrating with sparklers"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, rgba(20,20,25,0.15) 0%, rgba(20,20,25,0.55) 55%, rgba(20,20,25,0.85) 100%)' }} />

            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(28px, 4vw, 48px)', color: '#fff' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px' }}>
                <Sparkles size={13} /> Where great events begin
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', lineHeight: 1.2, marginBottom: '18px', color: '#fff' }}>
                Host moments people<br />never forget.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {benefits.map((b) => (
                  <div key={b.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(6px)', flexShrink: 0 }}>
                      <b.icon size={16} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{b.title}</div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.8, lineHeight: 1.4 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} style={{ fill: '#FFC107', color: '#FFC107' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '10px', fontStyle: 'italic' }}>
                  "I set up our temple's Diwali night in one evening — RSVPs, reminders, QR check-in. Our smoothest event ever."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={getAvatar('priya.sharma')} alt="Priya Sharma" className="avatar-img avatar-sm" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Priya Sharma</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.75 }}>Community Host · 14 events</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-stack">
                  {AVATARS.slice(0, 4).map((a, i) => (
                    <img key={i} src={a} alt="Community member" className="avatar-img avatar-sm" />
                  ))}
                  <span className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.6rem' }}>+2k</span>
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>Joined by 2,000+ hosts &amp; happy guests</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
