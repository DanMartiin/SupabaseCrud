'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Payment } from '@/types'
import { Navigation } from '@/components/Navigation'
import { Loader2, CreditCard, DollarSign, Calendar, Filter, Search, Eye, Download } from 'lucide-react'
import Link from 'next/link'

export function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user, currentPage, searchQuery, statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          products (
            title,
            description
          )
        `, { count: 'exact' })

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`products.title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply pagination
      const itemsPerPage = 10
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching payments:', error)
        setError('Failed to load payments. Please try again later.')
        setPayments([])
        setTotalPages(1)
        return
      }

      setPayments(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching payments:', error)
      setError('An unexpected error occurred while loading payments.')
      setPayments([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Description', 'Product Title'].join(','),
      ...payments.map(payment => [
        formatDate(payment.created_at),
        payment.amount,
        payment.status,
        payment.description || '',
        (payment as any).products?.title || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your payments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600 mt-1">View and manage your payment transactions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportPayments}
                disabled={payments.length === 0}
                className="btn-outline btn-sm sm:btn-md flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
              <Link href="/" className="btn-primary btn-sm sm:btn-md flex items-center justify-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Browse Products</span>
                <span className="sm:hidden">Browse</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{payments.length}</p>
                  </div>
                  <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      ${payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + Number(p.amount), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {payments.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {payments.filter(p => p.status === 'pending').length}
                    </p>
                  </div>
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-error">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Payments</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading payments...</span>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t made any payments yet'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/" className="btn-primary">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <div className="card">
                  <div className="card-content">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Description</th>
                            <th className="text-left py-3 px-4 font-medium">Product</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(payment.created_at)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium">${payment.amount}</span>
                                <span className="text-xs text-gray-500 ml-1 uppercase">{payment.currency}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                {payment.description || '-'}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {(payment as any).products?.title || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="card">
                    <div className="card-content">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">${payment.amount}</span>
                          <span className="text-xs text-gray-500 uppercase">{payment.currency}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{formatDate(payment.created_at)}</span>
                        </div>
                        
                        {(payment as any).products?.title && (
                          <div className="text-gray-900 font-medium">
                            {(payment as any).products.title}
                          </div>
                        )}
                        
                        {payment.description && (
                          <div className="text-gray-600">
                            {payment.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn-outline btn-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="btn-outline btn-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}



