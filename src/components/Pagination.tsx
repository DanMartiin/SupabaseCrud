'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Page Info */}
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers - Desktop */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`btn-sm min-w-[2rem] ${
                page === currentPage
                  ? 'btn-info'
                  : page === '...'
                  ? 'cursor-default bg-transparent border-transparent'
                  : 'btn-outline'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Page Numbers - Mobile */}
        <div className="sm:hidden flex items-center space-x-1">
          {currentPage > 1 && (
            <button
              onClick={() => onPageChange(currentPage - 1)}
              className="btn-outline btn-sm"
            >
              {currentPage - 1}
            </button>
          )}
          <button className="btn-info btn-sm min-w-[2rem]">
            {currentPage}
          </button>
          {currentPage < totalPages && (
            <button
              onClick={() => onPageChange(currentPage + 1)}
              className="btn-outline btn-sm"
            >
              {currentPage + 1}
            </button>
          )}
          {currentPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="btn-outline btn-sm"
            >
              {totalPages}
            </button>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}



