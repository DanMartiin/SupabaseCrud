'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [tables, setTables] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('products').select('count').limit(1)
      
      if (error) {
        throw error
      }

      // Test if tables exist
      const tablesToCheck = ['users', 'products', 'payments', 'product_reviews', 'user_favorites']
      const existingTables: string[] = []

      for (const table of tablesToCheck) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1)
          if (!tableError) {
            existingTables.push(table)
          }
        } catch (e) {
          console.log(`Table ${table} not found or accessible`)
        }
      }

      setTables(existingTables)
      setConnectionStatus('success')
    } catch (error: any) {
      console.error('Connection test failed:', error)
      setErrorMessage(error.message || 'Unknown error occurred')
      setConnectionStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>
            
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-3">
                {connectionStatus === 'loading' && (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-gray-700">Testing connection...</span>
                  </>
                )}
                
                {connectionStatus === 'success' && (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-green-700 font-medium">Connection successful!</span>
                  </>
                )}
                
                {connectionStatus === 'error' && (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="text-red-700 font-medium">Connection failed</span>
                  </>
                )}
              </div>

              {/* Error Message */}
              {connectionStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Tables Status */}
              {connectionStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Database Tables:</h3>
                  <div className="space-y-1">
                    {tables.map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">{table}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Found {tables.length} out of 5 expected tables
                  </p>
                </div>
              )}

              {/* Setup Instructions */}
              {connectionStatus === 'error' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions:</h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root</li>
                    <li>Add your Supabase URL and anon key to the file</li>
                    <li>Run the <code className="bg-blue-100 px-1 rounded">shoe-store-database.sql</code> script in Supabase SQL Editor</li>
                    <li>Refresh this page to test again</li>
                  </ol>
                </div>
              )}

              {/* Test Again Button */}
              <button
                onClick={testConnection}
                className="btn-primary"
                disabled={connectionStatus === 'loading'}
              >
                {connectionStatus === 'loading' ? 'Testing...' : 'Test Again'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



