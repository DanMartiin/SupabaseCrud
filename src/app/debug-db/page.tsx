'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react'

export default function DebugDBPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [schemaInfo, setSchemaInfo] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    debugDatabase()
  }, [])

  const debugDatabase = async () => {
    try {
      setStatus('loading')
      setMessage('Checking database schema...')

      // Test 1: Check if products table exists and get its structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('products')
        .select('*')
        .limit(1)

      if (tableError) {
        throw new Error(`Products table error: ${tableError.message}`)
      }

      setSchemaInfo({
        tableExists: true,
        sampleData: tableInfo,
        columns: tableInfo.length > 0 ? Object.keys(tableInfo[0]) : []
      })

      setStatus('success')
      setMessage('Database schema check completed!')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Unknown error occurred')
    }
  }

  const testProductInsert = async () => {
    try {
      setMessage('Testing product insertion...')
      
      const testProduct = {
        title: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        brand: 'Test Brand',
        stock: 10,
        size: ['10'],
        color: ['Black'],
        images: [],
        tags: ['test'],
        is_active: true
      }

      const { data, error } = await supabase
        .from('products')
        .insert(testProduct)
        .select()

      if (error) {
        throw new Error(`Insert error: ${error.message}`)
      }

      setMessage(`Test product created successfully! ID: ${data[0]?.id}`)
    } catch (error: any) {
      setMessage(`Insert test failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-bold mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Database Debug
            </h1>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {status === 'loading' && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-gray-700">Checking...</span>
                  </>
                )}

                {status === 'success' && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">Success!</span>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">Error</span>
                  </>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {message}
              </div>

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded">
                    <h3 className="font-medium text-green-800 mb-2">Database Status:</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ Products table exists</li>
                      <li>✅ Database connection working</li>
                    </ul>
                  </div>

                  <button
                    onClick={testProductInsert}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Test Product Insert
                  </button>

                  {schemaInfo && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-medium text-gray-800 mb-2">Schema Information:</h3>
                      <div className="text-sm text-gray-600">
                        <p><strong>Table exists:</strong> {schemaInfo.tableExists ? 'Yes' : 'No'}</p>
                        <p><strong>Columns found:</strong> {schemaInfo.columns.join(', ')}</p>
                        <p><strong>Sample data:</strong> {schemaInfo.sampleData.length} rows</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="font-medium text-red-800 mb-2">Next Steps:</h3>
                  <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
                    <li>Run the updated setup-database.sql script in Supabase</li>
                    <li>Make sure you're using the new Supabase project</li>
                    <li>Check that your .env.local has the correct credentials</li>
                  </ol>
                </div>
              )}

              <button
                onClick={debugDatabase}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
