import { useCallback, useMemo } from 'react'

export function FilterBar({ filter, onFilterChange, complaintTypes, statusOptions, wardOptions, user }) {
  const handleMyComplaintsToggle = useCallback(() => {
    onFilterChange(prev => ({ ...prev, myComplaintsOnly: !prev.myComplaintsOnly }))
  }, [onFilterChange])

  const handleTypeChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, type: e.target.value }))
  }, [onFilterChange])

  const handleStatusChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, status: e.target.value }))
  }, [onFilterChange])

  const handleWardChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, ward: e.target.value }))
  }, [onFilterChange])

  const handleSortChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, sortBy: e.target.value }))
  }, [onFilterChange])

  const clearFilter = useCallback((key) => {
    onFilterChange(prev => ({ ...prev, [key]: '' }))
  }, [onFilterChange])

  const activeFilters = useMemo(() => {
    const active = []
    if (filter.type) {
      const found = complaintTypes.find(t => t.value === filter.type)
      if (found) active.push({ label: found.label, key: 'type' })
    }
    if (filter.status) {
      const found = statusOptions.find(s => s.value === filter.status)
      if (found) active.push({ label: found.label, key: 'status' })
    }
    return active
  }, [filter.type, filter.status, complaintTypes, statusOptions])

  const dropdownClass = "w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-card appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23889ba3%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E')] bg-right pr-8 bg-no-repeat text-text-body focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-colors"

  return (
    <div className="sticky top-0 z-40 bg-filter-bar backdrop-blur-lg border-b border-border/60 safe-area-inset-top">
      <div className="px-4 py-3 space-y-3">
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600/10 text-teal-600 border border-teal-600/20"
              >
                {f.label}
                <button
                  onClick={() => clearFilter(f.key)}
                  className="ml-0.5 hover:text-teal-600 focus:outline-none"
                  aria-label={`Remove ${f.label} filter`}
                  type="button"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {user && !user.isDemoUser && (
          <button
            type="button"
            onClick={handleMyComplaintsToggle}
            className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium touch-target transition-all ${
              filter.myComplaintsOnly
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card text-text-body/70 border border-border hover:bg-surface'
            }`}
            aria-pressed={filter.myComplaintsOnly}
          >
            My Complaints Only
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="type-filter" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Type</label>
            <select
              id="type-filter"
              value={filter.type}
              onChange={handleTypeChange}
              className={dropdownClass}
            >
              {complaintTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Status</label>
            <select
              id="status-filter"
              value={filter.status}
              onChange={handleStatusChange}
              className={dropdownClass}
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {wardOptions && wardOptions.length > 0 && (
          <div>
            <label htmlFor="ward-filter" className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Ward</label>
            <select
              id="ward-filter"
              value={filter.ward}
              onChange={handleWardChange}
              className={dropdownClass}
            >
              {wardOptions.map(ward => (
                <option key={ward.value} value={ward.value}>{ward.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 pt-0.5">
          <label htmlFor="sort-by" className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">Sort</label>
          <select
            id="sort-by"
            value={filter.sortBy}
            onChange={handleSortChange}
            className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-card appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23889ba3%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E')] bg-right pr-8 bg-no-repeat text-text-body focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-colors"
          >
            <option value="distance">Nearest First</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">Status Priority</option>
          </select>
        </div>
      </div>
    </div>
  )
}
