import { User } from '@/types'

/**
 * Check if a user has admin role
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return !!user
}

/**
 * Check if a user has specific permissions
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false
  
  // For now, only admin has all permissions
  // You can extend this to check specific permissions based on your role system
  return user.role === 'admin'
}

/**
 * Get user's role
 */
export function getUserRole(user: User | null): string | null {
  return user?.role || null
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage products
 */
export function canManageProducts(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can view admin dashboard
 */
export function canViewAdminDashboard(user: User | null): boolean {
  return isAdmin(user)
}
