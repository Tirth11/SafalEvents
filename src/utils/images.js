// SafalEvents — Shared curated image library (Unsplash CDN, mockup-only).
// Use these everywhere instead of hard-coding URLs so the whole app stays consistent.

const u = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// ─── Event cover photos by category ───
export const EVENT_COVERS = {
  party: [
    u('photo-1533174072545-7a4b6ad7a6c3'),
    u('photo-1530103862676-de8c9debad1d'),
    u('photo-1496337589254-7e19d01cec44'),
  ],
  concert: [
    u('photo-1470229722913-7c0e2dbbafd3'),
    u('photo-1501281668745-f7f57925c3b4'),
    u('photo-1429962714451-bb934ecdc4ec'),
  ],
  conference: [
    u('photo-1540575467063-178a50c2df87'),
    u('photo-1505373877841-8d25f7d46678'),
    u('photo-1587825140708-dfaf72ae4b04'),
  ],
  meetup: [
    u('photo-1556761175-5973dc0f32e7'),
    u('photo-1515187029135-18ee286d815b'),
    u('photo-1517245386807-bb43f82c33c4'),
  ],
  workshop: [
    u('photo-1552664730-d307ca884978'),
    u('photo-1531482615713-2afd69097998'),
  ],
  dinner: [
    u('photo-1414235077428-338989a2e8c0'),
    u('photo-1555244162-803834f70033'),
    u('photo-1529543544282-ea669407fca3'),
  ],
  wedding: [
    u('photo-1519741497674-611481863552'),
    u('photo-1465495976277-4387d4b0b4c6'),
  ],
  fitness: [
    u('photo-1544367567-0f2fcb009e0b'),
    u('photo-1506126613408-eca07ce68773'),
    u('photo-1571019613454-1cb2f99b2d8b'),
  ],
  festival: [
    u('photo-1514525253161-7a46d19cd819'),
    u('photo-1506157786151-b8491531f063'),
    u('photo-1459749411175-04bf5292ceea'),
  ],
  art: [
    u('photo-1531058020387-3be344556be6'),
    u('photo-1460661419201-fd4cecdf8a8b'),
  ],
  gala: [
    u('photo-1519671482749-fd098f39dfa3'),
    u('photo-1511795409834-ef04bbd61622'),
    u('photo-1492684223066-81342ee5ff30'),
  ],
  sports: [
    u('photo-1461896836934-ffe607ba8211'),
    u('photo-1547347298-4074fc3086f0'),
  ],
};

// Flat list when you just need "an event photo"
export const ALL_COVERS = Object.values(EVENT_COVERS).flat();

// Reliable fallback cover for when an event's own image fails to load (e.g. a
// removed Unsplash URL). Use in an <img onError> handler.
export const FALLBACK_COVER = u('photo-1470229722913-7c0e2dbbafd3');

// Map an event's eventType / title to a fitting cover. Deterministic per id.
export function getEventCover(event = {}) {
  if (event.cover) return event.cover;
  const type = (event.eventType || '').toLowerCase();
  const pool =
    EVENT_COVERS[type] ||
    (type.includes('music') ? EVENT_COVERS.concert : null) ||
    (type.includes('network') ? EVENT_COVERS.meetup : null) ||
    ALL_COVERS;
  const seed = String(event.id || event.title || '0')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
}

// ─── Hero / marketing imagery ───
export const HERO_IMAGES = {
  landing: '/hero_mockup.jpg', // local hero image
  crowd: u('photo-1511795409834-ef04bbd61622', 1600), // elegant dinner party
  hosting: u('photo-1475721027785-f74eccf877e2', 1200), // speaker on stage
  dashboard: u('photo-1492684223066-81342ee5ff30', 1400), // confetti celebration (host dashboard banner)
  celebration: u('photo-1530103862676-de8c9debad1d', 1400), // sparkler night party
  festival: u('photo-1514525253161-7a46d19cd819', 1400), // concert / festival crowd
  toast: u('photo-1543007630-9710e4a00a20', 1200), // friends toasting
  loginSide: u('photo-1530023367847-a683933f4172', 1200), // sparkler celebration
  adminOps: u('photo-1551434678-e076c223a692', 1200), // team at work
};

// ─── People avatars (faces) ───
export const AVATARS = [
  u('photo-1494790108377-be9c29b29330', 200), // woman smiling
  u('photo-1507003211169-0a1dd7228f2d', 200), // man portrait
  u('photo-1438761681033-6461ffad8d80', 200), // woman portrait
  u('photo-1500648767791-00dcc994a43e', 200), // man smiling
  u('photo-1534528741775-53994a69daeb', 200), // woman model
  u('photo-1472099645785-5658abf4ff4e', 200), // man professional
  u('photo-1544005313-94ddf0286df2', 200), // woman blonde
  u('photo-1517841905240-472988babdf9', 200), // woman casual
  u('photo-1539571696357-5a69c17a67c6', 200), // man young
  u('photo-1546961329-78bef0414d7c', 200), // woman professional
];

// Deterministic avatar for a name/email/id string.
export function getAvatar(seed = '') {
  const n = String(seed)
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATARS[n % AVATARS.length];
}
