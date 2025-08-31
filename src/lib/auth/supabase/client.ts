import { createBrowserClient } from '@supabase/ssr'

export function createClient(): ReturnType<typeof createBrowserClient> {
  // For testing environment, use mock values
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env['DISABLE_AUTH_FOR_TESTING'] === 'true';
  
  // Use direct process.env access for client-side public environment variables
  const supabaseUrl = isTestEnv ? 'https://test.supabase.co' : process.env['NEXT_PUBLIC_SUPABASE_URL']!
  const supabaseAnonKey = isTestEnv ? 'test-anon-key' : process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}