import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateShortCode } from '@/lib/utils/qr-code'
import { createClient } from '@/lib/auth/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all QR codes for the user (excluding soft deleted)
    const qrCodes = await prisma.qRCode.findMany({
      where: { 
        userId: user.id,
        deletedAt: null
      },
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
        }
      },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
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

    const { title } = await request.json()

    // Count existing QR codes (limit to 10 per user)
    const existingCount = await prisma.qRCode.count({
      where: { 
        userId: user.id,
        deletedAt: null
      }
    })

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 QR codes allowed per user' },
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

    // Get next position
    const lastQrCode = await prisma.qRCode.findFirst({
      where: { 
        userId: user.id,
        deletedAt: null
      },
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
      },
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
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
