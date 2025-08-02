import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}