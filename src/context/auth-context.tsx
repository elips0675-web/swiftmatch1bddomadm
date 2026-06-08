import { createContext, useContext, useEffect, useReducer, useCallback, type ReactNode } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { AuthState } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  clearError: () => void
  supabaseUser: User | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthState['user']; token: string }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return { user: action.payload, token: action.token, isLoading: false, error: null }
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'AUTH_LOGOUT':
      return { user: null, token: null, isLoading: false, error: null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const supabase = getSupabase()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            id: Number(user.id),
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url || '',
          },
          token: session.access_token,
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'AUTH_LOGOUT' })
      } else if (event === 'TOKEN_REFRESHED') {
        // session refreshed
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            id: Number(user.id),
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url || '',
          },
          token: session.access_token,
        })
      } else {
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message })
      throw error
    }
  }, [supabase])

  const loginWithGoogle = useCallback(async () => {
    dispatch({ type: 'AUTH_START' })
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message })
      throw error
    }
  }, [supabase])

  const register = useCallback(async (email: string, password: string, name: string) => {
    dispatch({ type: 'AUTH_START' })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message })
      throw error
    }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    dispatch({ type: 'AUTH_LOGOUT' })
  }, [supabase])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const supabaseUser = state.user
    ? ({ id: String(state.user.id), email: state.user.email, user_metadata: { name: state.user.name, avatar_url: state.user.avatar } } as User)
    : null

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginWithGoogle, register, logout, clearError, supabaseUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
