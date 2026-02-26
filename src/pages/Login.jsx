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
        setMessage('Email de recuperação enviado!')
        setMode('login')
      }
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials' ? 'Email ou senha incorretos' :
        err.message === 'User already registered' ? 'Este email já está cadastrado' :
        err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Maritime background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(78,205,196,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(200,192,175,0.03) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.02) 0%, transparent 70%)' }} />
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(200,192,175,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,192,175,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-5"
            style={{
              background: 'rgba(200, 192, 175, 0.04)',
              border: '1px solid rgba(200, 192, 175, 0.08)',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)'
            }}>
            <img src="/icons/original-icon.png" alt="Intermarine" className="w-16 h-16 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/icons/icon-96x96.png' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#c8c0af' }}>
            Intermarine
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-8" style={{ background: 'rgba(200, 192, 175, 0.15)' }} />
            <p className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: 'rgba(200, 192, 175, 0.3)' }}>
              Desde 1973
            </p>
            <div className="h-px w-8" style={{ background: 'rgba(200, 192, 175, 0.15)' }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-modal p-7 sm:p-9">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white/90">
              {mode === 'login' ? 'Acessar plataforma' : mode === 'signup' ? 'Criar conta' : 'Recuperar senha'}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(200, 192, 175, 0.4)' }}>
              {mode === 'login' ? 'Gestão Operacional Integrada' : mode === 'signup' ? 'Preencha seus dados' : 'Enviaremos um link de recuperação'}
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(78, 205, 196, 0.08)', border: '1px solid rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(231, 76, 94, 0.08)', border: '1px solid rgba(231, 76, 94, 0.15)', color: '#e74c5e' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Seu nome" required className="input-dark" />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required className="input-dark" />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="label">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} className="input-dark" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Aguarde...
                </span>
              ) : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')}
                  className="text-xs transition-colors" style={{ color: 'rgba(200, 192, 175, 0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(200, 192, 175, 0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(200, 192, 175, 0.3)'}>
                  Esqueceu a senha?
                </button>
                <div className="mt-3">
                  <span style={{ color: 'rgba(200, 192, 175, 0.25)' }} className="text-xs">Não tem conta? </span>
                  <button onClick={() => setMode('signup')}
                    className="text-xs font-semibold transition-colors" style={{ color: '#4ecdc4' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#6ee7de'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4ecdc4'}>
                    Criar conta
                  </button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <div>
                <span style={{ color: 'rgba(200, 192, 175, 0.25)' }} className="text-xs">Já tem conta? </span>
                <button onClick={() => setMode('login')}
                  className="text-xs font-semibold transition-colors" style={{ color: '#4ecdc4' }}>
                  Fazer login
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')}
                className="text-xs font-semibold transition-colors" style={{ color: '#4ecdc4' }}>
                Voltar ao login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(200, 192, 175, 0.15)' }}>
          Acesso restrito ao time Intermarine & Noha
        </p>
      </div>
    </div>
  )
}
