'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AdminRoute({ 
  children, 
  fallback,
  redirectTo = '/'
}: AdminRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      // If user is not admin and not the specific admin email, redirect to specified page
      if (user.role !== 'admin' && user.email !== 'danmartinbilledo@ymail.com') {
        router.push(redirectTo)
        return
      }

      setIsChecking(false)
    }
  }, [user, loading, router, redirectTo])

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking admin privileges...</p>
        </div>
      </div>
    )
  }

  // Show fallback or default access denied message
  if (!user || (user.role !== 'admin' && user.email !== 'danmartinbilledo@ymail.com')) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/')}
                className="btn-primary flex-1"
              >
                Go Home
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="btn-outline flex-1"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and has admin role, render children
  return <>{children}</>
}
