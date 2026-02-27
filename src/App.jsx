import React, { useState, useMemo, useCallback } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UIProvider, useUI } from './contexts/UIContext'
import { useWorkspaces } from './hooks/useWorkspaces'
import { supabase } from './lib/supabase'

import Login from './pages/Login'
import Settings from './pages/Settings'
import WorkspacePage from './pages/WorkspacePage'
import NohaDashboard from './pages/NohaDashboard'
import WorkspaceNav from './components/WorkspaceNav'
import WorkspaceWizard from './components/workspace/WorkspaceWizard'

import { LayoutDashboard, Columns3, List } from 'lucide-react'

// ─── View Switcher (Dashboard/Kanban/Lista) ─────────
function ViewSwitcher({ accentColor, accentRgb }) {
  const { view, setView } = useUI()
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Columns3 },
    { id: 'list', label: 'Lista', icon: List },
  ]
  return (
    <div className="sticky top-14 sm:top-16 z-40"
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

// ─── Sub-workspace tabs (tabs under a parent client) ─
function SubWorkspaceTabs({ subWorkspaces, activeSubId, onSelect, accentColor, accentRgb }) {
  if (!subWorkspaces || subWorkspaces.length <= 1) return null
  return (
    <div className="sticky top-[88px] sm:top-[104px] z-39"
      style={{ background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
      <div className="flex justify-center py-1.5 px-3 gap-1 overflow-x-auto">
        {subWorkspaces.map(sw => {
          const isActive = activeSubId === sw.id
          return (
            <button key={sw.id} onClick={() => onSelect(sw.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 active:scale-95"
              style={isActive ? {
                background: `rgba(${sw.accent_rgb || accentRgb},0.12)`,
                color: sw.accent_color || accentColor,
              } : {
                color: 'rgba(200,192,175,0.35)'
              }}>
              {sw.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── App Content ─────────────────────────────────────
function AppContent() {
  const { user, loading: authLoading, profile, workspace: legacyWorkspace, switchWorkspace } = useAuth()
  const { view } = useUI()
  const { workspaces, parents, children, addWorkspace, loading: wsLoading } = useWorkspaces()

  // Active workspace state
  const [activeWs, setActiveWs] = useState('noha')
  const [activeSubWs, setActiveSubWs] = useState(null)
  const [showWizard, setShowWizard] = useState(false)

  const isSuperAdmin = profile?.email === 'contato@nohaoficial.com.br'

  // Get sub-workspaces for active parent
  const subWorkspaces = useMemo(() => {
    if (activeWs === 'noha' || activeWs === 'settings') return []
    return children(activeWs)
  }, [activeWs, children])

  // Determine which workspace to actually render
  const activeWorkspace = useMemo(() => {
    if (activeWs === 'noha' || activeWs === 'settings') return null
    // If parent has sub-workspaces, use the active sub-workspace
    if (subWorkspaces.length > 0) {
      const sub = activeSubWs ? subWorkspaces.find(s => s.id === activeSubWs) : subWorkspaces[0]
      return sub || subWorkspaces[0]
    }
    // Simple workspace (no children)
    return workspaces.find(w => w.id === activeWs) || null
  }, [activeWs, activeSubWs, subWorkspaces, workspaces])

  // Handle workspace selection from nav
  const handleSelectWorkspace = useCallback((id) => {
    setActiveWs(id)
    setActiveSubWs(null) // reset sub selection
  }, [])

  // Handle sub-workspace selection
  const handleSelectSub = useCallback((subId) => {
    setActiveSubWs(subId)
  }, [])

  // Create new workspace (from wizard)
  const handleCreateWorkspace = useCallback(async (wsData, frenteNames) => {
    const ws = await addWorkspace(wsData)
    // Create frentes for this workspace
    for (let i = 0; i < frenteNames.length; i++) {
      await supabase.from('frentes').insert({
        workspace_id: ws.id,
        nome: frenteNames[i],
        cor: wsData.accent_color,
        ordem: i + 1,
        ativo: true,
      })
    }
    // Switch to the new workspace
    setActiveWs(ws.parent_id || ws.id)
    if (ws.parent_id) setActiveSubWs(ws.id)
  }, [addWorkspace])

  // Accent for ViewSwitcher
  const accentColor = activeWorkspace?.accent_color || '#c8c0af'
  const accentRgb = activeWorkspace?.accent_rgb || '200,192,175'

  // ─── Loading ───────────────────────────────────
  if (authLoading || wsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(200,192,175,0.06)', border: '1px solid rgba(200,192,175,0.08)' }}>
            <img src="/icons/noha-logo.svg" alt="Noha" className="w-12 h-12 object-contain"
              style={{ filter: 'invert(1) brightness(0.8)' }}
              onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
          </div>
          <div className="w-8 h-8 mx-auto border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(200,192,175,0.1)', borderTopColor: '#c8c0af' }} />
          <p className="mt-4 text-xs font-medium tracking-widest uppercase"
            style={{ color: 'rgba(200,192,175,0.3)' }}>Carregando</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  const showViewSwitcher = activeWs !== 'settings'
  const showSubTabs = subWorkspaces.length > 1

  return (
    <div className="min-h-screen">
      <WorkspaceNav
        parents={parents}
        activeWorkspace={activeWs}
        onSelect={handleSelectWorkspace}
        onCreateNew={() => setShowWizard(true)}
        isSuperAdmin={isSuperAdmin}
      />

      {showViewSwitcher && <ViewSwitcher accentColor={accentColor} accentRgb={accentRgb} />}
      {showSubTabs && (
        <SubWorkspaceTabs
          subWorkspaces={subWorkspaces}
          activeSubId={activeWorkspace?.id}
          onSelect={handleSelectSub}
          accentColor={accentColor}
          accentRgb={accentRgb}
        />
      )}

      <main>
        {activeWs === 'noha' && <NohaDashboard workspaces={workspaces} view={view} />}
        {activeWs === 'settings' && <Settings />}
        {activeWs !== 'noha' && activeWs !== 'settings' && activeWorkspace && (
          <WorkspacePage workspace={activeWorkspace} view={view} />
        )}
      </main>

      {/* Workspace Creation Wizard */}
      {showWizard && (
        <WorkspaceWizard
          onClose={() => setShowWizard(false)}
          onCreateWorkspace={handleCreateWorkspace}
        />
      )}
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
