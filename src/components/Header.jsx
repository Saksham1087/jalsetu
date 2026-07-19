import { GoogleSignInButton } from './GoogleSignInButton'
import { appConfig } from '../lib/config'

export function Header({ user, onLogin, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-area-inset-top">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-water-500 to-water-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7V11h4V7h2v4h4v2z"/>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">JalSetu</h1>
            {appConfig.isDemo && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wider border border-amber-200">
                Demo
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <GoogleSignInButton user={user} onAuthChange={onLogin} />
        </div>
      </div>
    </header>
  )
}
