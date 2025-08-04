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
    const { logoUrl, logoSize, logoShape } = body

    // Validate logo size
    if (logoSize && (logoSize < 10 || logoSize > 40)) {
      return NextResponse.json({ error: 'Logo size must be between 10 and 40' }, { status: 400 })
    }

    // Validate logo shape
    if (logoShape && !['square', 'circle'].includes(logoShape)) {
      return NextResponse.json({ error: 'Logo shape must be either square or circle' }, { status: 400 })
    }

    // Update the QR code
    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: {
        logoUrl,
        logoSize: logoSize || 30,
        ...(logoShape && { logoShape })
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
    console.error('Error updating QR code logo:', error)
    return NextResponse.json(
      { error: 'Failed to update QR code logo' },
      { status: 500 }
    )
  }
}