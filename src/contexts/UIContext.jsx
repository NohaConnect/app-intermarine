import React, { createContext, useContext, useState, useCallback, useReducer } from 'react'

// ─── State ─────────────────────────────────────────────
const initialState = {
  view: 'dashboard', // 'dashboard' | 'kanban' | 'list'
}

function uiReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload }
    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────
const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState)
  const [toasts, setToasts] = useState([])

  const setView = useCallback((v) => dispatch({ type: 'SET_VIEW', payload: v }), [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <UIContext.Provider value={{ ...state, setView, toasts, addToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id}
              className="pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-semibold animate-slide-up"
              style={{
                background: t.type === 'success' ? 'rgba(78,205,196,0.15)' : t.type === 'error' ? 'rgba(231,76,94,0.15)' : 'rgba(200,192,175,0.1)',
                color: t.type === 'success' ? '#4ecdc4' : t.type === 'error' ? '#e74c5e' : '#c8c0af',
                border: `1px solid ${t.type === 'success' ? 'rgba(78,205,196,0.2)' : t.type === 'error' ? 'rgba(231,76,94,0.2)' : 'rgba(200,192,175,0.1)'}`,
                backdropFilter: 'blur(20px)',
              }}>
              {t.message}
            </div>
          ))}
        </div>
      )}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
