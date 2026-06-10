import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Image, Calendar, MapPin, Users, Eye, ArrowRight, Save, Shield, Bell, CreditCard, Check, Copy, Link2, Palette, Clock, MessageSquare, Lock } from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import FormField, { FormInput, FormTextarea, FormSelect } from '../components/FormField';
import { EVENT_COVERS, AVATARS, getEventCover } from '../utils/images';

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
    showRsvpCounts: 'detailed',

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
    bankAccountName: '',
    bankRouting: '',
    bankAccount: '',
    bankName: '',

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

  // ─── Pure UI helpers (no logic changes) ───
  const wizardSteps = [
    { n: 1, label: 'Details', icon: Sparkles },
    { n: 2, label: 'Design', icon: Palette },
    { n: 3, label: 'Audience', icon: Users },
    { n: 4, label: 'Rules', icon: Shield }
  ];

  const galleryCategories = [
    { key: 'party', label: 'Party' },
    { key: 'concert', label: 'Concert' },
    { key: 'conference', label: 'Conference' },
    { key: 'meetup', label: 'Meetup' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'wedding', label: 'Wedding' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'festival', label: 'Festival' },
    { key: 'art', label: 'Art' },
    { key: 'gala', label: 'Gala' },
    { key: 'sports', label: 'Sports' }
  ];

  const previewCover = formData.cover || getEventCover({ eventType: formData.eventType, title: formData.title || 'preview' });
  const shareLinkMock = `${window.location.origin}/e/[event-id]`;

  const previewDateChip = formData.date
    ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'Date TBD';

  // Small presentational helper for toggle rows (pure markup)
  const ToggleRow = ({ title, desc, checked, onChange, small }) => (
    <div className="settings-row">
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{title}</div>
        {desc && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{desc}</div>}
      </div>
      <label className="switch" style={small ? { transform: 'scale(0.85)', flexShrink: 0 } : { flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );

  return (
    <PageShell>
      <div className="create-event-layout">
        <div className="create-event-form-panel">
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '12px' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon-tile stat-icon-orange" style={{ borderRadius: '14px' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>Create Event</h1>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>Fill in what you know — you can always edit later.</p>
              </div>
            </div>
          </div>

        {/* Friendly numbered step indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
          {wizardSteps.map((s, i) => {
            const done = step > s.n;
            const current = step === s.n;
            return (
              <React.Fragment key={s.n}>
                {i > 0 && (
                  <div style={{ flex: 1, height: '3px', borderRadius: '2px', marginTop: '15px', background: step > i ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '0 8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.25s',
                    background: done ? 'var(--color-accent)' : current ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: done || current ? '#fff' : 'var(--color-text-muted)',
                    border: done || current ? 'none' : '2px solid var(--color-border)',
                    boxShadow: current ? '0 4px 12px rgba(255,107,53,0.35)' : 'none'
                  }}>
                    {done ? <Check size={16} strokeWidth={3} /> : s.n}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: current ? 700 : 500, color: current ? 'var(--color-primary)' : done ? 'var(--color-accent)' : 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* STEP 1: Basic Event Info Settings */}
          {step === 1 && (
            <div className="flex flex-col gap-sm animate-fade-in">
              <h3 className="wizard-section-title"><Sparkles size={18} className="text-primary" /> Basic details</h3>
              <FormField label="Event title">
                <FormInput type="text" placeholder="Summer Rooftop Mixer" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </FormField>
              <div className="grid-2">
                <FormField label="Event type">
                  <FormSelect value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                    <option value="Party">Party / Social</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Webinar">Webinar</option>
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
            <div className="flex flex-col gap-sm animate-fade-in">
              <h3 className="wizard-section-title"><Palette size={18} className="text-primary" /> Theme &amp; design</h3>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Accent gradient</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: t.id })}
                      style={{
                        position: 'relative',
                        padding: '18px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: formData.theme === t.id ? '3px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: t.gradient,
                        color: t.text,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        boxShadow: formData.theme === t.id ? '0 6px 16px rgba(255,107,53,0.25)' : 'var(--shadow-sm)'
                      }}
                    >
                      {formData.theme === t.id && (
                        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} strokeWidth={3} color="#fff" />
                        </span>
                      )}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated cover gallery picker (pure UI — sets formData.cover) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Image size={15} className="text-primary" /> Pick a cover from our gallery
                </label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Curated photos by vibe — tap one to use it instantly.</p>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', background: 'var(--color-surface)' }}>
                  {galleryCategories.map(cat => (
                    <div key={cat.key} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        {cat.label}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(EVENT_COVERS[cat.key] || []).map((url, i) => {
                          const selected = formData.cover === url;
                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setFormData({ ...formData, cover: url })}
                              aria-label={`${cat.label} cover ${i + 1}`}
                              style={{
                                position: 'relative',
                                width: '104px',
                                height: '66px',
                                padding: 0,
                                borderRadius: '10px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: selected ? '3px solid var(--color-primary)' : '1px solid var(--color-border)',
                                boxShadow: selected ? '0 4px 12px rgba(255,107,53,0.3)' : 'var(--shadow-sm)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                background: 'var(--color-surface-hover)'
                              }}
                            >
                              <img src={url} alt={`${cat.label} cover option`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              {selected && (
                                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
                                  <Check size={12} strokeWidth={3} color="#fff" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <FormField label="Or upload your own" hint="JPG or PNG, max 5MB. Click to upload or drag & drop.">
                <div style={{ position: 'relative' }}>
                  {formData.cover && formData.cover.startsWith('data:') ? (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '8px', boxShadow: 'var(--shadow-sm)' }}>
                      <img src={formData.cover} alt="Event cover preview" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={() => setFormData({ ...formData, cover: '' })} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px', cursor: 'pointer', background: 'var(--color-surface-hover)', transition: 'border-color 0.2s' }}>
                      <Image size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>Upload Event Image</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>JPG or PNG, max 5MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
                          if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { alert('Only JPG and PNG files are supported.'); return; }
                          const reader = new FileReader();
                          reader.onload = (ev) => setFormData({ ...formData, cover: ev.target.result });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      <Link2 size={12} /> Or enter image URL:
                    </label>
                    <FormInput type="text" placeholder="https://images.unsplash.com/..." value={formData.cover && !formData.cover.startsWith('data:') ? formData.cover : ''} onChange={(e) => setFormData({ ...formData, cover: e.target.value })} />
                  </div>
                </div>
              </FormField>
            </div>
          )}

          {/* STEP 3: Visibility, Capacity & Deadlines */}
          {step === 3 && (
            <div className="flex flex-col gap-sm animate-fade-in">
              <h3 className="wizard-section-title"><Users size={18} className="text-primary" /> Visibility &amp; capacity</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="settings-card" style={{ padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Event Privacy</label>
                  <select
                    value={formData.privacy}
                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                  >
                    <option value="Public">Public (Listed in discover)</option>
                    <option value="Private">Private (Direct link only)</option>
                    <option value="Unlisted">Unlisted (Profile lists only)</option>
                  </select>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                    Controls whether your event appears on the discover tab.
                  </span>
                </div>

                <div className="settings-card" style={{ padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>RSVP Status</label>
                  <select
                    value={formData.rsvpStatus}
                    onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                  >
                    <option value="Open">Open (Accepting RSVPs)</option>
                    <option value="Closed">Closed (Disabled bookings)</option>
                  </select>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                    Instantly opens or closes new RSVPs.
                  </span>
                </div>
              </div>

              <div className="settings-card">
                <ToggleRow
                  title="Show guest list social proof"
                  desc="Show avatars & names of registered guests on the invite page — boosts FOMO and signups."
                  checked={formData.showGuestList}
                  onChange={(e) => setFormData({ ...formData, showGuestList: e.target.checked })}
                />
              </div>

              <div className="settings-card" style={{ padding: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>Show RSVP status counts to guests</label>
                <select
                  value={formData.showRsvpCounts}
                  onChange={(e) => setFormData({ ...formData, showRsvpCounts: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)', fontSize: '0.85rem' }}
                >
                  <option value="detailed">Show Going and Maybe separately</option>
                  <option value="total">Show only total count</option>
                  <option value="off">Off (Hide all RSVP counts)</option>
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                  Controls whether and how RSVP counts (Going/Maybe) are displayed on the public event page.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="settings-card" style={{ padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Total Venue Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                    Max headcount spots available.
                  </span>
                </div>

                <div className="settings-card" style={{ padding: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>Max Guests Per RSVP</label>
                  <input
                    type="number"
                    value={formData.maxGuestsPerRsvp}
                    onChange={(e) => setFormData({ ...formData, maxGuestsPerRsvp: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                    Limits additional plus-ones.
                  </span>
                </div>
              </div>

              <div className="settings-card" style={{ padding: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600, fontSize: '0.85rem' }}>
                  <Clock size={14} className="text-primary" /> RSVP Deadline Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.rsvpDeadline}
                  onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                  Auto-closes RSVPs once this date/time passes.
                </span>
              </div>

              {formData.privacy === 'Private' && (
                <div style={{ background: 'rgba(0,113,227,0.05)', border: '1px solid rgba(0,113,227,0.2)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} className="text-primary" /> Private Event — Share Link</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input readOnly value={`${window.location.origin}/e/[event-id]`} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/e/[event-id]`); alert('Link copied to clipboard!'); }} style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={12} /> Copy Link
                    </button>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Share via:
                    <button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Join my event: ' + window.location.origin + '/e/[event-id]')}`, '_blank')} style={{ background: 'none', border: 'none', color: '#25D366', fontWeight: 600, cursor: 'pointer', marginLeft: '8px', fontSize: '0.72rem' }}>WhatsApp</button>
                    <button type="button" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Join my event: ' + window.location.origin + '/e/[event-id]')}`, '_blank')} style={{ background: 'none', border: 'none', color: '#1DA1F2', fontWeight: 600, cursor: 'pointer', marginLeft: '8px', fontSize: '0.72rem' }}>Twitter</button>
                    <button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/e/[event-id]')}`, '_blank')} style={{ background: 'none', border: 'none', color: '#1877F2', fontWeight: 600, cursor: 'pointer', marginLeft: '8px', fontSize: '0.72rem' }}>Facebook</button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Guest Self-Service & Notifications / Alerts */}
          {step === 4 && (
            <div className="flex flex-col gap-sm animate-fade-in" style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
              <h3 className="wizard-section-title"><Shield size={18} className="text-primary" /> Rules &amp; notifications</h3>

              {/* Self service */}
              <div className="settings-card flex flex-col gap-xs">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} className="text-primary" /> Guest Self-Service Policies
                </h4>

                <ToggleRow
                  title="Allow guests to self-edit RSVP details"
                  desc="Guests can update their answers and party size without contacting you."
                  checked={formData.allowSelfEdit}
                  onChange={(e) => setFormData({ ...formData, allowSelfEdit: e.target.checked })}
                  small
                />

                <ToggleRow
                  title="Allow guests to self-cancel RSVPs"
                  desc="Frees their spot automatically for waitlisted guests."
                  checked={formData.allowSelfCancellation}
                  onChange={(e) => setFormData({ ...formData, allowSelfCancellation: e.target.checked })}
                  small
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cancellation Cutoff (hrs)</label>
                    <input
                      type="number"
                      value={formData.cancellationCutoff}
                      onChange={(e) => setFormData({ ...formData, cancellationCutoff: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Require Reason</span>
                      <label className="switch" style={{ transform: 'scale(0.8)' }}>
                        <input type="checkbox" checked={formData.requireCancellationReason} onChange={(e) => setFormData({ ...formData, requireCancellationReason: e.target.checked })} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="settings-card flex flex-col gap-xs">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} className="text-primary" /> Notifications &amp; Reminders
                </h4>

                <ToggleRow
                  title="Send RSVP Confirmation Emails"
                  desc="Instant email receipt when a guest registers."
                  checked={formData.sendRsvpConfirmationEmail}
                  onChange={(e) => setFormData({ ...formData, sendRsvpConfirmationEmail: e.target.checked })}
                  small
                />

                <ToggleRow
                  title="Send RSVP Confirmation SMS"
                  desc="Text-message confirmation for guests with a phone number."
                  checked={formData.sendRsvpConfirmationSms}
                  onChange={(e) => setFormData({ ...formData, sendRsvpConfirmationSms: e.target.checked })}
                  small
                />

                <ToggleRow
                  title="Send Pre-Event Reminders (24h)"
                  desc="Nudge guests a day before so fewer people no-show."
                  checked={formData.sendPreEventReminders}
                  onChange={(e) => setFormData({ ...formData, sendPreEventReminders: e.target.checked })}
                  small
                />

                <ToggleRow
                  title="Send Post-Event Feedback Email"
                  desc="Automatically collect ratings & comments after the event."
                  checked={formData.sendPostEventFeedbackEmail}
                  onChange={(e) => setFormData({ ...formData, sendPostEventFeedbackEmail: e.target.checked })}
                  small
                />
              </div>

              {/* Comments & Payments */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ToggleRow
                    title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><MessageSquare size={13} className="text-primary" /> Allow Comments</span>}
                    desc="Public Q&A on the event page."
                    checked={formData.allowComments}
                    onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                  />
                </div>

                <div className="settings-card">
                  <ToggleRow
                    title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><CreditCard size={13} className="text-primary" /> Paid Ticket</span>}
                    desc="Charge guests to attend."
                    checked={formData.enablePayments}
                    onChange={(e) => setFormData({ ...formData, enablePayments: e.target.checked })}
                  />
                  {formData.enablePayments && (
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', marginTop: '4px' }}
                    />
                  )}
                </div>
              </div>

              {formData.enablePayments && (
                <div className="settings-card">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={14} className="text-primary" /> Bank Account for Payouts (Required for Paid Events)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Account Holder Name</label>
                      <input type="text" placeholder="Legal name on account" value={formData.bankAccountName || ''} onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Routing Number</label>
                      <input type="text" placeholder="9-digit routing number" value={formData.bankRouting || ''} onChange={(e) => setFormData({ ...formData, bankRouting: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Account Number</label>
                      <input type="text" placeholder="Account number" value={formData.bankAccount || ''} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Bank Name</label>
                      <input type="text" placeholder="e.g. Chase, Bank of America" value={formData.bankName || ''} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>Payments collected from attendees will be automatically transferred to this account after the event.</p>
                </div>
              )}

              {/* Custom Questions */}
              <div className="settings-card">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <MessageSquare size={14} className="text-primary" /> Checkout Questions
                </label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Ask guests anything when they RSVP — meals, song requests, +1 names.</p>
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
                      style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}
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

              {/* Celebratory "ready to publish" summary card */}
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(0,200,83,0.35)', boxShadow: '0 8px 24px rgba(0,200,83,0.12)' }}>
                <div style={{ position: 'relative', height: '110px' }}>
                  <img src={previewCover} alt="Your event cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.05))' }}></div>
                  <div style={{ position: 'absolute', left: '14px', bottom: '10px', right: '14px', color: '#fff' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>Almost there</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', textShadow: '0 2px 4px rgba(0,0,0,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formData.title.trim() || 'My Event'} is ready to go live! 🎉
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="stat-icon-tile stat-icon-green" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                      Hit <strong style={{ color: 'var(--color-text)' }}>Publish Event</strong> and your invite goes live instantly with this share link:
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '999px', border: '1px dashed var(--color-border)', background: 'var(--color-bg)', fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: 0 }}>
                      <Link2 size={13} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shareLinkMock}</span>
                    </div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(shareLinkMock); alert('Link copied to clipboard!'); }} style={{ padding: '8px 12px', borderRadius: '999px', background: 'var(--color-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Wizard Navigation */}
          <div className="flex justify-between items-center" style={{ marginTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-sm)', flexWrap: 'wrap', gap: '8px' }}>
            <div className="flex gap-sm">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Previous Step
                </Button>
              ) : (
                <div></div>
              )}
              <Button type="button" variant="ghost" onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                const cleanQuestions = formData.questions.filter(q => q.trim() !== '');
                mockStore.createEvent({
                  ...formData,
                  title: formData.title.trim() || 'My Event',
                  date: formData.date || today,
                  time: formData.time || '18:00',
                  location: formData.location.trim() || 'To be announced',
                  description: formData.description.trim() || 'Join us for a great gathering!',
                  questions: cleanQuestions,
                  status: 'Draft'
                });
                navigate('/dashboard');
              }} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Save Draft
              </Button>
            </div>

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

          <div className="text-center" style={{ marginBottom: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Eye size={14} /> Live invitation preview
          </div>

          {/* Mock Public Event Page wrapper — what guests will receive */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '24px',
            color: 'var(--color-text)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)'
          }}>

            {/* Cover hero with gradient overlay title block (theme gradient shows while image loads) */}
            <div style={{ position: 'relative', height: '190px', background: selectedTheme.gradient }}>
              <img
                src={previewCover}
                alt="Event cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)` }}></div>
              <span className="badge badge-primary" style={{ position: 'absolute', top: '12px', left: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {formData.eventType}
              </span>
              {formData.privacy === 'Private' && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
                  <Lock size={10} /> Private
                </span>
              )}
              <div style={{ position: 'absolute', left: '16px', right: '16px', bottom: '12px' }}>
                <h2 style={{ color: 'white', fontSize: '1.45rem', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}>
                  {formData.title || 'Your Event Title Here'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', margin: '4px 0 0', fontWeight: 500 }}>
                  Hosted by you · powered by SafalEvents
                </p>
              </div>
            </div>

            {/* Event Meta Details */}
            <div style={{ padding: '18px 20px 20px' }} className="flex flex-col gap-sm">

              {/* Date / time / location chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,107,53,0.08)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '999px' }}>
                  <Calendar size={13} /> {previewDateChip}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,107,53,0.08)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '999px' }}>
                  <Clock size={13} /> {formData.time || 'Time TBD'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,200,83,0.1)', color: '#00913d', fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: '999px', maxWidth: '100%' }}>
                  <MapPin size={13} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.location || 'Venue TBD'}</span>
                </span>
              </div>

              <div className="flex items-center gap-xs text-muted" style={{ fontSize: '0.78rem' }}>
                <Users size={14} />
                <span>Capacity: limited to {formData.capacity} guests{formData.privacy === 'Private' ? ' · Private event' : ''}</span>
              </div>

              {formData.rsvpDeadline && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                  <Clock size={12} /> RSVP by {new Date(formData.rsvpDeadline).toLocaleString()}
                </div>
              )}

              {/* Guest social proof — mock avatar stack */}
              {formData.showGuestList ? (
                <div className="flex items-center" style={{ gap: '10px' }}>
                  <div className="avatar-stack">
                    {AVATARS.slice(0, 4).map((a, i) => (
                      <img key={a} src={a} alt={`Guest ${i + 1}`} className="avatar-img avatar-sm" />
                    ))}
                    <span className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.62rem' }}>+23</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong style={{ color: 'var(--color-text)' }}>27 guests</strong> are going
                  </span>
                </div>
              ) : (
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '10px', fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Lock size={12} /> Guest list is set to private.
                </div>
              )}

              {/* Description */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>
                  {formData.description || 'Description of your gathering. Add details about activities, dress code, parking or drinks here...'}
                </p>
              </div>

              {/* RSVP Form Widget */}
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '16px',
                marginTop: '4px',
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                  {formData.rsvpStatus === 'Closed' ? 'RSVPs are Closed' : 'Are you coming?'}
                </p>

                {formData.rsvpStatus === 'Open' ? (
                  <div className="flex gap-xs justify-center" style={{ marginBottom: '12px' }}>
                    <button type="button" style={{ pointerEvents: 'none', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', border: 'none', background: 'var(--color-primary)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}>Going 🎉</button>
                    <button type="button" style={{ pointerEvents: 'none', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '999px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>Maybe</button>
                    <button type="button" style={{ pointerEvents: 'none', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '999px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>No</button>
                  </div>
                ) : (
                  <Button variant="outline" disabled style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>Registration Closed</Button>
                )}

                {formData.enablePayments && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginBottom: '8px' }}>
                    🎟️ Ticket Price: ${formData.ticketPrice} USD
                  </div>
                )}

                {formData.questions.length > 0 && formData.questions[0].trim() !== '' && (
                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>RSVP Questions</p>
                    {formData.questions.map((q, i) => q.trim() !== '' && (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text)', fontWeight: 500 }}>{q}</span>
                        <input type="text" disabled placeholder="Guest answer..." style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-muted" style={{ fontSize: '0.7rem', marginTop: '10px' }}>
            This is exactly what guests will see — it updates as you type.
          </p>
        </div>
      </div>

      </div>
    </PageShell>
  );
}
