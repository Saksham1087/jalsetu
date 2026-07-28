export function EmergencyButton() {
  return (
    <a
      href="tel:1800224849"
      className="fixed z-[1100] bottom-20 right-4 w-14 h-14 rounded-full bg-emergency text-white shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all duration-200 animate-[sos-pulse_2s_ease-in-out_infinite] focus:outline-none focus:ring-2 focus:ring-emergency focus:ring-offset-2"
      aria-label="Call MBMC water helpline"
      title="Call MBMC water helpline"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    </a>
  )
}
