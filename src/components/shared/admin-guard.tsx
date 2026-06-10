import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '@/lib/token'
import { getSupabase } from '@/lib/supabase'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = getSupabase()
      if (!supabase && !getToken()) {
        setAuthorized(true)
        return
      }

      const token = getToken()
      if (token) {
        try {
          const res = await fetch('/api/admin/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            setAuthorized(true)
            return
          }
        } catch {
          /* fall through to supabase check */
        }
      }

      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle()
            if (profile?.role === 'admin') {
              setAuthorized(true)
              return
            }
          }
        } catch {
          /* fall through */
        }
      }

      navigate('/login', { replace: true })
    }
    checkAdmin()
  }, [navigate])

  if (authorized === null) return null
  return <>{children}</>
}
