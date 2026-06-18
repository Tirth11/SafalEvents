import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Settings, LogOut, Users, ExternalLink, BarChart2, Check, X,
  Trash2, Mail, Download, MessageSquare, ChevronLeft, Award, HelpCircle, RefreshCw,
  Star, CreditCard, Bell, Shield, CheckSquare, FileText, Send, Clock,
  UserCheck, AlertCircle, Copy, Share2, ArrowRight, DollarSign, Ticket, TrendingUp,
  MapPin, Eye, Webhook, Compass, Search
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { mockStore, defaultTemplates } from '../utils/mockStore';
import { HERO_IMAGES, ALL_COVERS, getEventCover, getAvatar } from '../utils/images';

export default function HostDashboard({ onLogout }) {
  const navigate = useNavigate();

  // Get current user from mockStore to check if org host.
  // Fall back to the registered user record — older sessions may lack hostType.
  const currentUser = mockStore.getCurrentUser();
  const userRecord = mockStore.getUsers().find(u => u.email === currentUser?.email) || null;
  const isOrgHost = (currentUser?.hostType || userRecord?.hostType) === 'organization';
  const docsAlreadyVerified = !!userRecord?.orgDocsUploaded;

  // UC-08: a staff member sees a permission-limited version of the portal,
  // scoped to only the events they have been added to.
  const isStaffViewer = currentUser?.role === 'staff';
  const staffEventIds = isStaffViewer ? mockStore.getStaffForEmail(currentUser?.email).map(s => s.eventId) : null;

  // Navigation: dashboard, events, earnings, messages, audience, settings
  const [activeSidebar, setActiveSidebar] = useState(currentUser?.role === 'staff' ? 'events' : 'dashboard');

  // Org document upload state (seeded from the persisted user record)
  const [orgDocsUploaded, setOrgDocsUploaded] = useState(docsAlreadyVerified);
  const [uploadedDocuments, setUploadedDocuments] = useState(userRecord?.orgProfile?.docs || []);
  const [showOrgDocModal, setShowOrgDocModal] = useState(isOrgHost && !docsAlreadyVerified);

  // Integrations state
  const [connectedIntegrations, setConnectedIntegrations] = useState([]);
  const [integrationForm, setIntegrationForm] = useState({ platform: 'jotform', apiKey: '' });
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  // My Events sub-tab: live, today, thisWeek, upcoming, past, drafts
  const [activeEventTab, setActiveEventTab] = useState('thisWeek');
  // My Events search & filter
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  // State for events, RSVPs, global stats
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null); // Managed event ID
  const [selectedEventTab, setSelectedEventTab] = useState('overview'); // overview, guests, polls, comments, edit, notifications, invitations, checkin, payments, staff
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('rsvp'); // rsvp, reminder, feedback
  const [previewMode, setPreviewMode] = useState('email'); // email or sms
  const [viewLogDetail, setViewLogDetail] = useState(null);
  const [schedulerRunResult, setSchedulerRunResult] = useState(null);
  
  // Dialog state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // New Poll form state
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  // New tab states
  const [manualInviteForm, setManualInviteForm] = useState({ name: '', email: '', phone: '', guestCount: 1 });
  const [manualInviteSent, setManualInviteSent] = useState(false);
  const [checkinInput, setCheckinInput] = useState('');
  const [checkinResult, setCheckinResult] = useState(null);

  // New Host portal features
  const [stripeConnected, setStripeConnected] = useState(false);
  const [bankForm, setBankForm] = useState({ holderName: '', routingNumber: '', accountNumber: '', bankName: '' });
  const [activeStaffList, setActiveStaffList] = useState([
    { name: 'Alex Rivera (Host)', role: 'Host', email: 'alex@safalevent.com', status: 'Active' },
    { name: 'Marcus Chen', role: 'Co-Manager', email: 'marcus@safalevent.com', status: 'Active' },
    { name: 'Sarah Jenkins', role: 'Check-in Staff', email: 'sarah@safalevent.com', status: 'Active' }
  ]);
  const [inviteStaffForm, setInviteStaffForm] = useState({ name: '', email: '', roleId: 'role_coordinator' });
  // Staff & Roles (UC-06/07): role builder form for creating/editing a role
  const emptyRoleBuilder = { id: null, name: '', description: '', permissions: {} };
  const [roleBuilder, setRoleBuilder] = useState(emptyRoleBuilder);
  const [showRoleBuilder, setShowRoleBuilder] = useState(false);
  const [activeScannerStaff, setActiveScannerStaff] = useState('Alex Rivera (Host)');
  const [autoReplyRules, setAutoReplyRules] = useState([
    { id: 'rule_1', trigger: 'On Guest RSVP', condition: 'If Status is Waitlist', action: 'Send Waitlist email (rsvp_waitlist)', active: true },
    { id: 'rule_2', trigger: 'On QR Check-in', condition: 'If Checked In is True', action: 'Send Welcoming text alert', active: true }
  ]);
  const [newRule, setNewRule] = useState({ trigger: 'On Guest RSVP', condition: 'If Status is Going', action: 'Send Confirmation email (rsvp)' });
  const [seriesType, setSeriesType] = useState('None'); // None, Weekly, Monthly
  const [showSeriesConfirmModal, setShowSeriesConfirmModal] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'po_1', date: '2026-06-01', amount: 450.00, status: 'Paid', bank: 'Chase Bank (...1234)' },
    { id: 'po_2', date: '2026-06-08', amount: 320.00, status: 'Processing', bank: 'Chase Bank (...1234)' }
  ]);

  // Available Payout Balance
  const [availableBalance, setAvailableBalance] = useState(4250);
  const [transferring, setTransferring] = useState(false);

  // Calendar Date selection for This Week at a Glance
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Guest List checkboxes
  const [selectedGuestIds, setSelectedGuestIds] = useState([]);
  // Guest List search (within event management)
  const [guestSearch, setGuestSearch] = useState('');
  
  // Conversations Inbox Simulator
  const [conversations, setConversations] = useState([
    {
      id: 'c1',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      eventTitle: 'Summer Rooftop Mixer',
      avatar: 'SJ',
      messages: [
        { sender: 'guest', text: 'Hi! Can I bring my 2-year-old?', time: '6:12 PM' },
        { sender: 'host', text: 'Hi Sarah! Yes, children are absolutely welcome. We have a dedicated play area setup.', time: '6:15 PM' },
        { sender: 'guest', text: 'Hi, thank you! Also, is there food options for vegetarians?', time: '6:30 PM' }
      ],
      unread: true,
      flagged: false
    },
    {
      id: 'c2',
      guestName: 'Mike Thompson',
      guestEmail: 'mike@example.com',
      eventTitle: 'Tech Startup Meetup',
      avatar: 'MT',
      messages: [
        { sender: 'guest', text: 'Is parking free at the Venture Hub HQ building?', time: '4:30 PM' }
      ],
      unread: true,
      flagged: true
    },
    {
      id: 'c3',
      guestName: 'Priya Patel',
      guestEmail: 'priya@example.com',
      eventTitle: 'Community Yoga Session',
      avatar: 'PP',
      messages: [
        { sender: 'guest', text: 'Hi Alex, will there be spare mats? I forgot mine.', time: 'Yesterday' },
        { sender: 'host', text: 'Hi Priya! Yes, we have about 10 spare mats available on a first-come basis.', time: 'Yesterday' }
      ],
      unread: false,
      flagged: false
    }
  ]);
  const [activeConversationId, setActiveConversationId] = useState('c1');
  const [replyText, setReplyText] = useState('');

  // Edit Event state
  const [editEventForm, setEditEventForm] = useState({
    title: '',
    eventType: 'Meetup',
    date: '',
    time: '',
    location: '',
    description: '',
    cover: '',
    theme: 'mesh-gradient-sunset',
    privacy: 'Public',
    rsvpStatus: 'Open',
    showGuestList: true,
    showRsvpCounts: 'detailed',
    capacity: 100,
    maxGuestsPerRsvp: 2,
    rsvpDeadline: '',
    allowSelfEdit: true,
    allowSelfCancellation: true,
    cancellationCutoff: 24,
    requireCancellationReason: false,
    guestConfirmation: true,
    reminderSchedule: '24h',
    hostAlerts: true,
    allowComments: true,
    allowPhotoUploads: false,
    enablePayments: false,
    ticketPrice: 0,
    approvalRequired: false,
    messagingEnabled: true,
    questions: [],

    // Notification engine defaults
    sendRsvpConfirmationEmail: true,
    sendRsvpConfirmationSms: true,
    sendPreEventReminders: true,
    sendPostEventFeedbackEmail: true,
    sendPostEventFeedbackSms: false,
    reminder1Offset: 24,
    reminder2Enabled: false,
    reminder2Offset: 3,
    feedbackDelay: 3,
    templates: {
      rsvp: { subject: "", body: "" },
      reminder: { subject: "", body: "" },
      feedback: { subject: "", body: "" }
    }
  });

  const loadDashboardData = () => {
    const allEvents = mockStore.getEvents();
    setEvents(allEvents);
  };

  const handleOrgDocUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedDocuments([...uploadedDocuments, ...files.map(f => f.name)]);
    }
  };

  const handleOrgDocSubmit = () => {
    if (uploadedDocuments.length > 0) {
      mockStore.saveOrgDocuments(currentUser?.email, uploadedDocuments);
      setOrgDocsUploaded(true);
      setShowOrgDocModal(false);
      alert('Organization documents uploaded successfully! Your account is now fully activated.');
    } else {
      alert('Please upload at least one document.');
    }
  };

  const handleConnectIntegration = (e) => {
    e.preventDefault();
    if (!integrationForm.apiKey.trim()) {
      alert('Please enter an API key or token.');
      return;
    }
    setConnectedIntegrations([...connectedIntegrations, {
      id: Date.now(),
      platform: integrationForm.platform,
      status: 'connected',
      connectedAt: new Date().toLocaleDateString()
    }]);
    setIntegrationForm({ platform: 'jotform', apiKey: '' });
    setShowIntegrationModal(false);
    alert(`${integrationForm.platform} connected successfully!`);
  };

  const handleDisconnectIntegration = (id) => {
    setConnectedIntegrations(connectedIntegrations.filter(i => i.id !== id));
  };

  // Normalize a persisted store conversation into the host-hub display shape
  const normalizeConvo = (c) => ({
    ...c,
    unread: c.unreadByHost,
    messages: (c.messages || []).map(m => ({
      ...m,
      time: m.timestamp
        ? new Date(m.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : (m.time || '')
    }))
  });

  useEffect(() => {
    loadDashboardData();
    const currentUser = mockStore.getCurrentUser();
    if (currentUser && currentUser.email) {
      const bank = mockStore.getBankAccount(currentUser.email);
      if (bank) {
        setBankForm(bank);
        setStripeConnected(true);
      }
    }

    // Merge real guest->host conversations from the store ahead of demo threads
    const persisted = mockStore.getConversations().map(normalizeConvo);
    if (persisted.length > 0) {
      setConversations(prev => {
        const persistedIds = new Set(persisted.map(p => p.id));
        const demoOnly = prev.filter(d => !persistedIds.has(d.id));
        return [...persisted, ...demoOnly];
      });
      setActiveConversationId(persisted[0].id);
    }
  }, []);

  // Compute metrics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'Published' && new Date(e.date) >= new Date());
  const upcomingEventsCount = upcomingEvents.length;
  
  // Calculate total RSVPs across all events
  let totalRsvps = 0;
  let totalViews = 0;
  events.forEach(e => {
    const rsvps = mockStore.getRSVPs(e.id);
    totalRsvps += rsvps.filter(r => r.status === 'going').length;
    totalViews += mockStore.getViews(e.id);
  });

  // Unique audience list
  const getAudienceList = () => {
    const audienceMap = new Map();
    events.forEach(evt => {
      const rsvps = mockStore.getRSVPs(evt.id);
      rsvps.forEach(rsvp => {
        if (!audienceMap.has(rsvp.email)) {
          audienceMap.set(rsvp.email, {
            name: rsvp.name,
            email: rsvp.email,
            phone: rsvp.phone,
            eventsAttended: [evt.title],
            status: rsvp.status
          });
        } else {
          const entry = audienceMap.get(rsvp.email);
          if (!entry.eventsAttended.includes(evt.title)) {
            entry.eventsAttended.push(evt.title);
          }
        }
      });
    });
    return Array.from(audienceMap.values());
  };

  const audienceList = getAudienceList();

  const handleManageEvent = (eventId) => {
    setSelectedEventId(eventId);
    // UC-08: staff land on the first tab their role permits (e.g. a QR Scanner
    // opens straight onto Check-in, since that's all their role exposes).
    if (currentUser?.role === 'staff') {
      const p = mockStore.getPermissionsForEvent(currentUser.email, eventId) || {};
      const firstTab = p.guests_view ? 'overview'
        : p.checkin ? 'checkin'
        : p.messaging_view ? 'messaging'
        : p.settings_view ? 'notifications'
        : 'overview';
      setSelectedEventTab(firstTab);
    } else {
      setSelectedEventTab('overview');
    }
    setActiveSidebar('events');
    const evt = mockStore.getEventById(eventId);
    if (evt) {
      setEditEventForm({
        title: evt.title,
        eventType: evt.eventType || 'Meetup',
        date: evt.date,
        time: evt.time,
        location: evt.location,
        description: evt.description,
        cover: evt.cover || '',
        theme: evt.theme || 'mesh-gradient-sunset',
        privacy: evt.privacy || 'Public',
        rsvpStatus: evt.rsvpStatus || 'Open',
        showGuestList: evt.showGuestList !== undefined ? evt.showGuestList : true,
        showRsvpCounts: evt.showRsvpCounts || 'detailed',
        capacity: evt.capacity,
        maxGuestsPerRsvp: evt.maxGuestsPerRsvp !== undefined ? evt.maxGuestsPerRsvp : 2,
        rsvpDeadline: evt.rsvpDeadline || '',
        allowSelfEdit: evt.allowSelfEdit !== undefined ? evt.allowSelfEdit : true,
        allowSelfCancellation: evt.allowSelfCancellation !== undefined ? evt.allowSelfCancellation : true,
        cancellationCutoff: evt.cancellationCutoff !== undefined ? evt.cancellationCutoff : 24,
        requireCancellationReason: evt.requireCancellationReason !== undefined ? evt.requireCancellationReason : false,
        guestConfirmation: evt.guestConfirmation !== undefined ? evt.guestConfirmation : true,
        reminderSchedule: evt.reminderSchedule || '24h',
        hostAlerts: evt.hostAlerts !== undefined ? evt.hostAlerts : true,
        dailyDigestEnabled: evt.dailyDigestEnabled !== undefined ? evt.dailyDigestEnabled : false,
        allowComments: evt.allowComments !== undefined ? evt.allowComments : true,
        allowPhotoUploads: evt.allowPhotoUploads !== undefined ? evt.allowPhotoUploads : false,
        enablePayments: evt.enablePayments !== undefined ? evt.enablePayments : false,
        ticketPrice: evt.ticketPrice || 0,
        approvalRequired: evt.approvalRequired !== undefined ? evt.approvalRequired : false,
        messagingEnabled: evt.messagingEnabled !== undefined ? evt.messagingEnabled : true,
        questions: evt.questions || [],
        
        // Notification settings
        sendRsvpConfirmationEmail: evt.sendRsvpConfirmationEmail !== undefined ? evt.sendRsvpConfirmationEmail : true,
        sendRsvpConfirmationSms: evt.sendRsvpConfirmationSms !== undefined ? evt.sendRsvpConfirmationSms : true,
        sendPreEventReminders: evt.sendPreEventReminders !== undefined ? evt.sendPreEventReminders : true,
        sendPostEventFeedbackEmail: evt.sendPostEventFeedbackEmail !== undefined ? evt.sendPostEventFeedbackEmail : true,
        sendPostEventFeedbackSms: evt.sendPostEventFeedbackSms !== undefined ? evt.sendPostEventFeedbackSms : false,
        reminder1Offset: evt.reminder1Offset !== undefined ? evt.reminder1Offset : 24,
        reminder2Enabled: evt.reminder2Enabled !== undefined ? evt.reminder2Enabled : false,
        reminder2Offset: evt.reminder2Offset !== undefined ? evt.reminder2Offset : 3,
        feedbackDelay: evt.feedbackDelay !== undefined ? evt.feedbackDelay : 3,
        templates: {
          ...defaultTemplates,
          ...evt.templates
        }
      });
    }
  };

  const handleToggleCheckin = (eventId, rsvpId, checkedIn) => {
    mockStore.updateRSVP(eventId, rsvpId, { checkedIn: !checkedIn });
    loadDashboardData();
  };

  const handleApproveRSVP = (eventId, rsvpId, approve) => {
    mockStore.updateRSVP(eventId, rsvpId, { status: approve ? 'going' : 'declined' });
    loadDashboardData();
  };

  // Actor label used in audit logs for whoever is acting (host or staff)
  const viewerActor = () => `${currentUser?.name || 'Host'} (${currentUser?.role === 'staff' ? 'Staff' : 'Host'})`;

  // UC-02: approve / reject / reopen a pending RSVP
  const handleApproveDecision = (eventId, rsvpId) => {
    mockStore.approveRSVP(eventId, rsvpId, viewerActor());
    loadDashboardData();
  };

  const handleRejectDecision = (eventId, rsvpId) => {
    const reason = window.prompt('Optional: add a reason for rejecting this RSVP (the guest will see it).', '');
    if (reason === null) return; // cancelled
    mockStore.rejectRSVP(eventId, rsvpId, reason.trim(), viewerActor());
    loadDashboardData();
  };

  const handleReopenDecision = (eventId, rsvpId) => {
    mockStore.reopenRSVP(eventId, rsvpId, viewerActor());
    loadDashboardData();
  };

  const handleApproveAllPending = (eventId) => {
    const pending = mockStore.getRSVPs(eventId).filter(r => r.approvalState === 'UNDER_APPROVAL' && r.status !== 'waitlist');
    if (pending.length === 0) return;
    if (!window.confirm(`Approve all ${pending.length} pending RSVP(s)?`)) return;
    pending.forEach(r => mockStore.approveRSVP(eventId, r.id, viewerActor()));
    loadDashboardData();
  };

  const handleDeleteRSVP = (eventId, rsvpId) => {
    if (window.confirm("Are you sure you want to remove this guest RSVP?")) {
      mockStore.updateRSVP(eventId, rsvpId, { status: 'declined' });
      loadDashboardData();
    }
  };

  // UC-11: validate a scanned QR / pass ID against the event's APPROVED guest list
  const handleVerifyCheckin = (passId) => {
    const rsvp = managedEventRsvps.find(r => r.id === passId.trim());
    // Not in this event's list at all → wrong event / invalid token
    if (!rsvp) {
      setCheckinResult({ type: 'error', message: `Not valid for this event. Pass "${passId}" was not found on the guest list.` });
      return;
    }
    // Only approved guests may enter
    if (rsvp.approvalState === 'REJECTED') {
      setCheckinResult({ type: 'error', rsvp, message: 'This guest was not approved for the event. Entry denied.' });
      return;
    }
    if (rsvp.approvalState === 'UNDER_APPROVAL' || rsvp.status === 'waitlist') {
      setCheckinResult({ type: 'error', rsvp, message: 'This guest is still Under Approval and not yet admitted. Entry denied.' });
      return;
    }
    if (rsvp.status !== 'going') {
      setCheckinResult({ type: 'error', rsvp, message: 'This guest is not confirmed for the event. Entry denied.' });
      return;
    }
    // Already scanned → warn with the recorded time
    if (rsvp.checkedIn) {
      const when = rsvp.checkedInAt ? new Date(rsvp.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'earlier';
      setCheckinResult({ type: 'warning', rsvp, message: `Already scanned at ${when}. Duplicate entry detected.` });
      return;
    }

    // Success — mark arrived
    const scanner = currentUser?.role === 'staff' ? `${currentUser.name} (Staff)` : activeScannerStaff;
    mockStore.updateRSVP(selectedEventId, rsvp.id, { checkedIn: true, checkedInAt: new Date().toISOString() }, scanner);
    loadDashboardData();
    setCheckinResult({
      type: 'success',
      rsvp: { ...rsvp, checkedIn: true },
      message: `Arrived! ${rsvp.name} checked in (${rsvp.guestCount || 1} attendee${(rsvp.guestCount || 1) > 1 ? 's' : ''}) by ${scanner}.`
    });
    setCheckinInput('');
  };

  const handleSendTestMessage = (templateKey) => {
    const dummyGuest = { id: 'test_rsvp', name: "Alice Vance", email: "alice@example.com", phone: "+1 (555) 123-4567", guestCount: 1 };
    const templates = editEventForm.templates || {};
    const templateSubject = templates[templateKey]?.subject || '';
    const templateBody = templates[templateKey]?.body || '';
    
    const resolvedSubject = mockStore.renderTemplate(templateSubject, managedEvent, dummyGuest);
    const resolvedBody = mockStore.renderTemplate(templateBody, managedEvent, dummyGuest);
    
    mockStore.addNotificationLog(selectedEventId, {
      rsvpId: 'test_rsvp',
      guestEmail: 'alice@example.com',
      type: templateKey,
      channel: previewMode === 'email' ? 'Email' : 'SMS',
      subject: '[TEST] ' + resolvedSubject,
      body: resolvedBody,
      status: 'Delivered',
      isTest: true
    });
    
    loadDashboardData();
    alert(`🧪 Test message dispatched successfully! Checked outbox logs for the recipient 'alice@example.com'.`);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    const ruleToAdd = {
      id: 'rule_' + Math.random().toString(36).substr(2, 9),
      ...newRule,
      active: true
    };
    setAutoReplyRules([...autoReplyRules, ruleToAdd]);
    setNewRule({ trigger: 'On Guest RSVP', condition: 'If Status is Going', action: 'Send Confirmation email (rsvp)' });
  };

  const handleToggleRule = (id) => {
    setAutoReplyRules(autoReplyRules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRule = (id) => {
    setAutoReplyRules(autoReplyRules.filter(r => r.id !== id));
  };

  // UC-06: invite a staff member to the current event with an assigned role
  const handleInviteStaffSubmit = (e) => {
    e.preventDefault();
    if (!inviteStaffForm.name || !inviteStaffForm.email || !selectedEventId) return;
    const role = mockStore.getRoleById(inviteStaffForm.roleId);
    mockStore.inviteStaff(selectedEventId, {
      name: inviteStaffForm.name,
      email: inviteStaffForm.email,
      roleId: inviteStaffForm.roleId
    });
    setInviteStaffForm({ name: '', email: '', roleId: 'role_coordinator' });
    loadDashboardData();
    alert(`✉️ Invitation sent to ${inviteStaffForm.name} as ${role ? role.name : 'staff'}!`);
  };

  const handleRemoveStaff = (staffId) => {
    if (!window.confirm('Remove this team member from the event?')) return;
    mockStore.removeStaff(staffId);
    loadDashboardData();
  };

  const handleAcceptStaff = (staffId) => {
    mockStore.updateStaff(staffId, { status: 'ACTIVE', acceptedAt: new Date().toISOString() });
    loadDashboardData();
  };

  // UC-07: create or update a role definition with its permission toggles
  const handleOpenRoleBuilder = (role) => {
    if (role) {
      setRoleBuilder({ id: role.id, name: role.name, description: role.description || '', permissions: { ...role.permissions } });
    } else {
      setRoleBuilder(emptyRoleBuilder);
    }
    setShowRoleBuilder(true);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleBuilder.name.trim()) { alert('Please name the role.'); return; }
    if (roleBuilder.id) {
      mockStore.updateRole(roleBuilder.id, { name: roleBuilder.name, description: roleBuilder.description, permissions: roleBuilder.permissions });
    } else {
      mockStore.createRole({ name: roleBuilder.name, description: roleBuilder.description, permissions: roleBuilder.permissions });
    }
    setShowRoleBuilder(false);
    setRoleBuilder(emptyRoleBuilder);
    loadDashboardData();
  };

  const handleDeleteRole = (roleId) => {
    if (!window.confirm('Delete this role? Staff assigned to it will lose access until reassigned.')) return;
    const ok = mockStore.deleteRole(roleId);
    if (!ok) { alert('Built-in roles cannot be deleted.'); return; }
    loadDashboardData();
  };

  // Export CSV
  const handleExportCSV = (event, rsvps) => {
    const headers = 'Name,Email,Phone,Status,Checked-In,Timestamp\n';
    const rows = rsvps.map(r => `"${r.name}","${r.email}","${r.phone}","${r.status}",${r.checkedIn ? 'Yes' : 'No'},"${r.timestamp}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `guestlist_${event.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFeedbackCSV = (event, feedbackItems) => {
    const headers = 'Guest Name,Email,Rating,Review Comment,Date Submitted\n';
    const rows = feedbackItems.map(fb => `"${fb.name}","${fb.email}",${fb.rating},"${fb.comments || ''}","${fb.submittedAt}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `feedback_${event.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast Message
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    
    // Log broadcast to notification logs for all targeted guests
    const targetGuests = managedEventRsvps.filter(r => {
      if (broadcastTarget === 'all') return r.status === 'going';
      if (broadcastTarget === 'going') return r.status === 'going';
      if (broadcastTarget === 'maybe') return r.status === 'maybe';
      return r.email === broadcastTarget; // Individual guest
    });

    targetGuests.forEach(guest => {
      const subject = mockStore.renderTemplate(broadcastSubject, managedEvent, guest);
      const body = mockStore.renderTemplate(broadcastMessage, managedEvent, guest);
      mockStore.addNotificationLog(selectedEventId, {
        rsvpId: guest.id,
        guestEmail: guest.email,
        type: 'broadcast',
        channel: 'Email',
        subject,
        body
      });
    });

    setBroadcastSent(true);
    setTimeout(() => {
      setShowBroadcastModal(false);
      setBroadcastSent(false);
      setBroadcastSubject('');
      setBroadcastMessage('');
    }, 2000);
  };

  // Poll Creation
  const handleCreatePollSubmit = (e) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    const activeOptions = newPollOptions.filter(o => o.trim() !== '');
    if (activeOptions.length < 2) return;
    mockStore.createPoll(selectedEventId, newPollQuestion, activeOptions);
    setNewPollQuestion('');
    setNewPollOptions(['', '']);
    loadDashboardData();
  };

  // Edit Event Details Submit
  const handleSaveEventSeries = (applyToAll) => {
    setShowSeriesConfirmModal(false);
    const currentEvt = mockStore.getEventById(selectedEventId);
    if (!currentEvt) return;
    const dateChanged = editEventForm.date !== currentEvt.date || editEventForm.time !== currentEvt.time;
    const locationChanged = editEventForm.location !== currentEvt.location;

    mockStore.updateEvent(selectedEventId, editEventForm);
    
    if (applyToAll && seriesType !== 'None') {
      // Create 3 more weekly/monthly occurrences
      const baseDate = new Date(editEventForm.date);
      for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(baseDate);
        if (seriesType === 'Weekly') {
          nextDate.setDate(baseDate.getDate() + 7 * i);
        } else if (seriesType === 'Monthly') {
          nextDate.setMonth(baseDate.getMonth() + i);
        }
        
        const dateStr = nextDate.toISOString().split('T')[0];
        mockStore.createEvent({
          ...editEventForm,
          title: `${editEventForm.title} (Occurrence ${i + 1})`,
          date: dateStr,
          status: 'Published'
        });
      }
      alert(`📅 Event series created! 4 occurrences successfully generated (${seriesType} cadence) and published.`);
    } else {
      const eventRsvps = mockStore.getRSVPs(selectedEventId);
      if (dateChanged || locationChanged) {
        const goingGuests = eventRsvps.filter(r => r.status === 'going');
        goingGuests.forEach(guest => {
          const subject = `Event Updated: ${editEventForm.title}`;
          const body = `Hi ${guest.name},\n\nWe wanted to let you know that the details for the event "${editEventForm.title}" have been updated.\n\nNew Details:\nDate: ${editEventForm.date}\nTime: ${editEventForm.time}\nLocation: ${editEventForm.location}\n\nManage RSVP: ${window.location.origin}/dashboard`;
          
          mockStore.addNotificationLog(selectedEventId, {
            rsvpId: guest.id,
            guestEmail: guest.email,
            type: 'broadcast',
            channel: 'Email',
            subject,
            body
          });
        });
        alert('Event details updated successfully! 📧 An email update has been sent to all registered guests.');
      } else {
        alert('Event settings updated successfully!');
      }
    }
    loadDashboardData();
  };

  const handleEditEventSubmit = (e) => {
    e.preventDefault();
    const eventRsvps = mockStore.getRSVPs(selectedEventId);
    const attendingCount = eventRsvps.filter(r => r.status === 'going').length;
    
    // Capacity reduction limit block
    if (editEventForm.capacity < attendingCount) {
      alert(`❌ Capacity decrease blocked! You currently have ${attendingCount} registered guests. You cannot reduce capacity below this number.`);
      return;
    }

    if (seriesType !== 'None') {
      setShowSeriesConfirmModal(true);
    } else {
      handleSaveEventSeries(false);
    }
  };

  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    mockStore.updateEvent(selectedEventId, {
      sendRsvpConfirmationEmail: editEventForm.sendRsvpConfirmationEmail,
      sendRsvpConfirmationSms: editEventForm.sendRsvpConfirmationSms,
      sendPreEventReminders: editEventForm.sendPreEventReminders,
      sendPostEventFeedbackEmail: editEventForm.sendPostEventFeedbackEmail,
      sendPostEventFeedbackSms: editEventForm.sendPostEventFeedbackSms,
      reminder1Offset: editEventForm.reminder1Offset,
      reminder2Enabled: editEventForm.reminder2Enabled,
      reminder2Offset: editEventForm.reminder2Offset,
      templates: editEventForm.templates,
      hostAlerts: editEventForm.hostAlerts,
      dailyDigestEnabled: editEventForm.dailyDigestEnabled
    });
    loadDashboardData();
    alert('Notification settings and templates saved successfully!');
  };

  const handleDuplicateEvent = (eventId) => {
    if (window.confirm("Duplicate this event and copy all settings?")) {
      const cloned = mockStore.duplicateEvent(eventId);
      if (cloned) {
        alert(`Cloned successfully! New event "${cloned.title}" has been created as a Draft.`);
        loadDashboardData();
        setSelectedEventId(cloned.id);
        setSelectedEventTab('edit');
        setActiveSidebar('events');
      }
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("⚠️ WARNING: Are you sure you want to permanently delete this event and remove all guest RSVP logs? This action CANNOT be undone!")) {
      mockStore.deleteEvent(eventId);
      loadDashboardData();
      setSelectedEventId(null);
      alert('Event deleted successfully.');
    }
  };

  // Duplicate the last created/scheduled event in the events list
  const handleDuplicateLastEvent = () => {
    if (events.length === 0) {
      alert("No events found to duplicate.");
      return;
    }
    const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastEvent = sorted[0];
    handleDuplicateEvent(lastEvent.id);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Render weekly summary sub-status text
  const getWeeklyEventsText = () => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weeklyEvents = events.filter(e => e.status === 'Published' && new Date(e.date) >= now && new Date(e.date) <= oneWeekLater);
    if (weeklyEvents.length === 0) return "You have no events scheduled this week.";
    
    const nextEvent = [...weeklyEvents].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    return (
      <span>
        You have <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{weeklyEvents.length} events</span> happening this week. Next up: <strong>{nextEvent.title}</strong> starts on {nextEvent.date} at {nextEvent.time}.
      </span>
    );
  };

  // Monday to Sunday dates of current week
  const getDaysOfWeek = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // get Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      days.push(day);
    }
    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  // Filter events by deep dive tabs
  const getEventsForTab = (tab) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const scoped = isStaffViewer ? events.filter(e => staffEventIds.includes(e.id)) : events;
    return scoped.filter(e => {
      if (e.status === 'Draft') {
        return tab === 'drafts';
      }
      
      const evtDate = new Date(e.date + 'T' + e.time);
      const diffTime = evtDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (tab === 'live') {
        // Simple live condition: event is today and active around now
        const isToday = e.date === todayString;
        const eventHr = parseInt(e.time.split(':')[0], 10);
        const currHr = today.getHours();
        return isToday && currHr >= eventHr && currHr < eventHr + 4;
      }
      if (tab === 'today') {
        return e.date === todayString;
      }
      if (tab === 'thisWeek') {
        return e.date !== todayString && diffDays > 0 && diffDays <= 7;
      }
      if (tab === 'upcoming') {
        return diffDays > 7 && diffDays <= 30;
      }
      if (tab === 'past') {
        return evtDate < today && e.date !== todayString;
      }
      return false;
    });
  };

  // Apply search + type filter on top of the time-bucket
  const getFilteredEventsForTab = (tab) => {
    const q = eventSearch.trim().toLowerCase();
    return getEventsForTab(tab).filter(e => {
      const matchesSearch = !q ||
        e.title.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.eventType && e.eventType.toLowerCase().includes(q)) ||
        e.id.toLowerCase().includes(q);
      const matchesType = !eventTypeFilter || e.eventType === eventTypeFilter;
      return matchesSearch && matchesType;
    });
  };

  // Distinct event types across all of the host's events (for the filter dropdown)
  const hostEventTypes = [...new Set(events.map(e => e.eventType).filter(Boolean))].sort();

  // Payout bank transfer simulation
  const handleBankTransfer = () => {
    if (availableBalance <= 0) {
      alert("No funds available for payout.");
      return;
    }
    setTransferring(true);
    setTimeout(() => {
      const newPayout = {
        id: 'po_' + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        amount: availableBalance,
        status: 'Processing',
        bank: bankForm.bankName ? `${bankForm.bankName} (...${bankForm.accountNumber.slice(-4)})` : 'Chase Bank (...1234)'
      };
      setPayoutHistory([newPayout, ...payoutHistory]);
      setAvailableBalance(0);
      setTransferring(false);
      alert(`🎉 Transfer initiated! $${availableBalance} is being sent to your bank account.`);
    }, 1500);
  };

  // Inbox message sending handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Persist replies to real guest conversations so the guest sees them
    const activeC = conversations.find(c => c.id === activeConversationId);
    if (activeC && String(activeC.id).startsWith('conv_')) {
      mockStore.sendHostMessage(activeC.id, replyText.trim());
      mockStore.markConversationRead(activeC.id, 'host');
    }

    setConversations(conversations.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          unread: false,
          messages: [
            ...c.messages,
            { sender: 'host', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return c;
    }));
    setReplyText('');
  };

  // Active managed event details
  const managedEvent = selectedEventId ? mockStore.getEventById(selectedEventId) : null;
  const managedEventRsvps = selectedEventId ? mockStore.getRSVPs(selectedEventId) : [];
  const managedEventPolls = selectedEventId ? mockStore.getPolls(selectedEventId) : [];
  const managedEventComments = selectedEventId ? mockStore.getComments(selectedEventId) : [];
  const managedEventViews = selectedEventId ? mockStore.getViews(selectedEventId) : 0;

  // UC-07/08: resolve what the current viewer is allowed to do on this event.
  // The host (owner) gets everything; staff get only their role's grants.
  const allPerms = { guests_view: true, guests_approve: true, guests_edit: true, guests_export: true, checkin: true, messaging_view: true, messaging_reply: true, history_view: true, settings_view: true, settings_edit: true, staff_manage: true };
  const viewerPerms = managedEvent
    ? (isStaffViewer ? mockStore.getPermissionsForEvent(currentUser?.email, managedEvent.id) : allPerms)
    : allPerms;
  const can = (perm) => !!viewerPerms[perm];

  // Pending-approval queue for the managed event (UC-02). Waitlisted guests are
  // also UNDER_APPROVAL but shown in their own waitlist section below.
  const pendingApprovalRsvps = managedEventRsvps
    .filter(r => r.approvalState === 'UNDER_APPROVAL' && r.status !== 'waitlist')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Bulk actions handlers
  const handleBulkCheckIn = () => {
    selectedGuestIds.forEach(id => {
      mockStore.updateRSVP(selectedEventId, id, { checkedIn: true });
    });
    setSelectedGuestIds([]);
    loadDashboardData();
    alert('Selected guests checked in successfully!');
  };

  const handleBulkMessage = () => {
    setBroadcastTarget('all');
    setShowBroadcastModal(true);
  };

  const handleBulkExport = () => {
    const selectedRsvps = managedEventRsvps.filter(r => selectedGuestIds.includes(r.id));
    handleExportCSV(managedEvent, selectedRsvps);
  };

  return (
    <PageShell>
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>{isStaffViewer ? '🛠️' : '👑'}</span> {isStaffViewer ? 'Team Portal' : 'Host Portal'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {!isStaffViewer && (
            <button
              onClick={() => { setActiveSidebar('dashboard'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'dashboard' ? 'active' : ''}`}
            >
              <Compass size={18} /> Dashboard
            </button>
            )}

            <button
              onClick={() => { setActiveSidebar('events'); setSelectedEventId(null); }} 
              className={`dashboard-nav-btn ${activeSidebar === 'events' ? 'active' : ''}`}
            >
              <Calendar size={18} /> My Events
            </button>
            
            {!isStaffViewer && (
            <button
              onClick={() => { setActiveSidebar('earnings'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'earnings' ? 'active' : ''}`}
            >
              <CreditCard size={18} /> Earnings
            </button>
            )}

            <button
              onClick={() => { setActiveSidebar('messages'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'messages' ? 'active' : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div className="flex items-center gap-sm">
                <MessageSquare size={18} /> Messages
              </div>
              {conversations.some(c => c.unread) && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3b30' }} />
              )}
            </button>

            {!isStaffViewer && (
            <button
              onClick={() => { setActiveSidebar('audience'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'audience' ? 'active' : ''}`}
            >
              <Users size={18} /> Audience
            </button>
            )}

            {!isStaffViewer && (
            <button
              onClick={() => { setActiveSidebar('settings'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} /> Settings
            </button>
            )}

            {!isStaffViewer && (
            <button
              onClick={() => { setActiveSidebar('integrations'); setSelectedEventId(null); }}
              className={`dashboard-nav-btn ${activeSidebar === 'integrations' ? 'active' : ''}`}
            >
              <Webhook size={18} /> Integrations
            </button>
            )}
          </nav>

          <button 
            onClick={onLogout} 
            className="dashboard-nav-btn"
            style={{ marginTop: 'auto', border: '1px solid var(--color-border)' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="dashboard-main">
          
          {/* ========================================================================= */}
          {/* SECTION 1 - 3 & 6: DASHBOARD HOME PAGE                                    */}
          {/* ========================================================================= */}
          {activeSidebar === 'dashboard' && (
            <div className="flex flex-col gap-xl">
              
              {/* SECTION 1: WELCOME HERO BANNER */}
              <div className="page-hero animate-fade-in" style={{ padding: '32px', minHeight: '260px' }}>
                <img src={HERO_IMAGES.hosting} alt="Host on stage" className="page-hero-img" />
                <div className="page-hero-overlay" />
                <div className="page-hero-content" style={{ width: '100%', textAlign: 'left' }}>
                  <div className="flex justify-between items-end" style={{ flexWrap: 'wrap', gap: '20px', width: '100%' }}>
                    <div>
                      <div className="flex items-center gap-sm" style={{ marginBottom: '10px' }}>
                        <img src={getAvatar('alex@safalevent.com')} alt="Alex Rivera" className="avatar-img" />
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Host Portal</span>
                      </div>
                      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                        {getGreeting()}, Alex! 👋
                      </h1>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', maxWidth: '560px' }}>
                        {getWeeklyEventsText()}
                      </p>
                      <div className="flex gap-md" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', borderRadius: 'var(--radius-md)', padding: '8px 16px', textAlign: 'left' }}>
                          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.2 }}>{totalEvents}</div>
                          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Events</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', borderRadius: 'var(--radius-md)', padding: '8px 16px', textAlign: 'left' }}>
                          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.2 }}>{totalRsvps}</div>
                          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guests RSVP'd</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', borderRadius: 'var(--radius-md)', padding: '8px 16px', textAlign: 'left' }}>
                          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.2 }}>${availableBalance.toLocaleString()}</div>
                          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                      <Link to="/create">
                        <Button variant="primary" className="flex items-center gap-xs">
                          <Plus size={18} /> Create New Event
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={handleDuplicateLastEvent} className="flex items-center gap-xs" style={{ background: 'rgba(255,255,255,0.92)' }}>
                        <Copy size={16} /> Copy Last Event
                      </Button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/host/alex`);
                          alert("Host profile link copied to clipboard!");
                        }}
                        className="btn btn-outline"
                        style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'white', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.4)' }}
                      >
                        <Share2 size={16} /> Share Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STATUS OVERVIEW CARDS */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>Quick Stats</h2>
                <div className="grid-3" style={{ gap: '16px' }}>
                  <Card style={{ padding: '20px', textAlign: 'left', position: 'relative' }} className="card-hover-lift glass-surface">
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="stat-icon-tile stat-icon-green"><DollarSign size={22} /></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: 'rgba(0,200,83,0.1)', color: 'var(--color-accent)' }}>↑ +$850 this week</span>
                    </div>
                    <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Total Earnings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1 }}>${availableBalance.toLocaleString()}</p>
                    <button 
                      onClick={() => setActiveSidebar('earnings')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      View breakdown &rarr;
                    </button>
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left', position: 'relative' }} className="card-hover-lift glass-surface">
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="stat-icon-tile stat-icon-orange"><Ticket size={22} /></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)' }}>{upcomingEventsCount} Active</span>
                    </div>
                    <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Active RSVPs</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1 }}>{totalRsvps} guests</p>
                    <button 
                      onClick={() => setActiveSidebar('events')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      Manage guests &rarr;
                    </button>
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left', position: 'relative' }} className="card-hover-lift glass-surface">
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="stat-icon-tile stat-icon-blue"><Mail size={22} /></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: '#fee2e2', color: '#ef4444' }}>3 urgent</span>
                    </div>
                    <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Unread Messages</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1 }}>8 new</p>
                    <button 
                      onClick={() => setActiveSidebar('messages')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      Reply now &rarr;
                    </button>
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left', position: 'relative' }} className="card-hover-lift glass-surface">
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="stat-icon-tile stat-icon-red"><Clock size={22} /></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: '#fef3c7', color: '#d97706' }}>Ends in 3h</span>
                    </div>
                    <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Ending Soon</h3>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 12px 0' }}>Registration Closing</p>
                    <button 
                      onClick={() => {
                        const ending = events.find(e => e.rsvpStatus === 'Open');
                        if (ending) handleManageEvent(ending.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      Extend registration &rarr;
                    </button>
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left', position: 'relative' }} className="card-hover-lift glass-surface">
                    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                      <div className="stat-icon-tile stat-icon-purple"><Star size={22} /></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', background: '#fef3c7', color: '#b45309' }}>Recent reviews</span>
                    </div>
                    <h3 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>New Reviews</h3>
                    <p style={{ fontSize: '2.0rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1 }}>4.8 Rating</p>
                    <button 
                      onClick={() => {
                        const feedbackEvt = events.find(e => e.status === 'Completed');
                        if (feedbackEvt) {
                          handleManageEvent(feedbackEvt.id);
                          setSelectedEventTab('overview');
                        } else {
                          alert("No completed events with reviews found.");
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                      Read reviews &rarr;
                    </button>
                  </Card>

                </div>
              </div>

              {/* SECTION 3: THIS WEEK AT A GLANCE */}
              <div>
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>This Week at a Glance</h2>
                  <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.8rem' }}>
                    Monday, {daysOfWeek[0].toLocaleDateString([], {month: 'short', day: 'numeric'})} &mdash; Sunday, {daysOfWeek[6].toLocaleDateString([], {month: 'short', day: 'numeric'})}
                  </p>
                </div>

                <div className="grid-7" style={{ gap: '10px' }}>
                  {daysOfWeek.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayEvents = getEventsForDate(day);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = selectedCalendarDate?.toDateString() === day.toDateString();
                    
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedCalendarDate(isSelected ? null : day)}
                        style={{
                          background: isToday ? 'rgba(255,107,53,0.05)' : 'var(--color-surface)',
                          border: isSelected 
                            ? '2.5px solid var(--color-primary)' 
                            : isToday 
                            ? '1.5px solid var(--color-primary)' 
                            : '1px solid var(--color-border)',
                          borderRadius: '12px',
                          padding: '12px 8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          minHeight: '110px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? 'var(--shadow-soft)' : 'none'
                        }}
                        className="card-hover-lift"
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                            {day.toLocaleDateString([], { weekday: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isToday ? 'var(--color-primary)' : 'inherit' }}>
                            {day.getDate()}
                          </div>
                        </div>

                        <div>
                          {hasEvents ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                              <span style={{ fontSize: '1.1rem' }}>🎉</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)', borderRadius: '4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {dayEvents[0].title}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>No events</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Date click expand drawer */}
                {selectedCalendarDate && (
                  <div className="glass-surface" style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'left', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Schedule for {selectedCalendarDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      <button onClick={() => setSelectedCalendarDate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
                    </h4>
                    {getEventsForDate(selectedCalendarDate).length > 0 ? (
                      <div className="flex flex-col gap-sm">
                        {getEventsForDate(selectedCalendarDate).map(evt => {
                          const rsvps = mockStore.getRSVPs(evt.id);
                          const going = rsvps.filter(r => r.status === 'going').length;
                          return (
                            <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', items: 'center', background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={getEventCover(evt)} alt={evt.title} className="thumb-img" />
                                <div>
                                  <h5 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: 700 }}>{evt.title}</h5>
                                  <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                                    🕒 {evt.time} • 📍 {evt.location.split(',')[0]} • 👥 {going} / {evt.capacity} spots filled
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-xs">
                                <Button variant="primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleManageEvent(evt.id)}>Edit</Button>
                                <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/e/${evt.id}`); alert("Link copied!"); }}>Copy Link</Button>
                                <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { handleManageEvent(evt.id); setSelectedEventTab('guests'); }}>Guests</Button>
                                <Button variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { handleManageEvent(evt.id); setSelectedEventTab('checkin'); }}>Check-in</Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No events scheduled for this day.</p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 6: RECENT ACTIVITY FEED */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>What's Happening</h2>
                <Card style={{ padding: 0, overflow: 'hidden' }} className="glass-surface">
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    
                    {/* Activity Item 1 */}
                    <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                      <img src={getAvatar('sarah@example.com')} alt="Sarah Johnson" className="avatar-img" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sarah Johnson RSVP'd for Summer Rooftop Mixer (+2)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Just now</div>
                      </div>
                      <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => { handleManageEvent('1'); setSelectedEventTab('guests'); }}>View details</Button>
                    </div>

                    {/* Activity Item 2 */}
                    <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                      <div className="stat-icon-tile stat-icon-blue" style={{ width: '40px', height: '40px' }}><Mail size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>You sent message: "Parking update & venue maps" to 45 guests of Summer Rooftop Mixer</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>5 minutes ago</div>
                      </div>
                      <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => { handleManageEvent('1'); setSelectedEventTab('notifications'); }}>Outbox Logs</Button>
                    </div>

                    {/* Activity Item 3 */}
                    <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                      <img src={getAvatar('john.smith@example.com')} alt="John Smith" className="avatar-img" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ticket Payment received: $60.00 from John Smith</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>12 minutes ago</div>
                      </div>
                      <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setActiveSidebar('earnings')}>View in earnings</Button>
                    </div>

                    {/* Activity Item 4 */}
                    <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                      <div className="stat-icon-tile stat-icon-orange" style={{ width: '40px', height: '40px' }}><AlertCircle size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Capacity Alert: Stand-up Comedy Night is currently at 90% capacity</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>1 hour ago</div>
                      </div>
                      <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleManageEvent('5')}>Boost promotion</Button>
                    </div>

                    {/* Activity Item 5 */}
                    <div style={{ display: 'flex', gap: '16px', padding: '16px 20px', alignItems: 'center' }}>
                      <img src={getAvatar('priya@example.com')} alt="Priya M." className="avatar-img" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>New review posted: "Amazing venue!" ⭐⭐⭐⭐⭐ from Priya M.</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>3 hours ago</div>
                      </div>
                      <Button variant="ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => { handleManageEvent('4'); setSelectedEventTab('overview'); }}>Read & respond</Button>
                    </div>

                  </div>
                </Card>
              </div>

              {/* QUICK TOOLS & RESOURCES */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>Quick Tools & Resources</h2>
                <div className="grid-3" style={{ gap: '16px' }}>
                  <Card style={{ padding: '16px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                    <div className="stat-icon-tile stat-icon-blue" style={{ marginBottom: '10px' }}><HelpCircle size={20} /></div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>Help Center</h4>
                    <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.75rem' }}>Learn how to customize your check-in scanner and RSVPs workflows.</p>
                    <a href="#help" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Browse articles &rarr;</a>
                  </Card>
                  <Card style={{ padding: '16px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                    <div className="stat-icon-tile stat-icon-orange" style={{ marginBottom: '10px' }}><FileText size={20} /></div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>Auto-Reply Templates</h4>
                    <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.75rem' }}>Set default templates for instant confirmation and reminders.</p>
                    <a href="#templates" onClick={() => { setActiveSidebar('settings'); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Edit templates &rarr;</a>
                  </Card>
                  <Card style={{ padding: '16px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                    <div className="stat-icon-tile stat-icon-green" style={{ marginBottom: '10px' }}><Settings size={20} /></div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700 }}>Waitlist Promotion</h4>
                    <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.75rem' }}>Configure auto-promote settings when RSVPs get cancelled.</p>
                    <a href="#rules" onClick={() => { handleManageEvent('2'); setSelectedEventTab('staff'); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Manage rules &rarr;</a>
                  </Card>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: MY EVENTS (TABBED LIST)                                        */}
          {/* ========================================================================= */}
          {activeSidebar === 'events' && !selectedEventId && (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{isStaffViewer ? 'Assigned Events' : 'My Events'}</h1>
                  <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>{isStaffViewer ? 'Events you help run. Your access is limited by your assigned role.' : 'Deep dive into your invitation templates, guest check-ins, and outbox logs.'}</p>
                </div>
                {!isStaffViewer && (
                  <Link to="/create">
                    <Button variant="primary" className="flex items-center gap-xs">
                      <Plus size={18} /> Create New Event
                    </Button>
                  </Link>
                )}
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex gap-md" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
                {[
                  { key: 'live', label: '🔴 Live Now' },
                  { key: 'today', label: '📅 Today' },
                  { key: 'thisWeek', label: '⏳ This Week' },
                  { key: 'upcoming', label: '📆 Upcoming' },
                  { key: 'past', label: '✅ Past' },
                  { key: 'drafts', label: '📝 Drafts' }
                ].map(t => {
                  const evList = getEventsForTab(t.key);
                  const count = evList.length;
                  return (
                    <button 
                      key={t.key}
                      onClick={() => setActiveEventTab(t.key)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0 0 12px 0',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: activeEventTab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeEventTab === t.key ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {t.label}
                      {count > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          background: t.key === 'live' ? '#ff3b30' : 'rgba(255,107,53,0.1)',
                          color: t.key === 'live' ? 'white' : 'var(--color-primary)',
                          borderRadius: '10px'
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search + Filter toolbar */}
              <div className="flex" style={{ gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by title, location, type, or code..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none', background: 'var(--color-surface)', fontFamily: 'inherit' }}
                  />
                </div>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: 'var(--color-surface)', outline: 'none' }}
                >
                  <option value="">All Types</option>
                  {hostEventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(eventSearch || eventTypeFilter) && (
                  <button
                    type="button"
                    onClick={() => { setEventSearch(''); setEventTypeFilter(''); }}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Events Grid */}
              <div className="flex flex-col gap-md">
                {getFilteredEventsForTab(activeEventTab).length > 0 ? (
                  getFilteredEventsForTab(activeEventTab).map(event => {
                    const rsvps = mockStore.getRSVPs(event.id);
                    const going = rsvps.filter(r => r.status === 'going').length;
                    const maybe = rsvps.filter(r => r.status === 'maybe').length;
                    const waitlistCount = rsvps.filter(r => r.status === 'waitlist').length;
                    const totalAttending = going + maybe;
                    const pctFull = Math.min(100, Math.round((going / (event.capacity || 1)) * 100));
                    
                    return (
                      <Card key={event.id} style={{ padding: 0, overflow: 'hidden', textAlign: 'left' }} className="glass-surface">
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          
                          {/* Event Cover Photo */}
                          <div style={{
                            width: '100%',
                            maxWidth: '280px',
                            minHeight: '180px',
                            background: `url(${getEventCover(event)}) center/cover`,
                            position: 'relative'
                          }}>
                            {activeEventTab === 'live' && (
                              <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: '#ff3b30',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                animation: 'pulse 1.5s infinite'
                              }}>
                                🔴 LIVE NOW
                              </span>
                            )}
                            {event.status === 'Draft' && (
                              <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: '#cbd5e1',
                                color: '#475569',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '4px'
                              }}>
                                📝 DRAFT
                              </span>
                            )}
                            {activeEventTab !== 'live' && event.status === 'Published' && (
                              <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: activeEventTab === 'past' ? 'rgba(15,23,42,0.75)' : 'var(--color-accent)',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '99px',
                                letterSpacing: '0.5px'
                              }}>
                                {activeEventTab === 'past' ? 'COMPLETED' : 'PUBLISHED'}
                              </span>
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,12,0.35), transparent 50%)' }} />
                          </div>

                          {/* Event Details Content */}
                          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                            <div>
                              <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {event.eventType || 'Event'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Code: {event.id}</span>
                              </div>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>{event.title}</h3>
                              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                                🗓️ {event.date} • 🕒 {event.time} • 📍 {event.location}
                              </p>

                              {/* Action Warnings */}
                              {event.id === '1' && (
                                <div style={{ marginTop: '10px', background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  ⚠️ Action needed: 3 dietary restrictions unconfirmed
                                </div>
                              )}

                              {/* Attendee avatar stack */}
                              {totalAttending > 0 && (
                                <div className="flex items-center gap-sm" style={{ marginTop: '12px' }}>
                                  <div className="avatar-stack">
                                    {rsvps.filter(r => r.status === 'going').slice(0, 4).map(r => (
                                      <img key={r.id} src={getAvatar(r.name || r.email)} alt={r.name} className="avatar-img avatar-sm" />
                                    ))}
                                    {totalAttending > 4 && (
                                      <span className="avatar-stack-more" style={{ width: '28px', height: '28px', fontSize: '0.65rem' }}>+{totalAttending - 4}</span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{totalAttending} attending</span>
                                </div>
                              )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid-3" style={{ gap: '12px', background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Going</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                  {going} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ {event.capacity} cap</span>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Revenue</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                  ${event.ticketPrice ? (going * event.ticketPrice).toLocaleString() : 'Free'}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Rating</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  ⭐ {event.rating || 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Capacity Progress Bar */}
                            <div>
                              <div className="flex justify-between" style={{ fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600 }}>
                                <span>Capacity utilization</span>
                                <span>{pctFull}% Full ({going} Confirmed {waitlistCount > 0 && `• ${waitlistCount} Waitlisted`})</span>
                              </div>
                              <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: pctFull >= 95 ? '#ef4444' : pctFull >= 80 ? '#f59e0b' : 'var(--color-primary)', width: `${pctFull}%` }}></div>
                              </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex gap-sm" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', flexWrap: 'wrap' }}>
                              <Button variant="primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleManageEvent(event.id)}>
                                Manage Event
                              </Button>
                              <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => { handleManageEvent(event.id); setSelectedEventTab('guests'); }}>
                                Guest List
                              </Button>
                              <Button variant="outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => { handleManageEvent(event.id); setSelectedEventTab('checkin'); }}>
                                Check-in staff
                              </Button>
                              <Button variant="ghost" style={{ padding: '8px' }} title="Duplicate" onClick={() => handleDuplicateEvent(event.id)}>
                                <RefreshCw size={16} />
                              </Button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/e/${event.id}`);
                                  alert('Event invitation link copied!');
                                }}
                                className="btn btn-ghost"
                                style={{ padding: '8px', color: 'var(--color-text-muted)', background: 'transparent' }}
                                title="Copy Link"
                              >
                                <ExternalLink size={18} />
                              </button>
                            </div>

                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (eventSearch || eventTypeFilter) ? (
                  <div className="empty-state" style={{ padding: '48px var(--spacing-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <Search size={44} style={{ opacity: 0.3, color: 'var(--color-text-muted)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>No events match your search</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', maxWidth: '380px' }}>
                      Nothing in this tab matches your search or type filter. Try a different keyword or clear the filters.
                    </p>
                    <Button variant="primary" className="flex items-center gap-xs" onClick={() => { setEventSearch(''); setEventTypeFilter(''); }}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '48px var(--spacing-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <img src={HERO_IMAGES.toast} alt="Friends celebrating" className="empty-state-img" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Nothing here yet</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', maxWidth: '380px' }}>
                      No events in this bucket right now. Spin up your next unforgettable gathering and watch the RSVPs roll in.
                    </p>
                    <Link to="/create">
                      <Button variant="primary" className="flex items-center gap-xs">
                        <Plus size={16} /> Create New Event
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EVENT MANAGER DETAILED VIEW & TABBED PANELS                               */}
          {/* ========================================================================= */}
          {selectedEventId && managedEvent && activeSidebar === 'events' && (
            <div>
              {/* Breadcrumb and Header */}
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <button 
                  onClick={() => setSelectedEventId(null)}
                  className="flex items-center gap-xs"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '12px', padding: 0 }}
                >
                  <ChevronLeft size={16} /> Back to Events
                </button>
                
                <div className="page-hero" style={{ padding: '24px', minHeight: '200px', marginBottom: '16px' }}>
                  <img src={getEventCover(managedEvent)} alt={managedEvent.title} className="page-hero-img" />
                  <div className="page-hero-overlay" />
                  <div className="page-hero-content" style={{ width: '100%', textAlign: 'left' }}>
                    <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: managedEvent.status === 'Published' ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)', color: 'white', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {managedEvent.status}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(255,255,255,0.18)', color: 'white' }}>
                        {managedEvent.eventType || 'Event'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                        Invite Link: {window.location.origin}/e/{managedEvent.id}
                      </span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{managedEvent.title}</h1>
                    <p style={{ fontSize: '0.9rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span className="flex items-center gap-xs"><Calendar size={14} /> {managedEvent.date}</span>
                      <span className="flex items-center gap-xs"><Clock size={14} /> {managedEvent.time}</span>
                      <span className="flex items-center gap-xs"><MapPin size={14} /> {managedEvent.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '16px' }}>
                  <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleExportCSV(managedEvent, managedEventRsvps)}
                      className="btn btn-outline"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent' }}
                    >
                      <Download size={15} /> Export CSV
                    </button>
                    <button
                      onClick={() => {
                        setBroadcastTarget('all');
                        setShowBroadcastModal(true);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Mail size={15} /> Message Guests
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/e/${managedEvent.id}`);
                        alert('Invitation link copied!');
                      }}
                      className="btn btn-outline"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', background: 'transparent' }}
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(managedEvent.title + ': ' + window.location.origin + '/e/' + managedEvent.id)}`, '_blank')}
                      style={{ padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Share WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs for Event Management */}
              <div className="flex gap-md" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '1px' }}>
                {[
                  { key: 'overview', label: 'Stats Overview', perm: 'guests_view' },
                  { key: 'guests', label: `Guest List (${managedEventRsvps.length})`, perm: 'guests_view' },
                  { key: 'polls', label: `Polls (${managedEventPolls.length})`, perm: 'guests_view' },
                  { key: 'comments', label: `Comments (${managedEventComments.length})`, perm: 'messaging_view' },
                  { key: 'edit', label: 'Details Editor', perm: 'settings_edit' },
                  { key: 'notifications', label: 'Notifications Schedule', perm: 'settings_view' },
                  { key: 'invitations', label: 'Manual Add', perm: 'guests_edit' },
                  { key: 'checkin', label: 'QR Scan Check-in', perm: 'checkin' },
                  { key: 'payments', label: 'Payments', perm: 'settings_view' },
                  { key: 'staff', label: 'Staff & Roles', perm: 'staff_manage' }
                ].filter(t => can(t.perm)).map(t => (
                  <button 
                    key={t.key}
                    onClick={() => setSelectedEventTab(t.key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0 0 12px 0',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: selectedEventTab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderBottom: selectedEventTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB: STATS OVERVIEW */}
              {selectedEventTab === 'overview' && (
                <div className="flex flex-col gap-lg">
                  <div className="grid-3" style={{ gap: '16px' }}>
                    <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                      <div className="stat-icon-tile stat-icon-blue" style={{ marginBottom: '12px' }}><TrendingUp size={20} /></div>
                      <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Conversion Rate</h4>
                      <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)' }}>
                        {Math.round((managedEventRsvps.length / (managedEventViews || 1)) * 100)}%
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {managedEventRsvps.length} RSVPs from {managedEventViews} views
                      </p>
                    </Card>
                    <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                      <div className="stat-icon-tile stat-icon-orange" style={{ marginBottom: '12px' }}><Users size={20} /></div>
                      <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Capacity Fill</h4>
                      <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#ca8a04' }}>
                        {Math.round((managedEventRsvps.filter(r => r.status === 'going').length / (managedEvent.capacity || 1)) * 100)}%
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {managedEventRsvps.filter(r => r.status === 'going').length} Confirmed vs {managedEvent.capacity} Cap
                      </p>
                    </Card>
                    <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface card-hover-lift">
                      <div className="stat-icon-tile stat-icon-green" style={{ marginBottom: '12px' }}><UserCheck size={20} /></div>
                      <h4 className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0', fontWeight: 600 }}>Check-in Rate</h4>
                      <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>
                        {Math.round((managedEventRsvps.filter(r => r.checkedIn).length / (managedEventRsvps.filter(r => r.status === 'going').length || 1)) * 100)}%
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {managedEventRsvps.filter(r => r.checkedIn).length} checked in of {managedEventRsvps.filter(r => r.status === 'going').length} Confirmed
                      </p>
                    </Card>
                  </div>

                  <div className="grid-2" style={{ gap: '16px' }}>
                    <Card style={{ padding: '16px', textAlign: 'center' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Going</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>{managedEventRsvps.filter(r => r.status === 'going').length}</p>
                    </Card>
                    
                    <Card style={{ padding: '16px', textAlign: 'center' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Waitlist</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ef4444' }}>{managedEventRsvps.filter(r => r.status === 'waitlist').length}</p>
                    </Card>
                  </div>
                </div>
              )}

              {/* SUB-TAB: GUEST LIST (SECTION 5) */}
              {selectedEventTab === 'guests' && (
                <div className="flex flex-col gap-lg">

                  {/* UC-02: Pending Approval queue */}
                  {pendingApprovalRsvps.length > 0 && (
                    <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🕒 Under Approval
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(245,158,11,0.12)', color: '#ca8a04', borderRadius: '12px' }}>
                            {pendingApprovalRsvps.length} pending
                          </span>
                        </h4>
                        {can('guests_approve') && (
                          <button
                            onClick={() => handleApproveAllPending(managedEvent.id)}
                            style={{ border: 'none', background: 'rgba(34,197,94,0.12)', color: '#16a34a', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            Approve All
                          </button>
                        )}
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Contact</th>
                              <th>Response</th>
                              <th>Requested</th>
                              <th>Answers</th>
                              <th>Decision</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingApprovalRsvps.map(rsvp => (
                              <tr key={rsvp.id}>
                                <td style={{ fontWeight: 600 }}>
                                  <div className="flex items-center gap-sm">
                                    <img src={getAvatar(rsvp.name || rsvp.email)} alt={rsvp.name} className="avatar-img avatar-sm" />
                                    {rsvp.name}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.8rem' }}>{rsvp.email}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{rsvp.phone}</div>
                                </td>
                                <td style={{ textTransform: 'capitalize' }}>{rsvp.status} · {rsvp.guestCount || 1} guest(s)</td>
                                <td>{new Date(rsvp.timestamp).toLocaleDateString()}</td>
                                <td>
                                  {Object.keys(rsvp.answers || {}).length > 0 ? (
                                    <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      {Object.entries(rsvp.answers).map(([q, ans]) => (
                                        <div key={q}><strong>{q}:</strong> {ans}</div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>None</span>
                                  )}
                                </td>
                                <td>
                                  {can('guests_approve') ? (
                                    <div className="flex gap-xs">
                                      <button
                                        onClick={() => handleApproveDecision(managedEvent.id, rsvp.id)}
                                        style={{ border: 'none', background: 'rgba(34,197,94,0.12)', color: '#16a34a', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleRejectDecision(managedEvent.id, rsvp.id)}
                                        style={{ border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>View only</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Rejected requests (UC-02: can be re-opened) */}
                  {managedEventRsvps.filter(r => r.approvalState === 'REJECTED').length > 0 && (
                    <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#dc2626' }}>Rejected requests</h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                          <thead><tr><th>Name</th><th>Contact</th><th>Reason</th><th></th></tr></thead>
                          <tbody>
                            {managedEventRsvps.filter(r => r.approvalState === 'REJECTED').map(rsvp => (
                              <tr key={rsvp.id}>
                                <td style={{ fontWeight: 600 }}>{rsvp.name}</td>
                                <td style={{ fontSize: '0.8rem' }}>{rsvp.email}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{rsvp.rejectionReason || '—'}</td>
                                <td>
                                  {can('guests_approve') && (
                                    <button
                                      onClick={() => handleReopenDecision(managedEvent.id, rsvp.id)}
                                      style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                                    >
                                      Re-open
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Waitlist (FIFO) */}
                  {(() => {
                    const waitlisted = managedEventRsvps.filter(r => r.status === 'waitlist')
                                               .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    if (waitlisted.length === 0) return null;
                    return (
                      <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⏳ Waitlist — Under Approval
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '12px' }}>
                              {waitlisted.length} queued
                            </span>
                          </h4>
                          <p className="text-muted" style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                            Event is at capacity ({managedEventRsvps.filter(r => r.status === 'going' && r.approvalState !== 'REJECTED').reduce((s, r) => s + (r.guestCount || 1), 0)}/{managedEvent.capacity} confirmed). Ordered by signup date — approve a guest to allow them in when a spot opens.
                          </p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table className="premium-table">
                            <thead>
                              <tr>
                                <th>Position</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Joined</th>
                                <th>Size</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {waitlisted.map((rsvp, index) => (
                                <tr key={rsvp.id}>
                                  <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>#{index + 1}</td>
                                  <td style={{ fontWeight: 600 }}>
                                    <div className="flex items-center gap-sm">
                                      <img src={getAvatar(rsvp.name || rsvp.email)} alt={rsvp.name} className="avatar-img avatar-sm" />
                                      {rsvp.name}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.8rem' }}>{rsvp.email}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{rsvp.phone}</div>
                                  </td>
                                  <td>{new Date(rsvp.timestamp).toLocaleDateString()}</td>
                                  <td>{rsvp.guestCount || 1}</td>
                                  <td>
                                    {can('guests_approve') ? (
                                      <div className="flex gap-xs">
                                        <button
                                          onClick={() => handleApproveDecision(managedEvent.id, rsvp.id)}
                                          style={{ border: 'none', background: 'rgba(34,197,94,0.12)', color: '#16a34a', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                                        >
                                          Approve &amp; Allow In
                                        </button>
                                        <button
                                          onClick={() => handleRejectDecision(managedEvent.id, rsvp.id)}
                                          style={{ border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>View only</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    );
                  })()}

                  {/* Confirmed list */}
                  <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        👥 Registered Attendees
                      </h4>

                      <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '300px', minWidth: '180px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Search guests by name, email, phone..."
                          value={guestSearch}
                          onChange={(e) => setGuestSearch(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.82rem', outline: 'none', background: 'var(--color-surface)', fontFamily: 'inherit' }}
                        />
                      </div>

                      {/* Bulk actions tool bar */}
                      {selectedGuestIds.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface-hover)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{selectedGuestIds.length} Selected:</span>
                          {can('guests_edit') && <button onClick={handleBulkCheckIn} style={{ border: 'none', background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Check-in</button>}
                          {can('messaging_reply') && <button onClick={handleBulkMessage} style={{ border: 'none', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Message</button>}
                          {can('guests_export') && <button onClick={handleBulkExport} style={{ border: 'none', background: 'rgba(71,85,105,0.1)', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Export</button>}
                          <button onClick={() => setSelectedGuestIds([])} style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      )}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="premium-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>
                              <input 
                                type="checkbox"
                                checked={selectedGuestIds.length === managedEventRsvps.filter(r => r.status !== 'waitlist').length && selectedGuestIds.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGuestIds(managedEventRsvps.filter(r => r.status !== 'waitlist').map(r => r.id));
                                  } else {
                                    setSelectedGuestIds([]);
                                  }
                                }}
                              />
                            </th>
                            <th>Name</th>
                            <th>Contact Details</th>
                            <th>Status</th>
                            <th>Check-in Status</th>
                            <th>Custom Answers</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {managedEventRsvps.filter(r => {
                            if (r.status !== 'going') return false;
                            // Pending/rejected requests live in their own sections above
                            if (r.approvalState === 'UNDER_APPROVAL' || r.approvalState === 'REJECTED') return false;
                            const q = guestSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (r.name && r.name.toLowerCase().includes(q)) ||
                                   (r.email && r.email.toLowerCase().includes(q)) ||
                                   (r.phone && r.phone.toLowerCase().includes(q));
                          }).map(rsvp => (
                            <tr key={rsvp.id}>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedGuestIds.includes(rsvp.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedGuestIds([...selectedGuestIds, rsvp.id]);
                                    } else {
                                      setSelectedGuestIds(selectedGuestIds.filter(id => id !== rsvp.id));
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ fontWeight: 600 }}>
                                <div className="flex items-center gap-sm">
                                  <img src={getAvatar(rsvp.name || rsvp.email)} alt={rsvp.name} className="avatar-img" />
                                  <span>
                                    {rsvp.name}
                                    {rsvp.answers?.['Any food allergies?'] && rsvp.answers['Any food allergies?'] !== 'None' && (
                                      <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: '3px', marginLeft: '6px', fontWeight: 700 }} title={rsvp.answers['Any food allergies?']}>
                                        ⚠️ DIET
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.8rem' }}>{rsvp.email}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rsvp.phone}</div>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', textTransform: 'capitalize',
                                  background: rsvp.status === 'going' ? 'rgba(0,200,83,0.12)' : false ? 'rgba(239,68,68,0.12)' : 'rgba(255,107,53,0.12)',
                                  color: rsvp.status === 'going' ? '#00963f' : false ? '#ef4444' : '#e0531f'
                                }}>
                                  {'● Registered'}
                                </span>
                              </td>
                              <td>
                                <div className="flex items-center gap-xs">
                                  <input
                                    type="checkbox"
                                    checked={rsvp.checkedIn}
                                    disabled={!can('guests_edit')}
                                    onChange={() => handleToggleCheckin(managedEvent.id, rsvp.id, rsvp.checkedIn)}
                                    style={{ width: '16px', height: '16px', cursor: can('guests_edit') ? 'pointer' : 'not-allowed' }}
                                  />
                                  <span style={{ fontSize: '0.75rem', color: rsvp.checkedIn ? '#16a34a' : 'var(--color-text-muted)' }}>
                                    {rsvp.checkedIn ? 'Checked in' : 'Not arrived'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {Object.keys(rsvp.answers || {}).length > 0 ? (
                                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {Object.entries(rsvp.answers).map(([q, ans]) => (
                                      <div key={q}><strong>{q}:</strong> {ans}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None</span>
                                )}
                              </td>
                              <td>
                                {can('guests_edit') ? (
                                  <button
                                    onClick={() => handleDeleteRSVP(managedEvent.id, rsvp.id)}
                                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                    title="Remove Guest"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* SUB-TAB: POLLS */}
              {selectedEventTab === 'polls' && (
                <div className="grid-2" style={{ gap: '20px' }}>
                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Active Polls & Surveys</h4>
                    {managedEventPolls.length > 0 ? (
                      <div className="flex flex-col gap-md">
                        {managedEventPolls.map(poll => {
                          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                          return (
                            <div key={poll.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                              <h5 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Q: {poll.question}</h5>
                              <div className="flex flex-col gap-xs">
                                {poll.options.map(opt => {
                                  const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                  return (
                                    <div key={opt.id}>
                                      <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                                        <span>{opt.text}</span>
                                        <span style={{ fontWeight: 600 }}>{opt.votes} votes ({percent}%)</span>
                                      </div>
                                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${percent}%` }}></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state" style={{ padding: '24px 8px' }}>
                        <img src={ALL_COVERS[3]} alt="Event crowd" className="empty-state-img" style={{ width: '160px', height: '110px' }} />
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No active polls yet — ask your guests what they want using the form alongside.</p>
                      </div>
                    )}
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Create Guest Poll</h4>
                    <form onSubmit={handleCreatePollSubmit} className="flex flex-col gap-sm">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Question</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Which drinks should we stock?" 
                          value={newPollQuestion}
                          onChange={(e) => setNewPollQuestion(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Options</label>
                        {newPollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-xs items-center" style={{ marginBottom: '6px' }}>
                            <input 
                              type="text" 
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const opts = [...newPollOptions];
                                opts[idx] = e.target.value;
                                setNewPollOptions(opts);
                              }}
                              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                            />
                            {newPollOptions.length > 2 && (
                              <button 
                                type="button" 
                                onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== idx))}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => setNewPollOptions([...newPollOptions, ''])}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          + Add Option
                        </button>
                      </div>
                      <Button variant="primary" type="submit">Publish Poll</Button>
                    </form>
                  </Card>
                </div>
              )}

              {/* SUB-TAB: COMMENTS */}
              {selectedEventTab === 'comments' && (
                <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Guest Comments Board</h4>
                  {managedEventComments.length > 0 ? (
                    <div className="flex flex-col gap-md">
                      {[...managedEventComments]
                        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                        .map(comment => (
                          <div key={comment.id} className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', background: comment.pinned ? 'rgba(255,107,53,0.01)' : 'transparent', padding: comment.pinned ? '12px' : '0 0 12px 0', borderRadius: '8px' }}>
                            <div className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
                              <img src={getAvatar(comment.name)} alt={comment.name} className="avatar-img avatar-sm" />
                              <div>
                              <div className="flex items-center gap-xs" style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.name}</span>
                                {comment.pinned && <span style={{ fontSize: '0.65rem', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>PINNED</span>}
                                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '6px' }}>{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', margin: 0 }}>{comment.text}</p>
                              </div>
                            </div>
                            <div className="flex gap-sm">
                              <button
                                onClick={() => {
                                  mockStore.pinComment(managedEvent.id, comment.id);
                                  loadDashboardData();
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: comment.pinned ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                                title="Pin Comment"
                              >
                                📌
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm("Delete this comment?")) {
                                    mockStore.deleteComment(managedEvent.id, comment.id);
                                    loadDashboardData();
                                  }
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                                title="Delete Comment"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '32px 8px' }}>
                      <img src={HERO_IMAGES.toast} alt="Friends toasting" className="empty-state-img" />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>No comments yet</h4>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', maxWidth: '360px' }}>
                        When guests post on the event board, their questions and shout-outs will show up here for you to pin or moderate.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* SUB-TAB: DETAILS EDITOR */}
              {selectedEventTab === 'edit' && (
                <Card style={{ padding: '24px', textAlign: 'left' }} className="glass-surface">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Event Settings Editor</h4>
                  <form onSubmit={handleEditEventSubmit} className="flex flex-col gap-md" style={{ maxWidth: '640px' }}>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Event Title *</label>
                      <input 
                        type="text" 
                        required 
                        value={editEventForm.title} 
                        onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    </div>

                    <div className="grid-2" style={{ gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Date *</label>
                        <input 
                          type="date" 
                          required 
                          value={editEventForm.date} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })} 
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Time *</label>
                        <input 
                          type="time" 
                          required 
                          value={editEventForm.time} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })} 
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Location Venue Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={editEventForm.location} 
                        onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    </div>

                    <div className="grid-2" style={{ gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Max Capacity *</label>
                        <input 
                          type="number" 
                          required 
                          value={editEventForm.capacity} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, capacity: parseInt(e.target.value, 10) })} 
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Ticket Price ($)</label>
                        <input 
                          type="number" 
                          value={editEventForm.ticketPrice} 
                          onChange={(e) => setEditEventForm({ ...editEventForm, ticketPrice: parseFloat(e.target.value) })} 
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Event Description</label>
                      <textarea 
                        rows="5"
                        value={editEventForm.description} 
                        onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>Visibility & RSVP Settings</span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Event Privacy</label>
                          <select 
                            value={editEventForm.privacy} 
                            onChange={(e) => setEditEventForm({ ...editEventForm, privacy: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}
                          >
                            <option value="Public">Public (Listed in discover)</option>
                            <option value="Private">Private (Direct link only)</option>
                            <option value="Unlisted">Unlisted (Profile lists only)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>RSVP Status</label>
                          <select
                            value={editEventForm.rsvpStatus}
                            onChange={(e) => setEditEventForm({ ...editEventForm, rsvpStatus: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '0.85rem' }}
                          >
                            <option value="Open">Open (Accepting RSVPs)</option>
                            <option value="Closed">Closed (Disabled bookings)</option>
                          </select>
                        </div>
                      </div>

                      {/* UC-02 & UC-09: approval workflow + per-event messaging */}
                      <div className="flex justify-between items-center" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><UserCheck size={14} className="text-primary" /> Require RSVP approval</strong>
                          <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>New RSVPs are held as “Under Approval” until you approve or reject them.</p>
                        </div>
                        <label className="switch" style={{ flexShrink: 0 }}>
                          <input type="checkbox" checked={editEventForm.approvalRequired} onChange={(e) => setEditEventForm({ ...editEventForm, approvalRequired: e.target.checked })} />
                          <span className="slider"></span>
                        </label>
                      </div>

                      <div className="flex justify-between items-center" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px 14px' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14} className="text-primary" /> Allow guest messaging</strong>
                          <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.75rem' }}>Guests can message you in-app. Turning this off hides messaging from guests (history is kept).</p>
                        </div>
                        <label className="switch" style={{ flexShrink: 0 }}>
                          <input type="checkbox" checked={editEventForm.messagingEnabled} onChange={(e) => setEditEventForm({ ...editEventForm, messagingEnabled: e.target.checked })} />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Series Cadence Recurrence</span>
                      <select 
                        value={seriesType} 
                        onChange={(e) => setSeriesType(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                      >
                        <option value="None">No Recurrence (Single Occurrence)</option>
                        <option value="Weekly">Weekly (Create 3 additional occurrences)</option>
                        <option value="Monthly">Monthly (Create 3 additional occurrences)</option>
                      </select>
                    </div>

                    <div className="flex gap-sm" style={{ marginTop: '12px' }}>
                      <Button variant="primary" type="submit">Save Settings</Button>
                      <Button variant="ghost" type="button" onClick={() => handleManageEvent(selectedEventId)}>Reset</Button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteEvent(managedEvent.id)}
                        className="btn btn-outline"
                        style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                      >
                        Delete Event
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              {/* SUB-TAB: NOTIFICATIONS OUTBOX */}
              {selectedEventTab === 'notifications' && (
                <div className="flex flex-col gap-lg">
                  <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Notification Outbox & Scheduled Reminders</h4>
                    <form onSubmit={handleNotificationsSubmit} className="flex flex-col gap-md" style={{ maxWidth: '640px' }}>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Send Confirmation Email</strong>
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Send email confirmation immediately after guest RSVPs.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={editEventForm.sendRsvpConfirmationEmail}
                          onChange={(e) => setEditEventForm({ ...editEventForm, sendRsvpConfirmationEmail: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Send Confirmation SMS</strong>
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Send WhatsApp/SMS alert confirmation.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={editEventForm.sendRsvpConfirmationSms}
                          onChange={(e) => setEditEventForm({ ...editEventForm, sendRsvpConfirmationSms: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Send 24-Hour Pre-event Reminder</strong>
                          <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Send auto-reminder alert 24 hours before start.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={editEventForm.sendPreEventReminders}
                          onChange={(e) => setEditEventForm({ ...editEventForm, sendPreEventReminders: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                      </div>

                      <Button variant="primary" type="submit" style={{ alignSelf: 'start', marginTop: '10px' }}>Save Schedules</Button>
                    </form>
                  </Card>

                  {/* Dispatched Logs */}
                  <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Dispatched Logs</h4>
                    </div>
                    {mockStore.getNotificationLogs(managedEvent.id).length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Recipient</th>
                              <th>Channel</th>
                              <th>Alert</th>
                              <th>Subject</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockStore.getNotificationLogs(managedEvent.id).map(log => (
                              <tr key={log.id}>
                                <td style={{ fontSize: '0.8rem' }}>{new Date(log.sentAt).toLocaleTimeString()}</td>
                                <td>{log.guestEmail}</td>
                                <td>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)' }}>
                                    {log.channel}
                                  </span>
                                </td>
                                <td style={{ textTransform: 'capitalize' }}>{log.type}</td>
                                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.subject}</td>
                                <td>
                                  <Button variant="ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setViewLogDetail(log)}>View</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div className="stat-icon-tile stat-icon-blue"><Send size={20} /></div>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No messages dispatched yet — confirmations and reminders will be logged here.</p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* SUB-TAB: MANUAL ADD */}
              {selectedEventTab === 'invitations' && (
                <div className="grid-2" style={{ gap: '20px' }}>
                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Add Guest Manually</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Directly register offline tickets or VIP guests.</p>
                    {manualInviteSent && (
                      <div style={{ padding: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', color: '#16a34a', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                        Guest RSVP added successfully!
                      </div>
                    )}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const capacity = managedEvent.capacity;
                      const attending = managedEventRsvps.filter(r => r.status === 'going').length;
                      if (attending + manualInviteForm.guestCount > capacity) {
                        alert(`Cannot add guests. Remaining spots: ${capacity - attending}.`);
                        return;
                      }
                      mockStore.createManualInvitation(selectedEventId, manualInviteForm);
                      setManualInviteSent(true);
                      setManualInviteForm({ name: '', email: '', phone: '', guestCount: 1 });
                      setTimeout(() => setManualInviteSent(false), 2000);
                      loadDashboardData();
                    }} className="flex flex-col gap-sm">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Full Name *</label>
                        <input required type="text" value={manualInviteForm.name} onChange={(e) => setManualInviteForm({ ...manualInviteForm, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Email *</label>
                        <input required type="email" value={manualInviteForm.email} onChange={(e) => setManualInviteForm({ ...manualInviteForm, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Phone</label>
                        <input type="tel" placeholder="+1 (555) 000-0000" value={manualInviteForm.phone} onChange={(e) => setManualInviteForm({ ...manualInviteForm, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Guests Size</label>
                        <input type="number" min="1" max={managedEvent.maxGuestsPerRsvp} value={manualInviteForm.guestCount} onChange={(e) => setManualInviteForm({ ...manualInviteForm, guestCount: parseInt(e.target.value, 10) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      </div>
                      <div className="flex gap-sm">
                        <Button variant="primary" type="submit" style={{ flex: 1 }}>Register & Notify</Button>
                        <button type="button" onClick={() => {
                          if (!manualInviteForm.phone) { alert('Phone number required for WhatsApp'); return; }
                          const msg = `You're invited to ${managedEvent.title} on ${managedEvent.date}. RSVP: ${window.location.origin}/e/${managedEvent.id}`;
                          window.open(`https://wa.me/${manualInviteForm.phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }} style={{ padding: '10px 14px', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                          WhatsApp
                        </button>
                      </div>
                    </form>
                  </Card>

                  {/* Manual Guest logs */}
                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Invitations outbox</h4>
                    <div style={{ overflowY: 'auto', maxHeight: '380px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {managedEventRsvps.map(rsvp => (
                        <div key={rsvp.id} style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="flex items-center gap-sm">
                            <img src={getAvatar(rsvp.name || rsvp.email)} alt={rsvp.name} className="avatar-img avatar-sm" />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rsvp.name} {rsvp.isManualInvite && <span style={{ fontSize: '0.65rem', background: 'rgba(255,107,53,0.12)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: '3px' }}>Manual</span>}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rsvp.email}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: rsvp.status === 'going' ? 'rgba(0,200,83,0.12)' : false ? 'rgba(239,68,68,0.12)' : 'rgba(255,107,53,0.12)', color: rsvp.status === 'going' ? '#00963f' : false ? '#ef4444' : '#e0531f' }}>
                            {rsvp.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* SUB-TAB: QR SCAN CHECK-IN */}
              {selectedEventTab === 'checkin' && (
                <div className="grid-2" style={{ gap: '20px' }}>
                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>QR Ticket Validator</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Input ticket pass ID (e.g. r1, r2) or scan QR code to verify entries.</p>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Active Scanner Operator</label>
                      <select 
                        value={activeScannerStaff}
                        onChange={(e) => setActiveScannerStaff(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      >
                        {activeStaffList.map(s => (
                          <option key={s.email} value={s.name}>{s.name} ({s.role})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-sm" style={{ marginBottom: '16px' }}>
                      <input 
                        type="text" 
                        placeholder="Enter Ticket Pass ID" 
                        value={checkinInput}
                        onChange={(e) => setCheckinInput(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyCheckin(checkinInput)}
                      />
                      <Button variant="primary" onClick={() => handleVerifyCheckin(checkinInput)}>Verify</Button>
                    </div>

                    {checkinResult && (
                      <div style={{
                        padding: '14px', borderRadius: '8px', 
                        border: `1.5px solid ${checkinResult.type === 'success' ? '#22c55e' : checkinResult.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
                        background: checkinResult.type === 'success' ? 'rgba(34,197,94,0.08)' : checkinResult.type === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
                      }}>
                        <strong style={{ display: 'block', color: checkinResult.type === 'success' ? '#15803d' : checkinResult.type === 'warning' ? '#b45309' : '#dc2626', marginBottom: '4px' }}>
                          {checkinResult.type === 'success' ? '✓ ENTRY APPROVED' : checkinResult.type === 'warning' ? '⚠️ DUPLICATE ENTRY' : '✕ ENTRY DENIED'}
                        </strong>
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>{checkinResult.message}</p>
                        {checkinResult.rsvp && (
                          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <div>Guest: <strong>{checkinResult.rsvp.name}</strong></div>
                            <div>Email: {checkinResult.rsvp.email}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>

                  <Card style={{ padding: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Gate Attendance Stats</h4>
                    <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>
                          {managedEventRsvps.filter(r => r.checkedIn).length}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Checked In</span>
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>
                          {managedEventRsvps.filter(r => (r.status === 'going') && !r.checkedIn).length}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Arriving Soon</span>
                      </div>
                    </div>

                    <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Pending Guest Arrivals</h5>
                    <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {managedEventRsvps.filter(r => (r.status === 'going') && !r.checkedIn).map(rsvp => (
                        <div key={rsvp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-hover)', padding: '8px 12px', borderRadius: '6px' }}>
                          <span className="flex items-center gap-sm" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            <img src={getAvatar(rsvp.name || rsvp.email)} alt={rsvp.name} className="avatar-img avatar-sm" />
                            {rsvp.name}
                          </span>
                          <button 
                            onClick={() => {
                              mockStore.updateRSVP(selectedEventId, rsvp.id, { checkedIn: true }, activeScannerStaff);
                              loadDashboardData();
                              setCheckinResult({ type: 'success', rsvp: { ...rsvp, checkedIn: true }, message: `${rsvp.name} checked in successfully.` });
                            }}
                            style={{ border: 'none', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Check-in
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* SUB-TAB: PAYMENTS */}
              {selectedEventTab === 'payments' && (
                <div className="flex flex-col gap-lg">
                  <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary)' }}>Stripe Connect Setup</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Link bank payouts details to sell paid tickets seamlessly on SafalEvents.</p>
                    
                    <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
                      <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Stripe Payout Connection</h5>
                        <div className="flex items-center gap-xs" style={{ marginBottom: '16px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: stripeConnected ? '#22c55e' : '#cbd5e1' }}></span>
                          <strong>{stripeConnected ? 'CONNECTED' : 'DISCONNECTED'}</strong>
                        </div>
                        <button 
                          onClick={() => {
                            setStripeConnected(!stripeConnected);
                            alert(stripeConnected ? 'Stripe disconnected.' : 'Stripe connected successfully!');
                          }}
                          className="btn btn-primary"
                          style={{ border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {stripeConnected ? 'Disconnect Merchant' : 'Connect Stripe Account'}
                        </button>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const user = mockStore.getCurrentUser();
                        if (user && user.email) {
                          mockStore.saveBankAccount(user.email, bankForm);
                          alert('Bank routing saved!');
                        }
                      }} className="flex flex-col gap-sm">
                        <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>Direct Deposit Bank Setup</h5>
                        <div className="grid-2" style={{ gap: '8px' }}>
                          <input type="text" required placeholder="Bank Name" value={bankForm.bankName || ''} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                          <input type="text" required placeholder="Account Holder" value={bankForm.holderName || ''} onChange={(e) => setBankForm({ ...bankForm, holderName: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                        </div>
                        <div className="grid-2" style={{ gap: '8px' }}>
                          <input type="text" required placeholder="Routing Number (9 digits)" value={bankForm.routingNumber || ''} onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value.replace(/\D/g,'').substring(0,9) })} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                          <input type="text" required placeholder="Account Number" value={bankForm.accountNumber || ''} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g,'').substring(0,12) })} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                        </div>
                        <Button type="submit" variant="outline" style={{ alignSelf: 'end', padding: '8px 12px', fontSize: '0.85rem' }}>Save Bank Routing</Button>
                      </form>
                    </div>
                  </Card>
                </div>
              )}

              {/* SUB-TAB: STAFF & ROLES (UC-06/07) */}
              {selectedEventTab === 'staff' && (
                <div className="flex flex-col gap-lg">
                  <div className="grid-2" style={{ gap: '20px' }}>
                    {/* Team members for this event */}
                    <Card style={{ padding: '20px', textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Team members</h4>
                      <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0 0 12px 0' }}>Invite people to help run this event. Each member only sees and does what their role permits.</p>
                      <form onSubmit={handleInviteStaffSubmit} className="flex flex-col gap-sm" style={{ marginBottom: '16px', background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Invite a team member</span>
                        <div className="grid-2" style={{ gap: '6px' }}>
                          <input required placeholder="Name" value={inviteStaffForm.name} onChange={(e) => setInviteStaffForm({ ...inviteStaffForm, name: e.target.value })} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }} />
                          <input required type="email" placeholder="Email" value={inviteStaffForm.email} onChange={(e) => setInviteStaffForm({ ...inviteStaffForm, email: e.target.value })} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }} />
                        </div>
                        <div className="flex gap-sm">
                          <select value={inviteStaffForm.roleId} onChange={(e) => setInviteStaffForm({ ...inviteStaffForm, roleId: e.target.value })} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                            {mockStore.getRoles().map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <Button type="submit" variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Send Invite</Button>
                        </div>
                      </form>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Owner row (implicit full access) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px' }}>
                          <div className="flex items-center gap-sm">
                            <img src={getAvatar(managedEvent.hostEmail)} alt={managedEvent.hostName} className="avatar-img avatar-sm" />
                            <div>
                              <strong style={{ fontSize: '0.85rem' }}>{managedEvent.hostName} <span style={{ fontSize: '0.7rem' }}>👑</span></strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Host (owner) • Full access</div>
                            </div>
                          </div>
                          <span className="admin-badge admin-badge-active">Owner</span>
                        </div>

                        {mockStore.getStaff(selectedEventId).map(s => {
                          const role = mockStore.getRoleById(s.roleId);
                          return (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: '8px' }}>
                              <div className="flex items-center gap-sm">
                                <img src={getAvatar(s.email)} alt={s.name} className="avatar-img avatar-sm" />
                                <div>
                                  <strong style={{ fontSize: '0.85rem' }}>{s.name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{role ? role.name : 'No role'} • {s.email}</div>
                                  {s.inviteId && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                      Invite ID: <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace' }}>{s.inviteId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-sm">
                                <span className={`admin-badge ${s.status === 'ACTIVE' ? 'admin-badge-active' : 'admin-badge-pending'}`}>
                                  {s.status === 'ACTIVE' ? 'Active' : 'Invited'}
                                </span>
                                {s.status === 'INVITED' && (
                                  <button onClick={() => handleAcceptStaff(s.id)} title="Mark invite as accepted" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>Accept</button>
                                )}
                                <button onClick={() => handleRemoveStaff(s.id)} title="Remove" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                              </div>
                            </div>
                          );
                        })}
                        {mockStore.getStaff(selectedEventId).length === 0 && (
                          <p className="text-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0 0' }}>No team members yet. Invite someone above.</p>
                        )}
                      </div>
                    </Card>

                    {/* Roles & permissions */}
                    <Card style={{ padding: '20px', textAlign: 'left' }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Roles &amp; permissions</h4>
                        <Button type="button" variant="outline" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => handleOpenRoleBuilder(null)}>
                          <Plus size={13} style={{ verticalAlign: '-2px' }} /> New role
                        </Button>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0 0 12px 0' }}>A role is a named set of permissions. Default-deny: anything not granted is hidden and blocked.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mockStore.getRoles().map(role => {
                          const grantedCount = Object.values(role.permissions || {}).filter(Boolean).length;
                          return (
                            <div key={role.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: '8px' }}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <strong style={{ fontSize: '0.88rem' }}>{role.name}{role.builtIn && <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: 'var(--color-text-muted)' }}>built-in</span>}</strong>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{role.description}</div>
                                </div>
                                <div className="flex items-center gap-sm">
                                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{grantedCount} perms</span>
                                  <button onClick={() => handleOpenRoleBuilder(role)} style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>Edit</button>
                                  {!role.builtIn && (
                                    <button onClick={() => handleDeleteRole(role.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* Role builder (create / edit) */}
                  {showRoleBuilder && (
                    <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>{roleBuilder.id ? 'Edit role' : 'Create role'}</h4>
                      <form onSubmit={handleSaveRole} className="flex flex-col gap-md">
                        <div className="grid-2" style={{ gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Role name *</label>
                            <input required value={roleBuilder.name} onChange={(e) => setRoleBuilder({ ...roleBuilder, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                            <input value={roleBuilder.description} onChange={(e) => setRoleBuilder({ ...roleBuilder, description: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                          {[
                            { key: 'guests_view', label: 'View guest list' },
                            { key: 'guests_approve', label: 'Approve / reject RSVPs' },
                            { key: 'guests_edit', label: 'Edit guests & manual add' },
                            { key: 'guests_export', label: 'Export guest list' },
                            { key: 'checkin', label: 'Gate check-in (QR scan)' },
                            { key: 'messaging_view', label: 'View messages' },
                            { key: 'messaging_reply', label: 'Reply to guests' },
                            { key: 'history_view', label: 'View history' },
                            { key: 'settings_view', label: 'View settings' },
                            { key: 'settings_edit', label: 'Edit settings' },
                            { key: 'staff_manage', label: 'Manage staff & roles' }
                          ].map(p => (
                            <label key={p.key} className="flex items-center gap-xs" style={{ fontSize: '0.8rem', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!roleBuilder.permissions[p.key]}
                                onChange={(e) => setRoleBuilder({ ...roleBuilder, permissions: { ...roleBuilder.permissions, [p.key]: e.target.checked } })}
                              />
                              {p.label}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-sm">
                          <Button type="submit" variant="primary">{roleBuilder.id ? 'Save role' : 'Create role'}</Button>
                          <Button type="button" variant="ghost" onClick={() => { setShowRoleBuilder(false); setRoleBuilder(emptyRoleBuilder); }}>Cancel</Button>
                        </div>
                      </form>
                    </Card>
                  )}

                  <div>
                    <Card style={{ padding: '20px', textAlign: 'left' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Auto-Reply Notification Rules</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {autoReplyRules.map(r => (
                          <div key={r.id} style={{ padding: '10px 12px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem' }}>Trigger: {r.trigger}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Condition: {r.condition} &rarr; Action: {r.action}</div>
                            </div>
                            <button onClick={() => handleDeleteRule(r.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                      
                      <form onSubmit={handleAddRule} className="flex flex-col gap-sm" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Create auto-rule trigger</span>
                        <div className="grid-3" style={{ gap: '6px' }}>
                          <select value={newRule.trigger} onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                            <option value="On Guest RSVP">On Guest RSVP</option>
                            <option value="On QR Check-in">On QR Check-in</option>
                          </select>
                          <select value={newRule.condition} onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                            <option value="If Status is Going">If Status is Going</option>
                            <option value="If Status is Waitlist">If Status is Waitlist</option>
                          </select>
                          <select value={newRule.action} onChange={(e) => setNewRule({ ...newRule, action: e.target.value })} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                            <option value="Send Confirmation email (rsvp)">Send Confirmation (Email)</option>
                            <option value="Send Welcoming text alert">Send Alert (SMS)</option>
                          </select>
                        </div>
                        <Button type="submit" variant="outline" style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'end' }}>Add Auto-rule</Button>
                      </form>
                    </Card>
                  </div>

                  {/* Audit Logs security table */}
                  <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Security Audit Trail Logs</h4>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="premium-table">
                        <thead>
                          <tr>
                            <th>Timestamp</th>
                            <th>Operator</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockStore.getAuditTrail().filter(l => l.eventId === selectedEventId).map(l => (
                            <tr key={l.id}>
                              <td style={{ fontSize: '0.8rem' }}>{new Date(l.timestamp).toLocaleString()}</td>
                              <td style={{ fontWeight: 600 }}>{l.actor}</td>
                              <td>{l.action}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 7: EARNINGS & PAYOUTS                                             */}
          {/* ========================================================================= */}
          {activeSidebar === 'earnings' && (
            <div className="flex flex-col gap-xl">
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Earnings & Payouts</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Review ticket sale transactions and bank payout logs.</p>
              </div>

              <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
                
                {/* Available balance block */}
                <Card style={{ padding: '24px', textAlign: 'left' }} className="glass-surface">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div className="stat-icon-tile stat-icon-green"><DollarSign size={22} /></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', background: 'rgba(0,200,83,0.12)', color: '#00963f', borderRadius: '20px' }}>
                      Auto-transfers enabled
                    </span>
                  </div>
                  <h3 className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0', fontWeight: 600 }}>
                    Available Payout Balance
                  </h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 20px 0', lineHeight: 1 }}>
                    ${availableBalance.toLocaleString()}
                  </p>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleBankTransfer} 
                    disabled={transferring || availableBalance === 0}
                    style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
                  >
                    {transferring ? 'Connecting to Bank API...' : availableBalance > 0 ? `Transfer $${availableBalance} to Chase Bank` : 'No balance to withdraw'}
                  </Button>
                </Card>

                {/* Upcoming payouts block */}
                <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Upcoming Schedule</h4>
                  <div className="flex flex-col gap-sm">
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>Summer Rooftop Mixer Payout</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimated payout date: June 15, 2026</span>
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>$1,500.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>Tech Startup Meetup Ticket Sales</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimated payout date: June 22, 2026</span>
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>$2,750.00</strong>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transactions log tables */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>Payout Logs History</h2>
                <Card style={{ padding: 0, textAlign: 'left' }} className="glass-surface">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Transfer Date</th>
                          <th>Payout ID</th>
                          <th>Routing Bank</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutHistory.map(po => (
                          <tr key={po.id}>
                            <td>{po.date}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{po.id}</td>
                            <td>{po.bank}</td>
                            <td>
                              <span style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                                background: po.status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                                color: po.status === 'Paid' ? '#16a34a' : '#ca8a04'
                              }}>
                                {po.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>${po.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Stripe Connection config fields inside payouts page */}
              <Card style={{ padding: '20px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Stripe Direct-Deposit Config</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>Verify your bank routing routing numbers below to ensure seamless payouts transfer.</p>
                <div style={{ maxWidth: '480px' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert("Bank payouts connection verified & saved.");
                  }} className="flex flex-col gap-sm">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Bank Name</label>
                      <input type="text" value={bankForm.bankName || 'Chase Bank'} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Account Number</label>
                      <input type="password" value={bankForm.accountNumber || '1234567890'} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                    </div>
                    <Button type="submit" variant="outline" style={{ alignSelf: 'start' }}>Save Payout Routing</Button>
                  </form>
                </div>
              </Card>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 8: MESSAGES & COMMUNICATION HUB                                    */}
          {/* ========================================================================= */}
          {activeSidebar === 'messages' && (
            <div className="flex flex-col gap-lg" style={{ height: 'calc(100vh - 120px)' }}>
              
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Messages & Communication</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Answer guest questions, verify requests, and coordinate announcements.</p>
              </div>

              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '320px 1fr',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)'
              }}>
                
                {/* Left conversations list */}
                <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                    <input 
                      type="text" 
                      placeholder="Search conversations..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(c => {
                      const lastMsg = c.messages[c.messages.length - 1];
                      const isActive = c.id === activeConversationId;
                      return (
                        <div 
                          key={c.id}
                          onClick={() => {
                            setActiveConversationId(c.id);
                            // Mark read (persist for real guest threads)
                            if (String(c.id).startsWith('conv_')) {
                              mockStore.markConversationRead(c.id, 'host');
                            }
                            setConversations(conversations.map(conv => conv.id === c.id ? { ...conv, unread: false } : conv));
                          }}
                          style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            background: isActive ? 'rgba(255,107,53,0.06)' : 'transparent',
                            textAlign: 'left',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'start',
                            position: 'relative'
                          }}
                        >
                          <img src={getAvatar(c.guestName || c.guestEmail)} alt={c.guestName} className="avatar-img" style={{ flexShrink: 0 }} />
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{c.guestName}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{lastMsg?.time}</span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                              {c.eventTitle}
                            </span>
                            <p style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: c.unread ? 'var(--color-text)' : 'var(--color-text-muted)',
                              fontWeight: c.unread ? 600 : 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {lastMsg?.text}
                            </p>
                          </div>

                          {c.unread && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#ff3b30',
                              position: 'absolute',
                              right: '16px',
                              bottom: '16px'
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Active Message Thread */}
                {activeConversation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
                    
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="flex items-center gap-sm">
                        <img src={getAvatar(activeConversation.guestName || activeConversation.guestEmail)} alt={activeConversation.guestName} className="avatar-img" />
                        <div>
                          <strong style={{ fontSize: '1rem', display: 'block' }}>{activeConversation.guestName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Conversation regarding: <strong>{activeConversation.eventTitle}</strong> ({activeConversation.guestEmail})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-xs">
                        <button 
                          onClick={() => alert(`Flagged conversation with ${activeConversation.guestName}`)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent' }}
                        >
                          Flag Chat
                        </button>
                      </div>
                    </div>

                    {/* Messages Thread Bubbles */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeConversation.messages.map((m, idx) => {
                        const isHost = m.sender === 'host';
                        return (
                          <div 
                            key={idx}
                            style={{
                              alignSelf: isHost ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{
                              background: isHost ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                              color: isHost ? 'white' : 'var(--color-text)',
                              padding: '10px 14px',
                              borderRadius: isHost ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              fontSize: '0.85rem',
                              border: isHost ? 'none' : '1px solid var(--color-border)',
                              lineHeight: '1.4'
                            }}>
                              {m.text}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '3px', display: 'block', textAlign: isHost ? 'right' : 'left' }}>
                              {m.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input Reply Box */}
                    <form 
                      onSubmit={handleSendMessage}
                      style={{ padding: '16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', gap: '10px' }}
                    >
                      <input 
                        type="text" 
                        placeholder={`Reply to ${activeConversation.guestName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                      />
                      <button 
                        type="submit"
                        style={{
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Send size={16} />
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '32px' }}>
                    <div className="stat-icon-tile stat-icon-blue"><MessageSquare size={20} /></div>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Select a conversation to reply to guest inquiries.</p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GLOBAL AUDIENCE VIEW                                                      */}
          {/* ========================================================================= */}
          {activeSidebar === 'audience' && (
            <div>
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Audience Directory</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage contacts and histories for unique registered attendees.</p>
              </div>
              
              <Card style={{ padding: 0 }} className="glass-surface text-left">
                {audienceList.length > 0 ? (
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Guest Name</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Events RSVP'd</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audienceList.map(guest => (
                        <tr key={guest.email}>
                          <td style={{ fontWeight: 600 }}>
                            <div className="flex items-center gap-sm">
                              <img src={getAvatar(guest.name || guest.email)} alt={guest.name} className="avatar-img" />
                              {guest.name}
                            </div>
                          </td>
                          <td>{guest.email}</td>
                          <td>{guest.phone || 'N/A'}</td>
                          <td>{guest.eventsAttended.join(', ')}</td>
                          <td>
                            <Button 
                              variant="ghost" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => {
                                setBroadcastTarget(guest.email);
                                setShowBroadcastModal(true);
                              }}
                            >
                              <Mail size={12} /> Message
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state" style={{ padding: '48px 16px' }}>
                    <img src={HERO_IMAGES.crowd} alt="Dinner party crowd" className="empty-state-img" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Your audience starts here</h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', maxWidth: '380px' }}>
                      Once guests RSVP to your events, their contact details and attendance history will appear in this directory.
                    </p>
                    <Link to="/create">
                      <Button variant="primary" className="flex items-center gap-xs">
                        <Plus size={16} /> Host Your First Event
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GLOBAL SETTINGS VIEW                                                      */}
          {/* ========================================================================= */}
          {activeSidebar === 'settings' && (
            <div>
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Organizer Settings</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Configure default host profile settings and brand styles.</p>
              </div>
              
              <Card style={{ maxWidth: '600px', padding: '24px', textAlign: 'left' }} className="glass-surface">
                <div className="flex items-center gap-md" style={{ marginBottom: '20px' }}>
                  <img src={getAvatar('alex@safalevent.com')} alt="Alex Rivera" className="avatar-img avatar-lg" />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Organizer Profile Info</h4>
                    <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.8rem' }}>This is how guests see you across invitations and event pages.</p>
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); alert('Profile preferences updated!'); }} className="flex flex-col gap-md">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Host Display Name</label>
                    <input type="text" defaultValue="Alex Rivera" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                    <input type="email" defaultValue="alex@safalevent.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Contact Phone</label>
                    <input type="text" defaultValue="+1 (555) 999-8888" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                  </div>
                  
                  <Button variant="primary" type="submit" style={{ marginTop: '10px', alignSelf: 'start' }}>Save Changes</Button>
                </form>
              </Card>

              {/* ORG DOCUMENT UPLOAD SECTION (only for org hosts) */}
              {isOrgHost && (
                <Card style={{ maxWidth: '600px', padding: '24px', textAlign: 'left', marginTop: '24px', border: orgDocsUploaded ? '1px solid var(--color-border)' : '2px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                      background: orgDocsUploaded ? 'rgba(0, 200, 83, 0.1)' : 'rgba(242, 84, 27, 0.1)',
                      color: orgDocsUploaded ? 'var(--color-accent)' : 'var(--color-primary)'
                    }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Organization Documents</h4>
                      <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '0.8rem' }}>
                        {orgDocsUploaded ? '✓ Verified and uploaded' : 'Required for account activation'}
                      </p>
                    </div>
                    {orgDocsUploaded && (
                      <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                        <Check size={16} /> Verified
                      </div>
                    )}
                  </div>

                  {!orgDocsUploaded && (
                    <>
                      <div style={{
                        background: 'var(--color-surface-hover)', border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-md)', padding: '24px 16px', textAlign: 'center',
                        marginBottom: '16px', cursor: 'pointer'
                      }}>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleOrgDocUpload}
                          style={{ display: 'none' }}
                          id="settings-org-doc-upload"
                        />
                        <label htmlFor="settings-org-doc-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(242, 84, 27, 0.12)', color: 'var(--color-primary)'
                          }}>
                            <FileText size={20} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                            Click to upload documents
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            EIN letter, certificate, or legal document
                          </div>
                        </label>
                      </div>

                      {uploadedDocuments.length > 0 && (
                        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px' }}>
                          {uploadedDocuments.map((doc, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={13} color='var(--color-accent)' /> {doc}
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="primary"
                        onClick={handleOrgDocSubmit}
                        disabled={uploadedDocuments.length === 0}
                        style={{ width: '100%', padding: '11px', fontSize: '0.9rem', marginTop: '8px' }}
                      >
                        {uploadedDocuments.length === 0 ? 'Upload Documents' : `Upload & Verify (${uploadedDocuments.length})`}
                      </Button>
                    </>
                  )}

                  {orgDocsUploaded && (
                    <div style={{
                      background: 'rgba(0, 200, 83, 0.08)', border: '1px solid rgba(0, 200, 83, 0.3)',
                      borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text)'
                    }}>
                      ✓ Your organization is verified and fully activated. You can now create unlimited events.
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* INTEGRATIONS VIEW                                                        */}
          {/* ========================================================================= */}
          {activeSidebar === 'integrations' && (
            <div>
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Integrations</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Connect third-party tools and platforms to enhance your event management.</p>
              </div>

              {/* Connected Integrations */}
              {connectedIntegrations.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>Connected Integrations</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {connectedIntegrations.map(int => (
                      <Card key={int.id} style={{ padding: '18px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)', textTransform: 'capitalize' }}>{int.platform}</h4>
                            <p className="text-muted" style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Connected on {int.connectedAt}</p>
                          </div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', background: 'rgba(0, 200, 83, 0.1)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                            <Check size={13} /> Connected
                          </span>
                        </div>
                        <button
                          onClick={() => handleDisconnectIntegration(int.id)}
                          style={{
                            background: 'transparent', border: '1px solid var(--color-border)', color: '#ef4444',
                            padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          Disconnect
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Integrations */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Available Platforms</h3>
                  <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <Webhook size={12} /> Connect via API
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {[
                    { name: 'Jotform', desc: 'Sync form submissions directly to your events', icon: '📋' },
                    { name: 'WhatsApp', desc: 'Send RSVP reminders and updates via WhatsApp', icon: '💬' },
                    { name: 'Google Sheets', desc: 'Export guest lists and attendance to Sheets', icon: '📊' },
                    { name: 'Slack', desc: 'Get real-time RSVP notifications in your Slack workspace', icon: '🔔' },
                    { name: 'Mailchimp', desc: 'Sync guests to your email campaigns', icon: '📧' },
                    { name: 'Zapier', desc: 'Automate workflows with 1000+ apps', icon: '⚡' },
                    { name: 'HubSpot', desc: 'Manage guests and leads in HubSpot CRM', icon: '🎯' },
                    { name: 'Twilio', desc: 'Send SMS reminders and notifications', icon: '📱' }
                  ].map(platform => {
                    const isConnected = connectedIntegrations.some(i => i.platform.toLowerCase() === platform.name.toLowerCase());
                    return (
                      <Card key={platform.name} style={{ padding: '18px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{platform.icon}</div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>{platform.name}</h4>
                          <p className="text-muted" style={{ fontSize: '0.8rem', margin: '6px 0 0 0', lineHeight: 1.4 }}>{platform.desc}</p>
                        </div>
                        <Button
                          variant={isConnected ? 'ghost' : 'primary'}
                          onClick={() => !isConnected && setShowIntegrationModal(true)}
                          style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                          disabled={isConnected}
                        >
                          {isConnected ? '✓ Connected' : 'Connect'}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Broadcast Message Modal */}
        {showBroadcastModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="animate-fade-in" style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px',
              padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              {managedEvent && (
                <div style={{ position: 'relative', height: '96px' }}>
                  <img src={getEventCover(managedEvent)} alt={managedEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,12,0.75), rgba(8,8,12,0.15))' }} />
                  <span style={{ position: 'absolute', left: '20px', bottom: '10px', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                    {managedEvent.title}
                  </span>
                </div>
              )}
              <div style={{ padding: '24px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Mail size={18} color="var(--color-primary)" /> Broadcast Announcement
                </h3>
                <button onClick={() => setShowBroadcastModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSendBroadcast} className="flex flex-col gap-sm">
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Recipient Group</label>
                  <select 
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  >
                    <option value="all">All RSVP Guests ({managedEventRsvps.length})</option>
                    <option value="going">Going Only ({managedEventRsvps.filter(r => r.status === 'going').length})</option>
                    <option value="maybe">Maybe Only ({managedEventRsvps.filter(r => r.status === 'maybe').length})</option>
                    {broadcastTarget.includes('@') && <option value={broadcastTarget}>Direct contact: {broadcastTarget}</option>}
                  </select>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Subject Line</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Venue Directions / Important Announcement" 
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Message Body</label>
                  <textarea 
                    required 
                    placeholder="Type message content here..." 
                    rows="6"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <div className="flex gap-sm justify-end" style={{ marginTop: '12px' }}>
                  <Button variant="ghost" type="button" onClick={() => setShowBroadcastModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={broadcastSent}>
                    {broadcastSent ? 'Sending...' : 'Send Broadcast'}
                  </Button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Message Log View Modal */}
        {viewLogDetail && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: '16px', width: '90%', maxWidth: '600px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
              maxHeight: '85vh', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Outbox Message Details</h3>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                    Dispatched to {viewLogDetail.guestEmail} on {new Date(viewLogDetail.sentAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setViewLogDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', textAlign: 'left' }}>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                    <div><strong>To:</strong> {viewLogDetail.guestEmail}</div>
                    <div style={{ marginTop: '2px' }}><strong>Subject:</strong> {viewLogDetail.subject}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--color-bg)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', minHeight: '150px' }}>
                    {viewLogDetail.body}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'end' }}>
                <Button variant="ghost" onClick={() => setViewLogDetail(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Series Confirmation Modal */}
        {showSeriesConfirmModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'var(--color-surface)', borderRadius: '16px', width: '90%', maxWidth: '440px',
              padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,107,53,0.1)', color: 'var(--color-primary)', marginBottom: '16px' }}>
                <Calendar size={22} />
              </div>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', margin: 0 }}>Recurrence Series Options</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                You have enabled {seriesType} recurrence. Would you like to save changes and auto-generate 3 additional occurrences for the series, or update the current occurrence only?
              </p>
              
              <div className="flex flex-col gap-sm">
                <Button
                  variant="primary"
                  onClick={() => handleSaveEventSeries(true)}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Apply & Generate Entire Series
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSaveEventSeries(false)}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Apply to Current Only
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowSeriesConfirmModal(false)}
                  style={{ width: '100%', padding: '8px', color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRATION CONNECT MODAL */}
        {showIntegrationModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <div className="animate-fade-in" style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '480px',
              padding: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(242, 84, 27, 0.1)', color: 'var(--color-primary)', marginBottom: '16px'
                }}>
                  <Webhook size={28} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text)' }}>
                  Connect Integration
                </h2>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  Enter your API key or token to connect {integrationForm.platform}
                </p>
              </div>

              <form onSubmit={handleConnectIntegration} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Platform</label>
                  <select
                    value={integrationForm.platform}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, platform: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  >
                    <option value="jotform">Jotform</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="google-sheets">Google Sheets</option>
                    <option value="slack">Slack</option>
                    <option value="mailchimp">Mailchimp</option>
                    <option value="zapier">Zapier</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="twilio">Twilio</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>API Key / Token</label>
                  <input
                    type="password"
                    placeholder="Paste your API key here"
                    value={integrationForm.apiKey}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontFamily: 'monospace' }}
                  />
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '6px 0 0 0' }}>Your token is encrypted and never stored in plain text.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowIntegrationModal(false)}
                    style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  >
                    Connect Integration
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORG DOCUMENT UPLOAD MODAL */}
        {showOrgDocModal && isOrgHost && !orgDocsUploaded && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <div className="animate-fade-in" style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '540px',
              padding: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--color-border)', color: 'var(--color-text)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(242, 84, 27, 0.1)', color: 'var(--color-primary)', marginBottom: '16px'
                }}>
                  <FileText size={28} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text)' }}>
                  Complete Your Organization Verification
                </h2>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  To fully activate your organization account and create events, please upload your organization documents (EIN letter, certificate, or any legal document).
                </p>
              </div>

              <div style={{
                background: 'var(--color-surface-hover)', border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: '32px 20px', textAlign: 'center',
                marginBottom: '20px', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleOrgDocUpload}
                  style={{ display: 'none' }}
                  id="org-doc-upload"
                />
                <label htmlFor="org-doc-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(242, 84, 27, 0.12)', color: 'var(--color-primary)'
                  }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Click to upload or drag files
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      PDF, JPG, PNG, DOC, or DOCX
                    </div>
                  </div>
                </label>
              </div>

              {uploadedDocuments.length > 0 && (
                <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--color-text)' }}>
                    Uploaded Files ({uploadedDocuments.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uploadedDocuments.map((doc, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} color='var(--color-accent)' /> {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Button
                  variant="primary"
                  onClick={handleOrgDocSubmit}
                  disabled={uploadedDocuments.length === 0}
                  style={{ flex: 1, padding: '12px', fontWeight: 700 }}
                >
                  Upload & Activate Account
                </Button>
              </div>

              <p style={{
                fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '16px', margin: '16px 0 0 0'
              }}>
                You can also upload documents later in Settings → Organization Documents
              </p>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
