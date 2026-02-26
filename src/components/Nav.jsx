import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Target, Home, Megaphone, Settings, LogOut } from 'lucide-react'

const COLOR_MAP = {
  '#4ecdc4': '78,205,196',
  '#d4a574': '212,165,116',
  '#8b5cf6': '139,92,246',
  '#75777b': '117,119,123',
}

export default function Nav() {
  const { workspace, switchWorkspace, profile, signOut } = useAuth()

  const navItems = [
    { id: 'plano', label: 'Estratégia', labelFull: 'Estratégia 2026', icon: Target, color: '#4ecdc4' },
    { id: 'casa', label: 'Casa', labelFull: 'Casa IM', icon: Home, color: '#d4a574' },
    { id: 'noha', label: 'MKT', labelFull: 'MKT Geral', icon: Megaphone, color: '#8b5cf6' },
    { id: 'settings', label: 'Config', labelFull: 'Config', icon: Settings, color: '#75777b' },
  ]

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(200, 192, 175, 0.06)', border: '1px solid rgba(200, 192, 175, 0.08)' }}>
              <img src="/icons/original-icon.png" alt="Intermarine" className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-bold tracking-wider uppercase"
                style={{ color: '#c8c0af' }}>Intermarine</span>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl overflow-x-auto"
            style={{ background: 'rgba(200, 192, 175, 0.03)' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = workspace === item.id
              const rgb = COLOR_MAP[item.color] || '117,119,123'
              return (
                <button
                  key={item.id}
                  onClick={() => switchWorkspace(item.id)}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex-shrink-0 active:scale-95"
                  style={isActive ? {
                    background: `rgba(${rgb}, 0.12)`,
                    color: '#e8ecf4',
                    boxShadow: `0 0 20px ${item.color}15`
                  } : {
                    color: 'rgba(200, 192, 175, 0.4)'
                  }}
                >
                  <Icon size={15} style={isActive ? { color: item.color } : {}} />
                  <span className="hidden sm:inline">{item.labelFull}</span>
                  <span className="sm:hidden">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* User + Sign Out */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg"
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
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-lg text-sm transition-all duration-200"
              style={{ color: 'rgba(200, 192, 175, 0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e74c5e'; e.currentTarget.style.background = 'rgba(231, 76, 94, 0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200, 192, 175, 0.3)'; e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={16} />
              <span className="hidden md:inline text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
