import { useState, useRef, useEffect } from 'react'
import { GoogleSignInButton } from './GoogleSignInButton'
import { appConfig } from '../lib/config'
import { useTheme } from '../hooks/useTheme'
import { useNotifications } from '../hooks/useNotifications'
import { useAuthContext } from '../contexts/AuthContext'

const WaterWave = () => (
  <div className="relative h-3 overflow-hidden bg-header" aria-hidden="true">
    <svg
      className="absolute bottom-0 w-[200%] h-3"
      viewBox="0 0 1440 24"
      fill="none"
      preserveAspectRatio="none"
      style={{ animation: 'wave-drift 8s linear infinite' }}
    >
      <path
        d="M0 12C120 20 240 4 360 12S600 20 720 12 960 4 1080 12 1320 20 1440 12V24H0V12Z"
        fill="var(--color-page)"
        opacity="0.95"
      />
      <path
        d="M0 16C160 24 320 8 480 16S800 24 960 16 1280 8 1440 16V24H0V16Z"
        fill="var(--color-page)"
        opacity="0.6"
      />
    </svg>
  </div>
)

export function Header({ user, onLogin, onNotificationClick, onProfileClick, onAboutClick }) {
  const { isDark, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications(user)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const authCtx = useAuthContext()

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const showNotifications = !!user

  return (
    <header className="bg-header/90 backdrop-blur-md safe-area-inset-top relative z-50">
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-teal-600/20 animate-[water-ripple_2s_ease-in-out_infinite]" />
            <svg className="w-5 h-5 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-semibold text-white tracking-tight">JalSetu</h1>
            {appConfig.isDemo && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/15 text-white/80 rounded uppercase tracking-wider">
                Demo
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="touch-target flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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

          {showNotifications && (
            <button
              onClick={onNotificationClick}
              className="relative touch-target flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-emergency rounded-full border-2 border-header leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="touch-target flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors"
                aria-label="Profile menu"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-xl z-50 py-1">
                  <button
                    onClick={() => { setShowDropdown(false); onProfileClick?.() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Profile
                  </button>
                  <div className="h-px bg-border mx-3 my-1" />
                  <button
                    onClick={() => { setShowDropdown(false); onAboutClick?.() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    About Us
                  </button>
                  <div className="h-px bg-border mx-3 my-1" />
                  <button
                    onClick={() => { setShowDropdown(false); authCtx.logout() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emergency hover:bg-emergency/5 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-emergency" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <GoogleSignInButton user={user} onAuthChange={onLogin} />
          )}
        </div>
      </div>
      <WaterWave />
    </header>
  )
}
