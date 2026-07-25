import { GoogleSignInButton } from './GoogleSignInButton'
import { appConfig } from '../lib/config'
import { useTheme } from '../hooks/useTheme'

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

export function Header({ user, onLogin, onLogout }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-header safe-area-inset-top">
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
        <div className="flex items-center gap-2">
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
          <GoogleSignInButton user={user} onAuthChange={onLogin} />
        </div>
      </div>
      <WaterWave />
    </header>
  )
}
