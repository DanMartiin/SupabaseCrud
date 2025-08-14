export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  brand: string
  size: string[]
  color: string[]
  images: string[]
  stock: number
  is_active: boolean
  tags?: string[]
  created_at: string
  user_id: string
}

export interface ProductItem {
  id: string
  product_id: string
  name: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  product_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  payment_method?: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  products?: {
    title: string
    description?: string
  }
}

export interface SearchFilters {
  query: string
  category?: string
  price_min?: number
  price_max?: number
  sort_by?: 'title' | 'created_at' | 'price'
  sort_order?: 'asc' | 'desc'
}

export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_items: number
  items_per_page: number
  has_next: boolean
  has_prev: boolean
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  error?: string
}

export interface UserStats {
  total_products: number
  total_purchases: number
  total_spent: number
  favorite_brands: string[]
}

export interface AdminStats {
  total_users: number
  total_products: number
  total_sales: number
  total_revenue: number
  top_selling_products: Array<{
    product_id: string
    title: string
    sales_count: number
    revenue: number
  }>
}

export interface PaymentAnalytics {
  date: string
  total_sales: number
  total_revenue: number
  product_count: number
}



