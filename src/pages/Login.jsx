import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormSelect } from '../components/FormField';
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
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card">
          
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
                  Verification successful! Your organization application is now pending admin review. An administrator will review your documents and activate your account shortly.
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
                  We sent a 6-digit OTP code to {signupSession.formData.email} and {signupSession.formData.phone}.
                </p>
                <div style={{ margin: '12px auto', background: 'var(--color-surface-hover)', border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '8px 12px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  Active Code: {signupSession.otpCode}
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {errorMsg}
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
                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                  />
                </FormField>

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
              <div className="auth-header">
                <h1>{isSignup ? 'Become a Host' : 'Welcome back'}</h1>
                <p className="text-muted">
                  {isSignup ? 'Share only what you want — all fields are optional.' : 'Sign in with email or phone. No password needed.'}
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
                  
                  <div className="host-type-toggle">
                    <label className={`host-type-option ${hostType === 'individual' ? 'selected' : ''}`}>
                      <input type="radio" name="hostType" checked={hostType === 'individual'} onChange={() => { setHostType('individual'); setErrorMsg(''); }} />
                      <User size={16} /> Individual
                    </label>
                    <label className={`host-type-option ${hostType === 'organization' ? 'selected' : ''}`}>
                      <input type="radio" name="hostType" checked={hostType === 'organization'} onChange={() => { setHostType('organization'); setErrorMsg(''); }} />
                      <Building2 size={16} /> Organization
                    </label>
                  </div>

                  {hostType === 'individual' ? (
                    <div className="flex flex-col gap-sm animate-fade-in">
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
                      <FormField label="Password" hint="Optional — OTP login is used by default.">
                        <FormInput type="password" placeholder="••••••••" value={individualForm.password} onChange={(e) => setIndividualForm({ ...individualForm, password: e.target.value })} />
                      </FormField>
                      <label style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={individualForm.agreeTerms} onChange={(e) => setIndividualForm({ ...individualForm, agreeTerms: e.target.checked })} style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }} />
                        <span>I agree to the Terms and Privacy Policy</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-sm animate-fade-in">
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
                      <div className="settings-card flex flex-col gap-sm">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>Primary contact</span>
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
                      <FormField label="Organization document" hint="PDF, JPG, or PNG — optional for demo.">
                        <div style={{ position: 'relative', border: '2px dashed var(--color-border)', borderRadius: '8px', padding: '14px', textAlign: 'center', background: 'var(--color-surface-hover)', cursor: 'pointer' }}>
                          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} />
                          <Upload size={20} style={{ color: 'var(--color-primary)', margin: '0 auto 4px' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{uploadedFileName || 'Tap to upload a document'}</span>
                        </div>
                      </FormField>
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
                    <FormField label="Email or phone" hint="Or use a demo profile below to skip this step.">
                      <FormInput type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="you@email.com" />
                    </FormField>
                  ) : (
                    <FormField label="Verification code" hint={`Sent to ${inputVal}. Use 123456 in demo mode.`}>
                      <FormInput type="text" maxLength={6} value={otpVal} onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))} placeholder="123456" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }} />
                    </FormField>
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
          <Card compact>
            <div className="flex items-center gap-xs" style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>
              <Sparkles size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Try a demo profile</span>
            </div>
            <div className="flex flex-col gap-sm">
              <button type="button" onClick={() => handleQuickLogin('host')} className="demo-login-btn">
                <div className="flex items-center gap-sm">
                  <User size={18} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alex Rivera (Host)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Manage events, guest lists, and deep analytics.</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', padding: '2px 8px', background: 'rgba(79,70,229,0.1)', borderRadius: 'var(--radius-full)' }}>Host Dashboard</span>
              </button>

              <button type="button" onClick={() => handleQuickLogin('admin')} className="demo-login-btn">
                <div className="flex items-center gap-sm">
                  <Lock size={18} style={{ color: '#0ea5e9' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Super Admin (System Review)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Approve org hosts, view audit logs &amp; security metrics.</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0ea5e9', padding: '2px 8px', background: 'rgba(14,165,233,0.1)', borderRadius: 'var(--radius-full)' }}>Admin Portal</span>
              </button>
              
              <button type="button" onClick={() => handleQuickLogin('guest')} className="demo-login-btn">
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
