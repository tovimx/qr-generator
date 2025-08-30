import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth/supabase/server'
import { prisma } from '@/lib/db/prisma'
import SimpleProjectDashboard from '@/components/project/SimpleProjectDashboard'
import QueryProvider from '@/providers/QueryProvider'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) {
    redirect('/login')
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
      }
    })
  }

  // Get or create client for this user
  let client = await prisma.client.findUnique({
    where: { ownerUserId: user.id }
  })

  if (!client) {
    client = await prisma.client.create({
      data: { ownerUserId: user.id }
    })
  }

  // Get projects with stats
  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    include: {
      _count: {
        select: { qrCodes: { where: { deletedAt: null } } }
      }
    },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' }
    ]
  })

  // Ensure default project exists
  if (projects.length === 0) {
    const defaultProject = await prisma.project.create({
      data: {
        clientId: client.id,
        name: 'Default Project',
        isDefault: true
      },
      include: {
        _count: {
          select: { qrCodes: { where: { deletedAt: null } } }
        }
      }
    })
    projects.push(defaultProject)
  }

  // Transform projects with stats
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const qrCodes = await prisma.qRCode.findMany({
        where: {
          projectId: project.id,
          deletedAt: null
        },
        include: {
          _count: {
            select: { scans: true }
          }
        }
      })

      const totalScans = qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)
      const activeQRs = qrCodes.filter(qr => qr.isActive).length

      return {
        ...project,
        qrCodeCount: qrCodes.length,
        activeQRCount: activeQRs,
        totalScans,
        lastActivity: qrCodes.length > 0 ? 
          Math.max(...qrCodes.map(qr => new Date(qr.updatedAt).getTime())) : 
          new Date(project.updatedAt).getTime()
      }
    })
  )

  // Get initial QR codes for default project
  const defaultProject = projectsWithStats.find(p => p.isDefault) || projectsWithStats[0]
  const initialQRCodes = defaultProject ? await prisma.qRCode.findMany({
    where: {
      projectId: defaultProject.id,
      deletedAt: null
    },
    include: {
      links: {
        orderBy: { position: 'asc' }
      },
      project: true,
      _count: {
        select: { scans: true }
      }
    },
    orderBy: { position: 'asc' }
  }) : []

  return (
    <QueryProvider>
      <SimpleProjectDashboard 
        user={dbUser}
        initialProjects={projectsWithStats}
        initialQRCodes={initialQRCodes}
      />
    </QueryProvider>
  )
}
