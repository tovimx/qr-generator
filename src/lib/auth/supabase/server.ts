import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(): Promise<ReturnType<typeof createServerClient>> {
  const cookieStore = await cookies()

  // For testing environment, use mock values
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env['DISABLE_AUTH_FOR_TESTING'] === 'true';
  
  const supabaseUrl = isTestEnv ? 'https://test.supabase.co' : process.env['NEXT_PUBLIC_SUPABASE_URL']!
  const supabaseAnonKey = isTestEnv ? 'test-anon-key' : process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}