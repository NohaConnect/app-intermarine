import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useResponsive } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import { LogOut, User, Shield, Anchor, Compass, UserPlus, Check, AlertTriangle } from 'lucide-react'

export default function Settings() {
  const { user, profile, signOut, createUser } = useAuth()
  const { isMobile, isLandscape } = useResponsive()
  const isSuperAdmin = profile?.is_superadmin || profile?.email === 'contato@nohaoficial.com.br'

  const pad = isLandscape ? 'pl-20 pr-4 py-4' : isMobile ? 'px-4 py-4' : 'px-6 py-4'

  const handleSignOut = async () => {
    if (confirm('Sair da conta?')) await signOut()
  }

  // ─── User Management (admin only) ─────────────
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState(null)

  // Workspaces for access assignment
  const [workspaces, setWorkspaces] = useState([])
  const [selectedWs, setSelectedWs] = useState([])

  useEffect(() => {
    if (isSuperAdmin) {
      supabase.from('workspaces').select('*').is('parent_id', null).order('ordem').then(({ data }) => {
        setWorkspaces(data || [])
      })
    }
  }, [isSuperAdmin])

  const handleCreateUser = async () => {
    if (!newEmail.trim() || !newPassword || !newName.trim()) {
      setCreateMsg({ type: 'error', text: 'Preencha todos os campos' })
      return
    }
    try {
      setCreating(true)
      setCreateMsg(null)
      const { user: newUser } = await createUser(newEmail.trim(), newPassword, newName.trim())

      // Assign workspace access
      if (newUser && selectedWs.length > 0) {
        for (const wsId of selectedWs) {
          await supabase.from('user_workspace_access').insert({
            user_id: newUser.id,
            workspace_id: wsId,
          })
        }
      }

      setCreateMsg({ type: 'success', text: `Usuário ${newName} criado com sucesso!` })
      setNewEmail('')
      setNewPassword('')
      setNewName('')
      setSelectedWs([])
      setShowCreateUser(false)
    } catch (e) {
      setCreateMsg({ type: 'error', text: e.message })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={`min-h-screen ${pad}`}>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Profile Card */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(200,192,175,0.08)', color: '#c8c0af', border: '1px solid rgba(200,192,175,0.1)' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-base font-bold text-white">{profile?.name || 'Usuário'}</div>
              <div className="text-xs" style={{ color: 'rgba(200,192,175,0.4)' }}>{user?.email}</div>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block"
                  style={{ background: 'rgba(78,205,196,0.1)', color: '#4ecdc4' }}>
                  {isSuperAdmin ? 'Super Admin' : 'Membro'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management — Admin only */}
        {isSuperAdmin && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={16} style={{ color: '#c8c0af' }} />
              <span className="text-sm font-bold text-white/90">Gerenciar Usuários</span>
            </div>

            {createMsg && (
              <div className="p-3 rounded-lg mb-3 flex items-center gap-2 text-xs"
                style={{
                  background: createMsg.type === 'success' ? 'rgba(78,205,196,0.08)' : 'rgba(231,76,94,0.08)',
                  color: createMsg.type === 'success' ? '#4ecdc4' : '#e74c5e',
                }}>
                {createMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                {createMsg.text}
              </div>
            )}

            {!showCreateUser ? (
              <button onClick={() => setShowCreateUser(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.5)', border: '1px dashed rgba(200,192,175,0.12)' }}>
                <UserPlus size={16} /> Criar novo login
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="label">Nome</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Nome do usuário" className="input-dark" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com" className="input-dark" />
                </div>
                <div>
                  <label className="label">Senha</label>
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Senha inicial" className="input-dark" />
                </div>
                <div>
                  <label className="label">Workspaces com acesso</label>
                  <div className="space-y-1.5 mt-1">
                    {workspaces.map(ws => (
                      <label key={ws.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                        style={{ background: selectedWs.includes(ws.id) ? `rgba(${ws.accent_rgb || '200,192,175'},0.08)` : 'transparent' }}>
                        <input type="checkbox" checked={selectedWs.includes(ws.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedWs(prev => [...prev, ws.id])
                            else setSelectedWs(prev => prev.filter(id => id !== ws.id))
                          }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ws.accent_color }} />
                        <span className="text-sm text-white/70">{ws.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowCreateUser(false); setCreateMsg(null) }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.5)' }}>
                    Cancelar
                  </button>
                  <button onClick={handleCreateUser} disabled={creating}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #4ecdc4, #4ecdc4dd)', opacity: creating ? 0.5 : 1 }}>
                    {creating ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* App Info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Anchor size={16} style={{ color: '#c8c0af' }} />
            <span className="text-sm font-bold text-white/90">Sobre o App</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              ['Versão', '3.0.0'],
              ['Plataforma', 'PWA'],
              ['Backend', 'Supabase'],
              ['Design', 'Maritime Premium'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between" style={{ color: 'rgba(200,192,175,0.5)' }}>
                <span>{label}</span>
                <span className="font-mono font-bold text-white/70">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(200,192,175,0.06)' }}>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(200,192,175,0.3)' }}>
              Noha — Plataforma de gestão multi-cliente. Gerencie todos os seus clientes e projetos em um só lugar.
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="glass-card w-full p-4 flex items-center justify-center gap-2 text-sm font-bold transition-all"
          style={{ color: '#e74c5e' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,94,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}>
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
