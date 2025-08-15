'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Trash2, 
  Download, 
  Upload, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface BulkOperationsProps {
  selectedItems: string[]
  type: 'product' | 'user' | 'payment'
  onSuccess: () => void
  onClearSelection: () => void
}

export function BulkOperations({ selectedItems, type, onSuccess, onClearSelection }: BulkOperationsProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [operation, setOperation] = useState<'delete' | 'export' | 'status'>('delete')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  const supabase = createClient()

  const handleBulkDelete = async () => {
    setLoading(true)
    try {
      const tableName = type === 'product' ? 'products' : type === 'user' ? 'users' : 'payments'
      
      await Promise.all(selectedItems.map(id => 
        supabase.from(tableName).delete().eq('id', id)
      ))
      
      onSuccess()
      onClearSelection()
      setShowConfirmModal(false)
    } catch (error) {
      console.error('Error performing bulk delete:', error)
      alert('Failed to delete items')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (type !== 'product') return
    
    setLoading(true)
    try {
      await Promise.all(selectedItems.map(id => 
        supabase
          .from('products')
          .update({ is_active: status === 'active' })
          .eq('id', id)
      ))
      
      onSuccess()
      onClearSelection()
      setShowConfirmModal(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // This would typically generate a CSV or JSON file
    const data = selectedItems.map(id => ({ id }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOperation = (op: 'delete' | 'export' | 'status') => {
    setOperation(op)
    if (op === 'export') {
      handleExport()
    } else {
      setShowConfirmModal(true)
    }
  }

  const getOperationText = () => {
    switch (operation) {
      case 'delete':
        return `Delete ${selectedItems.length} selected ${type}(s)`
      case 'status':
        return `Set ${selectedItems.length} selected ${type}(s) to ${status}`
      default:
        return ''
    }
  }

  if (selectedItems.length === 0) return null

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length} {type}(s) selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {type === 'product' && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            
            <button
              onClick={() => handleOperation('delete')}
              className="btn-destructive btn-sm"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
            
            <button
              onClick={() => handleOperation('export')}
              className="btn-outline-primary btn-sm"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            
            {type === 'product' && (
              <button
                onClick={() => handleOperation('status')}
                className="btn-outline-warning btn-sm"
                disabled={loading}
              >
                <Settings className="h-4 w-4 mr-1" />
                Update Status
              </button>
            )}
            
            <button
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Operation</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {getOperationText()}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={operation === 'delete' ? handleBulkDelete : handleBulkStatusUpdate}
                disabled={loading}
                className={`btn-sm flex items-center ${
                  operation === 'delete' ? 'btn-destructive' : 'btn-warning'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {operation === 'delete' ? <Trash2 className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                    {operation === 'delete' ? 'Delete' : 'Update'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

