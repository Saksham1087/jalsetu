export function BottomNav({ activeTab, onTabChange, user }) {
  const tabs = [
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'list', label: 'Complaints', icon: ListIcon },
    { id: 'track', label: 'Track', icon: TrackIcon },
    { id: 'report', label: 'Report', icon: ReportIcon, requiresAuth: true },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      <div className="bg-nav backdrop-blur-lg border-t border-border/60">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const disabled = tab.requiresAuth && !user
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.requiresAuth && !user) return
                  onTabChange(tab.id)
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 touch-target transition-colors ${
                  disabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                disabled={disabled}
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-teal-600/10 text-teal-600' : 'text-text-tertiary active:text-text-body'
                }`}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-teal-600/5 border border-teal-600/10" />
                  )}
                  <div className="relative">
                    <tab.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                  </div>
                </div>
                <span className={`text-[11px] font-medium tracking-tight ${
                  isActive ? 'text-teal-600 font-semibold' : 'text-text-tertiary'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-teal-500" />
                )}
                {tab.requiresAuth && !user && (
                  <span className="absolute top-0 -right-1 w-3.5 h-3.5 bg-emergency text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm border border-white">
                    !
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function MapIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  )
}

function ListIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function TrackIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function ReportIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
