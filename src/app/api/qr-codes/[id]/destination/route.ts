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
    const { redirectType, redirectUrl } = body

    // Validate redirect type
    if (!['links', 'url'].includes(redirectType)) {
      return NextResponse.json({ error: 'Invalid redirect type' }, { status: 400 })
    }

    // Validate URL if type is 'url'
    if (redirectType === 'url' && redirectUrl) {
      try {
        new URL(redirectUrl)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }
    }

    // Update the QR code
    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: {
        redirectType,
        redirectUrl: redirectType === 'url' ? redirectUrl : null
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
    console.error('Error updating QR code destination:', error)
    return NextResponse.json(
      { error: 'Failed to update QR code destination' },
      { status: 500 }
    )
  }
}