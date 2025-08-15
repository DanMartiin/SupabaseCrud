'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Product, Payment, User } from '@/types'
import { Navigation } from '@/components/Navigation'
import { ProductCard } from '@/components/ProductCard'
import { SearchFilters } from './SearchFilters'
import { Pagination } from './Pagination'
import { Loader2, ShoppingBag, Heart, Star, TrendingUp, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'

export function Dashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')
  const [userProfile, setUserProfile] = useState<User | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchPurchasedProducts()
      fetchUserProfile()
      
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
    }
  }, [user, currentPage, searchQuery, categoryFilter, brandFilter, priceRange, sortBy])

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

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      }

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      if (brandFilter) {
        query = query.eq('brand', brandFilter)
      }

      if (priceRange.min) {
        query = query.gte('price', parseFloat(priceRange.min))
      }

      if (priceRange.max) {
        query = query.lte('price', parseFloat(priceRange.max))
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('title', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const itemsPerPage = 12
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
        setProducts([])
        setTotalPages(1)
        return
      }

      setProducts(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('An unexpected error occurred while loading products.')
      setProducts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchasedProducts = async () => {
    try {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          product_id,
          products (*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')

      if (paymentsError) {
        console.error('Error fetching purchased products:', paymentsError)
        return
      }

      const purchased = payments?.map(payment => payment.products).filter(Boolean) as unknown as Product[]
      setPurchasedProducts(purchased || [])
    } catch (error) {
      console.error('Error fetching purchased products:', error)
    }
  }

  const handleProductUpdate = () => {
    fetchProducts()
  }

  const addToCart = (product: Product & { selectedSize?: string }) => {
    setCart(prevCart => {
      // Check if item with same ID and size already exists
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        (item as any).selectedSize === product.selectedSize
      )
      if (existingItem) {
        return prevCart // Item already in cart
      }
      const newCart = [...prevCart, product]
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => 
        !(item.id === productId && (item as any).selectedSize === selectedSize)
      )
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

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
      
      // Clear cart and refresh purchased products
      setCart([])
      localStorage.removeItem('cart')
      fetchPurchasedProducts()
      
      alert('Checkout successful! Your items have been purchased.')
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Checkout failed. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-8">
                     {/* Header */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user.first_name || user.email}!</h1>
               <p className="text-gray-600 mt-1">Discover amazing shoes and track your purchases</p>
             </div>
             <div className="flex items-center gap-3">
               {/* Only show Cart Button for non-admin users */}
               {!(user.email === 'danmartinbilledo@ymail.com' || (userProfile && userProfile.role === 'admin')) && (
                 <Link
                   href="/checkout"
                   className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                   title={`Cart (${cart.length} items)`}
                 >
                   <ShoppingCart className="h-6 w-6" />
                   {cart.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                       {cart.length}
                     </span>
                   )}
                 </Link>
               )}
               {/* Only show Add Product button for admin users */}
               {(user.email === 'danmartinbilledo@ymail.com' || (userProfile && userProfile.role === 'admin')) && (
                 <Link href="/products/create" className="btn-primary btn-sm sm:btn-md flex items-center justify-center">
                   <ShoppingBag className="h-4 w-4 mr-2" />
                   <span className="hidden sm:inline">Add Product</span>
                   <span className="sm:hidden">Add</span>
                 </Link>
               )}
             </div>
           </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="card">
               <div className="card-content">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                     <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{products.length}</p>
                   </div>
                   <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-500" />
                 </div>
               </div>
             </div>

             <div className="card">
               <div className="card-content">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs sm:text-sm font-medium text-gray-600">Purchases</p>
                     <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{purchasedProducts.length}</p>
                   </div>
                   <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500" />
                 </div>
               </div>
             </div>

             {/* Only show Cart Items card for non-admin users */}
             {!(user.email === 'danmartinbilledo@ymail.com' || (userProfile && userProfile.role === 'admin')) && (
               <div className="card">
                 <div className="card-content">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600">Cart Items</p>
                       <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{cart.length}</p>
                     </div>
                     <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-500" />
                   </div>
                 </div>
               </div>
             )}

             {/* Only show Cart Total card for non-admin users */}
             {!(user.email === 'danmartinbilledo@ymail.com' || (userProfile && userProfile.role === 'admin')) && (
               <div className="card">
                 <div className="card-content">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600">Cart Total</p>
                       <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">₱{getCartTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                     </div>
                     <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500" />
                   </div>
                 </div>
               </div>
             )}
           </div>

           

          {/* Search and Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            brandFilter={brandFilter}
            onBrandChange={setBrandFilter}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

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
                  <h3 className="text-sm font-medium text-red-800">Error Loading Products</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                <span className="text-sm sm:text-base">Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                {searchQuery || categoryFilter || brandFilter
                  ? 'Try adjusting your search or filters'
                  : 'No products available yet'
                }
              </p>
              {!searchQuery && !categoryFilter && !brandFilter && (user.email === 'danmartinbilledo@ymail.com' || (userProfile && userProfile.role === 'admin')) && (
                <Link href="/products/create" className="btn-primary text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add First Product
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onUpdate={handleProductUpdate}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 sm:mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}


