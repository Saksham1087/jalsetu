import { useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'

export function AdminWards({ complaints }) {
  const wardStats = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    const map = Object.fromEntries(MIRA_BHAYANDER.wards.map(w => [w.name, { total: 0, pending: 0, inProgress: 0, resolved: 0 }]))
    for (const c of arr) {
      const entry = map[c.ward]
      if (entry) {
        entry.total++
        if (c.status === 'submitted') entry.pending++
        else if (c.status === 'in_progress') entry.inProgress++
        else if (c.status === 'resolved') entry.resolved++
      }
    }
    return map
  }, [complaints])

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-text-primary mb-1">Ward Overview</h3>
        <p className="text-sm text-text-secondary">
          {MIRA_BHAYANDER.wards.length} wards across Mira Bhayander
        </p>
      </div>

      <div className="grid gap-3">
        {MIRA_BHAYANDER.wards.map(ward => {
          const data = wardStats[ward.name]
          return (
            <div key={ward.id} className="bg-card rounded-xl shadow-sm border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-text-primary">{ward.name}</h4>
                  <p className="text-xs text-text-secondary">{ward.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-primary">{data?.total || 0}</p>
                  <p className="text-xs text-text-secondary">complaints</p>
                </div>
              </div>
              {data && data.total > 0 && (
                <div className="flex gap-3 text-xs mt-1">
                  {data.pending > 0 && <span className="text-yellow-600">{data.pending} pending</span>}
                  {data.inProgress > 0 && <span className="text-indigo-600">{data.inProgress} in progress</span>}
                  {data.resolved > 0 && <span className="text-green-600">{data.resolved} resolved</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-text-primary mb-3">Important Contacts</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">MBMC Water Complaint</p>
              <p className="text-xs text-text-secondary">Water supply issues, pipeline bursts</p>
            </div>
            <a href={`tel:${MIRA_BHAYANDER.contacts.waterComplaint}`} className="text-teal-600 font-medium hover:underline">
              {MIRA_BHAYANDER.contacts.waterComplaint}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Emergency</p>
              <p className="text-xs text-text-secondary">24x7 emergency helpline</p>
            </div>
            <a href={`tel:${MIRA_BHAYANDER.contacts.emergency}`} className="text-teal-600 font-medium hover:underline">
              {MIRA_BHAYANDER.contacts.emergency}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Website</p>
              <p className="text-xs text-text-secondary">MBMC official portal</p>
            </div>
            <a href={MIRA_BHAYANDER.contacts.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-medium hover:underline truncate max-w-[200px] sm:max-w-[300px]">
              {MIRA_BHAYANDER.contacts.website?.replace('https://', '') || 'Visit website'}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <h3 className="font-semibold text-text-primary mb-3">Known Issue Areas</h3>
        <div className="space-y-3">
          {MIRA_BHAYANDER.knownIssueAreas.map((area, i) => (
            <div key={i} className="pb-3 border-b border-divider last:border-0 last:pb-0">
              <h4 className="text-sm font-medium text-text-primary">{area.area}</h4>
              <ul className="mt-1 space-y-0.5">
                {area.issues.map((issue, j) => (
                  <li key={j} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-text-tertiary mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
