'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'

export default function DebugDbPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const checkTables = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Checking database tables...')

      // Check if users table exists
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (usersError) {
          addResult(`❌ Users table error: ${usersError.message}`)
        } else {
          addResult(`✅ Users table exists`)
        }
      } catch (err) {
        addResult(`❌ Users table not accessible: ${err}`)
      }

      // Check if products table exists
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('count')
          .limit(1)

        if (productsError) {
          addResult(`❌ Products table error: ${productsError.message}`)
        } else {
          addResult(`✅ Products table exists`)
        }
      } catch (err) {
        addResult(`❌ Products table not accessible: ${err}`)
      }

      // Check if payments table exists
      try {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('count')
          .limit(1)

        if (paymentsError) {
          addResult(`❌ Payments table error: ${paymentsError.message}`)
        } else {
          addResult(`✅ Payments table exists`)
        }
      } catch (err) {
        addResult(`❌ Payments table not accessible: ${err}`)
      }

      // Check table counts
      try {
        const [usersCount, productsCount, paymentsCount] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('payments').select('*', { count: 'exact', head: true })
        ])

        addResult(`📊 Table counts:`)
        addResult(`   - Users: ${usersCount.count || 0}`)
        addResult(`   - Products: ${productsCount.count || 0}`)
        addResult(`   - Payments: ${paymentsCount.count || 0}`)
      } catch (err) {
        addResult(`❌ Error getting table counts: ${err}`)
      }

    } catch (error) {
      addResult(`❌ Database check error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createMissingTables = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Creating missing tables...')

      // Try to create products table if it doesn't exist
      try {
        const { error: productsError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS products (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              price DECIMAL(10,2) NOT NULL,
              category TEXT NOT NULL,
              brand TEXT NOT NULL,
              size TEXT[],
              color TEXT[],
              images TEXT[],
              stock INTEGER DEFAULT 0,
              is_active BOOLEAN DEFAULT true,
              tags TEXT[],
              user_id UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        })

        if (productsError) {
          addResult(`❌ Products table creation error: ${productsError.message}`)
        } else {
          addResult(`✅ Products table created or already exists`)
        }
      } catch (err) {
        addResult(`❌ Products table creation failed: ${err}`)
      }

      // Try to create payments table if it doesn't exist
      try {
        const { error: paymentsError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS payments (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES users(id),
              product_id UUID REFERENCES products(id),
              amount DECIMAL(10,2) NOT NULL,
              currency TEXT DEFAULT 'USD',
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
              stripe_payment_intent_id TEXT,
              stripe_charge_id TEXT,
              payment_method TEXT,
              description TEXT,
              metadata JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        })

        if (paymentsError) {
          addResult(`❌ Payments table creation error: ${paymentsError.message}`)
        } else {
          addResult(`✅ Payments table created or already exists`)
        }
      } catch (err) {
        addResult(`❌ Payments table creation failed: ${err}`)
      }

    } catch (error) {
      addResult(`❌ Table creation error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Inspector</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={checkTables}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Database Tables'}
              </button>
              
              <button
                onClick={createMissingTables}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
              >
                {loading ? 'Creating...' : 'Create Missing Tables'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Results:</h3>
                <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Database Setup</h2>
            <div className="space-y-3 text-sm">
              <p><strong>If tables are missing, run this SQL in your Supabase SQL Editor:</strong></p>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
{`-- Create products table (if missing)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT[],
  color TEXT[],
  images TEXT[],
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table (if missing)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (user_id = auth.uid());`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
