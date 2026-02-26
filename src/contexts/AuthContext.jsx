import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState(() => {
    try { return localStorage.getItem('workspace') || 'plano' }
    catch { return 'plano' }
  })

  // Derive profile from user metadata
  const profile = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    email: user.email,
    role: user.user_metadata?.role || 'member'
  } : null

  useEffect(() => {
    // Safety timeout: if getSession hangs for more than 4 seconds, stop loading
    const safetyTimer = setTimeout(() => {
      setLoading(false)
    }, 4000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(safetyTimer)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(safetyTimer)
        setUser(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  const switchWorkspace = (ws) => {
    setWorkspace(ws)
    try { localStorage.setItem('workspace', ws) } catch {}
  }

  const signInWithEmail = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signUpWithEmail = async (email, password, name) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
  }

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    try { localStorage.removeItem('workspace') } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user, loading, profile, workspace,
      switchWorkspace, signInWithEmail, signUpWithEmail, resetPassword, signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
