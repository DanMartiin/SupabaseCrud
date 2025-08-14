'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  currentImages?: string[]
}

export function ImageUpload({ onImagesUploaded, currentImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `product-images/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (error) {
          console.error('Upload error:', error)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      // Combine with existing images
      const allImages = [...currentImages, ...uploadedUrls]
      onImagesUploaded(allImages)

    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = (imageUrl: string) => {
    const updatedImages = currentImages.filter(img => img !== imageUrl)
    onImagesUploaded(updatedImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300">
          <Upload className="h-5 w-5 text-blue-600" />
          <span className="text-blue-600 font-medium">
            {uploading ? 'Uploading...' : 'Upload Images'}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        
        {uploading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">
              {Math.round(uploadProgress)}%
            </span>
          </div>
        )}
      </div>

      {/* Display uploaded images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(imageUrl)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



