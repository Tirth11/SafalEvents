// SafalEvent Interactive Local Storage Database
const STORE_KEY = 'safalevent_db';

const defaultEvents = [
  {
    id: '1',
    title: 'Summer Rooftop Mixer',
    date: '2026-08-15',
    time: '19:00',
    location: 'Penthouse Lounge, Manhattan, NY',
    description: 'Join us for cocktails, high-fidelity music, and networking under the stars. Meet other creatives, developers, and designers in the city. Premium dress code enforced.',
    status: 'Published',
    capacity: 100,
    cover: 'https://images.unsplash.com/photo-1533174000243-cb84210f443b?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-sunset',
    approvalRequired: false,
    questions: ['Any food allergies?', 'What song do you want the DJ to play?'],
    eventType: 'Party',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    maxGuestsPerRsvp: 4,
    rsvpDeadline: '2026-08-14T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24,
    requireCancellationReason: true,
    allowComments: true,
    allowPhotoUploads: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    enablePayments: false
  },
  {
    id: '2',
    title: 'Tech Startup Meetup',
    date: '2026-09-02',
    time: '18:30',
    location: 'Venture Hub HQ, San Francisco, CA',
    description: 'Pitch your startup, find co-founders, and talk to VCs. Free pizza and beverages will be provided. RSVP required for building security.',
    status: 'Published',
    capacity: 150,
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-ocean',
    approvalRequired: true,
    questions: ['What startup are you building or working at?', 'Are you looking for funding?'],
    eventType: 'Meetup',
    privacy: 'Private',
    rsvpStatus: 'Open',
    showGuestList: true,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '2026-09-01T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 12,
    requireCancellationReason: false,
    allowComments: true,
    allowPhotoUploads: true,
    guestConfirmation: true,
    reminderSchedule: '3h',
    hostAlerts: true,
    enablePayments: false
  },
  {
    id: '3',
    title: 'Community Yoga Session',
    date: '2026-06-25',
    time: '08:00',
    location: 'Central Park Great Lawn, NY',
    description: 'A relaxing morning yoga session for all skill levels. Bring your own mat and water. Led by certified instructor Priya Patel.',
    status: 'Draft',
    capacity: 50,
    cover: null,
    theme: 'mesh-gradient-forest',
    approvalRequired: false,
    questions: ['Do you need a yoga mat?'],
    eventType: 'Workshop',
    privacy: 'Unlisted',
    rsvpStatus: 'Open',
    showGuestList: false,
    maxGuestsPerRsvp: 1,
    rsvpDeadline: '2026-06-24T23:59',
    allowSelfEdit: false,
    allowSelfCancellation: false,
    cancellationCutoff: 48,
    requireCancellationReason: false,
    allowComments: false,
    allowPhotoUploads: false,
    guestConfirmation: false,
    reminderSchedule: 'none',
    hostAlerts: false,
    enablePayments: false
  },
  {
    id: '4',
    title: 'Winter Gala 2025',
    date: '2025-12-10',
    time: '20:00',
    location: 'Grand Ballroom, Boston, MA',
    description: 'Annual winter celebration and charity auction. Formal black-tie event.',
    status: 'Completed',
    capacity: 200,
    cover: 'https://images.unsplash.com/photo-1519671482749-fd098f39dfa3?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-midnight',
    approvalRequired: false,
    questions: [],
    eventType: 'Party',
    privacy: 'Public',
    rsvpStatus: 'Closed',
    showGuestList: true,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '',
    allowSelfEdit: false,
    allowSelfCancellation: false,
    cancellationCutoff: 0,
    requireCancellationReason: false,
    allowComments: true,
    allowPhotoUploads: true,
    guestConfirmation: false,
    reminderSchedule: 'none',
    hostAlerts: false,
    enablePayments: false
  }
];

const defaultRSVPs = [
  // RSVPs for Event 1
  { id: 'r1', eventId: '1', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'going', checkedIn: true, timestamp: '2026-06-01T12:00:00.000Z', answers: { 'Any food allergies?': 'None', 'What song do you want the DJ to play?': 'Levitating - Dua Lipa' } },
  { id: 'r2', eventId: '1', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 234-5678', status: 'going', checkedIn: false, timestamp: '2026-06-02T14:30:00.000Z', answers: { 'Any food allergies?': 'Gluten-free', 'What song do you want the DJ to play?': 'Blinding Lights - The Weeknd' } },
  { id: 'r3', eventId: '1', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 345-6789', status: 'maybe', checkedIn: false, timestamp: '2026-06-03T09:15:00.000Z', answers: { 'Any food allergies?': 'Peanut allergy', 'What song do you want the DJ to play?': 'Stayin Alive' } },
  { id: 'r4', eventId: '1', name: 'Diana Prince', email: 'diana@example.com', phone: '+1 (555) 456-7890', status: 'declined', checkedIn: false, timestamp: '2026-06-04T18:45:00.000Z', answers: {} },
  { id: 'r5', eventId: '1', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '+1 (555) 567-8901', status: 'going', checkedIn: true, timestamp: '2026-06-05T10:10:00.000Z', answers: { 'Any food allergies?': 'None', 'What song do you want the DJ to play?': 'Mission Impossible Theme' } },

  // RSVPs for Event 2 (Approval Required)
  { id: 'r6', eventId: '2', name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '+1 (555) 678-9012', status: 'going', checkedIn: false, timestamp: '2026-06-05T11:00:00.000Z', answers: { 'What startup are you building or working at?': 'EcoClean Tech', 'Are you looking for funding?': 'Yes, seed stage' } },
  { id: 'r7', eventId: '2', name: 'George Costanza', email: 'george@example.com', phone: '+1 (555) 789-0123', status: 'waitlist', checkedIn: false, timestamp: '2026-06-06T15:20:00.000Z', answers: { 'What startup are you building or working at?': 'Vandelay Industries', 'Are you looking for funding?': 'Always' } },
  { id: 'r8', eventId: '2', name: 'Harvey Specter', email: 'harvey@example.com', phone: '+1 (555) 890-1234', status: 'going', checkedIn: false, timestamp: '2026-06-07T08:45:00.000Z', answers: { 'What startup are you building or working at?': 'Pearson Specter LegalTech', 'Are you looking for funding?': 'No, investing' } }
];

const defaultPolls = [
  {
    id: 'p1',
    eventId: '1',
    question: 'What type of drinks should we prioritize?',
    options: [
      { id: 'o1', text: 'Craft Cocktails', votes: 12, voters: ['alice@example.com', 'ethan@example.com'] },
      { id: 'o2', text: 'Non-Alcoholic Mocktails', votes: 4, voters: ['bob@example.com'] },
      { id: 'o3', text: 'Wine & Champagne', votes: 8, voters: ['charlie@example.com'] }
    ]
  },
  {
    id: 'p2',
    eventId: '2',
    question: 'Preferred presentation topic?',
    options: [
      { id: 'o1', text: 'Fundraising in 2026', votes: 15, voters: ['fiona@example.com'] },
      { id: 'o2', text: 'Scaling AI Products', votes: 22, voters: ['harvey@example.com'] },
      { id: 'o3', text: 'Finding Co-founders', votes: 9, voters: ['george@example.com'] }
    ]
  }
];

const defaultComments = [
  { id: 'c1', eventId: '1', name: 'Alice Vance', text: 'Can\'t wait for this! The lineup looks incredible.', timestamp: '2026-06-06T12:00:00.000Z', reactions: { '🎉': 4, '❤️': 3 } },
  { id: 'c2', eventId: '1', name: 'Bob Smith', text: 'Are there parking spots available near the rooftop venue?', timestamp: '2026-06-07T14:32:00.000Z', reactions: { '👍': 2 } },
  { id: 'c3', eventId: '1', name: 'Host (You)', text: 'Yes Bob! There is a public parking garage right next to the entrance.', timestamp: '2026-06-07T15:10:00.000Z', reactions: { '❤️': 1 } }
];

const defaultUser = {
  role: 'host', // host or guest
  name: 'Alex Rivera',
  email: 'alex@safalevent.com',
  phone: '+1 (555) 999-8888'
};

const defaultAnalytics = {
  views: {
    '1': 450,
    '2': 320,
    '3': 45,
    '4': 600
  }
};

const defaultTemplates = {
  rsvp: {
    subject: "You're going to {{event_name}} on {{event_date}}",
    body: "Hey {{guest_name}},\n\nYour spot is confirmed for {{event_name}}! Here are the details:\n\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\nGuests: {{guest_guest_count}}\nBooking ID: {{booking_id}}\n\nManage your RSVP here:\n{{manage_rsvp_link}}\n\nBest,\n{{host_name}}"
  },
  reminder: {
    subject: "Reminder: {{event_name}} starts soon!",
    body: "Hey {{guest_name}},\n\nThis is a quick reminder that {{event_name}} is starting soon.\n\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\n\nIf you need to change your RSVP status, you can do so here:\n{{manage_rsvp_link}}\n\nSee you there!\n{{host_name}}"
  },
  feedback: {
    subject: "How was {{event_name}}?",
    body: "Hey {{guest_name}},\n\nThank you for attending {{event_name}}! We would love to know how your experience was. Please take 2 minutes to fill out our short feedback survey:\n\n{{feedback_survey_link}}\n\nThank you,\n{{host_name}}"
  }
};

const defaultUsers = [
  {
    id: 'u1',
    role: 'host',
    name: 'Alex Rivera',
    email: 'alex@safalevent.com',
    phone: '+1 (555) 999-8888',
    password: 'password123',
    hostType: 'individual',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u2',
    role: 'admin',
    name: 'Super Admin',
    email: 'admin@safalevent.com',
    phone: '+1 (555) 000-0000',
    password: 'password123',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

// Initialize DB if not present
const getDB = () => {
  const data = localStorage.getItem(STORE_KEY);
  let db;
  if (!data) {
    db = {
      events: defaultEvents,
      rsvps: defaultRSVPs,
      polls: defaultPolls,
      comments: defaultComments,
      currentUser: defaultUser,
      analytics: defaultAnalytics,
      notificationLogs: [],
      feedbackResponses: [],
      users: defaultUsers,
      signupSessions: [],
      rsvpSessions: [],
      verificationLogs: []
    };
  } else {
    try {
      db = JSON.parse(data);
    } catch (e) {
      db = {
        events: defaultEvents,
        rsvps: defaultRSVPs,
        polls: defaultPolls,
        comments: defaultComments,
        currentUser: defaultUser,
        analytics: defaultAnalytics,
        notificationLogs: [],
        feedbackResponses: [],
        users: defaultUsers,
        signupSessions: [],
        rsvpSessions: [],
        verificationLogs: []
      };
    }
  }

  // Database Migrations for Notification Engine
  if (!db.notificationLogs) {
    db.notificationLogs = [];
  }
  if (!db.feedbackResponses) {
    db.feedbackResponses = [];
  }
  if (!db.users) {
    db.users = defaultUsers;
  }
  if (!db.signupSessions) {
    db.signupSessions = [];
  }
  if (!db.rsvpSessions) {
    db.rsvpSessions = [];
  }
  if (!db.verificationLogs) {
    db.verificationLogs = [];
  }

  db.events = db.events.map(event => {
    const defaults = {
      sendRsvpConfirmationEmail: true,
      sendRsvpConfirmationSms: true,
      sendPreEventReminders: true,
      sendPostEventFeedbackEmail: true,
      sendPostEventFeedbackSms: false,
      reminder1Offset: 24,
      reminder2Enabled: false,
      reminder2Offset: 3,
      feedbackDelay: 3
    };

    Object.keys(defaults).forEach(key => {
      if (event[key] === undefined) {
        event[key] = defaults[key];
      }
    });

    if (!event.templates) {
      event.templates = { ...defaultTemplates };
    } else {
      ['rsvp', 'reminder', 'feedback'].forEach(tKey => {
        if (!event.templates[tKey]) {
          event.templates[tKey] = { ...defaultTemplates[tKey] };
        }
      });
    }

    return event;
  });

  localStorage.setItem(STORE_KEY, JSON.stringify(db));
  return db;
};

const saveDB = (db) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
};

export const mockStore = {
  // --- Events ---
  getEvents: () => {
    const db = getDB();
    return db.events;
  },

  getEventById: (id) => {
    const db = getDB();
    return db.events.find(e => e.id === id);
  },

  createEvent: (eventData) => {
    const db = getDB();
    const newEvent = {
      id: String(db.events.length + 1),
      status: 'Published',
      theme: 'mesh-gradient-sunset',
      capacity: 100,
      approvalRequired: false,
      questions: [],
      eventType: 'Party',
      privacy: 'Public',
      rsvpStatus: 'Open',
      showGuestList: true,
      maxGuestsPerRsvp: 1,
      rsvpDeadline: '',
      allowSelfEdit: true,
      allowSelfCancellation: true,
      cancellationCutoff: 24,
      requireCancellationReason: false,
      allowComments: true,
      allowPhotoUploads: false,
      guestConfirmation: true,
      reminderSchedule: '24h',
      hostAlerts: true,
      enablePayments: false,
      
      // Default notification settings
      sendRsvpConfirmationEmail: true,
      sendRsvpConfirmationSms: true,
      sendPreEventReminders: true,
      sendPostEventFeedbackEmail: true,
      sendPostEventFeedbackSms: false,
      reminder1Offset: 24,
      reminder2Enabled: false,
      reminder2Offset: 3,
      feedbackDelay: 3,
      templates: { ...defaultTemplates },
      
      ...eventData
    };
    db.events.unshift(newEvent); // Add to beginning
    db.analytics.views[newEvent.id] = 0;
    saveDB(db);
    return newEvent;
  },

  updateEvent: (id, eventData) => {
    const db = getDB();
    db.events = db.events.map(e => e.id === id ? { ...e, ...eventData } : e);
    saveDB(db);
    return db.events.find(e => e.id === id);
  },

  duplicateEvent: (eventId) => {
    const db = getDB();
    const source = db.events.find(e => e.id === eventId);
    if (!source) return null;
    const cloned = {
      ...source,
      id: String(db.events.length + 1),
      title: `${source.title} (Clone)`,
      status: 'Draft' // Cloned events start as drafts
    };
    db.events.unshift(cloned);
    db.analytics.views[cloned.id] = 0;
    saveDB(db);
    return cloned;
  },

  deleteEvent: (eventId) => {
    const db = getDB();
    db.events = db.events.filter(e => e.id !== eventId);
    db.rsvps = db.rsvps.filter(r => r.eventId !== eventId);
    db.polls = db.polls.filter(p => p.eventId !== eventId);
    db.comments = db.comments.filter(c => c.eventId !== eventId);
    saveDB(db);
  },

  // --- RSVPs ---
  getRSVPs: (eventId) => {
    const db = getDB();
    return db.rsvps.filter(r => r.eventId === eventId);
  },

  addRSVP: (eventId, rsvpData) => {
    const db = getDB();
    const newRsvp = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      eventId,
      checkedIn: false,
      timestamp: new Date().toISOString(),
      answers: {},
      guestCount: rsvpData.guestCount || 1,
      ...rsvpData
    };
    db.rsvps.push(newRsvp);
    saveDB(db);

    // Dynamic Trigger for RSVP Confirmation
    const event = db.events.find(e => e.id === eventId);
    if (event) {
      const templates = event.templates || defaultTemplates;
      if (event.sendRsvpConfirmationEmail) {
        const subject = mockStore.renderTemplate(templates.rsvp?.subject || defaultTemplates.rsvp.subject, event, newRsvp);
        const body = mockStore.renderTemplate(templates.rsvp?.body || defaultTemplates.rsvp.body, event, newRsvp);
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'Email',
          subject,
          body
        });
      }
      if (event.sendRsvpConfirmationSms) {
        const body = mockStore.renderTemplate(templates.rsvp?.body || defaultTemplates.rsvp.body, event, newRsvp);
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'SMS',
          subject: 'RSVP Confirmation',
          body: body.length > 160 ? body.substring(0, 157) + '...' : body
        });
      }
    }

    return newRsvp;
  },

  updateRSVP: (eventId, rsvpId, updatedData) => {
    const db = getDB();
    db.rsvps = db.rsvps.map(r => (r.id === rsvpId || (r.eventId === eventId && r.email === rsvpId)) ? { ...r, ...updatedData } : r);
    saveDB(db);
    return db.rsvps.find(r => r.id === rsvpId || (r.eventId === eventId && r.email === rsvpId));
  },

  // --- Polls ---
  getPolls: (eventId) => {
    const db = getDB();
    return db.polls.filter(p => p.eventId === eventId);
  },

  voteInPoll: (eventId, pollId, optionId, email) => {
    const db = getDB();
    db.polls = db.polls.map(p => {
      if (p.id === pollId && p.eventId === eventId) {
        const updatedOptions = p.options.map(opt => {
          const hadVoted = opt.voters.includes(email);
          let voters = [...opt.voters];
          if (opt.id === optionId) {
            if (!hadVoted) {
              voters.push(email);
            }
          } else {
            voters = voters.filter(v => v !== email);
          }
          return {
            ...opt,
            voters,
            votes: voters.length
          };
        });
        return { ...p, options: updatedOptions };
      }
      return p;
    });
    saveDB(db);
    return db.polls.filter(p => p.eventId === eventId);
  },

  createPoll: (eventId, question, optionsArray) => {
    const db = getDB();
    const newPoll = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      eventId,
      question,
      options: optionsArray.map((opt, idx) => ({ id: 'o_' + idx, text: opt, votes: 0, voters: [] }))
    };
    db.polls.push(newPoll);
    saveDB(db);
    return newPoll;
  },

  // --- Comments ---
  getComments: (eventId) => {
    const db = getDB();
    return db.comments.filter(c => c.eventId === eventId);
  },

  addComment: (eventId, commentData) => {
    const db = getDB();
    const newComment = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      eventId,
      timestamp: new Date().toISOString(),
      reactions: {},
      ...commentData
    };
    db.comments.push(newComment);
    saveDB(db);
    return newComment;
  },

  deleteComment: (eventId, commentId) => {
    const db = getDB();
    db.comments = db.comments.filter(c => !(c.id === commentId && c.eventId === eventId));
    saveDB(db);
  },

  reactToComment: (eventId, commentId, emoji) => {
    const db = getDB();
    db.comments = db.comments.map(c => {
      if (c.id === commentId && c.eventId === eventId) {
        const reactions = { ...c.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...c, reactions };
      }
      return c;
    });
    saveDB(db);
    return db.comments.filter(c => c.eventId === eventId);
  },

  // --- Session User & Analytics ---
  getCurrentUser: () => {
    const db = getDB();
    return db.currentUser;
  },

  setCurrentUser: (userData) => {
    const db = getDB();
    db.currentUser = { ...db.currentUser, ...userData };
    saveDB(db);
    return db.currentUser;
  },

  getViews: (eventId) => {
    const db = getDB();
    return db.analytics.views[eventId] || 0;
  },

  incrementViews: (eventId) => {
    const db = getDB();
    db.analytics.views[eventId] = (db.analytics.views[eventId] || 0) + 1;
    saveDB(db);
    return db.analytics.views[eventId];
  },

  getAllViews: () => {
    const db = getDB();
    return db.analytics.views;
  },

  // --- Notification Engine API ---
  getNotificationLogs: (eventId) => {
    const db = getDB();
    if (!db.notificationLogs) db.notificationLogs = [];
    return db.notificationLogs.filter(log => log.eventId === eventId);
  },

  addNotificationLog: (eventId, logData) => {
    const db = getDB();
    if (!db.notificationLogs) db.notificationLogs = [];
    const newLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      eventId,
      sentAt: new Date().toISOString(),
      ...logData
    };
    db.notificationLogs.unshift(newLog);
    saveDB(db);
    return newLog;
  },

  getFeedbackResponses: (eventId) => {
    const db = getDB();
    if (!db.feedbackResponses) db.feedbackResponses = [];
    return db.feedbackResponses.filter(fb => fb.eventId === eventId);
  },

  submitFeedback: (eventId, feedbackData) => {
    const db = getDB();
    if (!db.feedbackResponses) db.feedbackResponses = [];
    const newFeedback = {
      id: 'fb_' + Math.random().toString(36).substr(2, 9),
      eventId,
      submittedAt: new Date().toISOString(),
      ...feedbackData
    };
    db.feedbackResponses.push(newFeedback);
    saveDB(db);
    return newFeedback;
  },

  renderTemplate: (templateText, event, guest, customVars = {}) => {
    if (!templateText) return '';
    let rendered = templateText;
    
    // Setup dynamic template parameters
    const variables = {
      '{{event_name}}': event.title || '',
      '{{event_date}}': event.date || '',
      '{{event_start_time}}': event.time || '',
      '{{event_end_time}}': event.endTime || '22:00',
      '{{event_location}}': event.location || '',
      '{{event_online_link}}': event.location?.includes('http') ? event.location : `http://localhost:5173/e/${event.id}`,
      '{{host_name}}': 'Alex Rivera',
      '{{manage_rsvp_link}}': `http://localhost:5173/dashboard`,
      '{{guest_name}}': guest?.name || 'Valued Guest',
      '{{guest_guest_count}}': String(guest?.guestCount || 1),
      '{{booking_id}}': guest?.id?.toUpperCase() || 'RSVP-123',
      '{{feedback_survey_link}}': `http://localhost:5173/feedback/${event.id}`,
      '{{safalevent_support_email}}': 'support@safalevent.com',
      ...customVars
    };

    Object.keys(variables).forEach(placeholder => {
      const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      rendered = rendered.replace(new RegExp(escapedPlaceholder, 'g'), variables[placeholder]);
    });

    return rendered;
  },

  runScheduledJobs: (eventId = null) => {
    const db = getDB();
    if (!db.notificationLogs) db.notificationLogs = [];
    
    const eventsToProcess = eventId 
      ? db.events.filter(e => e.id === eventId)
      : db.events;
      
    let logsDispatched = [];

    eventsToProcess.forEach(event => {
      // Find all going guests for this event
      const rsvps = db.rsvps.filter(r => r.eventId === event.id && r.status === 'going');
      const templates = event.templates || defaultTemplates;
      
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const now = new Date();
      const hoursDiffToStart = (eventDateTime - now) / (1000 * 60 * 60);

      // Estimate event end time as start time + 4 hours if not explicitly defined
      const eventEndDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);
      const hoursDiffFromEnd = (now - eventEndDateTime) / (1000 * 60 * 60);

      rsvps.forEach(rsvp => {
        // --- Reminder 1 (24h default before start) ---
        if (event.sendPreEventReminders) {
          const r1Offset = event.reminder1Offset || 24;
          const alreadySentR1 = db.notificationLogs.some(
            log => log.eventId === event.id && 
                   log.rsvpId === rsvp.id && 
                   log.type === 'reminder' && 
                   log.subject.includes('Reminder 1')
          );

          if (hoursDiffToStart <= r1Offset && hoursDiffToStart > 0 && !alreadySentR1) {
            const subject = 'Reminder 1: ' + mockStore.renderTemplate(templates.reminder?.subject || defaultTemplates.reminder.subject, event, rsvp);
            const body = mockStore.renderTemplate(templates.reminder?.body || defaultTemplates.reminder.body, event, rsvp);
            
            const newLog = mockStore.addNotificationLog(event.id, {
              rsvpId: rsvp.id,
              guestEmail: rsvp.email,
              type: 'reminder',
              channel: 'Email',
              subject,
              body
            });
            logsDispatched.push(newLog);
          }
        }

        // --- Reminder 2 (3h default before start) ---
        if (event.sendPreEventReminders && event.reminder2Enabled) {
          const r2Offset = event.reminder2Offset || 3;
          const alreadySentR2 = db.notificationLogs.some(
            log => log.eventId === event.id && 
                   log.rsvpId === rsvp.id && 
                   log.type === 'reminder' && 
                   log.subject.includes('Reminder 2')
          );

          if (hoursDiffToStart <= r2Offset && hoursDiffToStart > 0 && !alreadySentR2) {
            const subject = 'Reminder 2: ' + mockStore.renderTemplate(templates.reminder?.subject || defaultTemplates.reminder.subject, event, rsvp);
            const body = mockStore.renderTemplate(templates.reminder?.body || defaultTemplates.reminder.body, event, rsvp);
            
            const newLog = mockStore.addNotificationLog(event.id, {
              rsvpId: rsvp.id,
              guestEmail: rsvp.email,
              type: 'reminder',
              channel: 'Email',
              subject,
              body
            });
            logsDispatched.push(newLog);
          }
        }

        // --- Post-event Feedback request (3h default after end) ---
        if (event.sendPostEventFeedbackEmail) {
          const feedbackDelay = event.feedbackDelay || 3;
          const alreadySentFeedback = db.notificationLogs.some(
            log => log.eventId === event.id && 
                   log.rsvpId === rsvp.id && 
                   log.type === 'feedback'
          );

          if (hoursDiffFromEnd >= feedbackDelay && !alreadySentFeedback) {
            const subject = mockStore.renderTemplate(templates.feedback?.subject || defaultTemplates.feedback.subject, event, rsvp);
            const body = mockStore.renderTemplate(templates.feedback?.body || defaultTemplates.feedback.body, event, rsvp);
            
            const newLog = mockStore.addNotificationLog(event.id, {
              rsvpId: rsvp.id,
              guestEmail: rsvp.email,
              type: 'feedback',
              channel: 'Email',
              subject,
              body
            });
            logsDispatched.push(newLog);
            
            if (event.sendPostEventFeedbackSms && rsvp.phone) {
              const shortSmsBody = `How was ${event.title}? Let us know: http://localhost:5173/feedback/${event.id}`;
              mockStore.addNotificationLog(event.id, {
                rsvpId: rsvp.id,
                guestEmail: rsvp.email,
                type: 'feedback',
                channel: 'SMS',
                subject: 'Event Feedback Survey',
                body: shortSmsBody
              });
            }
          }
        }
      });
    });
    
    return logsDispatched;
  },

  // --- Users, Signup & OTP Verification ---
  getUsers: () => {
    const db = getDB();
    return db.users || [];
  },

  createUser: (userData) => {
    const db = getDB();
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...userData
    };
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  updateUserStatus: (userId, status, rejectReason = '') => {
    const db = getDB();
    db.users = db.users.map(u => u.id === userId ? { ...u, status, rejectReason } : u);
    saveDB(db);
    
    const user = db.users.find(u => u.id === userId);
    if (user) {
      mockStore.addNotificationLog(null, {
        rsvpId: null,
        guestEmail: user.email,
        type: 'broadcast',
        channel: 'Email',
        subject: `Your SafalEvent Host Application Status: ${status}`,
        body: status === 'ACTIVE' 
          ? `Hello ${user.name},\n\nWe are pleased to inform you that your application as a host has been APPROVED! You can now log in to your host dashboard.\n\nBest,\nSafalEvent Admin Team`
          : `Hello ${user.name},\n\nUnfortunately, your application as a host was rejected.\n\nReason: ${rejectReason}\n\nPlease update your profile details and re-apply if needed.\n\nBest,\nSafalEvent Admin Team`
      });
    }
    return db.users.find(u => u.id === userId);
  },

  createSignupSession: (hostType, formData) => {
    const db = getDB();
    db.signupSessions = db.signupSessions.filter(s => s.formData.email !== formData.email);
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const newSession = {
      id: 'sess_' + Math.random().toString(36).substr(2, 9),
      hostType,
      formData,
      otpCode: code,
      otpExpiry: expiry,
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    db.signupSessions.push(newSession);
    saveDB(db);

    const emailSubject = "Verify your SafalEvent host registration";
    const emailBody = `Your SafalEvent verification code is ${code}. Valid for 10 minutes.`;
    const smsBody = `SafalEvent code: ${code}. Valid for 10 minutes.`;

    mockStore.addNotificationLog(null, {
      rsvpId: null,
      guestEmail: formData.email,
      type: 'rsvp',
      channel: 'Email',
      subject: emailSubject,
      body: emailBody
    });

    mockStore.addNotificationLog(null, {
      rsvpId: null,
      guestEmail: formData.email,
      type: 'rsvp',
      channel: 'SMS',
      subject: 'Host OTP Code',
      body: smsBody
    });

    mockStore.logVerificationAttempt({
      type: 'signup',
      targetEmail: formData.email,
      targetPhone: formData.phone,
      otpCode: code,
      success: true,
      message: 'OTP Code Generated & Sent to Email + SMS'
    });

    return newSession;
  },

  verifySignupSession: (sessionId, code) => {
    const db = getDB();
    const session = db.signupSessions.find(s => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found. Please try again.' };
    }

    if (new Date() > new Date(session.otpExpiry)) {
      mockStore.logVerificationAttempt({
        type: 'signup',
        targetEmail: session.formData.email,
        targetPhone: session.formData.phone,
        otpCode: code,
        success: false,
        message: 'OTP Expired'
      });
      return { success: false, error: 'OTP expired. Please request a new code.' };
    }

    if (session.attempts >= 5) {
      mockStore.logVerificationAttempt({
        type: 'signup',
        targetEmail: session.formData.email,
        targetPhone: session.formData.phone,
        otpCode: code,
        success: false,
        message: 'Max attempts exceeded'
      });
      return { success: false, error: 'Maximum verification attempts exceeded. Please sign up again.' };
    }

    session.attempts += 1;
    db.signupSessions = db.signupSessions.map(s => s.id === sessionId ? session : s);
    saveDB(db);

    if (session.otpCode !== code) {
      mockStore.logVerificationAttempt({
        type: 'signup',
        targetEmail: session.formData.email,
        targetPhone: session.formData.phone,
        otpCode: code,
        success: false,
        message: `Incorrect code (Attempt ${session.attempts}/5)`
      });
      return { success: false, error: `Invalid code. ${5 - session.attempts} attempts remaining.` };
    }

    const userStatus = session.hostType === 'individual' ? 'ACTIVE' : 'PENDING_ADMIN_APPROVAL';
    
    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      role: 'host',
      name: `${session.formData.firstName} ${session.formData.lastName}`,
      email: session.formData.email,
      phone: session.formData.phone,
      password: session.formData.password || 'password123',
      hostType: session.hostType,
      orgProfile: session.hostType === 'organization' ? {
        orgName: session.formData.orgName,
        orgType: session.formData.orgType,
        website: session.formData.website,
        country: session.formData.country,
        city: session.formData.city,
        state: session.formData.state,
        docs: session.formData.docs || ['mock_org_ein_letter.pdf']
      } : null,
      status: userStatus,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    db.signupSessions = db.signupSessions.filter(s => s.id !== sessionId);
    saveDB(db);

    mockStore.logVerificationAttempt({
      type: 'signup',
      targetEmail: session.formData.email,
      targetPhone: session.formData.phone,
      otpCode: code,
      success: true,
      message: 'Verification Successful'
    });

    return { success: true, user: newUser };
  },

  createRsvpSession: (eventId, guestData) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return null;

    db.rsvpSessions = db.rsvpSessions.filter(s => s.eventId !== eventId || s.guestData.email !== guestData.email);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const newSession = {
      id: 'r_sess_' + Math.random().toString(36).substr(2, 9),
      eventId,
      guestData,
      otpCode: code,
      otpExpiry: expiry,
      attempts: 0,
      createdAt: new Date().toISOString()
    };

    db.rsvpSessions.push(newSession);
    saveDB(db);

    const emailSubject = `Verification code for ${event.title}`;
    const emailBody = `Your code for ${event.title} is ${code}. Valid for 10 minutes.`;
    const smsBody = `Code ${code} for ${event.title} on SafalEvent.`;

    mockStore.addNotificationLog(eventId, {
      rsvpId: null,
      guestEmail: guestData.email,
      type: 'rsvp',
      channel: 'Email',
      subject: emailSubject,
      body: emailBody
    });

    mockStore.addNotificationLog(eventId, {
      rsvpId: null,
      guestEmail: guestData.email,
      type: 'rsvp',
      channel: 'SMS',
      subject: 'RSVP OTP Code',
      body: smsBody
    });

    mockStore.logVerificationAttempt({
      type: 'rsvp',
      targetEmail: guestData.email,
      targetPhone: guestData.phone,
      otpCode: code,
      success: true,
      message: 'OTP Code Generated & Sent to Email + SMS'
    });

    return newSession;
  },

  verifyRsvpSession: (sessionId, code) => {
    const db = getDB();
    const session = db.rsvpSessions.find(s => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found. Please restart RSVP.' };
    }

    if (new Date() > new Date(session.otpExpiry)) {
      mockStore.logVerificationAttempt({
        type: 'rsvp',
        targetEmail: session.guestData.email,
        targetPhone: session.guestData.phone,
        otpCode: code,
        success: false,
        message: 'OTP Expired'
      });
      return { success: false, error: 'OTP expired. Please request a new code.' };
    }

    if (session.attempts >= 5) {
      mockStore.logVerificationAttempt({
        type: 'rsvp',
        targetEmail: session.guestData.email,
        targetPhone: session.guestData.phone,
        otpCode: code,
        success: false,
        message: 'Max attempts exceeded'
      });
      return { success: false, error: 'Maximum attempts exceeded. Please request a new code.' };
    }

    session.attempts += 1;
    db.rsvpSessions = db.rsvpSessions.map(s => s.id === sessionId ? session : s);
    saveDB(db);

    if (session.otpCode !== code) {
      mockStore.logVerificationAttempt({
        type: 'rsvp',
        targetEmail: session.guestData.email,
        targetPhone: session.guestData.phone,
        otpCode: code,
        success: false,
        message: `Incorrect code (Attempt ${session.attempts}/5)`
      });
      return { success: false, error: `Invalid code. ${5 - session.attempts} attempts remaining.` };
    }

    session.verified = true;
    db.rsvpSessions = db.rsvpSessions.map(s => s.id === sessionId ? session : s);
    saveDB(db);

    mockStore.logVerificationAttempt({
      type: 'rsvp',
      targetEmail: session.guestData.email,
      targetPhone: session.guestData.phone,
      otpCode: code,
      success: true,
      message: 'Verification Successful'
    });

    return { success: true, guestData: session.guestData };
  },

  checkRecentRsvpVerification: (eventId, email, phone) => {
    const db = getDB();
    const existing = db.rsvps.find(r => r.eventId === eventId && (r.email === email || r.phone === phone));
    if (existing) {
      return true;
    }
    return false;
  },

  logVerificationAttempt: (logData) => {
    const db = getDB();
    if (!db.verificationLogs) db.verificationLogs = [];
    const newLog = {
      id: 'vlog_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ip: '192.168.4.15',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile App (iOS)' : 'Desktop Browser (Chrome/Windows)',
      ...logData
    };
    db.verificationLogs.unshift(newLog);
    saveDB(db);
    return newLog;
  },

  getVerificationLogs: () => {
    const db = getDB();
    return db.verificationLogs || [];
  },

  saveBankAccount: (userId, bankData) => {
    const db = getDB();
    db.users = db.users.map(u => u.id === userId ? { ...u, bankAccount: bankData } : u);
    saveDB(db);
    return db.users.find(u => u.id === userId);
  },

  getTransactions: (eventId) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    if (!event || !event.enablePayments) return [];
    const rsvps = db.rsvps.filter(r => r.eventId === eventId && (r.status === 'going' || r.status === 'maybe'));
    return rsvps.map(r => ({
      id: 'txn_' + r.id,
      eventId,
      guestName: r.name,
      guestEmail: r.email,
      amount: event.ticketPrice || 0,
      guestCount: r.guestCount || 1,
      totalCharged: (event.ticketPrice || 0) * (r.guestCount || 1),
      status: 'completed',
      timestamp: r.timestamp,
      method: 'Credit Card'
    }));
  },

  createManualInvitation: (eventId, inviteData) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return null;
    const newRsvp = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      eventId,
      name: inviteData.name,
      email: inviteData.email,
      phone: inviteData.phone,
      guestCount: inviteData.guestCount || 1,
      status: 'going',
      checkedIn: false,
      isManualInvite: true,
      timestamp: new Date().toISOString(),
      answers: {}
    };
    db.rsvps.push(newRsvp);
    saveDB(db);
    return newRsvp;
  }
};
