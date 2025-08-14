'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase'
import { Edit, Trash2, Eye, Calendar, DollarSign, MoreVertical, CreditCard, Heart, Star } from 'lucide-react'
import { PaymentModal } from './PaymentModal'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onUpdate: () => void
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, onUpdate, viewMode = 'grid' }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
        return
      }

      onUpdate()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePaymentSuccess = () => {
    onUpdate()
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  return (
    <>
      <div className={`${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''} card hover:shadow-md transition-shadow relative group`}>
        {/* Product Image */}
        <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-32 h-48 sm:h-32 flex-shrink-0' : 'aspect-square'} bg-gray-200 overflow-hidden`}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="text-4xl mb-2">👟</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-2 left-2 p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <Link
              href={`/products/${product.id}`}
              className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              title="View product"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </Link>
            
            {/* Mobile Actions Menu */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="More actions"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <Link
                    href={`/products/${product.id}/edit`}
                    onClick={() => setShowActions(false)}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowActions(false)
                      setShowPaymentModal(true)
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Purchase</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false)
                      handleDelete()
                    }}
                    disabled={isDeleting}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className={`card-content ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-blue-600">{product.brand}</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">4.5</span>
                </div>
              </div>
              <h3 className="card-title text-lg truncate">{product.title}</h3>
              <p className="card-description line-clamp-2 mt-1 text-sm">{product.description}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Category:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            
            {product.size && product.size.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Sizes:</span>
                <span className="font-medium">{product.size.join(', ')}</span>
              </div>
            )}
            
            {product.color && product.color.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Colors:</span>
                <span className="font-medium">{product.color.join(', ')}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span>Stock:</span>
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xl font-bold text-gray-900">₱{product.price}</span>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="btn-outline-warning btn-sm"
                title="Edit product"
              >
                <Edit className="h-4 w-4" />
              </Link>
              {product.stock > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-success btn-sm"
                  title="Purchase product"
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-destructive btn-sm"
                title="Delete product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs text-blue-600 bg-blue-50"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-50">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close mobile menu */}
        {showActions && (
          <div 
            className="fixed inset-0 z-0"
            onClick={() => setShowActions(false)}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        product={product}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}


