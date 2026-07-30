import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { ComplaintForm } from './components/ComplaintForm'
import { ComplaintList } from './components/ComplaintList'
import { PublicMap } from './components/PublicMap'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { ComplaintDetail } from './components/ComplaintDetail'
import { Dashboard } from './components/Dashboard'
import { AboutPage } from './components/AboutPage'
import { ProfilePage } from './components/ProfilePage'
import { NotificationPanel } from './components/NotificationPanel'
import { EmergencyButton } from './components/EmergencyButton'
import { AdminLoginPage } from './components/AdminLoginPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { useToast } from './components/Toast'

const ChatWidget = lazy(() => import('./components/ChatWidget').then(m => ({ default: m.ChatWidget })))
import { useComplaints } from './hooks/useComplaints'
import { useLocation } from './hooks/useLocation'
import { useTheme } from './hooks/useTheme'
import { useNotifications } from './hooks/useNotifications'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { subscribeToAllComplaints, subscribeToDeletedComplaints, updateComplaintStatus, softDeleteComplaint, restoreComplaint } from './services/firestore'
import { appConfig } from './lib/config'
import { complaintService } from './services/complaintService'

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [route, setRoute] = useState('main')
  const [adminComplaints, setAdminComplaints] = useState([])
  const [deletedComplaints, setDeletedComplaints] = useState([])
  const [sentNotifications, setSentNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const { location, error: locationError, requestPermission } = useLocation()
  const { user, loading: authLoading, login, userRole, refreshRole } = useAuthContext()
  const { complaints, loading, error, submitComplaint, refresh } = useComplaints(location, user)
  const { notifications, markRead, markAllRead, deleteNotification } = useNotifications(user)
  const { toast } = useToast()
  useTheme()

  const tabFromHash = (hash) => {
    const tabMatch = hash.match(/^#\/(dashboard|map|list|report)$/)
    return tabMatch ? tabMatch[1] : null
  }

  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#/track') {
      window.location.hash = '#/dashboard'
    } else if (hash.startsWith('#/admin')) {
      setRoute('admin')
    } else if (hash === '#/login') {
      setRoute('login')
    } else if (hash === '#/profile') {
      setShowProfile(true)
      window.location.hash = '#/dashboard'
    } else {
      setRoute('main')
      const tab = tabFromHash(hash)
      if (tab) setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/track') {
        window.location.hash = '#/dashboard'
      } else if (hash.startsWith('#/admin')) {
        setRoute('admin')
      } else if (hash === '#/login') {
        setRoute('login')
      } else if (hash === '#/profile') {
        setShowProfile(true)
        window.location.hash = '#/dashboard'
      } else {
        setRoute('main')
        const tab = tabFromHash(hash)
        if (tab) setActiveTab(tab)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (route === 'admin' && user && !user.isDemoUser && !userRole) {
      refreshRole?.()
    }
  }, [route, user, userRole, refreshRole])

  useEffect(() => {
    const isAdminUser = user && (userRole === 'admin' || (user.isDemoUser && user.role === 'citizen'))
    if (route !== 'admin' || !user || !isAdminUser) return

    if (!appConfig.hasFirebase) {
      complaintService.seedDemoData()
      setAdminComplaints(complaintService.getAll())
    }

    const unsubscribe = subscribeToAllComplaints(
      (data) => setAdminComplaints(data.map(c => ({
        ...c,
        latitude: c.latitude ?? c.lat ?? null,
        longitude: c.longitude ?? c.lng ?? null,
        images: Array.isArray(c.images) ? c.images : c.photoURL ? [c.photoURL] : [],
      }))),
      (err) => console.error('Admin subscription error:', err)
    )

    const unsubscribeDeleted = subscribeToDeletedComplaints(
      (data) => setDeletedComplaints(data.map(c => ({
        ...c,
        latitude: c.latitude ?? c.lat ?? null,
        longitude: c.longitude ?? c.lng ?? null,
        images: Array.isArray(c.images) ? c.images : c.photoURL ? [c.photoURL] : [],
      }))),
      (err) => console.error('Deleted complaints subscription error:', err)
    )

    const pollSent = () => complaintService.subscribeToSentNotifications((data) => setSentNotifications(data))
    pollSent()
    const sentInterval = setInterval(pollSent, 2000)

    return () => {
      unsubscribe();
      unsubscribeDeleted();
      clearInterval(sentInterval)
    }
  }, [route, user, userRole])

  const handleLogin = useCallback(async () => {
    try { await login() } catch (err) { console.error('Login error:', err) }
  }, [login])

  const handleComplaintSelect = useCallback((complaint) => {
    setSelectedComplaint(complaint)
  }, [])

  const handleStatusUpdate = useCallback(async (id, status, note) => {
    if (!appConfig.hasFirebase) {
      complaintService.update(id, { status, ...(note && { timeline: [{ status, timestamp: new Date(), note }] }) })
      setAdminComplaints(complaintService.getAll())
      return
    }
    await updateComplaintStatus(id, status, note)
  }, [])

  const handleComplaintDelete = useCallback(async (complaintId) => {
    if (!appConfig.hasFirebase) {
      await complaintService.softDelete(complaintId, user?.uid || 'admin')
      setAdminComplaints(complaintService.getAll())
      setDeletedComplaints(complaintService.getAllDeleted())
      return
    }
    await softDeleteComplaint(complaintId, user?.uid)
  }, [user])

  const handleComplaintRestore = useCallback(async (complaintId) => {
    if (!appConfig.hasFirebase) {
      await complaintService.restore(complaintId)
      setAdminComplaints(complaintService.getAll())
      setDeletedComplaints(complaintService.getAllDeleted())
      return
    }
    await restoreComplaint(complaintId)
  }, [])

  const handleLocationPermission = useCallback(async () => {
    await requestPermission()
  }, [requestPermission])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    window.location.hash = `#/${tab}`
  }, [])

  const handleNavigateHome = useCallback(() => {
    window.location.hash = '#/'
    setRoute('main')
  }, [])

  const handleNotificationClick = useCallback(() => {
    setShowNotifications(v => !v)
  }, [])

  const handleProfileClick = useCallback(() => {
    setShowProfile(true)
  }, [])

  const handleAboutClick = useCallback(() => {
    setShowAbout(true)
  }, [])

  const handleAboutClose = useCallback(() => {
    setShowAbout(false)
  }, [])

  const handleNotificationDelete = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete notification')
    }
  }, [deleteNotification, toast])

  const handleDeleteSentNotification = useCallback(async (logId, batchId) => {
    try {
      if (!appConfig.hasFirebase) {
        if (batchId) {
          await complaintService.markBatchAsDeleted(batchId)
          await complaintService.hardDeleteNotificationsByBatch(batchId)
        }
        await complaintService.deleteSentNotificationLog(logId)
        complaintService.subscribeToSentNotifications((data) => setSentNotifications(data))
      } else {
        try {
          const { markBatchAsDeleted, deleteSentNotificationLog } = await import('./services/firestore')
          if (batchId) await markBatchAsDeleted(batchId)
          await deleteSentNotificationLog(logId)
        } catch {
          if (batchId) {
            await complaintService.markBatchAsDeleted(batchId)
            await complaintService.hardDeleteNotificationsByBatch(batchId)
          }
          await complaintService.deleteSentNotificationLog(logId)
          complaintService.subscribeToSentNotifications((data) => setSentNotifications(data))
        }
      }
      toast.success('Notification deleted for all users')
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification')
    }
  }, [toast])

  const handleNotificationNavigateToComplaint = useCallback((notification) => {
    const complaint = complaints.find(c => c.id === notification.complaintId)
    if (complaint) {
      setSelectedComplaint(complaint)
    }
    setShowNotifications(false)
  }, [complaints])

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
            <button onClick={handleNavigateHome} className="text-teal-600 hover:underline">Back to Home</button>
          </div>
        </div>
      )
    }

    return (
      <AdminLayout
        complaints={adminComplaints}
        deletedComplaints={deletedComplaints}
        sentNotifications={sentNotifications}
        onUpdateStatus={handleStatusUpdate}
        onDelete={handleComplaintDelete}
        onRestore={handleComplaintRestore}
        onNavigateHome={handleNavigateHome}
        onDeleteSentNotification={handleDeleteSentNotification}
      />
    )
  }

  return (
    <div className="h-screen h-[100dvh] bg-page safe-area-insets flex flex-col">
      <Header
        user={user}
        onLogin={handleLogin}
        onNotificationClick={handleNotificationClick}
        onProfileClick={handleProfileClick}
        onAboutClick={handleAboutClick}
      />

      <main className="flex-1 min-h-0 relative flex flex-col pb-24">
        {showAbout ? (
          <AboutPage onClose={handleAboutClose} />
        ) : showProfile ? (
          <ProfilePage
            complaints={complaints}
            onClose={() => setShowProfile(false)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                complaints={complaints}
                loading={loading}
                onComplaintSelect={handleComplaintSelect}
                onComplaintFound={handleComplaintSelect}
                onTabChange={handleTabChange}
                onNotificationClick={handleNotificationClick}
              />
            )}

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
              />
            )}
          </>
        )}

        {selectedComplaint && (
          <ComplaintDetail
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onUpdateStatus={handleStatusUpdate}
          />
        )}
      </main>

      {!showProfile && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onNavigateToComplaint={handleNotificationNavigateToComplaint}
          onDelete={handleNotificationDelete}
        />
      )}

      {locationError && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md mx-auto">
            <span className="text-sm font-medium">Location access needed for map and nearby complaints</span>
            <button onClick={handleLocationPermission} className="ml-auto px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">Enable</button>
          </div>
        </div>
      )}

      <EmergencyButton />

      {appConfig.hasGroq && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
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
