import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const project = await prisma.project.findFirst({
      where: {
        id: resolvedParams.id,
        client: {
          ownerUserId: user.id
        }
      },
      include: {
        qrCodes: {
          where: { deletedAt: null },
          include: {
            links: {
              orderBy: { position: 'asc' }
            },
            _count: {
              select: { scans: true }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { qrCodes: { where: { deletedAt: null } } }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate stats
    const totalScans = project.qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0)
    const activeQRs = project.qrCodes.filter(qr => qr.isActive).length

    const projectWithStats = {
      ...project,
      qrCodeCount: project.qrCodes.length,
      activeQRCount: activeQRs,
      totalScans,
      lastActivity: project.qrCodes.length > 0 ? 
        Math.max(...project.qrCodes.map(qr => new Date(qr.updatedAt).getTime())) : 
        new Date(project.updatedAt).getTime()
    }

    return NextResponse.json(projectWithStats)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    
    // Verify ownership and update
    const project = await prisma.project.updateMany({
      where: {
        id: resolvedParams.id,
        client: {
          ownerUserId: user.id
        }
      },
      data: {
        name: name.trim()
      }
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Return updated project
    const updatedProject = await prisma.project.findFirst({
      where: {
        id: resolvedParams.id,
        client: {
          ownerUserId: user.id
        }
      },
      include: {
        _count: {
          select: { qrCodes: { where: { deletedAt: null } } }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    
    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: resolvedParams.id,
        client: {
          ownerUserId: user.id
        }
      },
      include: {
        _count: {
          select: { qrCodes: { where: { deletedAt: null } } }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Prevent deletion of default project
    if (project.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default project' },
        { status: 400 }
      )
    }

    // Check if project has QR codes
    if (project._count.qrCodes > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with QR codes. Move or delete QR codes first.' },
        { status: 400 }
      )
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}