// SafalEvent Interactive Local Storage Database
const STORE_KEY = 'safalevent_db';

const defaultEvents = [
  {
    id: '1',
    title: 'Summer Rooftop Mixer',
    date: '2026-08-15',
    time: '19:00',
    location: 'Penthouse Lounge, Manhattan, NY',
    city: 'New York City',
    state: 'NY',
    description: 'Join us for cocktails, high-fidelity music, and networking under the stars. Meet other creatives, developers, and designers in the city. Premium dress code enforced.',
    status: 'Published',
    capacity: 100,
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-sunset',
    approvalRequired: false,
    questions: ['Any food allergies?', 'What song do you want the DJ to play?'],
    eventType: 'Party',
    customEventType: '',
    eventMode: 'Onsite',
    venueName: 'Penthouse Lounge',
    addressLine1: 'Penthouse Lounge, Manhattan',
    addressLine2: '',
    city: 'New York City',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    mapLink: 'https://maps.google.com/?q=Manhattan',
    additionalVenueInfo: 'Premium dress code enforced. Entry via private elevator.',
    dressCode: 'Smart Casual',
    customDressCode: '',
    dressCodeDetails: 'Please avoid shorts and flip-flops.',
    dressCodeImage: 'https://images.unsplash.com/photo-1515347619152-47530663737b?auto=format&fit=crop&w=400&q=80',
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
    enablePhotoAlbum: false,
    photoUploadPermission: 'host_only',
    requirePhotoApproval: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    enablePayments: false,
    hostName: 'Alex Rivera',
    hostEmail: 'alex@safalevent.com',
    distance: 2.3,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '2',
    title: 'Tech Startup Meetup',
    date: '2026-09-02',
    time: '18:30',
    location: 'Venture Hub HQ, San Francisco, CA',
    city: 'San Francisco',
    state: 'CA',
    description: 'Pitch your startup, find co-founders, and talk to VCs. Free pizza and beverages will be provided. RSVP required for building security.',
    status: 'Published',
    capacity: 150,
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-ocean',
    approvalRequired: true,
    autoCheckIn: false,
    messagingEnabled: true,
    questions: ['What startup are you building or working at?', 'Are you looking for funding?'],
    eventType: 'Meetup',
    customEventType: '',
    eventMode: 'Virtual',
    meetingPlatform: 'Zoom',
    meetingLink: 'https://zoom.us/j/1234567890',
    meetingId: '123 456 7890',
    meetingPasscode: 'startup26',
    joiningInstructions: 'Please join 5 minutes early to test your audio and video. Waiting room is enabled.',
    dressCode: 'No Dress Code',
    customDressCode: '',
    dressCodeDetails: '',
    dressCodeImage: '',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '2026-09-01T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 12,
    requireCancellationReason: false,
    allowComments: true,
    enablePhotoAlbum: true,
    photoUploadPermission: 'guests',
    requirePhotoApproval: true,
    guestConfirmation: true,
    reminderSchedule: '3h',
    hostAlerts: true,
    enablePayments: false,
    hostName: 'Jordan Chen',
    hostEmail: 'jordan@startup.com',
    distance: 5.1,
    rating: 4.5,
    reviewsCount: 89
  },
  {
    id: '3',
    title: 'Community Yoga Session',
    date: '2026-06-25',
    time: '08:00',
    location: 'Central Park Great Lawn, NY',
    city: 'New York City',
    state: 'NY',
    description: 'A relaxing morning yoga session for all skill levels. Bring your own mat and water. Led by certified instructor Priya Patel.',
    status: 'Published',
    capacity: 40,
    cover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-forest',
    approvalRequired: false,
    messagingEnabled: false,
    questions: ['Do you need a yoga mat?'],
    eventType: 'Other',
    customEventType: 'Yoga Class',
    eventMode: 'Hybrid',
    venueName: 'Central Park Great Lawn',
    addressLine1: 'Central Park',
    addressLine2: '',
    city: 'New York City',
    state: 'NY',
    country: 'USA',
    postalCode: '10024',
    mapLink: 'https://maps.google.com/?q=Central+Park',
    additionalVenueInfo: 'Meet near the turtle pond.',
    meetingPlatform: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    meetingId: '',
    meetingPasscode: '',
    joiningInstructions: 'Set up your camera so we can see your mat!',
    dressCode: 'Other',
    customDressCode: 'Comfortable Yoga Wear',
    dressCodeDetails: 'Wear anything comfortable that allows you to stretch easily.',
    dressCodeImage: '',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: false,
    maxGuestsPerRsvp: 1,
    rsvpDeadline: '2026-06-24T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24,
    requireCancellationReason: false,
    allowComments: true,
    enablePhotoAlbum: false,
    photoUploadPermission: 'host_only',
    requirePhotoApproval: false,
    guestConfirmation: false,
    reminderSchedule: 'none',
    hostAlerts: false,
    enablePayments: false,
    hostName: 'Priya Patel',
    hostEmail: 'priya@yogalife.com',
    distance: 1.2,
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: '4',
    title: 'Winter Gala 2025',
    date: '2025-12-10',
    time: '20:00',
    location: 'Grand Ballroom, Boston, MA',
    city: 'Boston',
    state: 'MA',
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
    enablePhotoAlbum: true,
    photoUploadPermission: 'guests',
    requirePhotoApproval: false,
    guestConfirmation: false,
    reminderSchedule: 'none',
    hostAlerts: false,
    enablePayments: false,
    hostName: 'Boston Charity Foundation',
    hostEmail: 'events@bostoncharity.org',
    distance: 4.0,
    rating: 4.6,
    reviewsCount: 112
  },
  {
    id: '5',
    title: 'Stand-up Comedy Night',
    date: '2026-07-10',
    time: '20:30',
    location: 'The Comedy Club, Manhattan, NY',
    city: 'New York City',
    state: 'NY',
    description: 'Get ready for a night of belly laughs with 5 national touring headliners. Craft beers and cocktails available. Strictly 21+.',
    status: 'Published',
    capacity: 80,
    cover: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800&q=80',
    theme: 'mesh-gradient-sunset',
    approvalRequired: false,
    questions: [],
    eventType: 'Comedy',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '2026-07-09T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24,
    requireCancellationReason: false,
    allowComments: true,
    allowPhotoUploads: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    enablePayments: true,
    ticketPrice: 25,
    hostName: 'Riley Morgan',
    hostEmail: 'riley@comedyclub.com',
    distance: 0.8,
    rating: 4.7,
    reviewsCount: 204
  },
  {
    id: '6',
    title: 'Design Systems Workshop',
    date: '2026-10-05',
    time: '10:00',
    location: 'Design Studio 4, Downtown',
    city: 'Seattle',
    state: 'WA',
    description: 'A deep dive into creating robust, scalable design systems. Created by a staff member and awaiting your approval to publish.',
    status: 'Under Approval',
    approvalState: 'UNDER_APPROVAL',
    capacity: 40,
    cover: '',
    theme: 'mesh-gradient-ocean',
    approvalRequired: false,
    questions: [],
    eventType: 'Workshop',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    maxGuestsPerRsvp: 1,
    rsvpDeadline: '2026-10-04T23:59',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 48,
    requireCancellationReason: false,
    allowComments: true,
    allowPhotoUploads: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    enablePayments: false,
    hostName: 'Design Team',
    hostEmail: 'design@example.com',
    distance: 1.5,
    rating: 0,
    reviewsCount: 0
  }
];

const defaultRSVPs = [
  // RSVPs for Event 1
  { id: 'r1', eventId: '1', name: 'Alice Vance', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'going', checkedIn: true, timestamp: '2026-06-01T12:00:00.000Z', answers: { 'Any food allergies?': 'None', 'What song do you want the DJ to play?': 'Levitating - Dua Lipa' } },
  { id: 'r2', eventId: '1', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 234-5678', status: 'going', checkedIn: false, guestCount: 4, timestamp: '2026-06-02T14:30:00.000Z', answers: { 'Any food allergies?': 'Gluten-free', 'What song do you want the DJ to play?': 'Blinding Lights - The Weeknd' } },
  { id: 'r3', eventId: '1', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 345-6789', status: 'going', checkedIn: false, guestCount: 3, timestamp: '2026-06-03T09:15:00.000Z', answers: { 'Any food allergies?': 'Peanut allergy', 'What song do you want the DJ to play?': 'Stayin Alive' } },
  { id: 'r4', eventId: '1', name: 'Diana Prince', email: 'diana@example.com', phone: '+1 (555) 456-7890', status: 'declined', checkedIn: false, timestamp: '2026-06-04T18:45:00.000Z', answers: {} },
  { id: 'r5', eventId: '1', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '+1 (555) 567-8901', status: 'going', checkedIn: true, timestamp: '2026-06-05T10:10:00.000Z', answers: { 'Any food allergies?': 'None', 'What song do you want the DJ to play?': 'Mission Impossible Theme' } },

  // RSVPs for Event 2 (Approval Required)
  { id: 'r6', eventId: '2', name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '+1 (555) 678-9012', status: 'going', checkedIn: false, timestamp: '2026-06-05T11:00:00.000Z', answers: { 'What startup are you building or working at?': 'EcoClean Tech', 'Are you looking for funding?': 'Yes, seed stage' } },
  { id: 'r7', eventId: '2', name: 'George Costanza', email: 'george@example.com', phone: '+1 (555) 789-0123', status: 'waitlist', checkedIn: false, timestamp: '2026-06-06T15:20:00.000Z', answers: { 'What startup are you building or working at?': 'Vandelay Industries', 'Are you looking for funding?': 'Always' } },
  { id: 'r8', eventId: '2', name: 'Harvey Specter', email: 'harvey@example.com', phone: '+1 (555) 890-1234', status: 'going', checkedIn: false, timestamp: '2026-06-07T08:45:00.000Z', answers: { 'What startup are you building or working at?': 'Pearson Specter LegalTech', 'Are you looking for funding?': 'No, investing' } }
];

// Two-way guest <-> host conversations (persisted). One thread per (event, guest).
const defaultConversations = [
  {
    id: 'conv_1_alice',
    eventId: '1',
    eventTitle: 'Summer Rooftop Mixer',
    guestName: 'Alice Vance',
    guestEmail: 'alice@example.com',
    hostName: 'Alex Rivera',
    hostEmail: 'alex@safalevent.com',
    messages: [
      { id: 'm1', sender: 'guest', text: 'Hi! Is there a dress code for the rooftop mixer?', timestamp: '2026-06-02T16:12:00.000Z' },
      { id: 'm2', sender: 'host', text: 'Hi Alice! Smart-casual is perfect. Looking forward to seeing you there!', timestamp: '2026-06-02T16:20:00.000Z' }
    ],
    unreadByHost: false,
    unreadByGuest: false
  }
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

const defaultPhotos = [
  { id: 'p1', eventId: '2', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80', uploaderName: 'Jordan Chen', uploaderEmail: 'jordan@startup.com', uploaderRole: 'host', status: 'APPROVED', timestamp: '2026-08-20T10:00:00.000Z', caption: 'Venue getting ready!' },
  { id: 'p2', eventId: '2', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80', uploaderName: 'Alice Vance', uploaderEmail: 'alice@example.com', uploaderRole: 'guest', status: 'PENDING', timestamp: '2026-09-02T19:00:00.000Z', caption: 'Great crowd today.' }
];

const defaultUser = null;

const defaultAnalytics = {
  views: {
    '1': 450,
    '2': 320,
    '3': 45,
    '4': 600
  }
};

export const defaultTemplates = {
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
  },
  rsvp_going: {
    subject: "Confirmed: You are attending {{event_name}}!",
    body: "Hi {{guest_name}},\n\nYour RSVP status for {{event_name}} is now confirmed as GOING.\n\nDate: {{event_date}} at {{event_start_time}}\nVenue: {{event_location}}\nTicket ID: {{booking_id}}\n\nManage tickets: {{manage_rsvp_link}}\n\nSee you there!\n{{host_name}}"
  },
  rsvp_maybe: {
    subject: "RSVP Update: Interested in {{event_name}}",
    body: "Hi {{guest_name}},\n\nWe've recorded your status as MAYBE for {{event_name}}.\n\nWe'll keep a spot open for you. If you decide to attend, please confirm here:\n{{manage_rsvp_link}}\n\nBest,\n{{host_name}}"
  },
  rsvp_waitlist: {
    subject: "Waitlisted for {{event_name}}",
    body: "Hi {{guest_name}},\n\n{{event_name}} is currently at full capacity. You have been placed on the official waitlist (Booking ID: {{booking_id}}).\n\nIf a spot opens up, you will be promoted and notified automatically.\n\nCheck status: {{manage_rsvp_link}}"
  },
  waitlist_promote: {
    subject: "Good news: You've been promoted to GOING for {{event_name}}!",
    body: "Hi {{guest_name}},\n\nA spot has opened up and you've been promoted from the waitlist to confirmed GOING for {{event_name}}!\n\nYour pass is now active. Access details & QR pass here:\n{{manage_rsvp_link}}"
  },
  reminder_24h: {
    subject: "Reminder: {{event_name}} is tomorrow!",
    body: "Hey {{guest_name}},\n\nJust 24 hours until {{event_name}}! Here's a reminder of the details:\n\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\n\nPass verification ID: {{booking_id}}\n\nSee you tomorrow!\n{{host_name}}"
  },
  reminder_3h: {
    subject: "Reminder: {{event_name}} starts in 3 hours!",
    body: "Hi {{guest_name}},\n\nWe start in 3 hours! Get ready for {{event_name}}.\n\nLocation: {{event_location}}\nDoors open at: {{event_start_time}}\n\nHave your ticket QR code ready for check-in: {{manage_rsvp_link}}"
  },
  details_updated: {
    subject: "Update: Details changed for {{event_name}}",
    body: "Hi {{guest_name}},\n\nThe host has updated the details for {{event_name}}.\n\nPlease note the updated schedule/venue details:\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\n\nView latest details: {{manage_rsvp_link}}"
  },
  event_cancelled: {
    subject: "Notice: {{event_name}} has been cancelled",
    body: "Hi {{guest_name}},\n\nWe regret to inform you that {{event_name}} on {{event_date}} has been cancelled by the host. We apologize for any inconvenience caused."
  },
  feedback_survey: {
    subject: "Thanks for coming to {{event_name}}! Rate your experience",
    body: "Hi {{guest_name}},\n\nWe hope you enjoyed {{event_name}}! Please take a moment to rate the event and write any comments:\n{{feedback_survey_link}}"
  },
  broadcast_all: {
    subject: "Announcement: Urgent update for {{event_name}}",
    body: "Dear Guest,\n\nWe have an announcement regarding {{event_name}}:\n\n[Your Message Here]\n\nManage RSVP: {{manage_rsvp_link}}"
  },
  host_new_rsvp: {
    subject: "[Host Notice] New Guest registered for {{event_name}}",
    body: "Hi Organizer,\n\n{{guest_name}} has registered for {{event_name}} (Status: Confirmed Going)."
  },
  host_rsvp_cancelled: {
    subject: "[Host Notice] Guest cancelled RSVP for {{event_name}}",
    body: "Hi Organizer,\n\n{{guest_name}} has cancelled their RSVP for {{event_name}}."
  },
  host_capacity_full: {
    subject: "[Host Notice] {{event_name}} has reached capacity limits",
    body: "Hi Organizer,\n\nYour event {{event_name}} is now at maximum capacity. New signups will automatically go to the Waitlist."
  },
  host_checkin_log: {
    subject: "[Host Notice] {{guest_name}} checked in to {{event_name}}",
    body: "Hi Organizer,\n\n{{guest_name}} has been checked in via QR pass scanner."
  },
  ticket_invoice: {
    subject: "Receipt for your ticket: {{event_name}}",
    body: "Hi {{guest_name}},\n\nHere is your receipt for {{event_name}}.\n\nTotal Paid: {{event_price}}\nBooking ID: {{booking_id}}\n\nAccess QR ticket: {{manage_rsvp_link}}"
  },
  rsvp_under_approval: {
    subject: "We received your RSVP for {{event_name}} — pending approval",
    body: "Hi {{guest_name}},\n\nThanks for your RSVP to {{event_name}}! Because this event requires organizer approval, your request is now UNDER APPROVAL.\n\nWe'll email you as soon as the host reviews it.\n\nDate: {{event_date}} at {{event_start_time}}\nLocation: {{event_location}}\nRequest ID: {{booking_id}}\n\nTrack your status: {{manage_rsvp_link}}\n\n{{host_name}}"
  },
  rsvp_approved: {
    subject: "You're approved for {{event_name}}!",
    body: "Hi {{guest_name}},\n\nGreat news — the host has APPROVED your RSVP for {{event_name}}. You're confirmed!\n\nDate: {{event_date}} at {{event_start_time}}\nLocation: {{event_location}}\nBooking ID: {{booking_id}}\n\nView your pass: {{manage_rsvp_link}}\n\nSee you there,\n{{host_name}}"
  },
  rsvp_rejected: {
    subject: "Update on your RSVP for {{event_name}}",
    body: "Hi {{guest_name}},\n\nThank you for your interest in {{event_name}}. Unfortunately the host was unable to approve your RSVP at this time.\n\nReason: {{rejection_reason}}\n\nWe hope to see you at a future event.\n\n{{host_name}}"
  },
  staff_invite: {
    subject: "You've been invited to help run {{event_name}}",
    body: "Hi {{staff_name}},\n\n{{host_name}} has invited you to join the team for {{event_name}} as {{staff_role}}.\n\nAccept your invite and sign in here: {{manage_rsvp_link}}\n\nYour access is limited to what the {{staff_role}} role permits.\n\nSafalEvent Team"
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
  },
  {
    id: 'u3',
    role: 'host',
    name: 'Maya Sharma',
    email: 'org@safalevent.com',
    phone: '+1 (555) 777-6666',
    password: 'password123',
    hostType: 'organization',
    orgProfile: {
      orgName: 'Safal Foundation',
      orgType: 'Non-profit',
      website: 'https://safalfoundation.org',
      country: 'USA',
      city: 'New York',
      state: 'NY',
      docs: []
    },
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u4',
    role: 'staff',
    name: 'Sam Carter',
    email: 'sam@safalevent.com',
    phone: '+1 (555) 444-3333',
    password: 'password123',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

// --- Staff Roles: named, tab/action-level permission sets (UC-07) ---
// Permission keys map to tabs/actions in the host portal. Default-deny:
// anything not present (or false) is hidden in the UI and blocked in the store.
export const PERMISSION_KEYS = [
  // Event Permissions
  'event_create', 'event_edit', 'event_delete', 'event_duplicate', 'event_publish', 'event_unpublish', 'event_cancel', 'event_archive', 'event_approve', 'event_reject',
  // Guest Permissions
  'guests_view_directory', 'guests_view_profile', 'guests_view_rsvp', 'guests_view_checkin', 'guests_view_intel', 'guests_add_internal_notes', 'guests_export', 'guests_import',
  // Check-In Permissions
  'checkin_scan', 'checkin_search', 'checkin_partial', 'checkin_full', 'checkin_manual', 'checkin_undo', 'checkin_view_history', 'checkin_view_intel',
  // Communication Permissions
  'comm_send_reminder', 'comm_send_message', 'comm_send_email', 'comm_send_sms', 'comm_send_push', 'comm_create_template', 'comm_view_history',
  // Analytics Permissions
  'analytics_view_dashboard', 'analytics_view_rsvp', 'analytics_view_attendance', 'analytics_view_guest', 'analytics_export',
  // Staff Management Permissions
  'staff_view', 'staff_create', 'staff_edit', 'staff_delete', 'roles_create', 'roles_edit', 'roles_delete',
  // Organization Permissions
  'org_manage_settings', 'org_manage_integrations', 'org_manage_subscription', 'org_view_audit'
];

const ALL_PERMS = PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
const buildPerms = (granted) => PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: granted.includes(k) }), {});

const defaultRoles = [
  {
    id: 'role_coordinator',
    name: 'Coordinator',
    description: 'Runs the event day-to-day: manage guests, approvals, check-in, and messaging.',
    builtIn: true,
    permissions: buildPerms([
      'guests_view', 'guests_approve', 'guests_edit', 'guests_export', 'checkin',
      'messaging_view', 'messaging_reply', 'history_view', 'settings_view'
    ])
  },
  {
    id: 'role_frontdesk',
    name: 'Front-desk',
    description: 'Check-in and door duty. Can see the guest list and check guests in.',
    builtIn: true,
    permissions: buildPerms(['guests_view', 'guests_edit', 'checkin', 'messaging_view', 'history_view'])
  },
  {
    id: 'role_scanner',
    name: 'QR Scanner',
    description: 'Gate check-in only — scans guest QR codes to mark arrivals. No editing, messaging, or settings.',
    builtIn: true,
    permissions: buildPerms(['checkin'])
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to guests, messages, and history.',
    builtIn: true,
    permissions: buildPerms(['guests_view', 'messaging_view', 'history_view'])
  }
];

// Staff assignments link a person (by email) + role to an event (UC-06/08).
// inviteId is the shareable token a staff member uses on the "Login as Staff"
// path (UC-13), matched against the email it was issued to.
const defaultStaff = [
  {
    id: 'st_1',
    accessScope: 'SELECTED',
    eventIds: ['1', '2'],
    name: 'Sam Carter',
    email: 'sam@safalevent.com',
    phone: '+1 (555) 444-3333',
    designation: 'Event Manager',
    department: 'Operations',
    roleId: 'role_coordinator',
    inviteId: 'INV-SAM-2026',
    status: 'ACTIVE',
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'st_2',
    eventId: '1',
    name: 'Sam Carter',
    email: 'sam@safalevent.com',
    roleId: 'role_frontdesk',
    inviteId: 'INV-SAM-2026',
    status: 'ACTIVE',
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'st_3',
    eventId: '1',
    name: 'Gabe Nguyen',
    email: 'gabe@safalevent.com',
    roleId: 'role_scanner',
    inviteId: 'INV-GATE-1',
    status: 'ACTIVE',
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

// --- Pricing Plans (UC-14) ---
const defaultPlans = [
  // Individual Plans
  {
    id: 'ind_free',
    name: 'Free',
    hostType: 'individual',
    monthlyPrice: 0,
    annualPrice: 0,
    commission: 0,
    limits: {
      activeEvents: 1,
      attendeesPerEvent: 50,
      maxGuestsPerRsvp: 1,
      staffMembers: 0,
      photos: 10,
      customQuestions: 2
    },
    paidTickets: false,
    polls: false,
    guestMessaging: false,
    duplicateEvents: false,
    customDomain: false,
    removeBranding: false,
    csvExport: false,
    qrCheckin: false
  },
  {
    id: 'ind_basic',
    name: 'Basic',
    hostType: 'individual',
    monthlyPrice: 3.99,
    annualPrice: 39.99,
    commission: 5,
    limits: {
      activeEvents: 3,
      attendeesPerEvent: 200,
      maxGuestsPerRsvp: 2,
      staffMembers: 2,
      photos: 50,
      customQuestions: 5
    },
    paidTickets: true,
    polls: true,
    guestMessaging: false,
    duplicateEvents: false,
    customDomain: false,
    removeBranding: false,
    csvExport: true,
    qrCheckin: false
  },
  {
    id: 'ind_advanced',
    name: 'Advanced',
    hostType: 'individual',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    commission: 3,
    limits: {
      activeEvents: 10,
      attendeesPerEvent: 500,
      maxGuestsPerRsvp: 4,
      staffMembers: 5,
      photos: 200,
      customQuestions: 10
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: false,
    removeBranding: false,
    csvExport: true,
    qrCheckin: true
  },
  {
    id: 'ind_premium',
    name: 'Premium',
    hostType: 'individual',
    monthlyPrice: 24.99,
    annualPrice: 249.99,
    commission: 2,
    limits: {
      activeEvents: -1,
      attendeesPerEvent: 1500,
      maxGuestsPerRsvp: 6,
      staffMembers: 15,
      photos: 1000,
      customQuestions: 25
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: true,
    removeBranding: true,
    csvExport: true,
    qrCheckin: true
  },
  {
    id: 'ind_premium_plus',
    name: 'Premium Plus',
    hostType: 'individual',
    monthlyPrice: 49.99,
    annualPrice: 499.99,
    commission: 1,
    limits: {
      activeEvents: -1,
      attendeesPerEvent: 5000,
      maxGuestsPerRsvp: 10,
      staffMembers: -1,
      photos: -1,
      customQuestions: -1
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: true,
    removeBranding: true,
    csvExport: true,
    qrCheckin: true
  },
  // Organization Plans
  {
    id: 'org_free',
    name: 'Free',
    hostType: 'organization',
    monthlyPrice: 0,
    annualPrice: 0,
    commission: 0,
    limits: {
      activeEvents: 2,
      attendeesPerEvent: 100,
      maxGuestsPerRsvp: 1,
      staffMembers: 1,
      photos: 20,
      customQuestions: 3
    },
    paidTickets: false,
    polls: false,
    guestMessaging: false,
    duplicateEvents: false,
    customDomain: false,
    removeBranding: false,
    csvExport: false,
    qrCheckin: false
  },
  {
    id: 'org_basic',
    name: 'Basic',
    hostType: 'organization',
    monthlyPrice: 19.99,
    annualPrice: 199.99,
    commission: 4,
    limits: {
      activeEvents: 5,
      attendeesPerEvent: 500,
      maxGuestsPerRsvp: 3,
      staffMembers: 5,
      photos: 100,
      customQuestions: 10
    },
    paidTickets: true,
    polls: true,
    guestMessaging: false,
    duplicateEvents: true,
    customDomain: false,
    removeBranding: false,
    csvExport: true,
    qrCheckin: true
  },
  {
    id: 'org_advanced',
    name: 'Advanced',
    hostType: 'organization',
    monthlyPrice: 49.99,
    annualPrice: 499.99,
    commission: 2.5,
    limits: {
      activeEvents: 30,
      attendeesPerEvent: 2000,
      maxGuestsPerRsvp: 5,
      staffMembers: 15,
      photos: 500,
      customQuestions: 20
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: true,
    removeBranding: false,
    csvExport: true,
    qrCheckin: true
  },
  {
    id: 'org_premium',
    name: 'Premium',
    hostType: 'organization',
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    commission: 1,
    limits: {
      activeEvents: -1,
      attendeesPerEvent: 5000,
      maxGuestsPerRsvp: 10,
      staffMembers: 50,
      photos: 5000,
      customQuestions: -1
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: true,
    removeBranding: true,
    csvExport: true,
    qrCheckin: true
  },
  {
    id: 'org_premium_plus',
    name: 'Premium Plus',
    hostType: 'organization',
    monthlyPrice: -1,
    annualPrice: -1,
    commission: 0,
    limits: {
      activeEvents: -1,
      attendeesPerEvent: -1,
      maxGuestsPerRsvp: -1,
      staffMembers: -1,
      photos: -1,
      customQuestions: -1
    },
    paidTickets: true,
    polls: true,
    guestMessaging: true,
    duplicateEvents: true,
    customDomain: true,
    removeBranding: true,
    csvExport: true,
    qrCheckin: true
  }
];

// --- Top-Up Packs (UC-14) ---
const defaultTopUps = [
  // Individual Top-Ups
  {
    id: 'topup_ind_events_3',
    name: '+3 Active Events',
    hostType: 'individual',
    category: 'events',
    value: 3,
    price: 4.99,
    description: 'Add 3 more active events to your current plan.'
  },
  {
    id: 'topup_ind_events_10',
    name: '+10 Active Events',
    hostType: 'individual',
    category: 'events',
    value: 10,
    price: 12.99,
    description: 'Add 10 more active events to your current plan.'
  },
  {
    id: 'topup_ind_attendees_100',
    name: '+100 Attendees',
    hostType: 'individual',
    category: 'attendees',
    value: 100,
    price: 2.99,
    description: 'Add 100 attendee slots to a specific event.'
  },
  {
    id: 'topup_ind_attendees_500',
    name: '+500 Attendees',
    hostType: 'individual',
    category: 'attendees',
    value: 500,
    price: 9.99,
    description: 'Add 500 attendee slots to a specific event.'
  },
  {
    id: 'topup_ind_photos_50',
    name: '+50 Photos',
    hostType: 'individual',
    category: 'photos',
    value: 50,
    price: 1.99,
    description: 'Add 50 more photo uploads across your events.'
  },
  {
    id: 'topup_ind_staff_3',
    name: '+3 Staff Members',
    hostType: 'individual',
    category: 'staff',
    value: 3,
    price: 3.99,
    description: 'Add 3 more staff member slots.'
  },
  // Organization Top-Ups
  {
    id: 'topup_org_events_10',
    name: '+10 Active Events',
    hostType: 'organization',
    category: 'events',
    value: 10,
    price: 14.99,
    description: 'Add 10 more active events to your organization plan.'
  },
  {
    id: 'topup_org_events_50',
    name: '+50 Active Events',
    hostType: 'organization',
    category: 'events',
    value: 50,
    price: 59.99,
    description: 'Add 50 more active events to your organization plan.'
  },
  {
    id: 'topup_org_attendees_500',
    name: '+500 Attendees',
    hostType: 'organization',
    category: 'attendees',
    value: 500,
    price: 9.99,
    description: 'Add 500 attendee slots to a specific event.'
  },
  {
    id: 'topup_org_attendees_2000',
    name: '+2000 Attendees',
    hostType: 'organization',
    category: 'attendees',
    value: 2000,
    price: 29.99,
    description: 'Add 2000 attendee slots to a specific event.'
  },
  {
    id: 'topup_org_photos_200',
    name: '+200 Photos',
    hostType: 'organization',
    category: 'photos',
    value: 200,
    price: 4.99,
    description: 'Add 200 more photo uploads across your events.'
  },
  {
    id: 'topup_org_staff_10',
    name: '+10 Staff Members',
    hostType: 'organization',
    category: 'staff',
    value: 10,
    price: 9.99,
    description: 'Add 10 more staff member slots.'
  }
];

// --- Default Subscriptions (UC-14) ---
const defaultSubscriptions = [
  {
    id: 'sub_1',
    hostEmail: 'alex@safalevent.com',
    planId: 'ind_advanced',
    billingCycle: 'monthly',
    status: 'active',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    currentPeriodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    scheduledChange: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  }
];

// --- Default Transactions (UC-14) ---
const defaultTransactions = [
  {
    id: 'txn_1',
    hostEmail: 'alex@safalevent.com',
    type: 'subscription',
    description: 'Advanced Plan - Monthly',
    amount: 9.99,
    status: 'completed',
    planId: 'ind_advanced',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  {
    id: 'txn_2',
    hostEmail: 'alex@safalevent.com',
    type: 'subscription',
    description: 'Advanced Plan - Monthly',
    amount: 9.99,
    status: 'completed',
    planId: 'ind_advanced',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
  }
];

// --- Default Message Templates ---
const defaultMessageTemplates = [
  { id: 'tpl_1', name: 'Registration Confirmation', category: 'Email', trigger: 'Guest Registered', content: 'Hi {{GuestName}},\n\nThanks for registering for {{EventName}}! We are excited to see you on {{EventDate}} at {{EventTime}}.\n\nVenue: {{Venue}}\n\nCheers,\n{{HostName}}', status: 'Active', isSystem: true },
  { id: 'tpl_2', name: 'Waitlist Notification', category: 'Email', trigger: 'Waitlisted', content: 'Hi {{GuestName}},\n\nYou are on the waitlist for {{EventName}}. We will notify you if a spot opens up.\n\nCheers,\n{{HostName}}', status: 'Active', isSystem: true },
  { id: 'tpl_3', name: 'RSVP Confirmation', category: 'Email', trigger: 'RSVP Confirmed', content: 'Hi {{GuestName}},\n\nYour RSVP for {{EventName}} is confirmed. See you soon!\n\nCheers,\n{{HostName}}', status: 'Active', isSystem: true },
  { id: 'tpl_4', name: 'Event Reminder (24h)', category: 'SMS', trigger: '24 Hours Before Event', content: 'Reminder: {{EventName}} is tomorrow at {{EventTime}}. See you there!', status: 'Active', isSystem: true },
  { id: 'tpl_5', name: 'Feedback Request', category: 'Email', trigger: 'Event Completed', content: 'Hi {{GuestName}},\n\nThanks for attending {{EventName}}. Please let us know how we did by leaving some feedback!\n\nCheers,\n{{HostName}}', status: 'Active', isSystem: true }
];

// --- Default Automation Rules ---
const defaultAutomationRules = [
  { id: 'rule_1', name: 'Send Registration Email', description: 'Automatically sends the Registration Confirmation template to newly registered guests.', scope: 'All Events', trigger: 'Guest Registered', conditions: [], actions: ['Send Email: Registration Confirmation'], status: 'Active' },
  { id: 'rule_2', name: 'Send RSVP Confirmation', description: 'Automatically sends an RSVP confirmation when guests RSVP as going.', scope: 'All Events', trigger: 'RSVP Submitted', conditions: ['If Status is Going'], actions: ['Send Email: RSVP Confirmation'], status: 'Active' },
  { id: 'rule_3', name: 'Send 24h Reminder', description: 'Sends an SMS reminder 24 hours before the event starts.', scope: 'All Events', trigger: '24 Hours Before Event', conditions: [], actions: ['Send SMS: Event Reminder (24h)'], status: 'Active' },
  { id: 'rule_4', name: 'Send Feedback Request', description: 'Sends a feedback request email after the event completes.', scope: 'All Events', trigger: 'Event Completed', conditions: [], actions: ['Send Email: Feedback Request'], status: 'Active' }
];

// --- Default Audit Logs ---
const defaultAuditLogs = [
  { id: 'al_1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), eventName: 'System', userName: 'Alex Rivera', role: 'Host Admin', action: 'Event Created', previousValue: 'None', newValue: 'Design Systems Workshop', status: 'Success', ip: '192.168.1.5' }
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
      verificationLogs: [],
      conversations: defaultConversations,
      roles: defaultRoles,
      staff: defaultStaff,
      photos: defaultPhotos
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
        verificationLogs: [],
        photos: defaultPhotos
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
  // Backfill the demo organization host for databases seeded before it existed
  if (!db.users.some(u => u.email === 'org@safalevent.com')) {
    db.users.push(defaultUsers.find(u => u.email === 'org@safalevent.com'));
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
  if (!db.conversations) {
    db.conversations = defaultConversations;
  }
  // Backfill pending event 6
  if (!db.events.some(e => e.id === '6')) {
    db.events.push(defaultEvents.find(e => e.id === '6'));
  }
  // Staff & Roles (UC-06/07/08)
  if (!db.roles) {
    db.roles = defaultRoles;
  }
  if (!db.orgSettings) {
    db.orgSettings = { eventCreationRequiresApproval: false };
  }
  if (!db.staff) {
    db.staff = defaultStaff;
  }
  if (!db.photos) {
    db.photos = defaultPhotos;
  }
  // Pricing & Billing (UC-14)
  if (!db.plans) {
    db.plans = defaultPlans;
  }
  if (!db.topUps) {
    db.topUps = defaultTopUps;
  }
  if (!db.subscriptions) {
    db.subscriptions = defaultSubscriptions;
  }
  if (!db.topUpBalances) {
    db.topUpBalances = [];
  }
  if (!db.transactions) {
    db.transactions = defaultTransactions;
  }
  // Backfill the demo staff user for databases seeded before it existed
  if (db.users && !db.users.some(u => u.email === 'sam@safalevent.com')) {
    db.users.push(defaultUsers.find(u => u.email === 'sam@safalevent.com'));
  }
  // Backfill per-RSVP approval state (UC-01). Events that require approval keep
  // new submissions UNDER_APPROVAL; everything else is implicitly APPROVED.
  db.rsvps = db.rsvps.map(r => {
    if (r.approvalState === undefined) {
      const ev = db.events.find(e => e.id === r.eventId);
      r.approvalState = (ev && ev.approvalRequired) ? 'UNDER_APPROVAL' : 'APPROVED';
    }
    return r;
  });
  if (!db.automationRules) db.automationRules = defaultAutomationRules;
  if (!db.messageTemplates) db.messageTemplates = defaultMessageTemplates;
  if (!db.auditLogs) db.auditLogs = defaultAuditLogs;

  if (!db.hostNotifications) {
    db.hostNotifications = [
      {
        id: 'n_1',
        type: 'rsvp',
        title: 'New RSVP',
        message: 'Alice Vance registered for Summer Rooftop Mixer.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        eventId: '1'
      },
      {
        id: 'n_2',
        type: 'payment',
        title: 'Payment Received',
        message: 'Bob Smith paid $15.00 for Summer Rooftop Mixer.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        eventId: '1'
      },
      {
        id: 'n_3',
        type: 'checkin',
        title: 'Guest Checked In',
        message: 'Ethan Hunt checked in via QR scanner.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
        eventId: '1'
      }
    ];
  }
  if (!db.immutableAuditTrail) {
    db.immutableAuditTrail = [
      {
        id: 'a_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actor: 'System',
        action: 'Database initialized & seeded defaults',
        eventId: null
      },
      {
        id: 'a_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        actor: 'Alex Rivera (Host)',
        action: 'Created Summer Rooftop Mixer',
        eventId: '1'
      },
      {
        id: 'a_3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        actor: 'Alice Vance (Guest)',
        action: 'RSVP registered status: going',
        eventId: '1'
      }
    ];
  }
  if (!db.hostSuspensions) {
    db.hostSuspensions = {};
  }
  if (!db.systemTemplates) {
    db.systemTemplates = [
      {
        key: 'rsvp',
        name: 'RSVP Confirmation',
        subject: "You're going to {{event_name}} on {{event_date}}",
        body: "Hey {{guest_name}},\n\nYour spot is confirmed for {{event_name}}! Here are the details:\n\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\nGuests: {{guest_guest_count}}\nBooking ID: {{booking_id}}\n\nManage your RSVP here:\n{{manage_rsvp_link}}\n\nBest,\n{{host_name}}",
        version: '1.0',
        updatedAt: new Date().toISOString(),
        logs: ['v1.0: Seed default system-wide template.']
      },
      {
        key: 'reminder',
        name: 'Event Reminder',
        subject: "Reminder: {{event_name}} starts soon!",
        body: "Hey {{guest_name}},\n\nThis is a quick reminder that {{event_name}} is starting soon.\n\nDate: {{event_date}}\nTime: {{event_start_time}}\nLocation: {{event_location}}\n\nIf you need to change your RSVP status, you can do so here:\n{{manage_rsvp_link}}\n\nSee you there!\n{{host_name}}",
        version: '1.0',
        updatedAt: new Date().toISOString(),
        logs: ['v1.0: Seed default system-wide template.']
      },
      {
        key: 'feedback',
        name: 'Post-Event Feedback',
        subject: "How was {{event_name}}?",
        body: "Hey {{guest_name}},\n\nThank you for attending {{event_name}}! We would love to know how your experience was. Please take 2 minutes to fill out our short feedback survey:\n\n{{feedback_survey_link}}\n\nThank you,\n{{host_name}}",
        version: '1.0',
        updatedAt: new Date().toISOString(),
        logs: ['v1.0: Seed default system-wide template.']
      }
    ];
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
      feedbackDelay: 3,
      // Per-event guest <-> host messaging (UC-09). Existing events default to
      // enabled to preserve current behavior; new events choose during creation.
      messagingEnabled: true,
      enablePhotoAlbum: false,
      photoUploadPermission: 'host_only',
      requirePhotoApproval: false
    };

    Object.keys(defaults).forEach(key => {
      if (event[key] === undefined) {
        event[key] = defaults[key];
      }
    });

    // Backfill host attribution for events seeded before host fields existed
    if (!event.hostName) {
      const seed = defaultEvents.find(d => d.id === event.id);
      event.hostName = (seed && seed.hostName) || 'Event Organizer';
      event.hostEmail = event.hostEmail || (seed && seed.hostEmail) || 'host@safalevents.com';
    }

    if (!event.templates) {
      event.templates = { ...defaultTemplates };
    } else {
      Object.keys(defaultTemplates).forEach(tKey => {
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

  getOrgSettings: () => {
    const db = getDB();
    return db.orgSettings || { eventCreationRequiresApproval: false };
  },

  updateOrgSettings: (settings) => {
    const db = getDB();
    db.orgSettings = { ...db.orgSettings, ...settings };
    saveDB(db);
    return db.orgSettings;
  },

  submitEventForApproval: (eventId) => {
    const db = getDB();
    db.events = db.events.map(e => e.id === eventId ? { ...e, approvalState: 'PENDING_APPROVAL' } : e);
    saveDB(db);
  },

  approveEvent: (eventId) => {
    const db = getDB();
    db.events = db.events.map(e => e.id === eventId ? { ...e, approvalState: 'APPROVED', status: 'Published' } : e);
    saveDB(db);
  },

  rejectEvent: (eventId, reason) => {
    const db = getDB();
    db.events = db.events.map(e => e.id === eventId ? { ...e, approvalState: 'REJECTED', approvalComments: reason } : e);
    saveDB(db);
  },

  getEventById: (id) => {
    const db = getDB();
    return db.events.find(e => e.id === id);
  },

  createEvent: (eventData) => {
    const db = getDB();
    const orgSettings = mockStore.getOrgSettings();
    const newEvent = {
      id: String(db.events.length + 1),
      status: orgSettings.eventCreationRequiresApproval ? 'Draft' : 'Published',
      approvalState: orgSettings.eventCreationRequiresApproval ? 'DRAFT' : 'APPROVED',
      theme: 'mesh-gradient-sunset',
      capacity: 100,
      approvalRequired: false,
      autoCheckIn: false,
      questions: [],
      eventType: 'Party',
      privacy: 'Public',
      rsvpStatus: 'Open',
      showGuestList: true,
      showRsvpCounts: 'detailed',
      maxGuestsPerRsvp: 1,
      rsvpDeadline: '',
      allowSelfEdit: true,
      allowSelfCancellation: true,
      allowNoRsvp: true,
      cancellationCutoff: 24,
      requireCancellationReason: false,
      allowComments: true,
      allowPhotoUploads: false,
      guestConfirmation: true,
      reminderSchedule: '24h',
      hostAlerts: true,
      enablePayments: false,
      messagingEnabled: true,

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
      
      // Photo settings
      enablePhotoAlbum: false,
      photoUploadPermission: 'host_only',
      requirePhotoApproval: false,

      ...eventData
    };
    db.events.unshift(newEvent); // Add to beginning
    db.analytics.views[newEvent.id] = 0;
    saveDB(db);
    return newEvent;
  },

  updateEvent: (id, eventData, actor = 'Organizer') => {
    const db = getDB();
    const oldEvent = db.events.find(e => e.id === id);
    if (!oldEvent) return null;

    db.events = db.events.map(e => e.id === id ? { ...e, ...eventData } : e);
    saveDB(db);

    const newEvent = db.events.find(e => e.id === id);
    
    // Audit Log
    mockStore.addAuditLog(actor, `Updated event details for "${newEvent.title}"`, id);

    // If capacity increased, check if we can promote waitlisted guests
    if (newEvent.capacity > (oldEvent.capacity || 0)) {
      mockStore.promoteWaitlistedGuestsIfPossible(id, db);
      saveDB(db);
    }
    
    return newEvent;
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
    db.photos = db.photos.filter(p => p.eventId !== eventId);
    saveDB(db);
  },

  // --- REVIEWS & FEEDBACK ---
  getEventFeedback: (eventId) => {
    const db = getDB();
    return db.rsvps.filter(r => r.eventId === eventId);
  },

  // --- Photos ---
  getEventPhotos: (eventId) => {
    const db = getDB();
    return (db.photos || []).filter(p => p.eventId === eventId);
  },
  
  uploadPhoto: (eventId, photoData) => {
    const db = getDB();
    const newPhoto = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      eventId,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      ...photoData
    };
    db.photos.push(newPhoto);
    saveDB(db);
    return newPhoto;
  },

  updatePhotoStatus: (photoId, status) => {
    const db = getDB();
    const photo = db.photos.find(p => p.id === photoId);
    if (photo) {
      photo.status = status;
      saveDB(db);
      return photo;
    }
    return null;
  },

  deletePhoto: (photoId) => {
    const db = getDB();
    db.photos = db.photos.filter(p => p.id !== photoId);
    saveDB(db);
  },

  getEventCapacityStatus: (eventId) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return { capacity: 0, currentGoing: 0, remaining: 0, full: false };
    
    const currentGoingCount = db.rsvps
      .filter(r => r.eventId === eventId && r.status === 'going' && r.approvalState !== 'REJECTED')
      .reduce((sum, r) => sum + (r.guestCount || 1), 0);
      
    const capacity = event.capacity || 100;
    return {
      capacity,
      currentGoing: currentGoingCount,
      remaining: Math.max(0, capacity - currentGoingCount),
      full: currentGoingCount >= capacity
    };
  },

  // --- RSVPs ---
  getRSVPs: (eventId) => {
    const db = getDB();
    return db.rsvps.filter(r => r.eventId === eventId);
  },

  // --- Conversations (two-way guest <-> host messaging) ---
  getConversations: () => {
    const db = getDB();
    return db.conversations || [];
  },

  // All conversation threads belonging to a guest (by email)
  getGuestConversations: (email) => {
    if (!email) return [];
    const db = getDB();
    return (db.conversations || [])
      .filter(c => c.guestEmail === email)
      .sort((a, b) => {
        const at = a.messages[a.messages.length - 1]?.timestamp || 0;
        const bt = b.messages[b.messages.length - 1]?.timestamp || 0;
        return new Date(bt) - new Date(at);
      });
  },

  // Find the thread for a given event + guest, or null
  getConversation: (eventId, guestEmail) => {
    const db = getDB();
    return (db.conversations || []).find(c => c.eventId === eventId && c.guestEmail === guestEmail) || null;
  },

  // Guest sends a message to the host of an event they've RSVP'd to.
  // Creates the thread if it does not exist yet. Returns the conversation.
  sendGuestMessage: (eventId, guest, text) => {
    const db = getDB();
    if (!db.conversations) db.conversations = [];
    const event = db.events.find(e => e.id === eventId);
    let convo = db.conversations.find(c => c.eventId === eventId && c.guestEmail === guest.email);

    const message = {
      id: `m_${Math.floor(performance.now() * 1000)}`,
      sender: 'guest',
      text,
      timestamp: new Date().toISOString()
    };

    if (!convo) {
      convo = {
        id: `conv_${eventId}_${(guest.email || 'guest').split('@')[0]}`,
        eventId,
        eventTitle: event?.title || 'Event',
        guestName: guest.name || 'Guest',
        guestEmail: guest.email || '',
        hostName: event?.hostName || 'Event Organizer',
        hostEmail: event?.hostEmail || 'host@safalevents.com',
        messages: [message],
        unreadByHost: true,
        unreadByGuest: false
      };
      db.conversations.push(convo);
    } else {
      convo.messages.push(message);
      convo.unreadByHost = true;
    }

    // Surface a host-side activity notification so the host knows a guest wrote in
    if (!db.hostNotifications) db.hostNotifications = [];
    db.hostNotifications.unshift({
      id: `n_msg_${message.id}`,
      type: 'message',
      title: 'New Guest Message',
      message: `${guest.name || 'A guest'} messaged you about "${event?.title || 'your event'}".`,
      timestamp: message.timestamp,
      read: false,
      eventId
    });

    saveDB(db);
    return convo;
  },

  // Host replies to a guest thread. Returns the conversation.
  sendHostMessage: (conversationId, text) => {
    const db = getDB();
    const convo = (db.conversations || []).find(c => c.id === conversationId);
    if (!convo) return null;
    convo.messages.push({
      id: `m_${Math.floor(performance.now() * 1000)}`,
      sender: 'host',
      text,
      timestamp: new Date().toISOString()
    });
    convo.unreadByGuest = true;
    saveDB(db);
    return convo;
  },

  // Clear unread flags for whichever side opened the thread
  markConversationRead: (conversationId, side = 'guest') => {
    const db = getDB();
    const convo = (db.conversations || []).find(c => c.id === conversationId);
    if (!convo) return;
    if (side === 'guest') convo.unreadByGuest = false;
    else convo.unreadByHost = false;
    saveDB(db);
  },

  addRSVP: (eventId, rsvpData) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    let finalStatus = rsvpData.status || 'going';

    if (event) {
      // Only confirmed/approved-going guests consume capacity (rejected don't count)
      const currentGoingCount = db.rsvps
        .filter(r => r.eventId === eventId && r.status === 'going' && r.approvalState !== 'REJECTED')
        .reduce((sum, r) => sum + (r.guestCount || 1), 0);
      const capacity = event.capacity || 100;

      if (currentGoingCount + (rsvpData.guestCount || 1) > capacity && (rsvpData.status === 'going' || !rsvpData.status)) {
        finalStatus = 'waitlist';
      }
    }

    const isWaitlist = finalStatus === 'waitlist';

    // UC-01/02: an RSVP is held UNDER_APPROVAL when (a) the event requires
    // organizer approval, or (b) it landed on the waitlist because the event is
    // full — the host then decides who to admit if a spot frees up.
    const approvalState = rsvpData.approvalState ||
      ((isWaitlist || (event && event.approvalRequired)) ? 'UNDER_APPROVAL' : 'APPROVED');
    const pendingApproval = approvalState === 'UNDER_APPROVAL';

    const newRsvp = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      eventId,
      checkedIn: false,
      timestamp: new Date().toISOString(),
      answers: {},
      guestCount: rsvpData.guestCount || 1,
      preferredChannel: rsvpData.preferredChannel || 'Email',
      reminderSchedule: rsvpData.reminderSchedule || 'both',
      optOutSms: rsvpData.optOutSms || false,
      ...rsvpData,
      status: finalStatus,
      approvalState
    };
    db.rsvps.push(newRsvp);
    saveDB(db);

    // Add Host Notification & Audit Log
    if (event) {
      const eventTitle = event.title || 'Event';
      if (isWaitlist) {
        mockStore.addHostNotification('rsvp', 'Waitlist — Review Needed', `${newRsvp.name} is waitlisted for ${eventTitle} (capacity full). Approve to allow them in if a spot opens.`, eventId);
      } else if (pendingApproval) {
        mockStore.addHostNotification('rsvp', 'RSVP Awaiting Approval', `${newRsvp.name} requested to join ${eventTitle}. Review in Manage → Guests.`, eventId);
      } else {
        mockStore.addHostNotification('rsvp', 'New RSVP', `${newRsvp.name} registered for ${eventTitle}.`, eventId);
      }
      mockStore.addAuditLog(
        newRsvp.name + ' (Guest)',
        isWaitlist
          ? `RSVP waitlisted — Under Approval (capacity full)`
          : pendingApproval
            ? `RSVP submitted — Under Approval (response: ${finalStatus})`
            : `RSVP registered with status: ${finalStatus}`,
        eventId
      );

      // Notify the host (and dashboard outbox) that a decision is pending (UC-03)
      if (pendingApproval) {
        const tmpls = event.templates || defaultTemplates;
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: event.hostEmail || 'host@safalevents.com',
          type: 'rsvp',
          channel: 'Email',
          subject: mockStore.renderTemplate(tmpls.host_new_rsvp?.subject || defaultTemplates.host_new_rsvp.subject, event, newRsvp),
          body: mockStore.renderTemplate(tmpls.host_new_rsvp?.body || defaultTemplates.host_new_rsvp.body, event, newRsvp),
          status: 'Delivered'
        });
      }
    }

    // UC-03: tell the guest their request is pending approval, then stop — we
    // do not send a confirmation/ticket until the host approves. Waitlisted
    // guests get the waitlist notice instead of the generic approval one.
    if (event && pendingApproval) {
      const templates = event.templates || defaultTemplates;
      if (event.sendRsvpConfirmationEmail && newRsvp.preferredChannel === 'Email') {
        const key = isWaitlist ? 'rsvp_waitlist' : 'rsvp_under_approval';
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'Email',
          subject: mockStore.renderTemplate(templates[key]?.subject || defaultTemplates[key].subject, event, newRsvp),
          body: mockStore.renderTemplate(templates[key]?.body || defaultTemplates[key].body, event, newRsvp),
          status: 'Delivered'
        });
      }
      return newRsvp;
    }

    // Dynamic Trigger for RSVP Confirmation
    if (event) {
      const templates = event.templates || defaultTemplates;
      const isWaitlisted = finalStatus === 'waitlist';
      const emailEnabled = event.sendRsvpConfirmationEmail && newRsvp.preferredChannel === 'Email';
      const smsEnabled = event.sendRsvpConfirmationSms && newRsvp.preferredChannel === 'SMS' && !newRsvp.optOutSms;

      if (emailEnabled) {
        const templateKey = isWaitlisted ? 'rsvp_waitlist' : 'rsvp';
        const subject = mockStore.renderTemplate(templates[templateKey]?.subject || defaultTemplates[templateKey].subject, event, newRsvp);
        const body = mockStore.renderTemplate(templates[templateKey]?.body || defaultTemplates[templateKey].body, event, newRsvp);
        
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'Email',
          subject,
          body,
          status: 'Delivered'
        });

        // If ticket payments are enabled and it's not waitlisted, send the ticket invoice
        if (event.enablePayments && !isWaitlisted) {
          const priceStr = `$${event.ticketPrice || 0}`;
          const invSubject = mockStore.renderTemplate(templates.ticket_invoice?.subject || defaultTemplates.ticket_invoice.subject, event, newRsvp);
          const invBody = mockStore.renderTemplate(templates.ticket_invoice?.body || defaultTemplates.ticket_invoice.body, event, newRsvp, { '{{event_price}}': priceStr });
          
          mockStore.addNotificationLog(eventId, {
            rsvpId: newRsvp.id,
            guestEmail: newRsvp.email,
            type: 'payment',
            channel: 'Email',
            subject: invSubject,
            body: invBody,
            status: 'Delivered'
          });

          // Also trigger a payment host notification
          mockStore.addHostNotification('payment', 'Payment Received', `${newRsvp.name} paid $${(event.ticketPrice || 0) * (newRsvp.guestCount || 1)} for ${event.title}.`, eventId);
        }
      }

      if (smsEnabled) {
        const templateKey = isWaitlisted ? 'rsvp_waitlist' : 'rsvp';
        const body = mockStore.renderTemplate(templates[templateKey]?.body || defaultTemplates[templateKey].body, event, newRsvp);
        
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'SMS',
          subject: isWaitlisted ? 'Waitlisted Alert' : 'RSVP Confirmation',
          body: body.length > 160 ? body.substring(0, 157) + '...' : body,
          status: 'Delivered'
        });
      }
    }

    return newRsvp;
  },

  // --- RSVP Approval Workflow (UC-02) ---
  // Host (or staff with the guests_approve permission) approves a pending RSVP.
  approveRSVP: (eventId, rsvpId, actor = 'Host') => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    const rsvp = db.rsvps.find(r => r.id === rsvpId && r.eventId === eventId);
    if (!rsvp) return null;

    rsvp.approvalState = 'APPROVED';
    rsvp.rejectionReason = '';
    // Approval admits the guest: a waitlisted or previously declined response
    // becomes "going" so they're allowed in.
    if (rsvp.status === 'declined' || rsvp.status === 'waitlist') rsvp.status = 'going';
    rsvp.approvedAt = new Date().toISOString();
    saveDB(db);

    const eventTitle = event ? event.title : 'Event';
    mockStore.addAuditLog(actor, `Approved RSVP for ${rsvp.name}`, eventId);
    mockStore.addHostNotification('rsvp', 'RSVP Approved', `${rsvp.name} was approved for ${eventTitle}.`, eventId);

    // UC-03: email the guest that they are approved
    if (event) {
      const templates = event.templates || defaultTemplates;
      mockStore.addNotificationLog(eventId, {
        rsvpId: rsvp.id,
        guestEmail: rsvp.email,
        type: 'rsvp',
        channel: 'Email',
        subject: mockStore.renderTemplate(templates.rsvp_approved?.subject || defaultTemplates.rsvp_approved.subject, event, rsvp),
        body: mockStore.renderTemplate(templates.rsvp_approved?.body || defaultTemplates.rsvp_approved.body, event, rsvp),
        status: 'Delivered'
      });
    }
    return rsvp;
  },

  // Host rejects a pending RSVP (optionally with a reason).
  rejectRSVP: (eventId, rsvpId, reason = '', actor = 'Host') => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    const rsvp = db.rsvps.find(r => r.id === rsvpId && r.eventId === eventId);
    if (!rsvp) return null;

    rsvp.approvalState = 'REJECTED';
    rsvp.rejectionReason = reason || '';
    rsvp.decidedAt = new Date().toISOString();
    saveDB(db);

    const eventTitle = event ? event.title : 'Event';
    mockStore.addAuditLog(actor, `Rejected RSVP for ${rsvp.name}${reason ? ` (reason: ${reason})` : ''}`, eventId);
    mockStore.addHostNotification('rsvp', 'RSVP Rejected', `${rsvp.name}'s request for ${eventTitle} was rejected.`, eventId);

    // UC-03: email the guest that they were not approved
    if (event) {
      const templates = event.templates || defaultTemplates;
      mockStore.addNotificationLog(eventId, {
        rsvpId: rsvp.id,
        guestEmail: rsvp.email,
        type: 'rsvp',
        channel: 'Email',
        subject: mockStore.renderTemplate(templates.rsvp_rejected?.subject || defaultTemplates.rsvp_rejected.subject, event, rsvp),
        body: mockStore.renderTemplate(
          templates.rsvp_rejected?.body || defaultTemplates.rsvp_rejected.body,
          event, rsvp, { '{{rejection_reason}}': reason || 'No reason provided.' }
        ),
        status: 'Delivered'
      });
    }
    return rsvp;
  },

  // Re-open a rejected RSVP back to the pending queue (UC-02 business rule).
  reopenRSVP: (eventId, rsvpId, actor = 'Host') => {
    const db = getDB();
    const rsvp = db.rsvps.find(r => r.id === rsvpId && r.eventId === eventId);
    if (!rsvp) return null;
    rsvp.approvalState = 'UNDER_APPROVAL';
    rsvp.rejectionReason = '';
    saveDB(db);
    mockStore.addAuditLog(actor, `Re-opened RSVP for ${rsvp.name} (back to Under Approval)`, eventId);
    return rsvp;
  },

  updateRSVP: (eventId, rsvpId, updatedData, actor = 'Organizer') => {
    const db = getDB();
    const oldRsvp = db.rsvps.find(r => r.id === rsvpId || (r.eventId === eventId && r.email === rsvpId));
    if (!oldRsvp) return null;

    const event = db.events.find(e => e.id === eventId);
    const eventTitle = event ? event.title : 'Event';

    // Perform the status mapping update
    db.rsvps = db.rsvps.map(r => (r.id === rsvpId || (r.eventId === eventId && r.email === rsvpId)) ? { ...r, ...updatedData } : r);
    saveDB(db);

    const newRsvp = db.rsvps.find(r => r.id === rsvpId || (r.eventId === eventId && r.email === rsvpId));

    // Audit Log
    let auditAction = `RSVP details updated. Preferred Channel: ${newRsvp.preferredChannel}, Reminder Schedule: ${newRsvp.reminderSchedule}`;
    if (updatedData.status && updatedData.status !== oldRsvp.status) {
      auditAction = `RSVP status updated from ${oldRsvp.status} to ${newRsvp.status}`;
    }
    if (updatedData.checkedIn !== undefined && updatedData.checkedIn !== oldRsvp.checkedIn) {
      auditAction = `Guest check-in status updated from ${oldRsvp.checkedIn ? 'Checked-In' : 'Absent'} to ${newRsvp.checkedIn ? 'Checked-In' : 'Absent'}`;
    }
    mockStore.addAuditLog(actor, auditAction, eventId);

    const prevInCount = oldRsvp.checkedInCount != null ? oldRsvp.checkedInCount : (oldRsvp.checkedIn ? (oldRsvp.guestCount || 1) : 0);
    const newInCount = newRsvp.checkedInCount != null ? newRsvp.checkedInCount : (newRsvp.checkedIn ? (newRsvp.guestCount || 1) : 0);

    // Notifications on check-in
    if (newInCount > prevInCount) {
      const total = newRsvp.guestCount || 1;
      const isComplete = newInCount >= total;
      mockStore.addHostNotification('checkin', 'Guest Checked In', `${newRsvp.name} (${newInCount}/${total}) checked in to ${eventTitle}.`, eventId);
      
      // Dispatch checking notice to outbox logs
      if (event && event.sendRsvpConfirmationEmail) {
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'checkin',
          channel: 'Email',
          subject: isComplete ? `Welcome: Check-in completed for ${eventTitle}` : `Update: Partial Check-in for ${eventTitle}`,
          body: isComplete 
            ? `Hi ${newRsvp.name},\n\nYour check-in for "${eventTitle}" has been successfully completed.\n\nGuests Checked In: ${newInCount} of ${total}\n\nEnjoy the event!`
            : `Hi ${newRsvp.name},\n\nYour check-in for "${eventTitle}" has been recorded.\n\nGuests Checked In: ${newInCount} of ${total}\n\nThe remaining guests in your RSVP can still check in using the same QR code.\n\nEnjoy the event!`,
          status: 'Delivered'
        });
      }
    }

    // Host Notification on status change to going (approved)
    if (updatedData.status === 'going' && oldRsvp.status !== 'going') {
      mockStore.addHostNotification('rsvp', 'RSVP Confirmed', `${newRsvp.name}'s RSVP for ${eventTitle} is confirmed (attending).`, eventId);
      
      // Dispatch rsvp_going notice
      if (event) {
        const templates = event.templates || defaultTemplates;
        const subject = mockStore.renderTemplate(templates.rsvp_going?.subject || defaultTemplates.rsvp_going.subject, event, newRsvp);
        const body = mockStore.renderTemplate(templates.rsvp_going?.body || defaultTemplates.rsvp_going.body, event, newRsvp);
        mockStore.addNotificationLog(eventId, {
          rsvpId: newRsvp.id,
          guestEmail: newRsvp.email,
          type: 'rsvp',
          channel: 'Email',
          subject,
          body,
          status: 'Delivered'
        });
      }
    }

    // Trigger waitlist promotion if a spot opened up
    const spotOpened = 
      (oldRsvp.status === 'going' && newRsvp.status !== 'going') ||
      (updatedData.status === 'declined' && oldRsvp.status === 'going');

    if (spotOpened) {
      mockStore.promoteWaitlistedGuestsIfPossible(eventId, db);
      saveDB(db);
    }

    return newRsvp;
  },

  addWalkinGuests: (eventId, rsvpId, count, scannerName = 'Host') => {
    const db = getDB();
    const rsvp = db.rsvps.find((r) => r.id === rsvpId);
    if (!rsvp || count < 1) return null;
    const stamp = new Date();
    const entry = {
      time: stamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      iso: stamp.toISOString(),
      count,
      by: scannerName,
      walkin: true,
    };
    rsvp.walkinCount = (rsvp.walkinCount || 0) + count;
    rsvp.checkedInCount = (rsvp.checkedInCount || 0) + count;
    rsvp.checkedIn = true;
    rsvp.checkInLog = [...(rsvp.checkInLog || []), entry];
    saveDB(db);
    return rsvp;
  },

  waitlistWalkins: (eventId, primaryRsvpId, walkinCount, actor = 'Staff') => {
    const db = getDB();
    const primaryRsvp = db.rsvps.find(r => r.id === primaryRsvpId);
    if (!primaryRsvp) return null;
    const event = db.events.find(e => e.id === eventId);
    if (!event) return null;

    const newRsvp = {
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      eventId,
      name: `Walk-ins (${primaryRsvp.name})`,
      email: primaryRsvp.email,
      phone: primaryRsvp.phone,
      linkedTo: primaryRsvpId,
      checkedIn: false,
      timestamp: new Date().toISOString(),
      answers: {},
      guestCount: walkinCount,
      preferredChannel: primaryRsvp.preferredChannel || 'Email',
      status: 'waitlist',
      approvalState: 'UNDER_APPROVAL'
    };
    db.rsvps.push(newRsvp);
    saveDB(db);

    // Host notification
    mockStore.addHostNotification(
      'rsvp', 
      'New Walk-In Approval Request', 
      `Event: ${event.title}\nPrimary Guest: ${primaryRsvp.name}\nAdditional Guests Requested: ${walkinCount}\nRequested By: ${actor}\nAction Required: Approve or Reject`, 
      eventId
    );

    // Guest notification
    if (event.sendRsvpConfirmationEmail) {
      mockStore.addNotificationLog(eventId, {
        rsvpId: primaryRsvp.id,
        guestEmail: primaryRsvp.email,
        type: 'waitlist',
        channel: 'Email',
        subject: `Update: Walk-ins waitlisted for ${event.title}`,
        body: `Hi ${primaryRsvp.name},\n\nYour check-in for "${event.title}" has been completed.\n\n${walkinCount} additional guest(s) could not be checked in because the event has reached capacity.\n\nThey have been added to the event waitlist and are awaiting host approval.\n\nYou will be notified once a decision has been made.`,
        status: 'Delivered'
      });
    }

    return newRsvp;
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
      '{{host_name}}': event.hostName || 'Alex Rivera',
      '{{manage_rsvp_link}}': `http://localhost:5173/dashboard`,
      '{{guest_name}}': guest?.name || 'Valued Guest',
      '{{guest_guest_count}}': String(guest?.guestCount || 1),
      '{{booking_id}}': guest?.id?.toUpperCase() || 'RSVP-123',
      '{{feedback_survey_link}}': `http://localhost:5173/feedback/${event.id}`,
      '{{safalevent_support_email}}': 'support@safalevent.com',
      '{{rejection_reason}}': 'No reason provided.',
      '{{staff_name}}': guest?.name || 'Team member',
      '{{staff_role}}': 'Team member',
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
    // Gate: an organization host cannot be activated until it has uploaded verification documents.
    const _target = db.users.find(u => u.id === userId);
    if (status === 'ACTIVE' && _target && _target.hostType === 'organization' && !(_target.orgProfile && _target.orgProfile.docs && _target.orgProfile.docs.length)) {
      return { ..._target, error: 'Documents required' };
    }
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

  // Persist organization verification documents to the host's user record
  saveOrgDocuments: (email, docNames) => {
    const db = getDB();
    db.users = db.users.map(u => {
      if (u.email !== email) return u;
      return {
        ...u,
        orgDocsUploaded: true,
        orgProfile: { ...(u.orgProfile || {}), docs: docNames }
      };
    });
    saveDB(db);
    return db.users.find(u => u.email === email) || null;
  },

  createSignupSession: (hostType, formData, accountType = 'host') => {
    const db = getDB();
    db.signupSessions = db.signupSessions.filter(s => s.formData.email !== formData.email);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const newSession = {
      id: 'sess_' + Math.random().toString(36).substr(2, 9),
      hostType,
      accountType, // 'host' | 'guest' (UC-12)
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

    // UC-12: a guest account is provisioned active immediately and lands in the guest flow
    if (session.accountType === 'guest') {
      const guestUser = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        role: 'guest',
        name: `${session.formData.firstName} ${session.formData.lastName}`.trim() || 'New Guest',
        email: session.formData.email,
        phone: session.formData.phone,
        password: session.formData.password || 'password123',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      db.users.push(guestUser);
      db.signupSessions = db.signupSessions.filter(s => s.id !== sessionId);
      saveDB(db);
      mockStore.logVerificationAttempt({
        type: 'signup', targetEmail: session.formData.email, targetPhone: session.formData.phone,
        otpCode: code, success: true, message: 'Guest verification successful'
      });
      return { success: true, user: guestUser };
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
        docs: []
      } : null,
      orgDocsUploaded: false,
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

  saveBankAccount: (email, bankData) => {
    const db = getDB();
    db.users = db.users.map(u => u.email === email ? { ...u, bankAccount: bankData } : u);
    saveDB(db);
    return db.users.find(u => u.email === email);
  },

  getBankAccount: (email) => {
    const db = getDB();
    const u = db.users.find(x => x.email === email);
    return u ? (u.bankAccount || null) : null;
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
  },

  // --- Global Notification Inbox ---
  getHostNotifications: () => {
    const db = getDB();
    return db.hostNotifications || [];
  },
  addHostNotification: (type, title, message, eventId) => {
    const db = getDB();
    if (!db.hostNotifications) db.hostNotifications = [];
    const newNotif = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      eventId
    };
    db.hostNotifications.unshift(newNotif);
    saveDB(db);
    return newNotif;
  },
  markHostNotificationsRead: () => {
    const db = getDB();
    if (!db.hostNotifications) db.hostNotifications = [];
    db.hostNotifications = db.hostNotifications.map(n => ({ ...n, read: true }));
    saveDB(db);
  },

  // --- Audit Trail ---
  getAuditTrail: () => {
    const db = getDB();
    return db.immutableAuditTrail || [];
  },
  addAuditLog: (actor, action, eventId = null) => {
    const db = getDB();
    if (!db.immutableAuditTrail) db.immutableAuditTrail = [];
    const newLog = {
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      actor,
      action,
      eventId
    };
    db.immutableAuditTrail.unshift(newLog);
    saveDB(db);
    return newLog;
  },

  // --- Comments Board Pinning ---
  pinComment: (eventId, commentId) => {
    const db = getDB();
    db.comments = db.comments.map(c => {
      if (c.eventId === eventId && c.id === commentId) {
        return { ...c, pinned: !c.pinned };
      }
      return c;
    });
    saveDB(db);
  },

  // --- Admin Custom Templates ---
  getSystemTemplates: () => {
    const db = getDB();
    return db.systemTemplates || [];
  },
  updateSystemTemplate: (key, subject, body, versionLog) => {
    const db = getDB();
    db.systemTemplates = db.systemTemplates.map(t => {
      if (t.key === key) {
        const nextVer = (parseFloat(t.version) + 0.1).toFixed(1);
        return {
          ...t,
          subject,
          body,
          version: String(nextVer),
          updatedAt: new Date().toISOString(),
          logs: [...(t.logs || []), `v${nextVer}: ${versionLog}`]
        };
      }
      return t;
    });
    saveDB(db);
  },

  // --- Admin Host Suspensions ---
  getHostSuspensions: () => {
    const db = getDB();
    return db.hostSuspensions || {};
  },
  toggleHostSuspension: (email, suspend, reason) => {
    const db = getDB();
    if (!db.hostSuspensions) db.hostSuspensions = {};
    if (suspend) {
      db.hostSuspensions[email] = {
        suspended: true,
        reason,
        timestamp: new Date().toISOString()
      };
    } else {
      delete db.hostSuspensions[email];
    }
    saveDB(db);
  },
  isHostSuspended: (email) => {
    const db = getDB();
    if (!db.hostSuspensions) return false;
    return !!db.hostSuspensions[email];
  },

  // --- Waitlist Promotion (FIFO) ---
  promoteWaitlistedGuestsIfPossible: (eventId, db) => {
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;
    
    let currentGoing = db.rsvps.filter(r => r.eventId === eventId && r.status === 'going').reduce((sum, r) => sum + (r.guestCount || 1), 0);
    const capacity = event.capacity || 100;
    
    // Sort waitlist guests by timestamp (FIFO)
    const waitlisted = db.rsvps.filter(r => r.eventId === eventId && r.status === 'waitlist')
                               .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let needsHostReview = false;

    for (let rsvp of waitlisted) {
      if (currentGoing + (rsvp.guestCount || 1) <= capacity) {
        // A spot is available. Waitlisted guests are held UNDER_APPROVAL, so the
        // host decides who to admit rather than auto-promoting by FIFO.
        if (rsvp.approvalState === 'UNDER_APPROVAL') {
          needsHostReview = true;
          continue;
        }
        rsvp.status = 'going';
        currentGoing += (rsvp.guestCount || 1);

        // Add a host notification
        db.hostNotifications = db.hostNotifications || [];
        db.hostNotifications.unshift({
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          type: 'rsvp',
          title: 'Waitlist Promotion',
          message: `${rsvp.name} has been promoted from the waitlist to GOING for ${event.title}.`,
          timestamp: new Date().toISOString(),
          read: false,
          eventId
        });
        
        // Audit log
        db.immutableAuditTrail = db.immutableAuditTrail || [];
        db.immutableAuditTrail.unshift({
          id: 'a_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: `Promoted waitlisted guest ${rsvp.name} to GOING`,
          eventId
        });

        // Dispatch waitlist promotion notification log
        const templates = event.templates || defaultTemplates;
        const subject = mockStore.renderTemplate(templates.waitlist_promote?.subject || defaultTemplates.waitlist_promote.subject, event, rsvp);
        const body = mockStore.renderTemplate(templates.waitlist_promote?.body || defaultTemplates.waitlist_promote.body, event, rsvp);
        
        const newLog = {
          id: 'log_' + Math.random().toString(36).substr(2, 9),
          eventId,
          sentAt: new Date().toISOString(),
          rsvpId: rsvp.id,
          guestEmail: rsvp.email,
          type: 'rsvp',
          channel: 'Email',
          subject,
          body,
          status: 'Delivered'
        };
        if (!db.notificationLogs) db.notificationLogs = [];
        db.notificationLogs.unshift(newLog);
      } else {
        break; // No more capacity
      }
    }

    // A spot opened but the next guest(s) need host approval to be admitted
    if (needsHostReview) {
      db.hostNotifications = db.hostNotifications || [];
      db.hostNotifications.unshift({
        id: 'n_' + Math.random().toString(36).substr(2, 9),
        type: 'rsvp',
        title: 'Spot Opened — Review Waitlist',
        message: `A spot opened for ${event.title}. Approve a waitlisted guest to allow them in.`,
        timestamp: new Date().toISOString(),
        read: false,
        eventId
      });
    }
  },

  // --- Staff & Roles (UC-06/07/08) ---
  getRoles: () => {
    const db = getDB();
    return db.roles || [];
  },

  getRoleById: (roleId) => {
    const db = getDB();
    return (db.roles || []).find(r => r.id === roleId) || null;
  },

  createRole: (roleData) => {
    const db = getDB();
    if (!db.roles) db.roles = [];
    const newRole = {
      id: 'role_' + Math.random().toString(36).substr(2, 9),
      name: roleData.name || 'New Role',
      description: roleData.description || '',
      builtIn: false,
      // Default-deny: only the explicitly granted permissions are true.
      permissions: PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: !!(roleData.permissions && roleData.permissions[k]) }), {})
    };
    db.roles.push(newRole);
    saveDB(db);
    mockStore.addAuditLog('Host', `Created role "${newRole.name}"`, null);
    return newRole;
  },

  updateRole: (roleId, roleData) => {
    const db = getDB();
    db.roles = (db.roles || []).map(r => r.id === roleId ? {
      ...r,
      ...roleData,
      permissions: { ...r.permissions, ...(roleData.permissions || {}) }
    } : r);
    saveDB(db);
    const role = (db.roles || []).find(r => r.id === roleId);
    if (role) mockStore.addAuditLog('Host', `Updated role "${role.name}"`, null);
    return role || null;
  },

  deleteRole: (roleId) => {
    const db = getDB();
    const role = (db.roles || []).find(r => r.id === roleId);
    if (role && role.builtIn) return false; // cannot delete built-in roles
    db.roles = (db.roles || []).filter(r => r.id !== roleId);
    // Detach any staff assigned to the deleted role
    db.staff = (db.staff || []).map(s => s.roleId === roleId ? { ...s, roleId: null } : s);
    saveDB(db);
    return true;
  },

  // Staff assigned to a given event
  getStaff: (eventId) => {
    const db = getDB();
    return (db.staff || []).filter(s => s.status !== 'REMOVED' && (s.accessScope === 'ALL' || (s.eventIds && s.eventIds.includes(eventId))));
  },

  // All events a person (by email) is active staff on
  getStaffForEmail: (email) => {
    if (!email) return [];
    const db = getDB();
    return (db.staff || []).filter(s => s.email === email && s.status !== 'REMOVED');
  },

  getAllStaff: () => {
    const db = getDB();
    return (db.staff || []).filter(s => s.status !== 'REMOVED');
  },

  addStaff: (staffData) => {
    const db = getDB();
    if (!db.staff) db.staff = [];
    const role = (db.roles || []).find(r => r.id === staffData.roleId);

    // If the email is not yet a user, create a pending staff user account
    if (staffData.email && !db.users.some(u => u.email === staffData.email)) {
      db.users.push({
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        role: 'staff',
        name: staffData.name || staffData.email,
        email: staffData.email,
        phone: staffData.phone || '',
        password: 'password123',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    const newStaff = {
      id: 'st_' + Math.random().toString(36).substr(2, 9),
      name: staffData.name || staffData.email,
      email: staffData.email,
      phone: staffData.phone || '',
      designation: staffData.designation || '',
      department: staffData.department || '',
      roleId: staffData.roleId || null,
      accessScope: staffData.accessScope || 'ALL',
      eventIds: staffData.eventIds || [],
      inviteId: 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: 'INVITED',
      invitedAt: new Date().toISOString()
    };
    db.staff.push(newStaff);
    saveDB(db);

    mockStore.addAuditLog('Host', `Invited ${newStaff.name} as ${role ? role.name : 'staff'}`, null);
    return newStaff;
  },

  updateStaff: (staffId, data) => {
    const db = getDB();
    db.staff = (db.staff || []).map(s => s.id === staffId ? { ...s, ...data } : s);
    saveDB(db);
    const updated = (db.staff || []).find(s => s.id === staffId);
    if (updated) mockStore.addAuditLog('Host', `Updated staff member "${updated.name}"`, null);
    return updated || null;
  },

  removeStaff: (staffId) => {
    const db = getDB();
    const staff = (db.staff || []).find(s => s.id === staffId);
    db.staff = (db.staff || []).map(s => s.id === staffId ? { ...s, status: 'REMOVED' } : s);
    saveDB(db);
    if (staff) mockStore.addAuditLog('Host', `Removed staff member "${staff.name}"`, null);
    return true;
  },

  // UC-13: "Login as Staff" — validate an Invite ID against the email/phone it
  // was issued to. Returns { success, staff } or { success, error }.
  loginAsStaff: (inviteId, contact) => {
    const db = getDB();
    const code = (inviteId || '').trim().toLowerCase();
    const c = (contact || '').trim().toLowerCase();
    if (!code || !c) return { success: false, error: 'Enter your Invite ID and the email/phone it was sent to.' };

    const matches = (db.staff || []).filter(s => (s.inviteId || '').toLowerCase() === code);
    if (matches.length === 0) {
      return { success: false, error: 'Invite ID not found. Check the ID or ask your host to resend it.' };
    }
    if (matches.every(s => s.status === 'REMOVED' || s.status === 'REVOKED')) {
      return { success: false, error: 'This invite has been revoked. Ask your host to send a new one.' };
    }
    const matched = matches.find(
      s => s.email.toLowerCase() === c ||
           (contact && s.phone && s.phone.replace(/\D/g, '') === contact.replace(/\D/g, ''))
    );
    if (!matched) {
      return { success: false, error: 'This Invite ID was issued to a different email/phone.' };
    }

    // Accepting the invite activates any pending assignments for this person
    db.staff = db.staff.map(s =>
      s.email === matched.email && s.status === 'INVITED'
        ? { ...s, status: 'ACTIVE', acceptedAt: new Date().toISOString() }
        : s
    );
    saveDB(db);
    mockStore.addAuditLog(`${matched.name} (Staff)`, `Signed in via Invite ID ${matched.inviteId}`, matched.eventId);

    return {
      success: true,
      staff: { role: 'staff', name: matched.name, email: matched.email, phone: matched.phone || '' },
    };
  },

  acceptStaffInvite: (email) => {
    const db = getDB();
    let changed = false;
    db.staff = (db.staff || []).map(s => {
      if (s.email === email && s.status === 'INVITED') {
        changed = true;
        return { ...s, status: 'ACTIVE', acceptedAt: new Date().toISOString() };
      }
      return s;
    });
    if (changed) saveDB(db);
    return changed;
  },

  // Resolve the effective permission set for a viewer on a specific event.
  // The host (owner) implicitly has full access; staff get their role's grants;
  // everyone else is default-denied.
  getPermissionsForEvent: (email, eventId) => {
    const db = getDB();
    const event = db.events.find(e => e.id === eventId);
    const denyAll = PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {});
    if (!event) return denyAll;
    if (email && event.hostEmail === email) return { ...ALL_PERMS };

    const assignment = (db.staff || []).find(
      s => s.eventId === eventId && s.email === email && s.status === 'ACTIVE'
    );
    if (!assignment) return denyAll;
    const role = (db.roles || []).find(r => r.id === assignment.roleId);
    if (!role) return denyAll;
    return { ...denyAll, ...role.permissions };
  },

  // --- Platform Settings ---
  getPlatformSettings: () => {
    const db = getDB();
    if (!db.platformSettings) {
      db.platformSettings = {
        platformName: 'SafalEvents',
        primaryColor: '#2563eb',
        fromName: 'SafalEvents',
        supportEmail: 'support@safalevent.com',
        smsSenderId: 'SAFALEVT',
        defaultRsvpDeadline: 12,
        defaultSelfCancellation: true
      };
      saveDB(db);
    }
    return db.platformSettings;
  },

  savePlatformSettings: (settings) => {
    const db = getDB();
    db.platformSettings = { ...db.platformSettings, ...settings };
    saveDB(db);
    return db.platformSettings;
  },

  // --- Pricing Plans (UC-14) ---
  getPlans: (hostType) => {
    const db = getDB();
    if (!hostType) return db.plans;
    return db.plans.filter(p => p.hostType === hostType);
  },

  getPlanById: (planId) => {
    const db = getDB();
    return db.plans.find(p => p.id === planId) || null;
  },

  getTopUps: (hostType) => {
    const db = getDB();
    if (!hostType) return db.topUps;
    return db.topUps.filter(t => t.hostType === hostType);
  },

  // --- Subscriptions (UC-14) ---
  getSubscription: (hostEmail) => {
    const db = getDB();
    return db.subscriptions.find(s => s.hostEmail === hostEmail) || null;
  },

  autoAssignFreePlan: (hostEmail, hostType) => {
    const db = getDB();
    const existing = db.subscriptions.find(s => s.hostEmail === hostEmail);
    if (existing) return existing;
    const freePlanId = hostType === 'organization' ? 'org_free' : 'ind_free';
    const now = new Date().toISOString();
    const sub = {
      id: 'sub_' + Date.now(),
      hostEmail,
      planId: freePlanId,
      billingCycle: 'none',
      status: 'active',
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: null,
      scheduledChange: null,
      createdAt: now,
      updatedAt: now
    };
    db.subscriptions.push(sub);
    saveDB(db);
    return sub;
  },

  upgradeSubscription: (hostEmail, newPlanId, billingCycle) => {
    const db = getDB();
    const sub = db.subscriptions.find(s => s.hostEmail === hostEmail);
    if (!sub) return { success: false, message: 'No subscription found.' };
    const newPlan = db.plans.find(p => p.id === newPlanId);
    if (!newPlan) return { success: false, message: 'Invalid plan.' };
    const oldPlan = db.plans.find(p => p.id === sub.planId);

    // Calculate prorated credit from remaining time on current plan
    let proratedCredit = 0;
    if (oldPlan && oldPlan.monthlyPrice > 0 && sub.currentPeriodEnd) {
      const now = Date.now();
      const periodEnd = new Date(sub.currentPeriodEnd).getTime();
      const periodStart = new Date(sub.currentPeriodStart).getTime();
      const totalDuration = periodEnd - periodStart;
      const remaining = Math.max(0, periodEnd - now);
      if (totalDuration > 0) {
        const currentPrice = sub.billingCycle === 'annual' ? oldPlan.annualPrice : oldPlan.monthlyPrice;
        proratedCredit = parseFloat(((remaining / totalDuration) * currentPrice).toFixed(2));
      }
    }

    const now = new Date();
    const periodMonths = billingCycle === 'annual' ? 12 : 1;
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + periodMonths);
    const price = billingCycle === 'annual' ? newPlan.annualPrice : newPlan.monthlyPrice;
    const chargedAmount = parseFloat(Math.max(0, price - proratedCredit).toFixed(2));

    sub.planId = newPlanId;
    sub.billingCycle = billingCycle;
    sub.status = 'active';
    sub.currentPeriodStart = now.toISOString();
    sub.currentPeriodEnd = periodEnd.toISOString();
    sub.scheduledChange = null;
    sub.updatedAt = now.toISOString();

    const txn = {
      id: 'txn_' + Date.now(),
      hostEmail,
      type: 'subscription',
      description: `${newPlan.name} Plan - ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} (upgrade)`,
      amount: chargedAmount,
      proratedCredit,
      status: 'completed',
      planId: newPlanId,
      createdAt: now.toISOString()
    };
    db.transactions.push(txn);
    saveDB(db);
    return { success: true, subscription: sub, transaction: txn, proratedCredit };
  },

  downgradeSubscription: (hostEmail, newPlanId) => {
    const db = getDB();
    const sub = db.subscriptions.find(s => s.hostEmail === hostEmail);
    if (!sub) return { success: false, message: 'No subscription found.' };
    const newPlan = db.plans.find(p => p.id === newPlanId);
    if (!newPlan) return { success: false, message: 'Invalid plan.' };
    sub.scheduledChange = {
      type: 'downgrade',
      newPlanId,
      effectiveDate: sub.currentPeriodEnd,
      scheduledAt: new Date().toISOString()
    };
    sub.updatedAt = new Date().toISOString();
    saveDB(db);
    return { success: true, subscription: sub };
  },

  // --- Top-Ups (UC-14) ---
  purchaseTopUp: (hostEmail, topUpId, eventId) => {
    const db = getDB();
    const topUp = db.topUps.find(t => t.id === topUpId);
    if (!topUp) return { success: false, message: 'Invalid top-up.' };
    const now = new Date().toISOString();
    const balance = {
      id: 'bal_' + Date.now(),
      hostEmail,
      topUpId,
      category: topUp.category,
      remaining: topUp.value,
      total: topUp.value,
      eventId: eventId || null,
      purchasedAt: now
    };
    db.topUpBalances.push(balance);
    const txn = {
      id: 'txn_' + Date.now(),
      hostEmail,
      type: 'topup',
      description: topUp.name,
      amount: topUp.price,
      status: 'completed',
      topUpId,
      eventId: eventId || null,
      createdAt: now
    };
    db.transactions.push(txn);
    saveDB(db);
    return { success: true, balance, transaction: txn };
  },

  getTopUpBalances: (hostEmail) => {
    const db = getDB();
    return (db.topUpBalances || []).filter(b => b.hostEmail === hostEmail && b.remaining > 0);
  },

  getTransactions: (hostEmail) => {
    const db = getDB();
    return (db.transactions || []).filter(t => !hostEmail || t.hostEmail === hostEmail).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  // --- Automation & Security Methods ---
  getAutomationRules: () => getDB().automationRules || [],
  addAutomationRule: (rule) => {
    const db = getDB();
    db.automationRules.push(rule);
    saveDB(db);
  },
  updateAutomationRule: (id, updates) => {
    const db = getDB();
    db.automationRules = db.automationRules.map(r => r.id === id ? { ...r, ...updates } : r);
    saveDB(db);
  },
  deleteAutomationRule: (id) => {
    const db = getDB();
    db.automationRules = db.automationRules.filter(r => r.id !== id);
    saveDB(db);
  },
  getMessageTemplates: () => getDB().messageTemplates || [],
  addMessageTemplate: (template) => {
    const db = getDB();
    db.messageTemplates.push(template);
    saveDB(db);
  },
  updateMessageTemplate: (id, updates) => {
    const db = getDB();
    db.messageTemplates = db.messageTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
    saveDB(db);
  },
  deleteMessageTemplate: (id) => {
    const db = getDB();
    db.messageTemplates = db.messageTemplates.filter(t => t.id !== id);
    saveDB(db);
  },
  getAuditLogs: () => {
    const db = getDB();
    return (db.auditLogs || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  addAuditLog: (log) => {
    const db = getDB();
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.push(log);
    saveDB(db);
  },

  // --- Usage & Limits (UC-14) ---
  getHostUsage: (hostEmail) => {
    const db = getDB();
    const sub = db.subscriptions.find(s => s.hostEmail === hostEmail);
    if (!sub) return null;
    const plan = db.plans.find(p => p.id === sub.planId);
    if (!plan) return null;
    const hostEvents = db.events.filter(e => e.hostEmail === hostEmail && e.status !== 'Cancelled');
    const activeEventCount = hostEvents.length;
    const totalAttendees = hostEvents.reduce((sum, ev) => {
      const evRsvps = db.rsvps.filter(r => r.eventId === ev.id && r.status !== 'not_going');
      return sum + evRsvps.length;
    }, 0);
    const staffCount = (db.staff || []).filter(s =>
      hostEvents.some(ev => ev.id === s.eventId) && s.status === 'ACTIVE'
    ).length;
    const photoCount = (db.photos || []).filter(p =>
      hostEvents.some(ev => ev.id === p.eventId)
    ).length;

    // Sum top-up bonuses for this host
    const topUpBonuses = (db.topUpBalances || []).filter(b => b.hostEmail === hostEmail && b.remaining > 0);
    const eventBonus = topUpBonuses.filter(b => b.category === 'events').reduce((s, b) => s + b.remaining, 0);
    const staffBonus = topUpBonuses.filter(b => b.category === 'staff').reduce((s, b) => s + b.remaining, 0);
    const photoBonus = topUpBonuses.filter(b => b.category === 'photos').reduce((s, b) => s + b.remaining, 0);

    return {
      planId: sub.planId,
      planName: plan.name,
      hostType: plan.hostType,
      usage: {
        activeEvents: { current: activeEventCount, max: plan.limits.activeEvents === -1 ? -1 : plan.limits.activeEvents + eventBonus },
        totalAttendees: { current: totalAttendees, max: plan.limits.attendeesPerEvent },
        staffMembers: { current: staffCount, max: plan.limits.staffMembers === -1 ? -1 : plan.limits.staffMembers + staffBonus },
        photos: { current: photoCount, max: plan.limits.photos === -1 ? -1 : plan.limits.photos + photoBonus }
      },
      subscription: sub
    };
  },

  checkLimit: (hostEmail, limitKey, eventId) => {
    const db = getDB();
    const sub = db.subscriptions.find(s => s.hostEmail === hostEmail);
    if (!sub) return { allowed: false, current: 0, max: 0, message: 'No active subscription.' };
    const plan = db.plans.find(p => p.id === sub.planId);
    if (!plan) return { allowed: false, current: 0, max: 0, message: 'Plan not found.' };

    const hostEvents = db.events.filter(e => e.hostEmail === hostEmail && e.status !== 'Cancelled');
    const topUpBonuses = (db.topUpBalances || []).filter(b => b.hostEmail === hostEmail && b.remaining > 0);

    let current = 0;
    let max = 0;
    let label = limitKey;

    switch (limitKey) {
      case 'activeEvents': {
        current = hostEvents.length;
        const bonus = topUpBonuses.filter(b => b.category === 'events').reduce((s, b) => s + b.remaining, 0);
        max = plan.limits.activeEvents === -1 ? -1 : plan.limits.activeEvents + bonus;
        label = 'active events';
        break;
      }
      case 'attendeesPerEvent': {
        const ev = eventId ? db.events.find(e => e.id === eventId) : null;
        const evRsvps = ev ? db.rsvps.filter(r => r.eventId === ev.id && r.status !== 'not_going') : [];
        current = evRsvps.length;
        const bonus = topUpBonuses.filter(b => b.category === 'attendees' && (b.eventId === eventId || !b.eventId)).reduce((s, b) => s + b.remaining, 0);
        max = plan.limits.attendeesPerEvent === -1 ? -1 : plan.limits.attendeesPerEvent + bonus;
        label = 'attendees for this event';
        break;
      }
      case 'staffMembers': {
        current = (db.staff || []).filter(s =>
          hostEvents.some(ev => ev.id === s.eventId) && s.status === 'ACTIVE'
        ).length;
        const bonus = topUpBonuses.filter(b => b.category === 'staff').reduce((s, b) => s + b.remaining, 0);
        max = plan.limits.staffMembers === -1 ? -1 : plan.limits.staffMembers + bonus;
        label = 'staff members';
        break;
      }
      case 'photos': {
        current = (db.photos || []).filter(p =>
          hostEvents.some(ev => ev.id === p.eventId)
        ).length;
        const bonus = topUpBonuses.filter(b => b.category === 'photos').reduce((s, b) => s + b.remaining, 0);
        max = plan.limits.photos === -1 ? -1 : plan.limits.photos + bonus;
        label = 'photos';
        break;
      }
      case 'customQuestions': {
        const ev = eventId ? db.events.find(e => e.id === eventId) : null;
        current = ev ? (ev.questions || []).length : 0;
        max = plan.limits.customQuestions;
        label = 'custom questions';
        break;
      }
      case 'maxGuestsPerRsvp': {
        current = 0;
        max = plan.limits.maxGuestsPerRsvp;
        label = 'guests per RSVP';
        break;
      }
      default:
        return { allowed: false, current: 0, max: 0, message: `Unknown limit key: ${limitKey}` };
    }

    if (max === -1) return { allowed: true, current, max: -1, message: 'Unlimited.' };
    const allowed = current < max;
    return {
      allowed,
      current,
      max,
      message: allowed ? `${current}/${max} ${label} used.` : `Limit reached: ${current}/${max} ${label}. Upgrade your plan or purchase a top-up.`
    };
  },

  // --- Admin Plan & Top-Up Management (UC-14) ---
  updatePlan: (planId, updates) => {
    const db = getDB();
    const idx = db.plans.findIndex(p => p.id === planId);
    if (idx === -1) return null;
    db.plans[idx] = { ...db.plans[idx], ...updates, id: planId };
    saveDB(db);
    return db.plans[idx];
  },

  updateTopUp: (topUpId, updates) => {
    const db = getDB();
    const idx = db.topUps.findIndex(t => t.id === topUpId);
    if (idx === -1) return null;
    db.topUps[idx] = { ...db.topUps[idx], ...updates, id: topUpId };
    saveDB(db);
    return db.topUps[idx];
  },

  overrideSubscription: (hostEmail, newPlanId, reason, adminName) => {
    const db = getDB();
    let sub = db.subscriptions.find(s => s.hostEmail === hostEmail);
    const newPlan = db.plans.find(p => p.id === newPlanId);
    if (!newPlan) return { success: false, message: 'Invalid plan.' };
    const now = new Date().toISOString();
    if (!sub) {
      sub = {
        id: 'sub_' + Date.now(),
        hostEmail,
        planId: newPlanId,
        billingCycle: 'none',
        status: 'active',
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: null,
        scheduledChange: null,
        createdAt: now,
        updatedAt: now
      };
      db.subscriptions.push(sub);
    } else {
      sub.planId = newPlanId;
      sub.status = 'active';
      sub.scheduledChange = null;
      sub.updatedAt = now;
    }
    const txn = {
      id: 'txn_' + Date.now(),
      hostEmail,
      type: 'admin_override',
      description: `Admin override to ${newPlan.name} plan by ${adminName}: ${reason}`,
      amount: 0,
      status: 'completed',
      planId: newPlanId,
      adminName,
      createdAt: now
    };
    db.transactions.push(txn);
    // Audit trail entry
    if (db.immutableAuditTrail) {
      db.immutableAuditTrail.push({
        id: 'a_' + Date.now(),
        timestamp: now,
        actor: `${adminName} (Admin)`,
        action: `Override subscription for ${hostEmail} to ${newPlan.name}: ${reason}`,
        eventId: null
      });
    }
    saveDB(db);
    return { success: true, subscription: sub, transaction: txn };
  },

  issueRefund: (transactionId, reason, adminName) => {
    const db = getDB();
    const txn = db.transactions.find(t => t.id === transactionId);
    if (!txn) return { success: false, message: 'Transaction not found.' };
    if (txn.status === 'refunded') return { success: false, message: 'Already refunded.' };
    txn.status = 'refunded';
    txn.refundedAt = new Date().toISOString();
    txn.refundReason = reason;
    txn.refundedBy = adminName;
    const refundTxn = {
      id: 'txn_' + Date.now(),
      hostEmail: txn.hostEmail,
      type: 'refund',
      description: `Refund for ${txn.description} by ${adminName}: ${reason}`,
      amount: -txn.amount,
      status: 'completed',
      originalTransactionId: transactionId,
      adminName,
      createdAt: new Date().toISOString()
    };
    db.transactions.push(refundTxn);
    // Audit trail entry
    if (db.immutableAuditTrail) {
      db.immutableAuditTrail.push({
        id: 'a_' + Date.now(),
        timestamp: new Date().toISOString(),
        actor: `${adminName} (Admin)`,
        action: `Refund $${txn.amount} for ${txn.hostEmail}: ${reason}`,
        eventId: null
      });
    }
    saveDB(db);
    return { success: true, refundTransaction: refundTxn };
  },

  // --- Revenue Metrics (UC-14) ---
  getRevenueMetrics: () => {
    const db = getDB();
    const txns = db.transactions || [];
    const completedTxns = txns.filter(t => t.status === 'completed');
    const totalRevenue = completedTxns.reduce((s, t) => s + t.amount, 0);
    const topUpRevenue = completedTxns.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0);
    const refundTotal = txns.filter(t => t.type === 'refund').reduce((s, t) => s + Math.abs(t.amount), 0);

    // Monthly breakdown (last 6 months)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7);
      const monthTxns = completedTxns.filter(t => t.createdAt && t.createdAt.startsWith(month));
      monthlyBreakdown.push({
        month,
        revenue: parseFloat(monthTxns.reduce((s, t) => s + t.amount, 0).toFixed(2)),
        count: monthTxns.length
      });
    }

    const subs = db.subscriptions || [];
    const plans = db.plans || [];
    const planDistribution = {};
    let mrr = 0;
    let arr = 0;
    let paidHosts = 0;
    let individualRevenue = 0;
    let orgRevenue = 0;

    subs.forEach(s => {
      if ((s.status || '').toUpperCase() !== 'ACTIVE') return;
      
      const plan = plans.find(p => p.id === s.planId);
      if (!plan) return;

      planDistribution[plan.name] = (planDistribution[plan.name] || 0) + 1;
      
      if (plan.monthlyPrice > 0 || plan.annualPrice > 0) {
        paidHosts++;
        let monthlyValue = 0;
        if (s.billingCycle === 'annual') {
           monthlyValue = plan.annualPrice / 12;
           arr += plan.annualPrice;
        } else {
           monthlyValue = plan.monthlyPrice;
           arr += plan.monthlyPrice * 12;
        }
        mrr += monthlyValue;

        if (plan.hostType === 'individual') {
          individualRevenue += (s.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice);
        } else {
          orgRevenue += (s.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice);
        }
      }
    });

    const totalHosts = Math.max((db.users || []).filter(u => u.role === 'host').length, subs.length, 1);
    const conversionRate = Math.round((paidHosts / totalHosts) * 100);

    return {
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      topUpRevenue: parseFloat(topUpRevenue.toFixed(2)),
      planDistribution,
      conversionRate,
      paidHosts,
      totalHosts,
      individualRevenue: parseFloat(individualRevenue.toFixed(2)),
      orgRevenue: parseFloat(orgRevenue.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyBreakdown,
      netRevenue: parseFloat((totalRevenue - refundTotal).toFixed(2)),
      totalTransactions: txns.length,
      activeSubscriptions: subs.filter(s => (s.status || '').toUpperCase() === 'ACTIVE').length
    };
  },

  getAllSubscriptions: () => {
    const db = getDB();
    return (db.subscriptions || []).map(sub => {
      const plan = db.plans.find(p => p.id === sub.planId);
      const user = (db.users || []).find(u => u.email === sub.hostEmail);
      return {
        ...sub,
        planName: plan ? plan.name : 'Unknown',
        hostType: plan ? plan.hostType : 'unknown',
        hostName: user ? user.name : sub.hostEmail
      };
    });
  }
};
