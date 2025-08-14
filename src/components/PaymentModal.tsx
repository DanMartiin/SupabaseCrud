'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { PaymentForm } from './PaymentForm'
import { X, CreditCard, DollarSign } from 'lucide-react'

interface PaymentModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ product, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen || !product) {
    return null
  }

  const handleSuccess = () => {
    setIsProcessing(false)
    onSuccess()
    onClose()
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Complete Purchase</h2>
                <p className="text-sm text-gray-600">Secure payment processing</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">{product.title}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₱{product.price?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm
              product={product}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
