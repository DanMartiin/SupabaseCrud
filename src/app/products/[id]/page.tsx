'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { PaymentModal } from '@/components/PaymentModal'
import { Product } from '@/types'
import { Loader2, ArrowLeft, Heart, Star, ShoppingCart, Share2, Eye, Calendar, DollarSign, Package, Tag } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setError('Product not found')
        return
      }

      if (!data) {
        setError('Product not found')
        return
      }

      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    // Refresh product data to update stock
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
              <Link href="/" className="btn-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Products
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[selectedImage]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-400 text-center">
                            <div className="text-6xl mb-4">👟</div>
                            <div className="text-lg">No Image Available</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.images && product.images.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">{product.brand}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={toggleFavorite}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={shareProduct}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="ml-1 text-gray-600">4.5</span>
                          <span className="ml-1 text-gray-500">(24 reviews)</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>1.2k views</span>
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <span className="text-3xl font-bold text-gray-900">₱{product.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-gray-600">4.5 (24 reviews)</span>
                      </div>
                    </div>
                    {product.stock > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        In Stock ({product.stock} available)
                      </span>
                    )}

                    {/* Product Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Category:</span>
                          <span className="text-sm font-medium">{product.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Added:</span>
                          <span className="text-sm font-medium">{formatDate(product.created_at)}</span>
                        </div>
                      </div>

                      {/* Sizes */}
                      {product.size && product.size.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Available Sizes</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.size.map((size) => (
                              <span
                                key={size}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {product.color && product.color.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Available Colors</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.color.map((color) => (
                              <span
                                key={color}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      {product.stock > 0 ? (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full btn-primary btn-lg flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>Buy Now - ₱{product.price}</span>
                        </button>
                      ) : (
                        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                          <span className="text-red-700 font-medium">Out of Stock</span>
                        </div>
                      )}

                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="flex-1 btn-outline btn-sm"
                          >
                            Edit Product
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                // Handle delete
                              }
                            }}
                            className="flex-1 btn-destructive btn-sm"
                          >
                            Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

