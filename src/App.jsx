import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UIProvider, useUI } from './contexts/UIContext'
import Login from './pages/Login'
import Plano from './pages/Plano'
import Casa from './pages/Casa'
import Noha from './pages/Noha'
import Settings from './pages/Settings'
import Nav from './components/Nav'
import { LayoutDashboard, Columns3, List } from 'lucide-react'

// ─── View Switcher (below Nav) ───────────────────────
function ViewSwitcher({ accentColor, accentRgb }) {
  const { view, setView } = useUI()
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
    { id: 'list', label: 'Lista', icon: List },
  ]
  return (
    <div className="sticky top-16 z-40"
      style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,192,175,0.06)' }}>
      <div className="flex justify-center py-2 px-3">
        <div className="flex items-center gap-1 p-1 rounded-xl w-full sm:w-auto justify-center"
          style={{ background: 'rgba(200,192,175,0.03)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = view === tab.id
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className="flex items-center gap-1.5 flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95"
                style={isActive ? {
                  background: `rgba(${accentRgb},0.15)`,
                  color: '#e8ecf4',
                  boxShadow: `0 0 16px rgba(${accentRgb},0.08)`
                } : {
                  color: 'rgba(200,192,175,0.4)'
                }}>
                <Icon size={15} style={isActive ? { color: accentColor } : {}} />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── App Content ─────────────────────────────────────
function AppContent() {
  const { user, loading, workspace } = useAuth()
  const { view } = useUI()

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

  const showViewSwitcher = workspace === 'plano' || workspace === 'casa' || workspace === 'noha'
  const accentMap = {
    plano: { color: '#4ecdc4', rgb: '78,205,196' },
    casa:  { color: '#d4a574', rgb: '212,165,116' },
    noha:  { color: '#8b5cf6', rgb: '139,92,246' },
  }
  const accentColor = accentMap[workspace]?.color || '#4ecdc4'
  const accentRgb = accentMap[workspace]?.rgb || '78,205,196'

  return (
    <div className="min-h-screen">
      <Nav />
      {showViewSwitcher && <ViewSwitcher accentColor={accentColor} accentRgb={accentRgb} />}
      <main>
        {workspace === 'plano' && <Plano view={view} />}
        {workspace === 'casa' && <Casa view={view} />}
        {workspace === 'noha' && <Noha view={view} />}
        {workspace === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </AuthProvider>
  )
}
