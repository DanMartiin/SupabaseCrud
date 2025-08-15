'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      setStatus('loading')
      setMessage('Testing Supabase connection...')

      // Test 1: Create client
      const supabase = createClient()
      setMessage('Supabase client created successfully')

      // Test 2: Test basic connection
      const { data, error } = await supabase.from('products').select('count').limit(1)
      
      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('Supabase connection successful!')
      setTestResult({ data, error: null })

    } catch (error: any) {
      setStatus('error')
      setMessage(`Connection failed: ${error.message}`)
      setTestResult({ data: null, error: error.message })
      console.error('Supabase test error:', error)
    }
  }

  const testAuth = async () => {
    try {
      setMessage('Testing authentication...')
      const supabase = createClient()
      
      // Test auth endpoint
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      setMessage('Authentication test successful!')
      setTestResult({ authData: data, error: null })

    } catch (error: any) {
      setMessage(`Auth test failed: ${error.message}`)
      setTestResult({ authData: null, error: error.message })
      console.error('Auth test error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          <div className="mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
              status === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status === 'loading' && '⏳ Loading...'}
              {status === 'success' && '✅ Success'}
              {status === 'error' && '❌ Error'}
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{message}</p>
          
          <div className="space-y-2">
            <button
              onClick={testSupabaseConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Database Connection
            </button>
            
            <button
              onClick={testAuth}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
            >
              Test Authentication
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Environment Variables</h3>
          <div className="text-sm text-blue-700">
            <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
