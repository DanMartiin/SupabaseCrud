'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'

export default function DebugCheckoutPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          products (
            title,
            brand,
            price
          ),
          users (
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        setError(error.message)
      } else {
        setPayments(data || [])
        console.log('Payments data:', data)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const testPaymentInsert = async () => {
    setTestResult('Testing payment insertion...')
    try {
      // First, let's get a valid product ID
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title')
        .limit(1)

      if (productsError) {
        setTestResult(`Error fetching products: ${productsError.message}`)
        return
      }

      if (!products || products.length === 0) {
        setTestResult('No products found in database. Cannot test payment insertion.')
        return
      }

      const testProduct = products[0]
      setTestResult(`Found product: ${testProduct.title} (ID: ${testProduct.id})`)

      // Now test payment insertion with valid product
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          product_id: testProduct.id,
          amount: 99.99,
          status: 'completed',
          payment_method: 'test',
          description: 'Test payment from debug page'
        })
        .select()

      if (error) {
        setTestResult(`Error: ${error.message}`)
        console.error('Test payment error:', error)
        
        // Check if it's a foreign key constraint error
        if (error.message.includes('foreign key') || error.message.includes('violates')) {
          setTestResult(`Foreign key constraint error: ${error.message}. This means either the user or product doesn't exist.`)
        }
      } else {
        setTestResult(`Success! Payment created with ID: ${data?.[0]?.id}`)
        console.log('Test payment success:', data)
        await fetchPayments() // Refresh the list
      }
    } catch (err) {
      setTestResult(`Exception: ${err}`)
      console.error('Test payment exception:', err)
    }
  }

  const createUserRecord = async () => {
    setTestResult('Creating user record in users table...')
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user?.id,
          email: user?.email,
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        if (error.code === '23505') { // Unique violation - user already exists
          setTestResult('User record already exists in users table')
        } else {
          setTestResult(`Error creating user record: ${error.message}`)
        }
      } else {
        setTestResult(`Success! User record created: ${data?.[0]?.email}`)
      }
    } catch (err) {
      setTestResult(`Exception creating user record: ${err}`)
    }
  }

  const checkUserPermissions = async () => {
    setTestResult('Checking user permissions and existence...')
    try {
      // Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (userError) {
        setTestResult(`User not found in users table: ${userError.message}`)
        return
      }

      setTestResult(`User found in users table: ${userData.email} (Role: ${userData.role})`)

      // Check if user can read from payments table
      const { data: readData, error: readError } = await supabase
        .from('payments')
        .select('count')
        .limit(1)

      if (readError) {
        setTestResult(`Read permission error: ${readError.message}`)
      } else {
        setTestResult('Read permission: OK')
      }
    } catch (err) {
      setTestResult(`Permission check error: ${err}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to debug checkout.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout Debug Page</h1>
          
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Actions</h2>
                         <div className="space-y-4">
               <button
                 onClick={checkUserPermissions}
                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
               >
                 Check Permissions
               </button>
               <button
                 onClick={createUserRecord}
                 className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 ml-4"
               >
                 Create User Record
               </button>
               <button
                 onClick={testPaymentInsert}
                 className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
               >
                 Test Payment Insert
               </button>
               <button
                 onClick={fetchPayments}
                 className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4"
               >
                 Refresh Payments
               </button>
             </div>
            {testResult && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p className="text-sm font-mono">{testResult}</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Payments List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Payments ({payments.length})
            </h2>
            
            {loading ? (
              <p>Loading payments...</p>
            ) : payments.length === 0 ? (
              <p className="text-gray-600">No payments found for this user.</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p><strong>Payment ID:</strong> {payment.id}</p>
                        <p><strong>Amount:</strong> ${payment.amount}</p>
                        <p><strong>Status:</strong> {payment.status}</p>
                      </div>
                      <div>
                        <p><strong>Product:</strong> {payment.products?.title || 'N/A'}</p>
                        <p><strong>Brand:</strong> {payment.products?.brand || 'N/A'}</p>
                        <p><strong>Method:</strong> {payment.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Created:</strong> {new Date(payment.created_at).toLocaleString()}</p>
                        <p><strong>Description:</strong> {payment.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
