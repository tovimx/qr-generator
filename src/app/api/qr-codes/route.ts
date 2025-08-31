import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateShortCode } from '@/lib/utils/qr-code'
import { createClient } from '@/lib/auth/supabase/server'

export async function GET(request: Request) {
  let user = null
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project filter from query parameters
    const url = new URL(request.url)
    const projectId = url.searchParams.get('projectId')

    const whereClause = {
      userId: user.id,
      deletedAt: null,
      ...(projectId && { projectId })
    }

    // Get all QR codes for the user (excluding soft deleted)
    const qrCodes = await prisma.qRCode.findMany({
      where: whereClause,
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        project: {
          select: {
            id: true,
            name: true,
            isDefault: true
          }
        },
        _count: {
          select: { scans: true }
        },
        preferredDomain: {
          select: {
            id: true,
            hostname: true,
            primary: true,
            verified: true
          }
        }
      },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      user: user?.id
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch QR codes',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
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

    const { title, projectId } = await request.json()

    // projectId is now REQUIRED
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate projectId
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          ownerUserId: user.id
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Count existing QR codes for this project (limit to 10 per project)
    const whereClause = { userId: user.id, projectId, deletedAt: null }

    const existingCount = await prisma.qRCode.count({
      where: whereClause
    })

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 QR codes allowed per project' },
        { status: 400 }
      )
    }

    // Generate unique short code
    let shortCode: string
    let isUnique = false
    
    while (!isUnique) {
      shortCode = generateShortCode()
      const existing = await prisma.qRCode.findUnique({
        where: { shortCode }
      })
      if (!existing) {
        isUnique = true
      }
    }

    // Ensure a client (tenant) exists for this user
    let client = await prisma.client.findUnique({ where: { ownerUserId: user.id } })
    if (!client) {
      client = await prisma.client.create({ data: { ownerUserId: user.id } })
    }

    // Get next position within the project scope
    const lastQrCode = await prisma.qRCode.findFirst({
      where: whereClause,
      orderBy: { position: 'desc' }
    })
    const nextPosition = (lastQrCode?.position || 0) + 1

    // Create new QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        userId: user.id,
        shortCode: shortCode!,
        title: title || `QR Code ${nextPosition}`,
        position: nextPosition,
        clientId: client.id,
        projectId: projectId,
      },
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        project: {
          select: {
            id: true,
            name: true,
            isDefault: true
          }
        },
        _count: {
          select: { scans: true }
        },
        preferredDomain: {
          select: {
            id: true,
            hostname: true,
            primary: true,
            verified: true
          }
        }
      }
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { qrCodeIds, newPositions } = await request.json()

    // Update positions for multiple QR codes (for reordering)
    if (qrCodeIds && newPositions) {
      await prisma.$transaction(
        qrCodeIds.map((id: string, index: number) =>
          prisma.qRCode.update({
            where: { 
              id,
              userId: user.id,
              deletedAt: null
            },
            data: { position: newPositions[index] }
          })
        )
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating QR codes:', error)
    return NextResponse.json(
      { error: 'Failed to update QR codes' },
      { status: 500 }
    )
  }
}
