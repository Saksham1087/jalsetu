## Approach

### Component: AdminUsers.jsx

Receives `complaints`, `onUpdateStatus`, `onDelete` (same pattern as AdminComplaints).

**State:**
- `search` — user name filter
- `selectedUserId` — null (list view) or userId string (user complaints view)

**Data aggregation (useMemo):**
```js
complaints.reduce((map, c) => {
  if (!c.userId) return map
  // accumulate count, latest date, name/email/mobile
}, new Map()) → sort by count desc
```

**User card:**
```
┌─────────────────────────────────┐
│  Name                [4 cmplnts]│
│  📞 98765xxxx                   │
│  📧 email@example.com           │
│  Last: 2 days ago               │
└─────────────────────────────────┘
```

**User complaints view:**
- Back button at top
- Header: "{Name}'s Complaints ({count})"
- Same complaint row styling as AdminComplaints (status badge, description, date, type)

### AdminLayout.jsx changes

- Add `{ id: 'users', label: 'Users', icon: '<people svg>' }` to navItems
- Add `{activeNav === 'users' && <AdminUsers ... />}` in main content area
