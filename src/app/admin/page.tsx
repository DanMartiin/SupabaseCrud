'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Product, Payment, User } from '@/types'
import { Navigation } from '@/components/Navigation'
import { BulkOperations } from '@/components/BulkOperations'
import { 
  Users, 
  CreditCard, 
  ShoppingBag, 
  Trash2, 
  Edit, 
  Eye, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Check if user is admin
  if (!user || user.email !== 'danmartinbilledo@ymail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      // Check if user is admin
      if (user.email !== 'danmartinbilledo@ymail.com') {
        console.log('Access denied: User is not admin')
        return
      }
      fetchData()
    }
  }, [user, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchProducts(),
        fetchUsers(),
        fetchPayments(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
  }

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        users (first_name, last_name, email),
        products (title, brand)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPayments(data)
    }
  }

  const fetchStats = async () => {
    const [productsRes, usersRes, paymentsRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact' }),
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('payments').select('amount', { count: 'exact' })
    ])

    const totalRevenue = paymentsRes.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    setStats({
      totalProducts: productsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalPayments: paymentsRes.count || 0,
      totalRevenue
    })
  }

  const handleBulkOperationSuccess = async () => {
    await fetchData()
    setSelectedItems([])
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const filteredData = () => {
    let data: any[] = []
    switch (activeTab) {
      case 'products':
        data = products
        break
      case 'users':
        data = users
        break
      case 'payments':
        data = payments
        break
    }

    if (searchQuery) {
      data = data.filter(item => {
        if (activeTab === 'products') {
          return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        } else if (activeTab === 'users') {
          return item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
        } else if (activeTab === 'payments') {
          return item.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 item.products?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return false
      })
    }

    return data
  }

  const handleSelectAll = () => {
    const filtered = filteredData()
    if (selectedItems.length === filtered.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filtered.map(item => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  if (!user || user.email !== 'danmartinbilledo@ymail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your store, users, and payments</p>
            </div>
                         <div className="flex items-center space-x-3">
               <button 
                 onClick={() => {
                   console.log('Add Product button clicked')
                   window.location.href = '/products/create'
                 }}
                 className="btn-primary btn-sm inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Add Product
               </button>
             </div>
          </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-blue-100 rounded-lg">
                   <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                 </div>
                 <div className="ml-3 sm:ml-4">
                   <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                   <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                 </div>
               </div>
             </div>

                         <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-green-100 rounded-lg">
                   <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                 </div>
                 <div className="ml-3 sm:ml-4">
                   <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                   <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-purple-100 rounded-lg">
                   <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                 </div>
                 <div className="ml-3 sm:ml-4">
                   <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                   <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-yellow-100 rounded-lg">
                   <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                 </div>
                 <div className="ml-3 sm:ml-4">
                   <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                   <p className="text-lg sm:text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'products', label: 'Products', icon: ShoppingBag },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'payments', label: 'Payments', icon: CreditCard }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
                             {/* Bulk Operations */}
               <BulkOperations
                 selectedItems={selectedItems}
                 type={activeTab === 'products' ? 'product' : activeTab === 'users' ? 'user' : 'payment'}
                 onSuccess={handleBulkOperationSuccess}
                 onClearSelection={handleClearSelection}
               />

               {/* Search and Actions */}
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                                 <div className="flex items-center space-x-3">
                   {activeTab === 'products' && (
                     <button 
                       onClick={() => {
                         console.log('Add Product button clicked (products tab)')
                         window.location.href = '/products/create'
                       }}
                       className="btn-primary btn-sm inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                     >
                       <Plus className="h-4 w-4 mr-2" />
                       Add Product
                     </button>
                   )}
                 </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h3>
                        <div className="space-y-3">
                          {products.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{product.title}</p>
                                <p className="text-sm text-gray-600">{product.brand}</p>
                              </div>
                                                             <span className="text-sm font-medium text-blue-600">₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                          {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{payment.users?.email}</p>
                                <p className="text-sm text-gray-600">{payment.products?.title}</p>
                              </div>
                                                             <span className="text-sm font-medium text-green-600">₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredData().length && filteredData().length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData().map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(product.id)}
                                onChange={() => handleSelectItem(product.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img className="h-10 w-10 rounded-lg object-cover" src={product.images[0]} alt={product.title} />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-400">👟</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                  <div className="text-sm text-gray-500">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link href={`/products/${product.id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'users' && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredData().length && filteredData().length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData().map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(user.id)}
                                onChange={() => handleSelectItem(user.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {user.first_name?.[0] || user.email?.[0] || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <div className="flex items-center space-x-2">
                                 <button className="text-blue-600 hover:text-blue-900">
                                   <Eye className="h-4 w-4" />
                                 </button>
                                 <Link href={`/admin/users/${user.id}/edit`} className="text-yellow-600 hover:text-yellow-900">
                                   <Edit className="h-4 w-4" />
                                 </Link>
                               </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'payments' && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.length === filteredData().length && filteredData().length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData().map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(payment.id)}
                                onChange={() => handleSelectItem(payment.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{payment.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.users?.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.products?.title}
                            </td>
                                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                               ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      
    </div>
  )
}



