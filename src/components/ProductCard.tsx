'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase'
import { Edit, Trash2, Eye, Calendar, DollarSign, MoreVertical, CreditCard, Heart, Star, ShoppingCart } from 'lucide-react'
import { PaymentModal } from './PaymentModal'
import { useAuth } from '@/components/auth/AuthProvider'
import { canViewAdminDashboard } from '@/lib/auth-utils'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onUpdate: () => void
  viewMode?: 'grid' | 'list'
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onUpdate, viewMode = 'grid', onAddToCart }: ProductCardProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [showSizeModal, setShowSizeModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (!error && data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    try {
      console.log('Deleting product:', product.id)
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) {
        console.error('Error deleting product:', error)
        alert(`Failed to delete product: ${error.message}`)
        return
      }

      console.log('Product deleted successfully')
      
      // Call onUpdate to refresh the data
      if (onUpdate) {
        onUpdate()
      }
      
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product. Please try again.')
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

  const handleAddToCart = () => {
    if (product.size && product.size.length > 0) {
      setShowSizeModal(true)
    } else {
      // If no sizes available, add directly to cart
      onAddToCart?.(product)
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    setShowSizeModal(false)
    // Add to cart with selected size
    const productWithSize = { ...product, selectedSize: size }
    onAddToCart?.(productWithSize)
  }

  return (
    <>
      <div className={`${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''} card hover:shadow-md transition-shadow relative group overflow-hidden`}>
        {/* Product Image */}
        <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-32 h-40 sm:h-32 flex-shrink-0' : 'aspect-square'} bg-gray-200 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-t-none`}>
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
            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex space-x-1 max-w-[calc(100%-1rem)]">
            <Link
              href={`/products/${product.id}`}
              className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
              title="View product"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </Link>
            
            {/* Mobile Actions Menu */}
            <div className="sm:hidden relative flex-shrink-0">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="More actions"
              >
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                                     {(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
                     <Link
                       href={`/products/${product.id}/edit`}
                       onClick={() => setShowActions(false)}
                       className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                     >
                       <Edit className="h-4 w-4" />
                       <span>Edit</span>
                     </Link>
                   )}
                                     {/* Only show Add to Cart for non-admin users */}
                                     {onAddToCart && !(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
                     <button
                       onClick={() => {
                         setShowActions(false)
                         handleAddToCart()
                       }}
                       className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                     >
                       <ShoppingCart className="h-4 w-4" />
                       <span>Add to Cart</span>
                     </button>
                   )}
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
                                     {(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
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
                   )}
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
                <span className="text-xs sm:text-sm font-medium text-blue-600">{product.brand}</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">4.5</span>
                </div>
              </div>
              <h3 className="card-title text-base sm:text-lg truncate">{product.title}</h3>
              <p className="card-description line-clamp-2 mt-1 text-xs sm:text-sm">{product.description}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Category:</span>
              <span className="font-medium truncate ml-2">{product.category}</span>
            </div>
            
            {product.size && product.size.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Sizes:</span>
                <span className="font-medium truncate ml-2">{product.size.join(', ')}</span>
              </div>
            )}
            
            {product.color && product.color.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Colors:</span>
                <span className="font-medium truncate ml-2">{product.color.join(', ')}</span>
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
          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-1 lg:space-x-2 flex-wrap gap-1">
              {/* Only show Add to Cart for non-admin users */}
              {onAddToCart && product.stock > 0 && !(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
                <button
                  onClick={handleAddToCart}
                  className="btn-outline-primary btn-sm p-1.5 sm:p-2"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
                             {(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
                 <Link
                   href={`/products/${product.id}/edit`}
                   className="btn-outline-warning btn-sm p-1.5 sm:p-2"
                   title="Edit product"
                 >
                   <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                 </Link>
               )}
              {product.stock > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-success btn-sm p-1.5 sm:p-2"
                  title="Purchase product"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
                             {(canViewAdminDashboard(userProfile) || user?.email === 'danmartinbilledo@ymail.com') && (
                 <button
                   onClick={handleDelete}
                   disabled={isDeleting}
                   className="btn-destructive btn-sm p-1.5 sm:p-2"
                   title="Delete product"
                 >
                   <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                 </button>
               )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs text-blue-600 bg-blue-50"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-50">
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

      {/* Size Selection Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Size</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{product.title}</h4>
              <p className="text-gray-600 text-sm">{product.brand}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Available Sizes:</p>
              <div className="grid grid-cols-3 gap-2">
                {product.size?.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSizeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


