# Admin Users Tab

## Requirements

1. **Sidebar nav item**: "Users" icon (people icon) between "Wards" and "Notify" in the admin sidebar
2. **User list mode**: Extract unique users from complaints (grouped by userId). Each card shows:
   - User name
   - Phone number (mobile)
   - Email (userEmail) if available
   - Complaint count
   - Last complaint relative date
3. **Sorting**: By complaint count descending (most active users first)
4. **Search**: Filter users by name (free-text, case-insensitive)
5. **User complaint view**: Clicking a user shows their complaints in a list identical to AdminComplaints styling
6. **Back navigation**: "← Back to Users" button at top of user complaint view
7. **Detail modal**: Clicking a complaint opens AdminComplaintDetail (same as other admin pages)
8. **Empty state**: "No users found" when search returns 0 results; "No complaints from this user" when selected user has no complaints
9. **Responsive**: Works on mobile (sidebar) and desktop
