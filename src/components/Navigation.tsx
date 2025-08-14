'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { User } from '@/types'
import { Menu, X, Search, ShoppingBag, CreditCard, User as UserIcon, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './Logo'
import { canViewAdminDashboard } from '@/lib/auth-utils'

export function Navigation() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userProfile, setUserProfile] = useState<User | null>(null)
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

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              href="/products?category=running"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Running
            </Link>
            <Link
              href="/products?category=basketball"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Basketball
            </Link>
            <Link
              href="/products?category=casual"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Casual
            </Link>
            <Link
              href="/payments"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shoes, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {userProfile?.first_name || user.email}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Account</span>
                  </Link>
                  {canViewAdminDashboard(userProfile) && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shoes, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Products</span>
                </Link>
                <Link
                  href="/products?category=running"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                >
                  Running
                </Link>
                <Link
                  href="/products?category=basketball"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                >
                  Basketball
                </Link>
                <Link
                  href="/products?category=casual"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                >
                  Casual
                </Link>
                <Link
                  href="/payments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Payments</span>
                </Link>
              </div>

              {/* Mobile User Menu */}
              {user ? (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-center space-x-3 px-4 py-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-base font-medium text-gray-900">
                      {userProfile?.first_name || user.email}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-base text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-50 rounded-lg"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Account</span>
                    </Link>
                                      {canViewAdminDashboard(userProfile) && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-base text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-50 rounded-lg"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-base text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-50 rounded-lg"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-gray-900 px-4 py-3 rounded-lg text-base font-medium transition-colors hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  )
}



