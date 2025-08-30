import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's client
    const client = await prisma.client.findUnique({
      where: { ownerUserId: user.id },
      include: {
        projects: {
          include: {
            _count: {
              select: { qrCodes: { where: { deletedAt: null } } }
            }
          },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    })

    if (!client) {
      return NextResponse.json({ projects: [] })
    }

    // Transform projects with QR code counts and stats
    const projectsWithStats = await Promise.all(
      client.projects.map(async (project) => {
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

    return NextResponse.json({ projects: projectsWithStats })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Get or create user's client
    let client = await prisma.client.findUnique({
      where: { ownerUserId: user.id }
    })

    if (!client) {
      client = await prisma.client.create({
        data: { ownerUserId: user.id }
      })
    }

    // Check project limit (10 projects per client)
    const projectCount = await prisma.project.count({
      where: { clientId: client.id }
    })

    if (projectCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 projects allowed per client' },
        { status: 400 }
      )
    }

    // Create new project
    const project = await prisma.project.create({
      data: {
        clientId: client.id,
        name: name.trim(),
        isDefault: false
      },
      include: {
        _count: {
          select: { qrCodes: { where: { deletedAt: null } } }
        }
      }
    })

    // Add stats
    const projectWithStats = {
      ...project,
      qrCodeCount: 0,
      activeQRCount: 0,
      totalScans: 0,
      lastActivity: new Date(project.createdAt).getTime()
    }

    return NextResponse.json(projectWithStats)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}