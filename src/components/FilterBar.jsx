import { useState, useRef, useEffect, useMemo, useCallback } from 'react'

export function FilterBar({ filter, onFilterChange, complaintTypes, statusOptions, wardOptions, user }) {
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const comboboxRef = useRef(null)

  const handleSearchChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, search: e.target.value }))
  }, [onFilterChange])

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setIsComboboxOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isComboboxOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsComboboxOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isComboboxOpen])

  const comboboxItems = useMemo(() => {
    const typeItems = complaintTypes.map(t => ({ ...t, group: 'type' }))
    const statusItems = statusOptions.map(s => ({ ...s, group: 'status' }))

    if (!filter.search) {
      return [
        ...typeItems,
        { separator: true },
        ...statusItems,
      ]
    }
    const q = filter.search.toLowerCase()
    return [
      ...typeItems.filter(t => t.label.toLowerCase().includes(q)),
      ...statusItems.filter(s => s.label.toLowerCase().includes(q)),
    ]
  }, [complaintTypes, statusOptions, filter.search])

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

  const dropdownClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E')] bg-right bg-no-repeat pr-8"

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset-top">
      <div className="px-4 py-3 space-y-3">
        <div ref={comboboxRef} className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filter.search}
            onChange={handleSearchChange}
            onFocus={() => setIsComboboxOpen(true)}
            placeholder="Search or filter complaints..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            aria-label="Search or filter complaints"
            role="combobox"
            aria-expanded={isComboboxOpen}
            aria-controls="filter-dropdown"
          />

          {isComboboxOpen && comboboxItems.length > 0 && (
            <div
              id="filter-dropdown"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
            >
              {comboboxItems.map((item, idx) => {
                if (item.separator) {
                  return <div key={`sep-${idx}`} className="border-t border-gray-100 mx-3 my-1" role="separator" />
                }
                const isActive = item.group === 'type'
                  ? filter.type === item.value
                  : filter.status === item.value
                return (
                  <button
                    key={`${item.group}-${item.value}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      const key = item.group === 'type' ? 'type' : 'status'
                      onFilterChange(prev => ({ ...prev, [key]: prev[key] === item.value ? '' : item.value }))
                      setIsComboboxOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-primary-600' : 'bg-gray-300'}`} />
                      {item.label}
                    </span>
                    {isActive && (
                      <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {isComboboxOpen && comboboxItems.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No matching filters</div>
            </div>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
              >
                {f.label}
                <button
                  onClick={() => clearFilter(f.key)}
                  className="ml-0.5 hover:text-primary-900 focus:outline-none"
                  aria-label={`Remove ${f.label} filter`}
                  type="button"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium touch-target transition-colors ${
              filter.myComplaintsOnly
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={filter.myComplaintsOnly}
          >
            My Complaints Only
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="type-filter" className="block text-xs text-gray-500 font-medium mb-1">Type</label>
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
            <label htmlFor="status-filter" className="block text-xs text-gray-500 font-medium mb-1">Status</label>
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
            <label htmlFor="ward-filter" className="block text-xs text-gray-500 font-medium mb-1">Ward / Area</label>
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

        <div className="flex items-center gap-2 pt-1">
          <label htmlFor="sort-by" className="text-xs text-gray-500 font-medium whitespace-nowrap">Sort:</label>
          <select
            id="sort-by"
            value={filter.sortBy}
            onChange={handleSortChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E')] bg-right bg-no-repeat pr-8"
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
