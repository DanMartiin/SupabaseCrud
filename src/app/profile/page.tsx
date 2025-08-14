'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { ProductCard } from '@/components/ProductCard'
import { Product, Payment } from '@/types'
import { Loader2, User, ShoppingBag, CreditCard, Settings, LogOut, Calendar, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'settings'>('profile')

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // Fetch purchased products
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
      } else {
        const purchased = paymentsData?.map(payment => payment.products).filter(Boolean) as unknown as Product[]
        setPurchasedProducts(purchased || [])
        setPayments(paymentsData || [])
        
        // Calculate total spent
        const total = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
        setTotalSpent(total)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
          <Link href="/auth/login" className="btn-primary mt-4">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account and view your purchases</p>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-outline btn-sm flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{purchasedProducts.length}</p>
                    </div>
                    <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatDate(user.created_at).split(' ')[2]}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'purchases'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4 inline mr-2" />
                    Purchases
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'settings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Settings
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <p className="text-gray-900">{user.first_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <p className="text-gray-900">{user.last_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <p className="text-gray-900">{formatDate(user.created_at)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                          <p className="text-gray-900">{formatDate(user.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Purchase History</h3>
                      <span className="text-sm text-gray-500">{purchasedProducts.length} items</span>
                    </div>

                    {error && (
                      <div className="alert-error">
                        <p>{error}</p>
                      </div>
                    )}

                    {purchasedProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                        <p className="text-gray-600 mb-4">Start shopping to see your purchase history here.</p>
                        <Link href="/products" className="btn-primary">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  Payment ID: {payment.stripe_payment_intent_id || payment.id}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(payment.created_at)}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-gray-600">Product:</span>
                                <p className="font-medium">{payment.products?.title || 'Unknown Product'}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Amount:</span>
                                <p className="font-medium text-green-600">${payment.amount}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Receive updates about your orders and new products</p>
                          </div>
                          <button className="btn-outline btn-sm">Configure</button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                            <p className="text-sm text-gray-600">Manage your privacy preferences</p>
                          </div>
                          <button className="btn-outline btn-sm">Manage</button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Delete Account</h4>
                            <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                          </div>
                          <button className="btn-destructive btn-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

