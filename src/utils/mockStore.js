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

// Initialize DB if not present
const getDB = () => {
  const data = localStorage.getItem(STORE_KEY);
  if (!data) {
    const initialDB = {
      events: defaultEvents,
      rsvps: defaultRSVPs,
      polls: defaultPolls,
      comments: defaultComments,
      currentUser: defaultUser,
      analytics: defaultAnalytics
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(data);
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
      ...rsvpData
    };
    db.rsvps.push(newRsvp);
    saveDB(db);
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
  }
};
