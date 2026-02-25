import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Plano from './pages/Plano'
import Noha from './pages/Noha'
import Settings from './pages/Settings'
import Nav from './components/Nav'

function AppContent() {
  const { user, loading, workspace } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <img src="/icons/original-icon.png" alt="Intermarine" className="w-10 h-10 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
          </div>
          <div className="w-8 h-8 mx-auto border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {workspace === 'settings' && <Settings />}
        {workspace === 'plano' && <Plano />}
        {workspace === 'noha' && <Noha />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
