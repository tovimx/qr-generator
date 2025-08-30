import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preferredDomainId } = await request.json()

    // Verify the QR code belongs to the user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: id,
        userId: user.id,
        deletedAt: null
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // If preferredDomainId is provided, verify it belongs to the user's client
    if (preferredDomainId) {
      const domain = await prisma.domain.findFirst({
        where: {
          id: preferredDomainId,
          client: {
            ownerUserId: user.id
          }
        }
      })

      if (!domain) {
        return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
      }
    }

    // Update the QR code's preferred domain
    const updatedQrCode = await prisma.qRCode.update({
      where: { id: id },
      data: { 
        preferredDomainId: preferredDomainId || null 
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

    return NextResponse.json(updatedQrCode)
  } catch (error) {
    console.error('Error updating preferred domain:', error)
    return NextResponse.json(
      { error: 'Failed to update preferred domain' },
      { status: 500 }
    )
  }
}