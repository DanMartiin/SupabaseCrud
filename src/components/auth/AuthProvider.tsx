'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    console.log('AuthProvider: Starting session check...')
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 seconds timeout
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('AuthProvider: Getting session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('AuthProvider: Session error:', sessionError)
          setLoading(false)
          clearTimeout(timeoutId)
          return
        }
        
        console.log('AuthProvider: Session result:', session ? 'Session found' : 'No session')
        
        if (session?.user) {
          console.log('AuthProvider: User found in session:', session.user.email)
          
          // Try to fetch user data from database
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (error) {
              console.log('AuthProvider: Error fetching user data:', error)
              
              // If user doesn't exist in our table, create them
              if (error.code === 'PGRST116') { // No rows returned
                console.log('AuthProvider: User not found in database, creating...')
                try {
                  // Special handling for danmartinbilledo@ymail.com - make them admin
                  const userRole = session.user.email === 'danmartinbilledo@ymail.com' ? 'admin' : 'user'
                  console.log(`AuthProvider: Creating user with role: ${userRole}`)
                  
                  const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                      id: session.user.id,
                      email: session.user.email,
                      role: userRole,
                      created_at: session.user.created_at,
                    })
                    .single()
                  
                  if (insertError) {
                    console.error('AuthProvider: Error creating user record:', insertError)
                    // Use fallback user object
                    setUser({
                      id: session.user.id,
                      email: session.user.email || '',
                      role: userRole,
                      created_at: session.user.created_at,
                      updated_at: session.user.updated_at || session.user.created_at,
                    })
                  } else {
                    console.log('AuthProvider: User created successfully')
                    // Use fallback user object since we just created it
                    setUser({
                      id: session.user.id,
                      email: session.user.email || '',
                      role: userRole,
                      created_at: session.user.created_at,
                      updated_at: session.user.updated_at || session.user.created_at,
                    })
                  }
                } catch (err) {
                  console.error('AuthProvider: Error in user creation:', err)
                  // Use fallback user object
                  const userRole = session.user.email === 'danmartinbilledo@ymail.com' ? 'admin' : 'user'
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: userRole,
                    created_at: session.user.created_at,
                    updated_at: session.user.updated_at || session.user.created_at,
                  })
                }
              } else {
                console.log('AuthProvider: Using fallback user object due to error')
                // Use fallback user object for other errors
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: 'user',
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || session.user.created_at,
                })
              }
            } else {
              console.log('AuthProvider: User data fetched successfully:', userData)
              setUser(userData)
            }
          } catch (dbError) {
            console.error('AuthProvider: Database error:', dbError)
            // Use fallback user object
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            })
          }
        } else {
          console.log('AuthProvider: No user in session')
          setUser(null)
        }
      } catch (error) {
        console.error('AuthProvider: Error getting session:', error)
        setUser(null)
      } finally {
        console.log('AuthProvider: Setting loading to false')
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change event:', event, session ? 'Session exists' : 'No session')
        
        try {
          if (session?.user) {
            console.log('AuthProvider: Setting user from auth state change:', session.user.email)
            // Use a simple fallback user object for now
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            })
          } else {
            console.log('AuthProvider: Clearing user from auth state change')
            setUser(null)
          }
        } catch (error) {
          console.error('AuthProvider: Error in auth state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // If signin is successful, refresh user data from database
    if (data.user && !error) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!userError && userData) {
          console.log('AuthProvider: User data loaded after signin:', userData)
          setUser(userData)
        } else if (userError && userError.code === 'PGRST116') {
          // User doesn't exist in database, create them
          console.log('AuthProvider: User not found after signin, creating...')
          const userRole = data.user.email === 'danmartinbilledo@ymail.com' ? 'admin' : 'user'
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: userRole,
              created_at: data.user.created_at,
            })
            .single()
          
          if (!insertError) {
            console.log('AuthProvider: User created after signin with role:', userRole)
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              role: userRole,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || data.user.created_at,
            })
          } else {
            console.error('AuthProvider: Error creating user after signin:', insertError)
            // Use fallback user object
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              role: userRole,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || data.user.created_at,
            })
          }
        }
      } catch (err) {
        console.error('Error refreshing user data after signin:', err)
        // Use fallback user object
        const userRole = data.user.email === 'danmartinbilledo@ymail.com' ? 'admin' : 'user'
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          role: userRole,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        })
      }
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If signup is successful, manually create the user record if it doesn't exist
    if (data.user && !error) {
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'user',
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at,
          })
          .single()
        
        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user record:', insertError)
        }
      } catch (err) {
        console.error('Error in user creation:', err)
      }
    }
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    if (!user?.id) return
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && userData) {
        setUser(userData)
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


