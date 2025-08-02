import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase/server'
import { prisma } from '@/lib/db/prisma'
import QRCodeManager from '@/components/dashboard/QRCodeManager'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      qrCode: {
        include: {
          links: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: { scans: true }
          }
        }
      }
    }
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
      },
      include: {
        qrCode: {
          include: {
            links: {
              orderBy: { position: 'asc' }
            },
            _count: {
              select: { scans: true }
            }
          }
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user.email!} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Your QR Code</h1>
          <QRCodeManager user={dbUser} qrCode={dbUser.qrCode} />
        </div>
      </main>
    </div>
  )
}