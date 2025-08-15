'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Navigation } from '@/components/Navigation'

export default function TestLoginPage() {
  const { user, signIn, loading } = useAuth()
  const [email, setEmail] = useState('danmartinbilledo@ymail.com')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Logging in...')
    
    try {
      const { error } = await signIn(email, password)
      if (error) {
        setStatus(`Login error: ${error.message}`)
      } else {
        setStatus('Login successful!')
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Login Test</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-2">Current Status</h2>
              <p className="text-sm text-blue-800">
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-blue-800">
                <strong>User:</strong> {user ? user.email : 'Not logged in'}
              </p>
              <p className="text-sm text-blue-800">
                <strong>User Role:</strong> {user?.role || 'N/A'}
              </p>
            </div>

            {!user && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </form>
            )}

            {status && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h2 className="font-semibold text-green-900 mb-2">Status</h2>
                <p className="text-sm text-green-800">{status}</p>
              </div>
            )}

            {user && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h2 className="font-semibold text-purple-900 mb-2">User Data</h2>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
