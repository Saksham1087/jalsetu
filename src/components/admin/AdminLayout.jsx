import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { AdminDashboard } from './AdminDashboard'
import { AdminComplaints } from './AdminComplaints'
import { AdminWards } from './AdminWards'
import { AdminComplaintDetail } from './AdminComplaintDetail'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'complaints', label: 'Complaints', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'wards', label: 'Wards', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
]

export function AdminLayout({ complaints, onUpdateStatus, onNavigateHome }) {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const { user, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between h-16 px-6 bg-header">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7">
              <svg className="w-4 h-4 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-base font-semibold text-white tracking-tight">JalSetu Admin</h1>
              <p className="text-[11px] text-teal-300/70">MBMC Water Management</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-text-tertiary hover:text-text-body touch-target">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSelectedComplaint(null) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === item.id
                    ? 'bg-teal-600/10 text-teal-600'
                    : 'text-text-body hover:bg-surface hover:text-text-primary'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-sm border-t border-border/60">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-teal-600/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-teal-600">
                {user?.displayName?.[0] || user?.email?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.displayName || user?.email || 'Admin'}</p>
              <p className="text-xs text-teal-600 font-semibold">Admin</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onNavigateHome}
              className="flex-1 px-3 py-2 text-xs font-medium text-text-body/70 bg-surface rounded-xl hover:bg-surface/80 touch-target transition-colors"
            >
              Home
            </button>
            <button
              onClick={logout}
              className="flex-1 px-3 py-2 text-xs font-medium text-emergency bg-emergency/10 rounded-xl hover:bg-emergency/20 touch-target transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-16 bg-card/90 backdrop-blur-sm border-b border-border/60 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-tertiary hover:text-text-body">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="font-display text-base font-semibold text-text-primary capitalize">{activeNav}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="touch-target flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <span className="text-sm text-text-secondary hidden sm:block">{user?.email || ''}</span>
          </div>
        </header>
        <div className="h-px bg-gradient-to-r from-teal-500/30 via-brass-400/30 to-teal-500/30" />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeNav === 'dashboard' && (
            <AdminDashboard
              complaints={complaints}
              onSelectComplaint={setSelectedComplaint}
              onRefresh={() => {}}
            />
          )}
          {activeNav === 'complaints' && (
            <AdminComplaints
              complaints={complaints}
              onUpdateStatus={onUpdateStatus}
            />
          )}
          {activeNav === 'wards' && (
            <AdminWards
              complaints={complaints}
            />
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <AdminComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  )
}
