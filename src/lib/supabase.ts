import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for use in Client Components)
export function createClient() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    console.log('Server-side: Using environment variables')
  } else {
    console.log('Client-side: Creating Supabase client')
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


  