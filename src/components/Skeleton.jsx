export function Skeleton({ width, height, rounded = 'xl', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-border/60 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || '16px',
        borderRadius: rounded === 'full' ? '9999px' : rounded === 'circle' ? '50%' : `var(--radius-${rounded}, 0.75rem)`,
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 ${className}`}>
      <Skeleton width={40} height={40} rounded="xl" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-label="Loading...">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStatGrid({ className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <Skeleton width={40} height={40} rounded="xl" />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={24} />
            <Skeleton width="50%" height={10} />
          </div>
        </div>
      ))}
    </div>
  )
}
