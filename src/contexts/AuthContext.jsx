import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)

  // Fetch profile from profiles table (for is_superadmin)
  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfileData(data)
    } catch {
      setProfileData(null)
    }
  }

  // Derive profile from user metadata + DB profile
  const profile = user ? {
    name: profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    email: user.email,
    role: profileData?.role || user.user_metadata?.role || 'member',
    is_superadmin: profileData?.is_superadmin || user.email === 'contato@nohaoficial.com.br',
  } : null

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 4000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(safetyTimer)
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(safetyTimer)
        setUser(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

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

  // Admin creates a user (for client access)
  const createUser = async (email, password, name) => {
    // Use signUp to create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'member' } }
    })
    if (error) throw error
    return data
  }

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfileData(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, profile,
      signInWithEmail, signUpWithEmail, createUser, resetPassword, signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
