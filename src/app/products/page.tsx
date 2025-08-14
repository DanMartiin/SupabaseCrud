'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Product } from '@/types'
import { Navigation } from '@/components/Navigation'
import { ProductCard } from '@/components/ProductCard'
import { SearchFilters } from '@/components/SearchFilters'
import { Pagination } from '@/components/Pagination'
import { Loader2, ShoppingBag, Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '')
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || ''
  })
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  // Available filters
  const categories = ['Running', 'Basketball', 'Casual', 'Formal', 'Athletic', 'Sandals', 'Boots', 'Sneakers']
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Jordan', 'Under Armour']

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchQuery, categoryFilter, brandFilter, priceRange, sortBy])

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (categoryFilter) params.set('category', categoryFilter)
    if (brandFilter) params.set('brand', brandFilter)
    if (priceRange.min) params.set('min_price', priceRange.min)
    if (priceRange.max) params.set('max_price', priceRange.max)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = params.toString() ? `?${params.toString()}` : '/products'
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, categoryFilter, brandFilter, priceRange, sortBy, currentPage, router])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      }

      // Apply filters
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
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const itemsPerPage = viewMode === 'grid' ? 12 : 8
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
        return
      }

      setProducts(data || [])
      setTotalProducts(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('An unexpected error occurred while loading products.')
      setProducts([])
      setTotalPages(1)
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('')
    setBrandFilter('')
    setPriceRange({ min: '', max: '' })
    setSortBy('newest')
    setCurrentPage(1)
  }

  const handleProductUpdate = () => {
    fetchProducts()
  }

  const hasActiveFilters = searchQuery || categoryFilter || brandFilter || priceRange.min || priceRange.max

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-1">
                {totalProducts > 0 
                  ? `Showing ${products.length} of ${totalProducts} products`
                  : 'No products found'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline btn-sm flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
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

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {brandFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Brand: {brandFilter}
                  <button
                    onClick={() => setBrandFilter('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Price: ₱{priceRange.min || '0'} - ₱{priceRange.max || '∞'}
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

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

          {/* Products Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'No products available yet'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onUpdate={handleProductUpdate}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
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

