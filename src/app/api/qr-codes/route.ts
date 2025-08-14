import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateShortCode } from '@/lib/utils/qr-code'
import { createClient } from '@/lib/auth/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    // Check if user already has a QR code
    const existingQrCode = await prisma.qRCode.findUnique({
      where: { userId },
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
        }
      }
    })

    if (existingQrCode) {
      return NextResponse.json(existingQrCode)
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

    // Create new QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        userId,
        shortCode: shortCode!,
        title: 'My QR Code',
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
