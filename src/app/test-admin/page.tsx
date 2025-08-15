'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'

export default function TestAdminPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    setStatus('Checking admin status...')
    
    try {
      // Check if user exists in database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        setStatus(`User not found in database: ${error.message}`)
        setUserData(null)
      } else {
        setStatus(`User found: ${data.role} role`)
        setUserData(data)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const forceCreateAdmin = async () => {
    if (!user) return
    
    setStatus('Creating admin user...')
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        setStatus(`Error creating admin: ${error.message}`)
      } else {
        setStatus('Admin user created successfully!')
        setUserData(data)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const testAddProductButton = () => {
    const isAdmin = user?.email === 'danmartinbilledo@ymail.com' || userData?.role === 'admin'
    setStatus(`Add Product button should be visible: ${isAdmin ? 'YES' : 'NO'}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
          
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
              <h2 className="font-semibold text-green-900 mb-2">Status</h2>
              <p className="text-sm text-green-800">{status}</p>
            </div>

            {userData && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">User Data</h2>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h2 className="font-semibold text-yellow-900 mb-2">Actions</h2>
              <div className="space-x-2">
                <button
                  onClick={checkAdminStatus}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Check Status
                </button>
                <button
                  onClick={forceCreateAdmin}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Force Create Admin
                </button>
                <button
                  onClick={testAddProductButton}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Test Add Product Button
                </button>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h2 className="font-semibold text-purple-900 mb-2">Expected Behavior</h2>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• If user is danmartinbilledo@ymail.com, they should be admin</li>
                <li>• Add Product button should be visible for admins</li>
                <li>• Admin Panel link should be visible for admins</li>
                <li>• Edit/Delete buttons should be visible on product cards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
