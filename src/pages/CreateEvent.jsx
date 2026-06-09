import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Image, CheckSquare, Calendar, MapPin, Users, HelpCircle, Eye, ArrowRight, Save, Shield, Compass, FileText, Bell, CreditCard, MessageSquare, Plus, Trash } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormTextarea, FormSelect } from '../components/FormField';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State matching all setting spec keys
  const [formData, setFormData] = useState({
    title: '',
    eventType: 'Meetup', // Party, Meetup, Workshop, Religious, Wedding, Other
    date: '',
    time: '',
    location: '',
    description: '',
    cover: '',
    theme: 'mesh-gradient-sunset',
    
    privacy: 'Public', // Public, Private, Unlisted
    rsvpStatus: 'Open', // Open, Closed
    showGuestList: true,

    capacity: 100,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '',

    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24, // hours
    requireCancellationReason: false,

    sendRsvpConfirmationEmail: true,
    sendRsvpConfirmationSms: true,
    sendPreEventReminders: true,
    sendPostEventFeedbackEmail: true,
    sendPostEventFeedbackSms: false,
    reminder1Offset: 24,
    reminder2Enabled: false,
    reminder2Offset: 3,
    feedbackDelay: 3,
    
    allowComments: true,
    enablePayments: false,
    ticketPrice: 0,
    
    questions: ['Any dietary restrictions?']
  });

  const handleAddField = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, '']
    });
  };

  const handleRemoveField = (idx) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== idx)
    });
  };

  const handleFieldChange = (idx, val) => {
    const updated = [...formData.questions];
    updated[idx] = val;
    setFormData({
      ...formData,
      questions: updated
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const cleanQuestions = formData.questions.filter(q => q.trim() !== '');
      const newEvent = mockStore.createEvent({
        ...formData,
        title: formData.title.trim() || 'My Event',
        date: formData.date || today,
        time: formData.time || '18:00',
        location: formData.location.trim() || 'To be announced',
        description: formData.description.trim() || 'Join us for a great gathering!',
        questions: cleanQuestions
      });
      // Redirect to the event details page
      navigate(`/e/${newEvent.id}`);
    }
  };

  // Predefined Gradient Themes
  const themes = [
    { id: 'mesh-gradient-sunset', label: 'Sunset Coral', gradient: 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)', text: '#fff' },
    { id: 'mesh-gradient-ocean', label: 'Ocean Indigo', gradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', text: '#fff' },
    { id: 'mesh-gradient-forest', label: 'Emerald Forest', gradient: 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)', text: '#fff' },
    { id: 'mesh-gradient-midnight', label: 'Midnight Obsidian', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', text: '#fff' }
  ];

  const selectedTheme = themes.find(t => t.id === formData.theme) || themes[0];

  return (
    <PageShell>
      <div className="create-event-layout">
        <div className="create-event-form-panel">
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '12px' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 style={{ fontSize: '1.75rem' }}>Create Event</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Fill in what you know — you can always edit later.</p>
          </div>

        <div className="step-indicator">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-indicator-bar ${step >= s ? 'active' : ''}`} />
          ))}
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* STEP 1: Basic Event Info Settings */}
          {step === 1 && (
            <div className="flex flex-col gap-sm">
              <h3 className="wizard-section-title"><Sparkles size={18} className="text-primary" /> Basic details</h3>
              <FormField label="Event title">
                <FormInput type="text" placeholder="Summer Rooftop Mixer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </FormField>
              <div className="grid-2">
                <FormField label="Event type">
                  <FormSelect value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                    <option value="Party">Party</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Religious">Religious / Temple</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Other">Other</option>
                  </FormSelect>
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <FormField label="Date">
                    <FormInput type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </FormField>
                  <FormField label="Time">
                    <FormInput type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                  </FormField>
                </div>
              </div>
              <FormField label="Venue">
                <FormInput type="text" placeholder="Penthouse Lounge, Manhattan" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </FormField>
              <FormField label="Description">
                <FormTextarea placeholder="Tell guests what to expect..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </FormField>
            </div>
          )}

          {/* STEP 2: Theme & Cover Styling */}
          {step === 2 && (
            <div className="flex flex-col gap-sm">
              <h3 style={{ fontSize: '1.15rem' }} className="flex items-center gap-xs"><Image size={18} className="text-primary" /> 2. Theme & Design</h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Select Theme Gradient</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: t.id })}
                      style={{
                        padding: '16px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: formData.theme === t.id ? '3px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: t.gradient,
                        color: t.text,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.15s'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <FormField label="Cover image URL">
                <FormInput type="text" placeholder="https://images.unsplash.com/..." value={formData.cover} onChange={(e) => setFormData({ ...formData, cover: e.target.value })} />
              </FormField>
            </div>
          )}

          {/* STEP 3: Visibility, Capacity & Deadlines */}
          {step === 3 && (
            <div className="flex flex-col gap-sm">
              <h3 style={{ fontSize: '1.15rem' }} className="flex items-center gap-xs"><Compass size={18} className="text-primary" /> 3. Visibility & Capacity</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Event Privacy</label>
                  <select
                    value={formData.privacy}
                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  >
                    <option value="Public">Public (Listed in discover)</option>
                    <option value="Private">Private (Direct link only)</option>
                    <option value="Unlisted">Unlisted (Profile lists only)</option>
                  </select>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                    ℹ️ <strong>Impact:</strong> Controls discovery on discover tab.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>RSVP Status</label>
                  <select
                    value={formData.rsvpStatus}
                    onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  >
                    <option value="Open">Open (Accepting RSVPs)</option>
                    <option value="Closed">Closed (Disabled bookings)</option>
                  </select>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                    ℹ️ <strong>Impact:</strong> Instantly opens/closes new RSVPs.
                  </span>
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} className="flex justify-between items-center">
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Show Guest List Social Proof</h4>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>Show avatars & names of registered guests on invite page.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={formData.showGuestList} 
                    onChange={(e) => setFormData({ ...formData, showGuestList: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Total Venue Capacity</label>
                  <input 
                    type="number" 
                    value={formData.capacity} 
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                    ℹ️ Max headcount spots available.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Max Guests Per RSVP</label>
                  <input 
                    type="number" 
                    value={formData.maxGuestsPerRsvp} 
                    onChange={(e) => setFormData({ ...formData, maxGuestsPerRsvp: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                    ℹ️ Limits additional plus-ones.
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>RSVP Deadline Date</label>
                <input 
                  type="datetime-local" 
                  value={formData.rsvpDeadline} 
                  onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                  ℹ️ <strong>Impact:</strong> Auto-closes RSVPs once date/time passes.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Guest Self-Service & Notifications / Alerts */}
          {step === 4 && (
            <div className="flex flex-col gap-sm" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              <h3 style={{ fontSize: '1.15rem' }} className="flex items-center gap-xs"><Shield size={18} className="text-primary" /> 4. Rules & Notifications</h3>
              
              {/* Self service */}
              <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} className="flex flex-col gap-xs">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Guest Self-Service Policies</h4>
                
                <div className="flex justify-between items-center" style={{ margin: '4px 0' }}>
                  <span style={{ fontSize: '0.8rem' }}>Allow guests to self-edit RSVP details</span>
                  <label className="switch">
                    <input type="checkbox" checked={formData.allowSelfEdit} onChange={(e) => setFormData({ ...formData, allowSelfEdit: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="flex justify-between items-center" style={{ margin: '4px 0' }}>
                  <span style={{ fontSize: '0.8rem' }}>Allow guests to self-cancel RSVPs</span>
                  <label className="switch">
                    <input type="checkbox" checked={formData.allowSelfCancellation} onChange={(e) => setFormData({ ...formData, allowSelfCancellation: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Cancellation Cutoff (hrs)</label>
                    <input 
                      type="number" 
                      value={formData.cancellationCutoff} 
                      onChange={(e) => setFormData({ ...formData, cancellationCutoff: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Require Reason</span>
                      <label className="switch" style={{ transform: 'scale(0.8)' }}>
                        <input type="checkbox" checked={formData.requireCancellationReason} onChange={(e) => setFormData({ ...formData, requireCancellationReason: e.target.checked })} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} className="flex flex-col gap-xs">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bell size={14} className="text-primary" /> Notifications & Reminders Setup
                </h4>
                
                <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem' }}>Send RSVP Confirmation Emails</span>
                  <label className="switch" style={{ transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={formData.sendRsvpConfirmationEmail} onChange={(e) => setFormData({ ...formData, sendRsvpConfirmationEmail: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem' }}>Send RSVP Confirmation SMS</span>
                  <label className="switch" style={{ transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={formData.sendRsvpConfirmationSms} onChange={(e) => setFormData({ ...formData, sendRsvpConfirmationSms: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem' }}>Send Pre-Event Reminders (24h)</span>
                  <label className="switch" style={{ transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={formData.sendPreEventReminders} onChange={(e) => setFormData({ ...formData, sendPreEventReminders: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem' }}>Send Post-Event Feedback Email</span>
                  <label className="switch" style={{ transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={formData.sendPostEventFeedbackEmail} onChange={(e) => setFormData({ ...formData, sendPostEventFeedbackEmail: e.target.checked })} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Comments & Payments */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Allow Comments</span>
                    <label className="switch">
                      <input type="checkbox" checked={formData.allowComments} onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })} />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Paid Ticket</span>
                    <label className="switch">
                      <input type="checkbox" checked={formData.enablePayments} onChange={(e) => setFormData({ ...formData, enablePayments: e.target.checked })} />
                      <span className="slider"></span>
                    </label>
                  </div>
                  {formData.enablePayments && (
                    <input 
                      type="number" 
                      placeholder="Price ($)" 
                      value={formData.ticketPrice} 
                      onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                      style={{ width: '100%', padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                  )}
                </div>
              </div>

              {/* Custom Questions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Checkout Questions</label>
                {formData.questions.map((q, idx) => (
                  <div key={idx} className="flex gap-xs items-center" style={{ marginBottom: '6px' }}>
                    <FormInput
                      type="text"
                      placeholder="e.g. Dietary details?"
                      value={q}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveField(idx)}
                      style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddField}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  + Add Custom Question
                </button>
              </div>

            </div>
          )}

          {/* Wizard Navigation */}
          <div className="flex justify-between items-center" style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)' }}>
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button variant="primary" type="submit" className="flex items-center gap-xs">
              {step < 4 ? (
                <>Next Step <ArrowRight size={18} /></>
              ) : (
                <>Publish Event <Save size={18} /></>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="create-event-preview-panel">
        <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
          
          <div className="text-center" style={{ marginBottom: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Eye size={14} /> LIVE INVITATION PREVIEW
          </div>
          
          {/* Mock Public Event Page wrapper */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '24px',
            color: 'var(--color-text)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)'
          }}>
            
            {/* Event Cover / Gradient Banner */}
            <div style={{
              height: '160px',
              background: formData.cover ? `url(${formData.cover}) center/cover` : selectedTheme.gradient,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '16px',
              transition: 'background 0.3s'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)', zIndex: 1 }}></div>
              <h2 style={{ color: 'white', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0, zIndex: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {formData.title || 'Your Event Title Here'}
              </h2>
            </div>

            {/* Event Meta Details */}
            <div style={{ padding: '20px' }} className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs text-muted" style={{ fontSize: '0.85rem' }}>
                <div className="flex items-center gap-xs" style={{ color: 'var(--color-text)' }}>
                  <Calendar size={16} className="text-primary" />
                  <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'} • {formData.time || 'Time TBD'}</span>
                </div>
                <div className="flex items-center gap-xs" style={{ color: 'var(--color-text)' }}>
                  <MapPin size={16} className="text-accent" />
                  <span>{formData.location || 'Venue Location Address'}</span>
                </div>
                <div className="flex items-center gap-xs">
                  <Users size={16} />
                  <span>Capacity: Limit to {formData.capacity} guests {formData.privacy === 'Private' ? '(Private Event)' : ''}</span>
                </div>
                {formData.rsvpDeadline && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                    RSVP Deadline: {new Date(formData.rsvpDeadline).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {formData.description || 'Description of your gathering. Add details about activities, dress code, parking or drinks here...'}
                </p>
              </div>

              {/* RSVP Form Widget */}
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '16px',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
                  {formData.rsvpStatus === 'Closed' ? 'RSVPs are Closed' : 'Are you coming?'}
                </p>
                
                {formData.rsvpStatus === 'Open' ? (
                  <div className="flex gap-xs justify-center" style={{ marginBottom: '12px' }}>
                    <Button variant="outline" type="button" style={{ pointerEvents: 'none', padding: '6px 14px', fontSize: '0.85rem' }}>Going</Button>
                    <Button variant="outline" type="button" style={{ pointerEvents: 'none', padding: '6px 14px', fontSize: '0.85rem' }}>Maybe</Button>
                    <Button variant="outline" type="button" style={{ pointerEvents: 'none', padding: '6px 14px', fontSize: '0.85rem' }}>No</Button>
                  </div>
                ) : (
                  <Button variant="outline" disabled style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>Registration Closed</Button>
                )}

                {formData.enablePayments && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>
                    🎟️ Ticket Price: ${formData.ticketPrice} USD
                  </div>
                )}
                
                {formData.questions.length > 0 && formData.questions[0].trim() !== '' && (
                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Rsvp Questions:</p>
                    {formData.questions.map((q, i) => q.trim() !== '' && (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text)', fontWeight: 500 }}>{q}</span>
                        <input type="text" disabled placeholder="Guest answer..." style={{ width: '100%', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guest list social proof toggle in preview */}
              {!formData.showGuestList && (
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  🔒 Guest list is set to private.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      </div>
    </PageShell>
  );
}
