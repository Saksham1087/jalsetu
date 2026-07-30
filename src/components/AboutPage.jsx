export function AboutPage({ onClose }) {
  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom bg-page">
      <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
        <button
          onClick={onClose}
          className="touch-target flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">JalSetu</h1>
          <p className="text-sm text-text-secondary mt-1">Water Complaint Platform</p>
        </div>

        <div className="mt-6 bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-text-body leading-relaxed">
            JalSetu is a civic complaint platform designed for the residents of Mira Bhayander to report water-related issues directly to the Mira Bhayander Municipal Corporation (MBMC). Citizens can submit complaints with geo-tagged photos, track their status in real time, view reported issues on a public map, and receive updates as their complaint moves through the pipeline. On the administrative side, officials can manage complaints by ward, update statuses, send notifications, and generate PDF reports — creating a transparent feedback loop between the community and the civic body.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-tertiary tracking-wider uppercase">Built By</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-lg font-semibold text-text-primary">Saksham Rai</h2>
            <p className="text-sm text-text-secondary">Full-stack Developer</p>
          </div>

          <div className="mt-4 space-y-3">
            <a
              href="mailto:raisaksham1087@gmail.com"
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:bg-surface transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-tertiary">Email</p>
                <p className="text-sm text-text-primary truncate">raisaksham1087@gmail.com</p>
              </div>
            </a>

            <a
              href="tel:8468847274"
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:bg-surface transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-tertiary">Phone</p>
                <p className="text-sm text-text-primary">8468847274</p>
              </div>
            </a>

            <a
              href="https://www.instagram.com/offx_.saksham._/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:bg-surface transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-tertiary">Instagram</p>
                <p className="text-sm text-text-primary truncate">@offx_.saksham._</p>
              </div>
              <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            <a
              href="https://github.com/Saksham1087"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:bg-surface transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-tertiary">GitHub</p>
                <p className="text-sm text-text-primary truncate">Saksham1087</p>
              </div>
              <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-text-tertiary">© 2026 JalSetu</p>
      </div>
    </div>
  )
}
