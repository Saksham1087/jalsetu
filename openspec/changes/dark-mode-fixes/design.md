# Design

## Approach
Replace every hardcoded light-mode Tailwind class with an equivalent semantic
token from `index.css`. For `bg-teal-50` patterns, use `bg-teal-600/10` (10%
opacity teal on any background = works in both themes).

## Token Reference

| Hardcoded | Replace With |
|-----------|-------------|
| `bg-gray-50` | `bg-page` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500`, `text-gray-600` | `text-text-body` |
| `text-gray-700` | `text-text-body` |
| `text-gray-400` | `text-text-tertiary` |
| `border-gray-200`, `border-gray-300` | `border-border` |
| `bg-teal-50` | `bg-teal-600/10` |
| `text-teal-700`, `text-teal-800` | `text-teal-600` |
| `border-teal-200/60` | `border-teal-600/20` |
| `hover:bg-teal-50`, `hover:bg-teal-100` | `hover:bg-teal-600/10` |
| `hover:text-gray-900` | `hover:text-text-primary` |

## Files to Change (in order)

1. `src/App.jsx` — `bg-gray-50` -> `bg-page` (line 150)
2. `src/components/ComplaintForm.jsx` — photo border, teal-50 location box
3. `src/components/FilterBar.jsx` — active filter tags
4. `src/components/PublicMap.jsx` — legend text, checkbox borders, error text
5. `src/styles/map.css` — zoom control colors to CSS variables
6. `src/components/BottomNav.jsx` — active tab teal-50
7. `src/components/admin/AdminLayout.jsx` — active nav teal-50
8. `src/components/admin/AdminDashboard.jsx` — view button teal-50
9. `src/components/GoogleSignInButton.jsx` — sign out text
10. `src/components/ComplaintList.jsx` — error alert (already OK, just verify)
