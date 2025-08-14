'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function CheckUserPage() {
  const { user, loading, refreshUser } = useAuth()
  const [dbUser, setDbUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkUserInDatabase()
    }
  }, [user])

  const checkUserInDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        setMessage(`Database error: ${error.message}`)
      } else {
        setDbUser(data)
        setMessage('User found in database')
      }
    } catch (err) {
      setMessage(`Error: ${err}`)
    }
  }

  const makeAdmin = async () => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (error) {
        setMessage(`Error making admin: ${error.message}`)
      } else {
        setMessage('Successfully made admin! Refreshing user data...')
        await refreshUser() // Refresh the AuthProvider user data
        checkUserInDatabase()
      }
    } catch (err) {
      setMessage(`Error: ${err}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          User Status Check
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="p-4 bg-gray-100 rounded">
              <h3 className="font-medium mb-2">Auth Provider User:</h3>
              <p>Email: {user?.email || 'Not signed in'}</p>
              <p>Role: {user?.role || 'None'}</p>
              <p>ID: {user?.id || 'None'}</p>
            </div>

            {dbUser && (
              <div className="p-4 bg-blue-100 rounded">
                <h3 className="font-medium mb-2">Database User:</h3>
                <p>Email: {dbUser.email}</p>
                <p>Role: {dbUser.role}</p>
                <p>ID: {dbUser.id}</p>
                <p>Created: {new Date(dbUser.created_at).toLocaleString()}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {message}
              </div>
            )}

            {user && (
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    await refreshUser()
                    checkUserInDatabase()
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh User Data
                </button>

                <button
                  onClick={makeAdmin}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Make Me Admin
                </button>
              </div>
            )}

            {!user && (
              <div className="text-center">
                <p className="text-gray-600">Please sign in first</p>
                <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
