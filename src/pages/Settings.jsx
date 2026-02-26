import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useResponsive } from '../hooks/useSupabase'
import { LogOut, User, Shield, Info, Anchor, Compass } from 'lucide-react'

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const { isMobile, isLandscape } = useResponsive()

  const pad = isLandscape ? 'pl-20 pr-4 py-4' : isMobile ? 'px-4 py-4' : 'px-6 py-4'

  const handleSignOut = async () => {
    if (confirm('Sair da conta?')) {
      await signOut()
    }
  }

  return (
    <div className={`min-h-screen ${pad}`}>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Profile Card */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(200, 192, 175, 0.08)', color: '#c8c0af', border: '1px solid rgba(200, 192, 175, 0.1)' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-base font-bold text-white">{profile?.name || 'Usuário'}</div>
              <div className="text-xs" style={{ color: 'rgba(200, 192, 175, 0.4)' }}>{user?.email}</div>
              <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-md inline-block"
                style={{ background: 'rgba(78, 205, 196, 0.1)', color: '#4ecdc4' }}>
                {profile?.role === 'admin' ? 'Administrador' : 'Membro'}
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Anchor size={16} style={{ color: '#c8c0af' }} />
            <span className="text-sm font-bold text-white/90">Sobre o App</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between" style={{ color: 'rgba(200, 192, 175, 0.5)' }}>
              <span>Versão</span>
              <span className="font-mono font-bold text-white/70">2.0.0</span>
            </div>
            <div className="flex justify-between" style={{ color: 'rgba(200, 192, 175, 0.5)' }}>
              <span>Plataforma</span>
              <span className="font-bold text-white/70">PWA</span>
            </div>
            <div className="flex justify-between" style={{ color: 'rgba(200, 192, 175, 0.5)' }}>
              <span>Backend</span>
              <span className="font-bold text-white/70">Supabase</span>
            </div>
            <div className="flex justify-between" style={{ color: 'rgba(200, 192, 175, 0.5)' }}>
              <span>Design</span>
              <span className="font-bold text-white/70">Maritime Premium</span>
            </div>
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(200, 192, 175, 0.06)' }}>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(200, 192, 175, 0.3)' }}>
              Intermarine & Noha — Gestão operacional integrada. Plano de Ação Intermarine + Tarefas Noha conectadas por objetivos estratégicos.
            </p>
          </div>
        </div>

        {/* Brand Card */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Compass size={16} style={{ color: '#c8c0af' }} />
            <span className="text-sm font-bold text-white/90">Intermarine</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(200, 192, 175, 0.04)', border: '1px solid rgba(200, 192, 175, 0.06)' }}>
              <img src="/icons/original-icon.png" alt="Intermarine" className="w-10 h-10 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c8c0af' }}>Since 1973</div>
              <div className="text-[11px] mt-1" style={{ color: 'rgba(200, 192, 175, 0.35)' }}>
                Artesanal & Contemporâneo
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="glass-card w-full p-4 flex items-center justify-center gap-2 text-sm font-bold transition-all"
          style={{ color: '#e74c5e' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(231, 76, 94, 0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(200, 192, 175, 0.03)'}>
          <LogOut size={16} />
          Sair da conta
        </button>

        <div className="text-center text-[10px] py-2" style={{ color: 'rgba(200, 192, 175, 0.15)' }}>
          Adicione à tela inicial para experiência completa
        </div>
      </div>
    </div>
  )
}
