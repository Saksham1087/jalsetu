# Dark Mode Fixes Spec

## Background
The dark-light-mode change added semantic CSS tokens and `dark:` variants but
~30 hardcoded light-mode colors remain across the codebase.

## Requirements

### R1: App container bg
- `App.jsx` main wrapper `bg-gray-50` → `bg-page`

### R2: ComplaintForm colors
- Photo border `border-gray-200` → `border-border`
- Upload hover `hover:bg-teal-50` → `hover:bg-teal-600/10`
- Location captured `bg-teal-50 text-teal-800` → `bg-teal-600/10 text-teal-600`

### R3: FilterBar filter tags
- Active filter tag `bg-teal-50 text-teal-700 border-teal-200/60` → `bg-teal-600/10 text-teal-600 border-teal-600/20`

### R4: PublicMap legend
- "Type" heading `text-gray-900` → `text-text-primary`
- Checkbox `border-gray-300` → `border-border`
- Error text `text-gray-600` → `text-text-body`

### R5: map.css zoom controls
- Light mode zoom buttons `background: white` → `var(--color-card)`
- Light mode zoom buttons `color: #374151` → `var(--color-text-body)`
- Light mode zoom hover `background: #f3f4f6` → `var(--color-surface)`
- Light mode divider `border-top-color: #e5e7eb` → `var(--color-border)`
- Remove duplicate `.dark` blocks (CSS variables handle it)

### R6: teal-50 patterns (BottomNav, AdminLayout, AdminDashboard)
- Active/hover `bg-teal-50` → `bg-teal-600/10`
- `text-teal-700` → `text-teal-600`

### R7: GoogleSignInButton sign out
- Sign Out `text-gray-600 hover:text-gray-900` → `text-text-body hover:text-text-primary`
