import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, CheckSquare, Settings, LogOut, User } from 'lucide-react'

export default function Nav() {
  const { workspace, switchWorkspace, profile, signOut } = useAuth()

  const navItems = [
    { id: 'plano', label: 'Plano IM', icon: LayoutDashboard, color: '#4ecdc4' },
    { id: 'noha', label: 'Noha', icon: CheckSquare, color: '#8b5cf6' },
    { id: 'settings', label: 'Config', icon: Settings, color: '#75777b' },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(200, 192, 175, 0.06)', border: '1px solid rgba(200, 192, 175, 0.08)' }}>
              <img src="/icons/original-icon.png" alt="Intermarine" className="w-6 h-6 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-wider uppercase"
                style={{ color: '#c8c0af' }}>Intermarine</span>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(200, 192, 175, 0.03)' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = workspace === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => switchWorkspace(item.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={isActive ? {
                    background: `rgba(${item.color === '#4ecdc4' ? '78,205,196' : item.color === '#8b5cf6' ? '139,92,246' : '117,119,123'}, 0.12)`,
                    color: '#e8ecf4',
                    boxShadow: `0 0 20px ${item.color}15`
                  } : {
                    color: 'rgba(200, 192, 175, 0.4)'
                  }}
                >
                  <Icon size={16} style={isActive ? { color: item.color } : {}} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ background: item.color }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* User + Sign Out */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(200, 192, 175, 0.04)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(200, 192, 175, 0.1)', color: '#c8c0af' }}>
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium" style={{ color: 'rgba(200, 192, 175, 0.5)' }}>
                {profile?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200"
              style={{ color: 'rgba(200, 192, 175, 0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e74c5e'; e.currentTarget.style.background = 'rgba(231, 76, 94, 0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200, 192, 175, 0.3)'; e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
