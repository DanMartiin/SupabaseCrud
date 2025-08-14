'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { CreditCard, Lock, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PaymentFormProps {
  product: Product
  onSuccess: () => void
  onCancel: () => void
}

function PaymentFormContent({ product, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !user) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: product.price,
          productId: product.id,
          userId: user.id,
        }),
      })

      const { clientSecret, error: intentError } = await response.json()

      if (intentError) {
        setError('Failed to create payment. Please try again.')
        return
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (paymentError) {
        setError(paymentError.message || 'Payment failed. Please try again.')
        return
      }

      // Store payment intent ID for success page
      setPaymentIntentId(paymentIntent?.id || null)

      // Record payment in database
      const { error: dbError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          product_id: product.id,
          amount: product.price,
          status: 'completed',
          stripe_payment_intent_id: paymentIntent?.id,
          description: `Payment for ${product.title}`,
        })

      if (dbError) {
        console.error('Error recording payment:', dbError)
        // Payment succeeded but recording failed - this is not critical
      }

      setSuccess(true)
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        if (paymentIntent?.id) {
          router.push(`/payments/success?payment_intent=${paymentIntent.id}`)
        } else {
          onSuccess()
        }
      }, 2000)
    } catch (error) {
      console.error('Payment error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  if (success) {
    return (
      <div className="text-center py-8 px-4">
        <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 text-sm sm:text-base">Your payment has been processed successfully.</p>
        <p className="text-gray-500 text-xs mt-2">Redirecting to payment confirmation...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Close button for mobile */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 sm:hidden p-2 text-gray-400 hover:text-gray-600"
        disabled={isProcessing}
      >
        <X className="h-5 w-5" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">{product.title}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-semibold text-gray-900">
              ₱{product.price?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span>Your payment information is secure</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 text-sm text-red-700 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-outline order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="btn-primary order-1 sm:order-2"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Pay ₱{product.price?.toFixed(2)}</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}








