import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useResponsive } from '../hooks/useSupabase'
import { LogOut, User, Shield, Info } from 'lucide-react'

export default function Settings({ isDark }) {
  const { user, profile, signOut } = useAuth()
  const { isMobile, isLandscape } = useResponsive()
  const tx = isDark ? '#e8ecf4' : '#1e293b'
  const dim = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const cardClass = isDark ? 'glass-dark' : 'glass-light'
  const pad = isLandscape ? 'pl-20 pr-4 py-4' : isMobile ? 'px-4 py-4' : 'px-6 py-4'

  const handleSignOut = async () => {
    if (confirm('Sair da conta?')) { await signOut() }
  }

  return (
    <div className={`min-h-screen ${pad}`}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className={`${cardClass} p-5`}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                 style={{ background: isDark ? 'rgba(77,168,218,0.15)' : 'rgba(37,99,235,0.1)', color: isDark ? '#4da8da' : '#2563eb' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: tx }}>{profile?.name || 'Usuario'}</div>
              <div className="text-xs" style={{ color: dim }}>{user?.email}</div>
              <div className="text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-md inline-block"
                   style={{ background: isDark ? 'rgba(78,205,196,0.12)' : 'rgba(16,185,129,0.1)', color: isDark ? '#4ecdc4' : '#10b981' }}>
                {profile?.role === 'admin' ? 'Administrador' : 'Membro'}
              </div>
            </div>
          </div>
        </div>
        <div className={`${cardClass} p-5`}>
          <div className="flex items-center gap-3 mb-4">
            <Info size={18} style={{ color: dim }} />
            <span className="text-sm font-bold" style={{ color: tx }}>Sobre o App</span>
          </div>
          <div className="space-y-2 text-xs" style={{ color: dim }}>
            <div className="flex justify-between"><span>Versao</span><span className="font-mono font-bold">1.0.0</span></div>
            <div className="flex justify-between"><span>Plataforma</span><span className="font-bold">PWA</span></div>
            <div className="flex justify-between"><span>Backend</span><span className="font-bold">Supabase</span></div>
          </div>
          <p className="text-[10px] mt-3 leading-relaxed" style={{ color: dim }}>
            Intermarine & Noha — Gestao operacional integrada. Plano de Acao Intermarine + Tarefas Noha conectadas por objetivos estrategicos.
          </p>
        </div>
        <button onClick={handleSignOut}
                className={`${cardClass} w-full p-4 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-[0.98] active:scale-95`}
                style={{ color: '#ef4444' }}>
          <LogOut size={16} /> Sair da conta
        </button>
        <div className="text-center text-[10px] py-2" style={{ color: dim }}>Adicione a tela inicial para experiencia completa</div>
      </div>
    </div>
  )
}
