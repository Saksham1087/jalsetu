import { useState, useCallback, useEffect } from 'react'
import { ComplaintForm } from './components/ComplaintForm'
import { ComplaintList } from './components/ComplaintList'
import { PublicMap } from './components/PublicMap'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { ComplaintDetail } from './components/ComplaintDetail'
import { ChatWidget } from './components/ChatWidget'
import { AdminLoginPage } from './components/AdminLoginPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { useComplaints } from './hooks/useComplaints'
import { useLocation } from './hooks/useLocation'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { subscribeToAllComplaints, updateComplaintStatus } from './services/firestore'
import { appConfig } from './lib/config'
import { complaintService } from './services/complaintService'

function AppInner() {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [prefillComplaint, setPrefillComplaint] = useState(null)
  const [route, setRoute] = useState('main')
  const [adminComplaints, setAdminComplaints] = useState([])
  
  const { location, error: locationError, requestPermission } = useLocation()
  const { user, loading: authLoading, login, logout, userRole, refreshRole } = useAuthContext()
  const { complaints, loading, error, submitComplaint, refresh } = useComplaints(location, user)

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#/admin' || hash === '#/admin/dashboard') {
      setRoute('admin')
    } else if (hash === '#/login') {
      setRoute('login')
    } else {
      setRoute('main')
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/admin' || hash === '#/admin/dashboard') {
        setRoute('admin')
      } else if (hash === '#/login') {
        setRoute('login')
      } else {
        setRoute('main')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (route === 'admin' && user && !user.isDemoUser && !userRole) {
      refreshRole?.()
    }
  }, [route, user, userRole])

  useEffect(() => {
    const isAdminUser = user && (userRole === 'admin' || (user.isDemoUser && user.role === 'citizen'))
    if (route !== 'admin' || !user || !isAdminUser) return

    if (!appConfig.hasFirebase) {
      complaintService.seedDemoData()
      setAdminComplaints(complaintService.getAll())
      return
    }

    const unsubscribe = subscribeToAllComplaints(
      (data) => setAdminComplaints(data),
      (err) => console.error('Admin subscription error:', err)
    )

    return () => unsubscribe()
  }, [route, user, userRole])

  const handleLogin = useCallback(async () => {
    try { await login() } catch (err) { console.error('Login error:', err) }
  }, [login])

  const handleLogout = useCallback(() => logout(), [logout])

  const handleComplaintSelect = useCallback((complaint) => {
    setSelectedComplaint(complaint)
  }, [])

  const handleStatusUpdate = useCallback(async (id, status, note) => {
    if (!appConfig.hasFirebase) {
      try {
        complaintService.update(id, { status, ...(note && { timeline: [{ status, timestamp: new Date(), note }] }) })
        setAdminComplaints(complaintService.getAll())
      } catch (err) { alert(err.message) }
      return
    }
    try {
      await updateComplaintStatus(id, status, note)
    } catch (err) { alert(err.message) }
  }, [])

  const handleLocationPermission = useCallback(async () => {
    await requestPermission()
  }, [requestPermission])

  const handleNavigateHome = useCallback(() => {
    window.location.hash = '#/'
    setRoute('main')
  }, [])

  if (route === 'login') {
    return <AdminLoginPage onNavigateHome={handleNavigateHome} />
  }

  if (route === 'admin') {
    const isAdmin = user && (userRole === 'admin' || (user.isDemoUser && user.role === 'citizen'))
    if (!user) {
      window.location.hash = '#/login'
      return null
    }
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-6.364A9 9 0 1112 3a9 9 0 016.364 14.636z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-4">You do not have admin privileges.</p>
            <button onClick={handleNavigateHome} className="text-primary-600 hover:underline">Back to Home</button>
          </div>
        </div>
      )
    }

    return (
      <AdminLayout
        complaints={adminComplaints}
        onUpdateStatus={handleStatusUpdate}
        onNavigateHome={handleNavigateHome}
      />
    )
  }

  return (
    <div className="h-screen h-[100dvh] bg-gray-50 safe-area-insets flex flex-col">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main className="flex-1 min-h-0 overflow-hidden relative flex flex-col pb-24">
        {activeTab === 'map' && (
          <PublicMap 
            complaints={complaints}
            loading={loading}
            center={location ? [location.latitude, location.longitude] : [19.2813, 72.8568]}
            zoom={location ? 15 : 12}
            onComplaintClick={handleComplaintSelect}
            showUserLocation={true}
            userLocation={location}
            user={user}
          />
        )}
        
        {activeTab === 'list' && (
          <ComplaintList 
            complaints={complaints} 
            loading={loading}
            error={error}
            onRefresh={refresh}
            userLocation={location}
            user={user}
          />
        )}
        
        {activeTab === 'report' && (
          <ComplaintForm 
            onSubmit={submitComplaint}
            userLocation={location}
            user={user}
            authLoading={authLoading}
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
        position="bottom-right"
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

export default App
