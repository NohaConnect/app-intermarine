import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Plano from './pages/Plano'
import Noha from './pages/Noha'
import Settings from './pages/Settings'
import Nav from './components/Nav'
import { LayoutDashboard, Columns3, List } from 'lucide-react'

function ViewSwitcher({ view, setView, accentColor }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
    { id: 'list', label: 'Lista', icon: List },
  ]
  return (
    <div className="sticky top-16 z-40" style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,192,175,0.06)' }}>
      <div className="max-w-7xl mx-auto flex justify-center py-2">
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(200,192,175,0.03)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = view === tab.id
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={isActive ? {
                  background: `${accentColor}18`,
                  color: '#e8ecf4',
                  boxShadow: `0 0 16px ${accentColor}10`
                } : {
                  color: 'rgba(200,192,175,0.4)'
                }}>
                <Icon size={14} style={isActive ? { color: accentColor } : {}} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, loading, workspace } = useAuth()
  const [view, setView] = useState('dashboard')

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

  const showViewSwitcher = workspace === 'plano' || workspace === 'noha'
  const accentColor = workspace === 'plano' ? '#4ecdc4' : '#8b5cf6'

  return (
    <div className="min-h-screen">
      <Nav />
      {showViewSwitcher && <ViewSwitcher view={view} setView={setView} accentColor={accentColor} />}
      <main>
        {workspace === 'plano' && <Plano view={view} />}
        {workspace === 'noha' && <Noha view={view} />}
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
