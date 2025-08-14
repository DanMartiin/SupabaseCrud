'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

export default function TestDBPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setTestResult('Testing connection...')
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      if (error) {
        setTestResult(`Connection failed: ${error.message}`)
      } else {
        setTestResult('Database connection successful!')
      }
    } catch (err) {
      setTestResult(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testProductCreation = async () => {
    if (!user) {
      setTestResult('You must be logged in to test product creation')
      return
    }

    setLoading(true)
    setTestResult('Testing product creation...')
    
    try {
      const testProduct = {
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: 'Running',
        brand: 'Nike',
        stock: 10,
        size: ['8', '9', '10'],
        color: ['Black', 'White'],
        images: [],
        tags: ['test'],
        user_id: user.id,
        is_active: true
      }

      console.log('Test product data:', testProduct)

      const { data, error } = await supabase
        .from('products')
        .insert(testProduct)
        .select()

      if (error) {
        setTestResult(`Product creation failed: ${error.message}`)
        console.error('Test product creation error:', error)
      } else {
        setTestResult(`Product created successfully! ID: ${data?.[0]?.id}`)
        console.log('Test product created:', data)
      }
    } catch (err) {
      setTestResult(`Unexpected error: ${err}`)
      console.error('Test product creation unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    setLoading(true)
    setTestResult('Checking user...')
    
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        setTestResult(`User check failed: ${error.message}`)
      } else if (currentUser) {
        setTestResult(`User authenticated: ${currentUser.email} (ID: ${currentUser.id})`)
        
        // Check if user exists in users table
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        if (userError) {
          setTestResult(`User not found in users table: ${userError.message}`)
        } else {
          setTestResult(`User found in users table: ${userRecord.email} (Role: ${userRecord.role})`)
        }
      } else {
        setTestResult('No user authenticated')
      }
    } catch (err) {
      setTestResult(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createUserRecord = async () => {
    if (!user) {
      setTestResult('You must be logged in to create a user record')
      return
    }

    setLoading(true)
    setTestResult('Creating user record...')
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        if (error.code === '23505') { // Unique violation
          setTestResult('User record already exists')
        } else {
          setTestResult(`Failed to create user record: ${error.message}`)
        }
      } else {
        setTestResult(`User record created successfully!`)
      }
    } catch (err) {
      setTestResult(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="btn-primary w-full"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={checkUser}
            disabled={loading}
            className="btn-primary w-full"
          >
            Check User Authentication
          </button>
          
          <button
            onClick={createUserRecord}
            disabled={loading || !user}
            className="btn-primary w-full"
          >
            Create User Record
          </button>
          
          <button
            onClick={testProductCreation}
            disabled={loading || !user}
            className="btn-primary w-full"
          >
            Test Product Creation
          </button>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>

        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Current User:</h3>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  )
}



