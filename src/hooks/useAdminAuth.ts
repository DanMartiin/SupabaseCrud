'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseAdminAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAdminAuth(options: UseAdminAuthOptions = {}) {
  const { redirectTo = '/', requireAuth = true } = options
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (requireAuth) {
          router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        }
        setIsAuthorized(false)
      } else if (user.role !== 'admin') {
        if (requireAuth) {
          router.push(redirectTo)
        }
        setIsAuthorized(false)
      } else {
        setIsAuthorized(true)
      }
      setIsChecking(false)
    }
  }, [user, loading, router, redirectTo, requireAuth])

  return {
    isAuthorized,
    isChecking: loading || isChecking,
    user,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user
  }
}
