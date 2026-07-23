export function FilterBar({ filter, onFilterChange, complaintTypes, statusOptions, wardOptions }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset-top">
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={filter.search}
            onChange={(e) => onFilterChange(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search complaints..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            aria-label="Search complaints"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {complaintTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => onFilterChange(prev => ({ ...prev, type: prev.type === type.value ? '' : type.value }))}
              className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium touch-target transition-colors ${
                filter.type === type.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={filter.type === type.value}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusOptions.map(status => (
            <button
              key={status.value}
              type="button"
              onClick={() => onFilterChange(prev => ({ ...prev, status: prev.status === status.value ? '' : status.value }))}
              className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium touch-target transition-colors ${
                filter.status === status.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={filter.status === status.value}
            >
              {status.label}
            </button>
          ))}
        </div>

        {wardOptions && wardOptions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {wardOptions.map(ward => (
              <button
                key={ward.value}
                type="button"
                onClick={() => onFilterChange(prev => ({ ...prev, ward: prev.ward === ward.value ? '' : ward.value }))}
                className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium touch-target transition-colors ${
                  filter.ward === ward.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={filter.ward === ward.value}
              >
                {ward.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <label htmlFor="sort-by" className="text-xs text-gray-500 font-medium">Sort:</label>
          <select
            id="sort-by"
            value={filter.sortBy}
            onChange={(e) => onFilterChange(prev => ({ ...prev, sortBy: e.target.value }))}
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
