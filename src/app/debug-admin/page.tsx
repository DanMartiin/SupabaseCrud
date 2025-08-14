'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'

interface DebugInfo {
  authUser: any
  dbUser: any
  dbError: any
  isAdminRoute: boolean
  middlewareCheck: string
}

export default function DebugAdminPage() {
  const { user, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) {
        setDebugInfo({
          authUser: null,
          dbUser: null,
          dbError: 'No authenticated user',
          isAdminRoute: true,
          middlewareCheck: 'Not authenticated'
        })
        setIsLoading(false)
        return
      }

      try {
        // Fetch user data from database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        setDebugInfo({
          authUser: user,
          dbUser,
          dbError,
          isAdminRoute: true,
          middlewareCheck: dbUser?.role === 'admin' ? 'Admin access granted' : 'Admin access denied'
        })
      } catch (error) {
        setDebugInfo({
          authUser: user,
          dbUser: null,
          dbError: error,
          isAdminRoute: true,
          middlewareCheck: 'Error checking access'
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchDebugInfo()
    }
  }, [user, loading, supabase])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading debug information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Access Debug</h1>
          
          {debugInfo && (
            <div className="space-y-6">
              {/* Auth User Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Auth User Info</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo.authUser, null, 2)}
                </pre>
              </div>

              {/* Database User Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Database User Info</h2>
                {debugInfo.dbError ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {JSON.stringify(debugInfo.dbError, null, 2)}
                  </div>
                ) : (
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.dbUser, null, 2)}
                  </pre>
                )}
              </div>

              {/* Access Check */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Check</h2>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium">Route Type:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {debugInfo.isAdminRoute ? 'Admin Route' : 'Regular Route'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Middleware Check:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      debugInfo.middlewareCheck.includes('granted') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.middlewareCheck}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">User Role:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      debugInfo.dbUser?.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {debugInfo.dbUser?.role || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
                <div className="space-y-2 text-sm">
                  {!debugInfo.authUser && (
                    <p className="text-red-600">• User is not authenticated - should redirect to login</p>
                  )}
                  {debugInfo.authUser && !debugInfo.dbUser && (
                    <p className="text-red-600">• User exists in auth but not in database - check trigger</p>
                  )}
                  {debugInfo.dbUser && debugInfo.dbUser.role !== 'admin' && (
                    <p className="text-red-600">• User role is '{debugInfo.dbUser.role}' - should not have admin access</p>
                  )}
                  {debugInfo.dbUser && debugInfo.dbUser.role === 'admin' && (
                    <p className="text-green-600">• User has admin role - access should be granted</p>
                  )}
                  {debugInfo.dbError && (
                    <p className="text-red-600">• Database error occurred - check RLS policies</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
