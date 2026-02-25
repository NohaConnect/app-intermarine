import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setMessage(null)
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await signUpWithEmail(email, password, name)
        if (error) throw error
        setMessage('Conta criada! Verifique seu email para confirmar.')
        setMode('login')
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Email de recuperacao enviado!')
        setMode('login')
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos'
        : err.message === 'User already registered' ? 'Este email ja esta cadastrado' : err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
         style={{ background: 'linear-gradient(160deg, #0f1729 0%, #0c1220 50%, #0f1729 100%)' }}>
      <div className="fixed top-[-180px] right-[-120px] w-[420px] h-[420px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-160px] left-[-80px] w-[350px] h-[350px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.05) 0%, transparent 70%)' }} />
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]">
            <img src="/icons/icon-96x96.png" alt="Logo" className="w-14 h-14 rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Intermarine & Noha</h1>
          <p className="text-white/40 text-sm mt-1">Gestao Operacional</p>
        </div>
        <div className="glass-dark p-6 sm:p-8">
          {message && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (<div><label className="label text-white/40">Nome</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required className="input-dark" /></div>)}
            <div><label className="label text-white/40">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-dark" /></div>
            {mode !== 'forgot' && (<div><label className="label text-white/40">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input-dark" /></div>)}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Aguarde...</span>
              : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link'}
            </button>
          </form>
          <div className="mt-5 text-center text-sm">
            {mode === 'login' && (<><button onClick={() => setMode('forgot')} className="text-white/40 hover:text-white/60 transition-colors">Esqueceu a senha?</button><div className="mt-2"><span className="text-white/30">Nao tem conta? </span><button onClick={() => setMode('signup')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Criar conta</button></div></>)}
            {mode === 'signup' && (<div><span className="text-white/30">Ja tem conta? </span><button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Fazer login</button></div>)}
            {mode === 'forgot' && (<button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Voltar ao login</button>)}
          </div>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">Acesso restrito ao time Intermarine & Noha</p>
      </div>
    </div>
  )
}
