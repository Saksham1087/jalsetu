export function BottomNav({ activeTab, onTabChange, userLocation, user }) {
  const tabs = [
    { id: 'map', label: 'Map', icon: MapIcon },
    { id: 'list', label: 'Complaints', icon: ListIcon },
    { id: 'report', label: 'Report', icon: ReportIcon, requiresAuth: true },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.requiresAuth && !user) {
                onTabChange('report')
                return
              }
              onTabChange(tab.id)
            }}
            className={`flex flex-col items-center gap-1 touch-target transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-500 active:text-gray-700'
            }`}
            disabled={tab.requiresAuth && !user}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{tab.label}</span>
            {tab.requiresAuth && !user && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

function MapIcon({ className, fill }) {
  return (
    <svg className={className} fill={fill || 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ListIcon({ className, fill }) {
  return (
    <svg className={className} fill={fill || 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function ReportIcon({ className, fill }) {
  return (
    <svg className={className} fill={fill || 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  )
}
