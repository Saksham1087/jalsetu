# Dashboard Toggle

## Requirements

1. **Segmented pill control**: Two-tab toggle below the welcome header — "My View" (left) and "JalSetu Overview" (right). Active tab visually distinct with teal fill + white text. Inactive tab muted with transparent background.

2. **Stat cards change per view**:
   - "My View": Total, Resolved, Rate, This Week — all from `myComplaints` (user's personal complaints)
   - "JalSetu Overview": Total, Resolved, Rate, This Week — all from `complaints` (all complaints)

3. **Recent Complaints**:
   - "My View": top 5 from user's complaints
   - "JalSetu Overview": top 5 most recent from all complaints
   - Heading stays "Recent Complaints" in both modes

4. **Header greeting**:
   - "My View": "Welcome, {name}" (unchanged)
   - "JalSetu Overview": "JalSetu Overview" (no personal greeting)

5. **Empty state**:
   - Shown only in "My View" when user has 0 complaints
   - Never shown in "JalSetu Overview" (city always has data, or stat cards show 0)

6. **No persistence**: Always reset to "My View" on page load

7. **Other sections unchanged**: Track by ID card, Emergency Call card, Notifications section — identical in both views

8. **Mobile-first**: Pill must be tappable (min 44px height), responsive, same styling throughout
