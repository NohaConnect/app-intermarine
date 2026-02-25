import React from 'react'
import { LayoutDashboard, Columns3, List, Settings, Ship, Palette } from 'lucide-react'

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban', Icon: Columns3 },
  { id: 'list', label: 'Lista', Icon: List },
  { id: 'settings', label: 'Config', Icon: Settings }
]

const WORKSPACES = [
  { id: 'plano', label: 'Plano IM', Icon: Ship },
  { id: 'noha', label: 'Noha', Icon: Palette }
]

export default function Nav({ view, onView, workspace, onWorkspace, isDark, isLandscape, isMobile }) {
  const bg = isDark ? 'rgba(12,18,35,0.92)' : 'rgba(255,255,255,0.92)'
  const accent = isDark ? '#4da8da' : '#2563eb'
  const dim = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  if (isLandscape) {
    return (
      <nav className="fixed left-0 top-0 bottom-0 w-16 flex flex-col items-center py-3 gap-1 z-50 safe-left"
           style={{ background: bg, backdropFilter: 'blur(20px) saturate(180%)', borderRight: `1px solid ${border}` }}>
        {WORKSPACES.map(ws => (
          <button key={ws.id} onClick={() => onWorkspace(ws.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ background: workspace === ws.id ? `${accent}15` : 'transparent', color: workspace === ws.id ? accent : dim }}>
            <ws.Icon size={18} strokeWidth={workspace === ws.id ? 2.5 : 1.5} />
          </button>
        ))}
        <div className="w-6 h-px my-1" style={{ background: border }} />
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => onView(v.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ background: view === v.id ? `${accent}15` : 'transparent', color: view === v.id ? accent : dim }}>
            <v.Icon size={16} strokeWidth={view === v.id ? 2.5 : 1.5} />
          </button>
        ))}
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
         style={{ background: bg, backdropFilter: 'blur(20px) saturate(180%)', borderTop: `1px solid ${border}` }}>
      <div className="flex items-center px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="flex gap-0.5 p-1 rounded-xl mr-1" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
          {WORKSPACES.map(ws => (
            <button key={ws.id} onClick={() => onWorkspace(ws.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center gap-1"
                    style={{ background: workspace === ws.id ? accent : 'transparent', color: workspace === ws.id ? '#fff' : dim, letterSpacing: '0.04em' }}>
              <ws.Icon size={12} />
              {!isMobile || workspace === ws.id ? ws.label : ''}
            </button>
          ))}
        </div>
        <div className="flex flex-1 justify-around">
          {VIEWS.map(v => {
            const active = view === v.id
            return (
              <button key={v.id} onClick={() => onView(v.id)}
                      className="flex flex-col items-center py-2 px-2 transition-all duration-200 relative">
                <v.Icon size={18} strokeWidth={active ? 2.5 : 1.5} style={{ color: active ? accent : dim }} />
                <span className="text-[9px] font-semibold mt-0.5 tracking-wide" style={{ color: active ? accent : dim }}>{v.label}</span>
                {active && <div className="absolute -bottom-0 w-5 h-0.5 rounded-full" style={{ background: accent }} />}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
