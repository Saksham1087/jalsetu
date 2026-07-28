import { useState } from 'react'
import { formatDistance, formatRelativeTime, formatType } from '../utils/formatters'
import { statusConfig } from '../lib/statusConfig'
import { getDistance } from '../utils/geo'
import { generateComplaintPdf } from '../utils/pdfGenerator'
import { TypeIcon } from './TypeIcon'

const statusSaturation = {
  submitted: { opacity: 0.06 },
  acknowledged: { opacity: 0.10 },
  in_progress: { opacity: 0.15 },
  resolved: { opacity: 0.12 },
  rejected: { opacity: 0.10 },
}

export function ComplaintCard({ complaint, userLocation, index }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const distance = userLocation && complaint.latitude && complaint.longitude
    ? formatDistance(getDistance(userLocation, complaint))
    : null

  const config = statusConfig[complaint.status] || statusConfig.submitted
  const sat = statusSaturation[complaint.status] || statusSaturation.submitted

  const severityDots = {
    leakage: 3,
    critical_leak: 3,
    contamination: 3,
    no_supply: 2,
    low_pressure: 2,
    billing: 1,
    other: 1,
  }
  const dots = severityDots[complaint.type] || 1

  return (
    <article
      className="relative bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.99] cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-teal-600 flex-shrink-0" aria-hidden="true">
              <TypeIcon type={complaint.type} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold text-text-primary truncate">
                {formatType(complaint.type)}
              </h3>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {complaint.address || complaint.landmark || 'Location not specified'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-[2px] px-1">
              {[1, 2, 3].map((d) => (
                <div
                  key={d}
                  className={`w-1 h-1 rounded-full ${
                    d <= dots ? 'bg-brass-400' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${config.badgeBg} ${config.badgeText} tracking-tight`}>
              {config.label}
            </span>
          </div>
        </div>

        {complaint.description && (
          <p className="text-sm text-text-body/70 mb-3 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {complaint.ward && (
            <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-text-secondary">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {complaint.ward}
            </span>
          )}
          {complaint.landmark && (
            <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-text-secondary">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {complaint.landmark}
            </span>
          )}
          <time dateTime={complaint.createdAt} className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatRelativeTime(complaint.createdAt)}
          </time>
          {distance && (
            <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full text-text-secondary">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {distance}
            </span>
          )}
        </div>

        {complaint.images && complaint.images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {complaint.images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Photo ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-divider/50"
                loading="lazy"
              />
            ))}
            {complaint.images.length > 4 && (
              <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-surface flex items-center justify-center text-[11px] text-text-tertiary border border-dashed border-border font-medium">
                +{complaint.images.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="px-4 py-2.5 flex items-center justify-between transition-colors duration-500 border-t border-transparent"
        style={{
          backgroundColor: config.gaugeColor + sat.opacity.toString(16).padStart(2, '0'),
          borderTopColor: config.gaugeColor + '15',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium tracking-wider" style={{ color: config.gaugeColor }}>
            #{complaint.id.slice(-6).toUpperCase()}
          </span>
          <button
            onClick={async (e) => {
              e.stopPropagation()
              setDownloadingPdf(true)
              try { await generateComplaintPdf(complaint) } catch {}
              setDownloadingPdf(false)
            }}
            disabled={downloadingPdf}
            className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Download PDF Report"
          >
            {downloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: config.gaugeColor }} />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: config.gaugeColor }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
          </button>
        </div>
        <span className="text-[11px]" style={{ color: config.gaugeColor }}>
          {complaint.userName || 'Anonymous'}
        </span>
      </div>
    </article>
  )
}
