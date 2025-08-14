'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'

export default function TestAuthPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage('Please enter both email and password')
      return
    }
    setMessage('Signing up...')
    const { error } = await signUp(email, password)
    if (error) {
      setMessage(`Signup error: ${error.message}`)
    } else {
      setMessage('Signup successful! Check your email.')
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage('Please enter both email and password')
      return
    }
    setMessage('Signing in...')
    const { error } = await signIn(email, password)
    if (error) {
      setMessage(`Signin error: ${error.message}`)
    } else {
      setMessage('Signin successful!')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setMessage('Signed out!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Auth Test Page
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium">Current State:</h3>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.email} (${user.role})` : 'None'}</p>
            <p>User ID: {user?.id || 'None'}</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  console.log('Sign Up button clicked')
                  handleSignUp()
                }}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Sign In button clicked')
                  handleSignIn()
                }}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </div>
          </div>

          {user && (
            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
