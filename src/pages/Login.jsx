import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { 
  CheckCircle2, ArrowLeft, ShieldAlert, Sparkles, User, Users, 
  Building2, Upload, FileText, Check, Lock, Timer, AlertCircle 
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';

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
    password: '',
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
    docs: ['mock_org_ein_letter.pdf'], // Mock uploaded documents list
    agreeRepresentation: false,
    agreeTerms: false
  });

  // OTP Verification screen state
  const [signupSession, setSignupSession] = useState(null);
  const [signupOtp, setSignupOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Validation / Error Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

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

    let formData = {};
    if (hostType === 'individual') {
      if (!individualForm.firstName || !individualForm.lastName || !individualForm.email || !individualForm.phone || !individualForm.agreeTerms) {
        setErrorMsg('Please fill in all required fields and agree to the terms.');
        return;
      }
      formData = { ...individualForm };
    } else {
      if (!orgForm.orgName || !orgForm.firstName || !orgForm.lastName || !orgForm.email || !orgForm.phone || !orgForm.agreeRepresentation || !orgForm.agreeTerms) {
        setErrorMsg('Please fill in all required fields, upload document proof, and agree to the terms.');
        return;
      }
      formData = { ...orgForm };
    }

    // RESTRICTION: restrict phone number to US format (simple check or length)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Please enter a valid US phone number with area code (at least 10 digits).');
      return;
    }

    // Check unique email in registered users
    const existingUsers = mockStore.getUsers();
    if (existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase().trim())) {
      setErrorMsg('A host account with this email address already exists. Please log in.');
      return;
    }

    // Create session & dispatch OTP
    const session = mockStore.createSignupSession(hostType, formData);
    setSignupSession(session);
    setResendCooldown(30);
    setSignupOtp('');
  };

  const handleOtpVerifySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (signupOtp.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    const res = mockStore.verifySignupSession(signupSession.id, signupOtp);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    setSignupSuccess(true);
  };

  const handleResendSignupOtp = () => {
    if (resendCooldown > 0 || !signupSession) return;
    
    const newSession = mockStore.createSignupSession(signupSession.hostType, signupSession.formData);
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

      if (user.status === 'PENDING_ADMIN_APPROVAL') {
        setErrorMsg('Your host application is currently pending admin review. You will receive an email once approved.');
        return;
      }

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
          phone: user.phone
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setOrgForm({ ...orgForm, docs: [file.name] });
    }
  };

  return (
    <PageShell>
      <div className="container flex justify-center items-center" style={{ minHeight: '80vh', padding: 'var(--spacing-xl) 0' }}>
        <div style={{ width: '100%', maxWidth: '540px' }} className="flex flex-col gap-md">
          <Card style={{ padding: 'var(--spacing-xl)' }} className="glass-surface">
          
          {signupSuccess ? (
            <div className="text-center" style={{ padding: 'var(--spacing-sm) 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', marginBottom: '16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>Registration Submitted!</h2>
              {hostType === 'individual' ? (
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '0.95rem' }}>
                  Verification successful. Your host account is active. You can now log in using your contact details.
                </p>
              ) : (
                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '0.95rem' }}>
                  Verification successful! Your organization application is now **Pending Admin Review**. An administrator will review your documents and activate your account shortly.
                </p>
              )}
              <Button variant="primary" onClick={() => { setIsSignup(false); setSignupSuccess(false); setSignupSession(null); }} style={{ width: '100%' }}>Proceed to Login</Button>
            </div>
          ) : signupSession ? (
            /* SIGNUP OTP VERIFICATION VIEW */
            <div className="animate-fade-in">
              <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)' }}>Verify Contact Details</h1>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  We sent a 6-digit OTP code to **{signupSession.formData.email}** and **{signupSession.formData.phone}**.
                </p>
                <div style={{ margin: '12px auto', background: 'rgba(79, 70, 229, 0.06)', border: '1px dashed rgba(79, 70, 229, 0.3)', borderRadius: '8px', padding: '8px 12px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  Active Code: {signupSession.otpCode}
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-md">
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500 }}>Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456" 
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }} 
                  />
                  <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '6px', textAlign: 'center' }}>
                    Code expires in 10 minutes. Max 5 verification attempts.
                  </p>
                </div>

                <Button variant="primary" type="submit" style={{ width: '100%', padding: '12px', fontWeight: 600 }}>
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
              <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  {isSignup ? 'Become a Host' : 'Welcome to SafalEvent'}
                </h1>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {isSignup ? 'Sign up to create, customize, and manage beautiful RSVPs.' : 'Log in securely with your contact details.'}
                </p>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isSignup ? (
                /* HOST SIGNUP FORMS */
                <form onSubmit={handleHostSignupSubmit} className="flex flex-col gap-md">
                  
                  {/* Host Type Selector Toggle */}
                  <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '4px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 600 }}>HOST REGISTRATION TYPE</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: hostType === 'individual' ? 600 : 400 }}>
                        <input 
                          type="radio" 
                          name="hostType" 
                          checked={hostType === 'individual'} 
                          onChange={() => { setHostType('individual'); setErrorMsg(''); }} 
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <User size={16} /> Individual Host
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: hostType === 'organization' ? 600 : 400 }}>
                        <input 
                          type="radio" 
                          name="hostType" 
                          checked={hostType === 'organization'} 
                          onChange={() => { setHostType('organization'); setErrorMsg(''); }} 
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <Building2 size={16} /> Organization Host
                      </label>
                    </div>
                  </div>

                  {hostType === 'individual' ? (
                    /* INDIVIDUAL FIELDS */
                    <div className="flex flex-col gap-sm animate-fade-in">
                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>First Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Alex" 
                            value={individualForm.firstName}
                            onChange={(e) => setIndividualForm({ ...individualForm, firstName: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Last Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Rivera" 
                            value={individualForm.lastName}
                            onChange={(e) => setIndividualForm({ ...individualForm, lastName: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Email Address *</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="alex@example.com" 
                            value={individualForm.email}
                            onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Phone (US Only) *</label>
                          <input 
                            type="tel" 
                            required 
                            placeholder="+1 (555) 000-0000" 
                            value={individualForm.phone}
                            onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Country *</label>
                          <input 
                            type="text" 
                            required 
                            readOnly
                            value={individualForm.country}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>City (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="New York" 
                            value={individualForm.city}
                            onChange={(e) => setIndividualForm({ ...individualForm, city: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Choose Password *</label>
                        <input 
                          type="password" 
                          required 
                          placeholder="••••••••" 
                          value={individualForm.password}
                          onChange={(e) => setIndividualForm({ ...individualForm, password: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                        />
                      </div>

                      <label style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          required
                          checked={individualForm.agreeTerms}
                          onChange={(e) => setIndividualForm({ ...individualForm, agreeTerms: e.target.checked })}
                          style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
                        />
                        <span>I agree to the [Terms &amp; Conditions](file:///terms) and [Privacy Policy](file:///privacy). *</span>
                      </label>
                    </div>
                  ) : (
                    /* ORGANIZATION FIELDS */
                    <div className="flex flex-col gap-sm animate-fade-in">
                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Organization Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Temple Community Group" 
                            value={orgForm.orgName}
                            onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Org Type *</label>
                          <select 
                            value={orgForm.orgType}
                            onChange={(e) => setOrgForm({ ...orgForm, orgType: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                          >
                            <option value="NGO">NGO (Non-Profit)</option>
                            <option value="Temple">Temple / religious</option>
                            <option value="Community">Community / Club</option>
                            <option value="Company">Company / Corporate</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Website (Optional)</label>
                          <input 
                            type="url" 
                            placeholder="https://templegroup.org" 
                            value={orgForm.website}
                            onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>State *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="California" 
                            value={orgForm.state}
                            onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Country *</label>
                          <input 
                            type="text" 
                            required 
                            readOnly
                            value={orgForm.country}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>City *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="San Francisco" 
                            value={orgForm.city}
                            onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                          />
                        </div>
                      </div>

                      {/* Contact Person */}
                      <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>PRIMARY CONTACT PERSON</span>
                        
                        <div className="flex flex-col gap-sm">
                          <div className="grid-2">
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 500 }}>First Name *</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Alex" 
                                value={orgForm.firstName}
                                onChange={(e) => setOrgForm({ ...orgForm, firstName: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} 
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 500 }}>Last Name *</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Rivera" 
                                value={orgForm.lastName}
                                onChange={(e) => setOrgForm({ ...orgForm, lastName: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} 
                              />
                            </div>
                          </div>

                          <div className="grid-2">
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 500 }}>Email Address *</label>
                              <input 
                                type="email" 
                                required 
                                placeholder="alex@templegroup.org" 
                                value={orgForm.email}
                                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} 
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 500 }}>Phone (US Only) *</label>
                              <input 
                                type="tel" 
                                required 
                                placeholder="+1 (555) 777-6666" 
                                value={orgForm.phone}
                                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents Upload */}
                      <div style={{ marginTop: '4px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>Upload Organization Document *</label>
                        <div style={{ position: 'relative', border: '2px dashed var(--color-border)', borderRadius: '8px', padding: '14px', textAlign: 'center', background: 'var(--color-surface-hover)', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <Upload size={20} style={{ color: 'var(--color-primary)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{uploadedFileName || 'Select Registration Certificate / EIN Letter'}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Supports PDF, JPG, PNG (Max 5MB)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-xs" style={{ marginTop: '4px' }}>
                        <label style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            required
                            checked={orgForm.agreeRepresentation}
                            onChange={(e) => setOrgForm({ ...orgForm, agreeRepresentation: e.target.checked })}
                            style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
                          />
                          <span>I confirm that I am authorised to represent this organization. *</span>
                        </label>
                        <label style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            required
                            checked={orgForm.agreeTerms}
                            onChange={(e) => setOrgForm({ ...orgForm, agreeTerms: e.target.checked })}
                            style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
                          />
                          <span>I agree to the [Terms &amp; Conditions](file:///terms) and [Privacy Policy](file:///privacy). *</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)', padding: '12px', fontSize: '1rem', fontWeight: 600 }}>
                    Create Account &amp; Send OTP
                  </Button>
                  
                  <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
                    <span className="text-muted">Already registered? </span>
                    <button type="button" onClick={() => { setIsSignup(false); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Log in here</button>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-md">
                  {!showOtp ? (
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Email Address or Phone Number</label>
                      <input 
                        type="text" 
                        required 
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder="Enter email or phone" 
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} 
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xs)' }}>
                        <label style={{ fontWeight: 500 }}>Enter 6-Digit OTP</label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Sent to {inputVal}</span>
                      </div>
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        value={otpVal}
                        onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456" 
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', letterSpacing: '4px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }} 
                      />
                      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '6px', textAlign: 'center' }}>
                        Tip: Enter the code dispatched in the alert window to log in.
                      </p>
                    </div>
                  )}

                  <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)', padding: '12px', fontWeight: 600 }}>
                    {showOtp ? 'Verify & Login' : 'Send Login OTP'}
                  </Button>
                  
                  <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
                    <span className="text-muted">Want to host events? </span>
                    <button type="button" onClick={() => { setIsSignup(true); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Apply here</button>
                  </div>
                </form>
              )}
            </>
          )}
        </Card>

        {/* Demo Quick Logins Card */}
        {!isSignup && !signupSuccess && (
          <Card style={{ padding: 'var(--spacing-md)', background: 'rgba(17, 24, 39, 0.65)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
            <div className="flex items-center gap-xs" style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>
              <Sparkles size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Demo Quick Login Profiles</span>
            </div>
            <div className="flex flex-col gap-sm">
              <button 
                type="button" 
                onClick={() => handleQuickLogin('host')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div className="flex items-center gap-sm">
                  <User size={18} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alex Rivera (Host)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Manage events, guest lists, and deep analytics.</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', padding: '2px 8px', background: 'rgba(79,70,229,0.1)', borderRadius: 'var(--radius-full)' }}>Host Dashboard</span>
              </button>

              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div className="flex items-center gap-sm">
                  <Lock size={18} style={{ color: '#0ea5e9' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Super Admin (System Review)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Approve org hosts, view audit logs &amp; security metrics.</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0ea5e9', padding: '2px 8px', background: 'rgba(14,165,233,0.1)', borderRadius: 'var(--radius-full)' }}>Admin Portal</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => handleQuickLogin('guest')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div className="flex items-center gap-sm">
                  <Users size={18} style={{ color: 'var(--color-accent)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alice Vance (Guest)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>View RSVP tickets, QR codes, explore public events.</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', padding: '2px 8px', background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-full)' }}>Guest Board</span>
              </button>
            </div>
          </Card>
        )}
        </div>
      </div>
    </PageShell>
  );
}
