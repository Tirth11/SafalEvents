import sys
import re

with open('src/pages/HostDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Add staff to global sidebar
content = content.replace(
    "{ key: 'settings', icon: <Settings size={18} />, label: 'Settings', staff: true },",
    "{ key: 'staff', icon: <Users size={18} />, label: 'Staff & Roles', staff: false },\n      { key: 'settings', icon: <Settings size={18} />, label: 'Settings', staff: true },"
)

# 2. Remove staff tab from event nav
content = content.replace(
    "{ key: 'payments', label: 'Payments', perm: 'settings_view' },\n                  { key: 'staff', label: 'Staff & Roles', perm: 'staff_manage' }",
    "{ key: 'payments', label: 'Payments', perm: 'settings_view' }"
)

# 3. Extract the selectedEventTab === 'staff' block.
# We will use string finding.
start_str = "              {selectedEventTab === 'staff' && (\n                <div className=\"flex flex-col gap-lg\">"
end_str = "                </div>\n              )}\n\n            </div>\n          )}"

start_idx = content.find(start_str)
if start_idx == -1:
    print("Could not find start_str")
    sys.exit(1)

# Find the end of the block, which is right before the `activeSidebar === 'earnings'` block.
# Actually, the block ends with `                </div>\n              )}\n`
end_find_str = "                  </Card>\n                </div>\n              )}\n"
end_idx = content.find(end_find_str, start_idx)
if end_idx == -1:
    print("Could not find end_find_str")
    sys.exit(1)

end_idx += len(end_find_str)

staff_block = content[start_idx:end_idx]

# Remove the staff_block from content
content = content[:start_idx] + content[end_idx:]

# Modify staff_block for global view
staff_block = staff_block.replace("              {selectedEventTab === 'staff' && (", "          {activeSidebar === 'staff' && (")
# Add the header and event selector
header = """            <div>
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Staff, Roles & Event Security</h1>
                <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Manage team members, roles, auto-replies, and view audit logs.</p>
              </div>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', marginRight: '10px' }}>Select Event Context:</label>
                <select value={selectedEventId || ''} onChange={(e) => setSelectedEventId(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
"""
# Replace `<div className="flex flex-col gap-lg">` with the new header
staff_block = staff_block.replace('                <div className="flex flex-col gap-lg">', header + '                <div className="flex flex-col gap-lg">', 1)

# Fix the closing div for the new header
staff_block = staff_block.replace('              )}', '              </div>\n          )}', 1)

# Now insert it before activeSidebar === 'settings'
settings_str = "          {/* ========================================================================= */}\n          {/* GLOBAL SETTINGS VIEW                                                      */}"
settings_idx = content.find(settings_str)

if settings_idx == -1:
    print("Could not find settings block")
    sys.exit(1)

full_insert = "          {/* ========================================================================= */}\n          {/* GLOBAL STAFF & ROLES VIEW                                               */}\n          {/* ========================================================================= */}\n" + staff_block + "\n"

content = content[:settings_idx] + full_insert + content[settings_idx:]

with open('src/pages/HostDashboard.jsx', 'w') as f:
    f.write(content)

print("Successfully moved Staff & Roles")
