import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found in middleware')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    // Check if the request is for an admin route
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      console.log('🔒 Admin route detected:', request.nextUrl.pathname)
      
      // If no user is authenticated, redirect to login
      if (!user) {
        console.log('❌ No user authenticated, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('✅ User authenticated:', user.email)

      // Check if user has admin role
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', user.id)
          .single()

        console.log('🔍 Database query result:', { userData, userError })

        if (userError) {
          console.error('❌ Database error:', userError)
          // If there's a database error, redirect to home for security
          const homeUrl = new URL('/', request.url)
          return NextResponse.redirect(homeUrl)
        }

        if (!userData) {
          console.log('❌ User not found in database')
          const homeUrl = new URL('/', request.url)
          return NextResponse.redirect(homeUrl)
        }

        console.log('👤 User role from database:', userData.role)

        if (userData.role !== 'admin') {
          console.log('❌ User is not admin, redirecting to home')
          const homeUrl = new URL('/', request.url)
          return NextResponse.redirect(homeUrl)
        }

        console.log('✅ User is admin, allowing access')
      } catch (error) {
        console.error('❌ Error checking user role in middleware:', error)
        // If there's an error checking the role, redirect to home for security
        const homeUrl = new URL('/', request.url)
        return NextResponse.redirect(homeUrl)
      }
    }

  } catch (error) {
    console.error('Error in Supabase middleware:', error)
    // Continue without Supabase if there's an error
  }

  return supabaseResponse
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}


