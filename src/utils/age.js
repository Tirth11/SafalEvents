// Age helpers for age-restricted events (US-EVENT-013/014/015/016/017).
// DOB is stored on RSVP records as an ISO date string 'YYYY-MM-DD'.

// Calculate full years old from a 'YYYY-MM-DD' date of birth.
// Returns null when dob is missing or unparseable.
export function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

// True when the person meets the minimum age for an age-restricted event.
export function meetsAge(dob, minimumAge) {
  const age = calcAge(dob);
  return age !== null && age >= minimumAge;
}

// Friendly DOB display, e.g. "Apr 3, 1998 · 28 yrs". Returns '' for empty dob.
export function formatDob(dob) {
  if (!dob) return '';
  const d = new Date(dob);
  if (isNaN(d.getTime())) return dob;
  const age = calcAge(dob);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${age !== null ? ` · ${age} yrs` : ''}`;
}
