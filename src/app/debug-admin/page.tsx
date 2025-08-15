'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'

export default function DebugAdminPage() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      debugUserStatus()
    }
  }, [user])

  const debugUserStatus = async () => {
    setLoading(true)
    const info: any = {
      authUser: user,
      userProfile: null,
      isAdmin: false,
      canViewAdmin: false,
      databaseError: null
    }

    try {
      console.log('🔍 Debugging user:', user?.email)

      // Check if user exists in database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError) {
        console.log('❌ User not found in database:', profileError)
        info.databaseError = profileError.message
        
        // Try to create admin user for danmartinbilledo@ymail.com
        if (user?.email === 'danmartinbilledo@ymail.com') {
          console.log('🛠️ Creating admin user...')
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (createError) {
            console.log('❌ Error creating admin user:', createError)
            info.createError = createError.message
          } else {
            console.log('✅ Admin user created:', newUser)
            info.userProfile = newUser
            info.isAdmin = newUser.role === 'admin'
          }
        }
      } else {
        console.log('✅ User found in database:', userProfile)
        info.userProfile = userProfile
        info.isAdmin = userProfile.role === 'admin'
      }

      // Check admin permissions
      info.canViewAdmin = info.isAdmin || user?.email === 'danmartinbilledo@ymail.com'

    } catch (error) {
      console.error('❌ Debug error:', error)
      info.error = error
    }

    setDebugInfo(info)
    setLoading(false)
  }

  const forceCreateAdmin = async () => {
    if (!user) return

    try {
      console.log('🛠️ Force creating admin user...')
      const { data: newUser, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.log('❌ Error force creating admin:', error)
        alert('Error creating admin: ' + error.message)
      } else {
        console.log('✅ Admin user force created:', newUser)
        alert('Admin user created successfully!')
        debugUserStatus()
      }
    } catch (error) {
      console.error('❌ Force create error:', error)
      alert('Error: ' + error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Debug Admin Status</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Debug Admin Status</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-2">Current User</h2>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {user?.email || 'Not logged in'}
              </p>
              <p className="text-sm text-blue-800">
                <strong>ID:</strong> {user?.id || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">Admin Status</h2>
              <p className="text-sm text-green-800">
                <strong>Is Admin:</strong> {debugInfo.isAdmin ? '✅ Yes' : '❌ No'}
              </p>
              <p className="text-sm text-green-800">
                <strong>Can View Admin:</strong> {debugInfo.canViewAdmin ? '✅ Yes' : '❌ No'}
              </p>
              <p className="text-sm text-green-800">
                <strong>Special Email:</strong> {user?.email === 'danmartinbilledo@ymail.com' ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            {debugInfo.userProfile && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">User Profile</h2>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(debugInfo.userProfile, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.databaseError && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h2 className="font-semibold text-red-900 mb-2">Database Error</h2>
                <p className="text-sm text-red-800">{debugInfo.databaseError}</p>
              </div>
            )}

            {debugInfo.createError && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h2 className="font-semibold text-red-900 mb-2">Create Error</h2>
                <p className="text-sm text-red-800">{debugInfo.createError}</p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h2 className="font-semibold text-yellow-900 mb-2">Actions</h2>
              <button
                onClick={forceCreateAdmin}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Force Create Admin User
              </button>
              <button
                onClick={debugUserStatus}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
              >
                Refresh Debug Info
              </button>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h2 className="font-semibold text-purple-900 mb-2">Raw Debug Info</h2>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
