'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Payment } from '@/types'
import { Navigation } from '@/components/Navigation'
import { CheckCircle, Download, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const [paymentDetails, setPaymentDetails] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (paymentIntentId) {
      fetchPaymentDetails()
    }
  }, [paymentIntentId])

  const fetchPaymentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          products (
            title,
            description
          )
        `)
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (error) {
        console.error('Error fetching payment details:', error)
        setError('Failed to load payment details')
        return
      }

      setPaymentDetails(data)
    } catch (error) {
      console.error('Error fetching payment details:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!paymentDetails) return

    const receiptContent = `
Payment Receipt
===============

Payment ID: ${paymentDetails.id}
Date: ${new Date(paymentDetails.created_at).toLocaleDateString()}
Time: ${new Date(paymentDetails.created_at).toLocaleTimeString()}

Item: ${paymentDetails.products?.title || 'N/A'}
Description: ${paymentDetails.products?.description || 'N/A'}

Amount: $${paymentDetails.amount}
Currency: ${paymentDetails.currency?.toUpperCase()}
Status: ${paymentDetails.status}

Thank you for your purchase!
    `.trim()

    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${paymentDetails.id}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The payment details could not be found.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <Link href="/payments" className="btn-outline">
                <CreditCard className="h-4 w-4 mr-2" />
                View All Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Success Header */}
            <div className="text-center p-8 border-b border-gray-200">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">
                Your payment has been processed successfully. Thank you for your purchase!
              </p>
            </div>

            {/* Payment Details */}
            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium text-gray-900">{paymentDetails.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(paymentDetails.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(paymentDetails.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      paymentDetails.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {paymentDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <p className="text-sm text-gray-900">{paymentDetails.products?.title || 'N/A'}</p>
                  </div>
                  
                  {paymentDetails.products?.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <p className="text-sm text-gray-900">{paymentDetails.products.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${paymentDetails.amount} {paymentDetails.currency?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={downloadReceipt}
                  className="btn-outline flex-1 flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </button>
                
                <Link href="/payments" className="btn-primary flex-1 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View All Payments
                </Link>
              </div>
              
              <div className="text-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
