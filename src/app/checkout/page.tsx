'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Product } from '@/types'
import { Navigation } from '@/components/Navigation'
import { ArrowLeft, CreditCard, ShoppingCart, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Error parsing cart:', error)
        setCart([])
      }
    }

    // Pre-fill form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      }))
    }
  }, [user, router])

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0)
  }

  const removeFromCart = (productId: string, selectedSize?: string) => {
    const updatedCart = cart.filter(item => 
      !(item.id === productId && (item as any).selectedSize === selectedSize)
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const updatedCart = cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    setLoading(true)
    try {
      // Create payment records for each item in cart
      const paymentPromises = cart.map(product => 
        supabase
          .from('payments')
          .insert({
            user_id: user?.id,
            product_id: product.id,
            amount: product.price,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: new Date().toISOString(),
          })
      )

      await Promise.all(paymentPromises)
      
      // Clear cart
      setCart([])
      localStorage.removeItem('cart')
      setSuccess(true)
      
             // Redirect to homepage after 2 seconds
       setTimeout(() => {
         router.push('/')
       }, 2000)
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to proceed to checkout.</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart before checkout.</p>
                         <Link href="/" className="btn-primary">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Homepage
             </Link>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                         <Link href="/" className="btn-primary">
               Back to Homepage
             </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
                         <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Homepage
             </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
             {/* Checkout Form */}
             <div className="bg-white rounded-lg shadow p-4 sm:p-6">
               <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping & Payment Information</h2>
              
              <form onSubmit={handleCheckout} className="space-y-6">
                                 {/* Personal Information */}
                 <div>
                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                                 {/* Shipping Address */}
                 <div>
                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Address</h3>
                   <div className="space-y-3 sm:space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                       <input
                         type="text"
                         name="address"
                         value={formData.address}
                         onChange={handleInputChange}
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                                 {/* Payment Information */}
                 <div>
                   <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Information</h3>
                   <div className="space-y-3 sm:space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                       <input
                         type="text"
                         name="cardNumber"
                         value={formData.cardNumber}
                         onChange={handleInputChange}
                         placeholder="1234 5678 9012 3456"
                         required
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                                 <button
                   type="submit"
                   disabled={loading || cart.length === 0}
                   className="w-full bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                 >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Purchase - ₱{getCartTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  )}
                </button>
              </form>
            </div>

                         {/* Order Summary */}
             <div className="bg-white rounded-lg shadow p-4 sm:p-6 h-fit">
               <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
                             <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                 {cart.map((item) => (
                   <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                                         {item.images && item.images.length > 0 ? (
                       <img
                         src={item.images[0]}
                         alt={item.title}
                         className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                       />
                     ) : (
                       <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center">
                         <div className="text-gray-400 text-center">
                           <div className="text-lg sm:text-2xl">👟</div>
                         </div>
                       </div>
                     )}
                                                              <div className="flex-1 min-w-0">
                       <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.title}</h3>
                       <p className="text-gray-600 text-xs sm:text-sm">{item.brand}</p>
                       {(item as any).selectedSize && (
                         <p className="text-xs sm:text-sm text-gray-500">Size: {(item as any).selectedSize}</p>
                       )}
                       <p className="text-base sm:text-lg font-bold text-blue-600">₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                     </div>
                                         <button
                       onClick={() => removeFromCart(item.id, (item as any).selectedSize)}
                       className="text-red-600 hover:text-red-800"
                     >
                       Remove
                     </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                                     <span className="font-medium">₱{getCartTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                                     <span className="text-blue-600">₱{getCartTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
