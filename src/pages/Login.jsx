import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { CheckCircle2, ArrowLeft, ShieldAlert, Sparkles, User, Users } from 'lucide-react';
import { mockStore } from '../utils/mockStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSignup, setIsSignup] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [otpVal, setOtpVal] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsSignup(true);
    }
  }, [location]);

  const handleHostSignup = (e) => {
    e.preventDefault();
    setSignupSuccess(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!showOtp) {
      if (inputVal.trim()) {
        setShowOtp(true);
      }
    } else {
      if (otpVal.trim() === '123456' || otpVal.trim().length >= 4) {
        // By default, if logging in via phone/email, check if they are "Host" email or regular.
        // Let's make it a Host login if it contains 'host' or 'alex', else Guest.
        const isHost = inputVal.toLowerCase().includes('host') || inputVal.toLowerCase().includes('alex');
        if (isHost) {
          mockStore.setCurrentUser({
            role: 'host',
            name: 'Alex Rivera',
            email: inputVal.includes('@') ? inputVal : 'alex@safalevent.com',
            phone: !inputVal.includes('@') ? inputVal : '+1 (555) 999-8888'
          });
        } else {
          mockStore.setCurrentUser({
            role: 'guest',
            name: 'Alice Vance',
            email: inputVal.includes('@') ? inputVal : 'alice@example.com',
            phone: !inputVal.includes('@') ? inputVal : '+1 (555) 123-4567'
          });
        }
        navigate('/dashboard');
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

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '100vh', padding: 'var(--spacing-xl) 0' }}>
      
      {/* Back button */}
      <Link to="/" style={{ position: 'absolute', top: 'var(--spacing-sm)', left: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div style={{ width: '100%', maxWidth: '500px' }} className="flex flex-col gap-md">
        <Card style={{ padding: 'var(--spacing-xl)' }}>
          
          {signupSuccess ? (
            <div className="text-center" style={{ padding: 'var(--spacing-sm) 0' }}>
              <CheckCircle2 size={64} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-md)' }} />
              <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>Request Submitted</h2>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>
                We'll review your request within 24 hours. You'll receive an email once approved.
              </p>
              <Button variant="primary" onClick={() => navigate('/')} style={{ width: '100%' }}>Return to Home</Button>
            </div>
          ) : (
            <>
              <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>
                  {isSignup ? 'Become a Host' : 'Welcome to SafalEvent'}
                </h1>
                <p className="text-muted">
                  {isSignup ? 'Apply to host events on our platform.' : 'Log in securely with your contact details.'}
                </p>
              </div>

              {isSignup ? (
                <form onSubmit={handleHostSignup} className="flex flex-col gap-md">
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Host Type</label>
                    <select required style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}>
                      <option>Individual</option>
                      <option>Organization</option>
                      <option>Community</option>
                      <option>Venue</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Organization Name</label>
                    <input type="text" required placeholder="Safal Gatherings" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Email Address</label>
                    <input type="email" required placeholder="host@example.com" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Phone Number</label>
                    <input type="tel" required placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} />
                  </div>
                  <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>Request Approval</Button>
                  
                  <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
                    <span className="text-muted">Already a host? </span>
                    <button type="button" onClick={() => setIsSignup(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Log in here</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-md">
                  {!showOtp ? (
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>Email or Phone Number</label>
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
                        <label style={{ fontWeight: 500 }}>Enter OTP</label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Sent to {inputVal}</span>
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={otpVal}
                        onChange={(e) => setOtpVal(e.target.value)}
                        placeholder="123456" 
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem' }} 
                      />
                      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Tip: Enter any 6-digit code to log in.</p>
                    </div>
                  )}
                  <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}>
                    {showOtp ? 'Verify & Login' : 'Send OTP'}
                  </Button>
                  
                  <div className="text-center" style={{ marginTop: 'var(--spacing-md)' }}>
                    <span className="text-muted">Want to host events? </span>
                    <button type="button" onClick={() => setIsSignup(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Apply here</button>
                  </div>
                </form>
              )}
            </>
          )}
        </Card>

        {/* Demo Quick Logins Card */}
        {!isSignup && !signupSuccess && (
          <Card style={{ padding: 'var(--spacing-md)', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
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
                  background: 'white', 
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
                onClick={() => handleQuickLogin('guest')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)', 
                  background: 'white', 
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
  );
}

