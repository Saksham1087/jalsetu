import { useState, useEffect, useCallback } from 'react'
import { ComplaintForm } from './components/ComplaintForm'
import { ComplaintList } from './components/ComplaintList'
import { MapView } from './components/MapView'
import { PublicMap } from './components/PublicMap'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { ComplaintDetail } from './components/ComplaintDetail'
import { ChatWidget } from './components/ChatWidget'
import { useComplaints } from './hooks/useComplaints'
import { useLocation } from './hooks/useLocation'
import { useAuth } from './hooks/useAuth'
import { complaintService } from './services/complaintService'

function App() {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [prefillComplaint, setPrefillComplaint] = useState(null)
  
  const { complaints, loading, error, submitComplaint, refresh, updateComplaint } = useComplaints()
  const { location, error: locationError, getCurrentLocation, requestPermission } = useLocation()
  const { user, loading: authLoading, login, logout } = useAuth()

  useEffect(() => {
    complaintService.seedDemoData()
    refresh()
  }, [refresh])

  const handleLogin = useCallback(async () => {
    try { await login() } catch (err) { console.error('Login error:', err) }
  }, [login])

  const handleLogout = useCallback(() => logout(), [logout])

  const handleComplaintSelect = useCallback((complaint) => {
    setSelectedComplaint(complaint)
  }, [])

  const handleStatusUpdate = useCallback(async (id, status) => {
    try { await updateComplaint(id, { status }) } catch (err) { alert(err.message) }
  }, [updateComplaint])

  const handleLocationPermission = useCallback(async () => {
    await requestPermission()
  }, [requestPermission])

  const handleFileComplaintFromChat = useCallback((userMessage, suggestedSeverity) => {
    setPrefillComplaint({ userMessage, suggestedSeverity })
    setActiveTab('report')
  }, [])

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 safe-area-insets flex flex-col">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'map' && (
          <PublicMap 
            center={location ? [location.latitude, location.longitude] : [28.6139, 77.2090]}
            zoom={location ? 15 : 12}
            onComplaintClick={handleComplaintSelect}
            showUserLocation={true}
            userLocation={location}
          />
        )}
        
        {activeTab === 'list' && (
          <ComplaintList 
            complaints={complaints} 
            loading={loading}
            error={error}
            onRefresh={refresh}
            userLocation={location}
          />
        )}
        
        {activeTab === 'report' && (
          <ComplaintForm 
            onSubmit={submitComplaint}
            userLocation={location}
            user={user}
            loading={loading}
            prefill={prefillComplaint}
            onPrefillComplete={() => setPrefillComplaint(null)}
          />
        )}

        {selectedComplaint && (
          <ComplaintDetail
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onUpdateStatus={handleStatusUpdate}
          />
        )}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userLocation={location}
        user={user}
      />
      
      {locationError && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md mx-auto">
            <span className="text-sm font-medium">Location access needed for map and nearby complaints</span>
            <button onClick={handleLocationPermission} className="ml-auto px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">Enable</button>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget 
        user={user} 
        onFileComplaint={handleFileComplaintFromChat}
        position="bottom-right"
      />
    </div>
  )
}

export default App
