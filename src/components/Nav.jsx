import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, CheckSquare, Settings, LogOut } from 'lucide-react'

export default function Nav() {
  const { workspace, switchWorkspace, signOut } = useAuth()

  const navItems = [
    { id: 'plano', label: 'Plano IM', icon: LayoutDashboard, color: '#4ecdc4', bg: 'bg-teal-500/10' },
    { id: 'noha', label: 'Noha', icon: CheckSquare, color: '#8b5cf6', bg: 'bg-violet-500/10' },
    { id: 'settings', label: 'Config', icon: Settings, color: '#94a3b8', bg: 'bg-slate-500/10' },
  ]

  return (
    <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/icons/original-icon.png" alt="Intermarine" className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
            <span className="text-lg font-bold text-white">Intermarine</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = workspace === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => switchWorkspace(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${item.bg} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive ? { borderBottom: `2px solid ${item.color}` } : {}}
                >
                  <Icon size={18} style={isActive ? { color: item.color } : {}} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
