import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    if (qrCode.user.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { cornerRadius, fgColor } = body

    // Validate corner radius
    if (cornerRadius !== undefined && (cornerRadius < 0 || cornerRadius > 10)) {
      return NextResponse.json({ error: 'Corner radius must be between 0 and 10' }, { status: 400 })
    }

    // Validate color format
    if (fgColor !== undefined && !fgColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      return NextResponse.json({ error: 'Invalid color format. Use hex format like #000000' }, { status: 400 })
    }

    // Update the QR code
    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: {
        ...(cornerRadius !== undefined && { cornerRadius }),
        ...(fgColor !== undefined && { fgColor })
      },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
        }
      }
    })

    return NextResponse.json(updatedQrCode)
  } catch (error) {
    console.error('Error updating QR code style:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update QR code style',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}