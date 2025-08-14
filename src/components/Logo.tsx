import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm`}>
        <ShoppingBag className={`${iconSizes[size]} text-white`} />
      </div>
      {showText && (
        <>
          <span className={`${textSizes[size]} font-bold text-gray-900 sm:block`}>
            DM Soles
          </span>
          <span className={`${textSizes[size]} font-bold text-gray-900 sm:hidden`}>
            DMS
          </span>
        </>
      )}
    </Link>
  )
}
