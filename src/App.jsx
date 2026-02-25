import React, { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useResponsive } from './hooks/useSupabase'
import Login from './pages/Login'
import PlanoPage from './pages/Plano'
import NohaPage from './pages/Noha'
import Settings from './pages/Settings'
import Nav from './components/Nav'

export default function App() {
  const { user, loading } = useAuth()
  const [workspace, setWorkspace] = useState('plano')
  const [view, setView] = useState('dashboard')
  const { isMobile, isLandscape } = useResponsive()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(160deg, #0f1729 0%, #0c1220 50%, #0f1729 100%)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <img src="/icons/icon-96x96.png" alt="" className="w-10 h-10 rounded-lg" />
          </div>
          <div className="w-8 h-8 mx-auto border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  const isDark = workspace === 'plano'

  return (
    <div className={`min-h-screen font-sans ${isLandscape ? 'pb-0' : 'pb-20'} overflow-x-hidden transition-colors duration-300`}
         style={{
           background: isDark
             ? 'linear-gradient(160deg, #0f1729 0%, #0c1220 50%, #0f1729 100%)'
             : 'linear-gradient(160deg, #f0f2f8 0%, #e4eaf3 100%)',
           color: isDark ? '#e8ecf4' : '#1e293b'
         }}>
      
      <div className="fixed top-[-180px] right-[-120px] w-[420px] h-[420px] rounded-full pointer-events-none"
           style={{ background: isDark
             ? 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)'
             : 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-160px] left-[-80px] w-[350px] h-[350px] rounded-full pointer-events-none"
           style={{ background: isDark
             ? 'radial-gradient(circle, rgba(78,205,196,0.05) 0%, transparent 70%)'
             : 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)' }} />

      {view === 'settings' ? (
        <Settings isDark={isDark} />
      ) : workspace === 'plano' ? (
        <PlanoPage view={view} />
      ) : (
        <NohaPage view={view} />
      )}

      <Nav view={view} onView={setView} workspace={workspace} onWorkspace={setWorkspace}
           isDark={isDark} isLandscape={isLandscape} isMobile={isMobile} />
    </div>
  )
}
