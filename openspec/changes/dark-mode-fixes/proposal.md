# Dark Mode Fixes

## Vision
Polish the dark/light mode implementation to eliminate hardcoded light-mode colors
that were missed during the initial dark-mode rollout. Every component should
render correctly in both themes — no light patches on dark backgrounds, no invisible
text.

## Scope
Fix ~30 hardcoded color references across 10 files. No new features, no structural
changes. Token substitutions only (replace `bg-gray-*`, `text-gray-*`, `border-gray-*`,
`bg-teal-50` with existing semantic tokens and dark-aware patterns).

## Out of Scope
- The `adminBg`/`adminText`/`dot` missing-properties bug in admin components (unrelated)
