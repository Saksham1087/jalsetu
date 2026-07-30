## Approach

### Component: AboutPage.jsx
- Receives `onClose` prop
- Styled identically to ProfilePage (same container, back button pattern)
- Static content — no hooks or state needed

### Layout
```
┌─────────────────────────────┐
│ ← Back                      │
│                             │
│    💧 JalSetu               │
│                             │
│    [app paragraph]          │
│                             │
│    ──── Built By ────       │
│                             │
│    Saksham Rai              │
│    Full-stack Developer     │
│                             │
│    📧 raisaksham1087@...    │
│    📞 8468847274            │
│                             │
│    [Instagram] [GitHub]     │
│                             │
│    © 2026 JalSetu           │
└─────────────────────────────┘
```

### Data flow
```
Header dropdown "About Us"
  → onAboutClick()
    → App.jsx sets showAbout = true
      → renders <AboutPage onClose={handleAboutClose}/>
```

### App.jsx changes
```jsx
const [showAbout, setShowAbout] = useState(false)
const handleAboutClick = () => setShowAbout(true)
const handleAboutClose = () => setShowAbout(false)

// In render:
{showAbout ? <AboutPage onClose={handleAboutClose} /> : ...}
```
