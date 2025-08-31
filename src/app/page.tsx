import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function HomePage() {
  // Bypass authentication checks for testing
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env['DISABLE_AUTH_FOR_TESTING'] === 'true';
  
  if (isTestEnv) {
    // In test mode, go directly to dashboard
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}