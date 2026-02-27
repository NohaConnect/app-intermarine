import React, { memo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart3, Settings, LogOut, Plus, ChevronDown,
  Target, Home, Megaphone, Ship, Briefcase
} from 'lucide-react'

const ICON_MAP = {
  target: Target,
  home: Home,
  megaphone: Megaphone,
  ship: Ship,
  briefcase: Briefcase,
  settings: Settings,
}

function getIcon(name) {
  return ICON_MAP[name] || Briefcase
}

function rgbFromHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

/**
 * WorkspaceNav — dynamic navigation with workspace tabs loaded from DB.
 * Shows: Noha (global) | Client1 | Client2 | ... | + | Config
 */
const WorkspaceNav = memo(function WorkspaceNav({
  parents,          // top-level workspaces (clients)
  activeWorkspace,  // current workspace id or 'noha' / 'settings'
  onSelect,         // (workspaceId | 'noha' | 'settings') => void
  onCreateNew,      // () => void — open workspace wizard
  isSuperAdmin,
}) {
  const { profile, signOut } = useAuth()

  const tabs = [
    // Noha global dashboard always first
    { id: 'noha', label: 'Gestão', labelFull: 'Noha | Gestão', icon: BarChart3, color: '#c8c0af' },
    // Dynamic client workspaces
    ...parents.map(p => ({
      id: p.id,
      label: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
      labelFull: p.name,
      icon: getIcon(p.icon),
      color: p.accent_color,
    })),
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50 px-2 sm:px-4"
      style={{ borderBottom: '1px solid rgba(200,192,175,0.06)' }}>
      <div className="flex items-center h-14 sm:h-16 gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-2 sm:pr-4 mr-1 sm:mr-2 flex-shrink-0"
          style={{ borderRight: '1px solid rgba(200,192,175,0.08)' }}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(200,192,175,0.08) 0%, rgba(200,192,175,0.02) 100%)', border: '1px solid rgba(200,192,175,0.08)' }}>
            <img src="/icons/original-icon.png" alt="N" className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.textContent = 'N' }} />
          </div>
          <span className="text-sm sm:text-base font-black tracking-wider text-white hidden sm:block">NOHA</span>
        </div>

        {/* Workspace tabs — scrollable */}
        <div className="flex-1 overflow-x-auto flex items-center gap-0.5 sm:gap-1 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeWorkspace === tab.id
            const rgb = rgbFromHex(tab.color || '#c8c0af')
            return (
              <button key={tab.id} onClick={() => onSelect(tab.id)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 active:scale-95"
                style={isActive ? {
                  background: `rgba(${rgb},0.12)`,
                  color: '#e8ecf4',
                } : {
                  color: 'rgba(200,192,175,0.4)',
                }}>
                <Icon size={14} style={isActive ? { color: tab.color } : {}} />
                <span className="hidden xs:inline sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.labelFull}</span>
                {/* Show only icon on very small screens */}
              </button>
            )
          })}

          {/* Add workspace button — only for superadmin */}
          {isSuperAdmin && onCreateNew && (
            <button onClick={onCreateNew}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 active:scale-95"
              style={{ color: 'rgba(200,192,175,0.3)', border: '1px dashed rgba(200,192,175,0.12)' }}>
              <Plus size={13} />
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
        </div>

        {/* Config + Profile */}
        <div className="flex items-center gap-1 sm:gap-2 ml-1 flex-shrink-0">
          <button onClick={() => onSelect('settings')}
            className="p-1.5 sm:p-2 rounded-lg transition-all active:scale-95"
            style={activeWorkspace === 'settings'
              ? { background: 'rgba(117,119,123,0.12)', color: '#e8ecf4' }
              : { color: 'rgba(200,192,175,0.4)' }}>
            <Settings size={16} />
          </button>

          {/* Profile */}
          <div className="items-center gap-2 hidden md:flex">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.5)' }}>
              {(profile?.name || 'U')[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium hidden lg:block" style={{ color: 'rgba(200,192,175,0.4)' }}>
              {profile?.name?.split(' ')[0]}
            </span>
          </div>

          <button onClick={signOut}
            className="p-1.5 rounded-lg transition-all active:scale-95"
            style={{ color: 'rgba(200,192,175,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e74c5e'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,192,175,0.25)'}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  )
})

export default WorkspaceNav
