import { useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'

export function AdminWards({ complaints }) {
  const wardStats = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    const map = {}
    for (const w of MIRA_BHAYANDER.wards) {
      const wardComplaints = arr.filter(c => c.ward === w.name)
      map[w.name] = {
        total: wardComplaints.length,
        pending: wardComplaints.filter(c => c.status === 'submitted').length,
        inProgress: wardComplaints.filter(c => c.status === 'in_progress').length,
        resolved: wardComplaints.filter(c => c.status === 'resolved').length,
      }
    }
    return map
  }, [complaints])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-1">Ward Overview</h3>
        <p className="text-sm text-gray-500">
          {MIRA_BHAYANDER.wards.length} wards across Mira Bhayander
        </p>
      </div>

      <div className="grid gap-3">
        {MIRA_BHAYANDER.wards.map(ward => {
          const data = wardStats[ward.name]
          return (
            <div key={ward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{ward.name}</h4>
                  <p className="text-xs text-gray-500">{ward.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
                  <p className="text-xs text-gray-500">complaints</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Important Contacts</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">MBMC Water Complaint</p>
              <p className="text-xs text-gray-500">Water supply issues, pipeline bursts</p>
            </div>
            <a href={`tel:${MIRA_BHAYANDER.contacts.waterComplaint}`} className="text-primary-600 font-medium hover:underline">
              {MIRA_BHAYANDER.contacts.waterComplaint}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Emergency</p>
              <p className="text-xs text-gray-500">24x7 emergency helpline</p>
            </div>
            <a href={`tel:${MIRA_BHAYANDER.contacts.emergency}`} className="text-primary-600 font-medium hover:underline">
              {MIRA_BHAYANDER.contacts.emergency}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Website</p>
              <p className="text-xs text-gray-500">MBMC official portal</p>
            </div>
            <a href={MIRA_BHAYANDER.contacts.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-medium hover:underline truncate max-w-[200px] sm:max-w-[300px]">
              {MIRA_BHAYANDER.contacts.website.replace('https://', '')}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Known Issue Areas</h3>
        <div className="space-y-3">
          {MIRA_BHAYANDER.knownIssueAreas.map((area, i) => (
            <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <h4 className="text-sm font-medium text-gray-900">{area.area}</h4>
              <ul className="mt-1 space-y-0.5">
                {area.issues.map((issue, j) => (
                  <li key={j} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
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
