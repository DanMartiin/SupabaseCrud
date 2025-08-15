'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'

export default function TestDbPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addResult('Starting database tests...')
      
      // Test 1: Check if user is authenticated
      if (!user) {
        addResult('❌ User not authenticated')
        return
      }
      addResult(`✅ User authenticated: ${user.email}`)

      // Test 2: Check if payments table exists and is accessible
      const { data: tableTest, error: tableError } = await supabase
        .from('payments')
        .select('count')
        .limit(1)

      if (tableError) {
        addResult(`❌ Payments table error: ${tableError.message}`)
      } else {
        addResult('✅ Payments table accessible')
      }

      // Test 3: Check if user can read their own payments
      const { data: readTest, error: readError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .limit(5)

      if (readError) {
        addResult(`❌ Read permissions error: ${readError.message}`)
      } else {
        addResult(`✅ Read permissions OK (found ${readTest?.length || 0} payments)`)
      }

      // Test 4: Check if user can insert a payment (with a valid product)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title')
        .limit(1)

      if (productsError) {
        addResult(`❌ Cannot fetch products: ${productsError.message}`)
      } else if (!products || products.length === 0) {
        addResult('❌ No products found in database')
      } else {
        const testProduct = products[0]
        addResult(`✅ Found test product: ${testProduct.title}`)

        // Try to insert a test payment
        const { data: insertTest, error: insertError } = await supabase
          .from('payments')
          .insert({
            user_id: user.id,
            product_id: testProduct.id,
            amount: 1.00,
            status: 'completed',
            payment_method: 'test',
            description: 'Test payment from debug page'
          })
          .select()

        if (insertError) {
          addResult(`❌ Insert permissions error: ${insertError.message}`)
        } else {
          addResult(`✅ Insert permissions OK (created payment ${insertTest?.[0]?.id})`)
          
          // Clean up the test payment
          if (insertTest?.[0]?.id) {
            const { error: deleteError } = await supabase
              .from('payments')
              .delete()
              .eq('id', insertTest[0].id)
            
            if (deleteError) {
              addResult(`⚠️ Could not clean up test payment: ${deleteError.message}`)
            } else {
              addResult('✅ Test payment cleaned up')
            }
          }
        }
      }

      // Test 5: Check RLS policies
      addResult('ℹ️ Checking Row Level Security policies...')
      addResult('ℹ️ Users should only see their own payments')
      addResult('ℹ️ Users should be able to create payments for themselves')

    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Tests</h2>
            
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Database Tests'}
            </button>

            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results:</h3>
                <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting Tips</h2>
            <div className="space-y-3 text-sm">
              <p><strong>If payments aren't appearing in Supabase:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check that you're looking in the <code>payments</code> table, not <code>orders</code></li>
                <li>Verify your user ID matches the <code>user_id</code> in the payments table</li>
                <li>Check the browser console for any JavaScript errors during checkout</li>
                <li>Ensure your Supabase RLS policies allow users to insert payments</li>
                <li>Verify that the products exist in the database</li>
              </ul>
              
              <p className="mt-4"><strong>Common issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Foreign key constraint violations (product_id doesn't exist)</li>
                <li>RLS policy blocking insert operations</li>
                <li>Network connectivity issues</li>
                <li>Authentication token expired</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



