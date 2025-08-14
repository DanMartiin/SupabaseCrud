'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { ImageUpload } from '@/components/ImageUpload'
import { Loader2, Plus, X } from 'lucide-react'
import { AdminRoute } from '@/components/auth/AdminRoute'

export default function CreateProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    size: [] as string[],
    color: [] as string[],
    images: [] as string[],
    tags: [] as string[]
  })

  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newTag, setNewTag] = useState('')

  const categories = ['Running', 'Basketball', 'Casual', 'Formal', 'Athletic', 'Sandals', 'Boots', 'Sneakers']
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Jordan', 'Under Armour']
  const availableSizes = ['6', '7', '8', '9', '10', '11', '12', '13']
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Grey', 'Navy']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create a product')
      return
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Product title is required')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (!formData.category) {
      setError('Category is required')
      return
    }

    if (!formData.brand) {
      setError('Brand is required')
      return
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Stock quantity must be 0 or greater')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const productData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock),
        size: formData.size,
        color: formData.color,
        images: formData.images,
        tags: formData.tags,
        is_active: true
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()

      if (error) {
        console.error('Supabase error creating product:', error)
        setError(`Failed to create product: ${error.message}`)
        return
      }

      console.log('Product created successfully:', data)
      router.push('/admin')
    } catch (error) {
      console.error('Unexpected error creating product:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addSize = () => {
    if (newSize && !formData.size.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        size: [...prev.size, newSize]
      }))
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.filter(s => s !== size)
    }))
  }

  const addColor = () => {
    if (newColor && !formData.color.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        color: [...prev.color, newColor]
      }))
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.filter(c => c !== color)
    }))
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">Create a new shoe product for your store</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="alert-error">
                    <p>{error}</p>
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="e.g., Nike Air Max 270"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Describe the product..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="input"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        className="input"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand *
                      </label>
                      <select
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="input"
                      >
                        <option value="">Select brand</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.size.map(size => (
                      <span
                        key={size}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="input flex-1"
                    >
                      <option value="">Select size</option>
                      {availableSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addSize}
                      className="btn-primary btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.color.map(color => (
                      <span
                        key={color}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="input flex-1"
                    >
                      <option value="">Select color</option>
                      {availableColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addColor}
                      className="btn-primary btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                  <ImageUpload
                    onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                    currentImages={formData.images}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="input flex-1"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-primary btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Create Product</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
