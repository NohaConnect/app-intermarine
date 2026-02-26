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
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(200, 192, 175, 0.06)', border: '1px solid rgba(200, 192, 175, 0.08)' }}>
            <img src="/icons/original-icon.png" alt="Intermarine" className="w-12 h-12 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
          </div>
          <div className="w-8 h-8 mx-auto border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(200, 192, 175, 0.1)', borderTopColor: '#c8c0af' }} />
          <p className="mt-4 text-xs font-medium tracking-widest uppercase"
            style={{ color: 'rgba(200, 192, 175, 0.3)' }}>Carregando</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {workspace === 'plano' && <Plano />}
        {workspace === 'noha' && <Noha />}
        {workspace === 'settings' && <Settings />}
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
