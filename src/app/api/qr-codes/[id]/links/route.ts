import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

interface LinkInput {
  title: string
  url: string
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

    const { id } = await params
    const { links } = await request.json()

    // Verify QR code belongs to user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        user: {
          email: user.email
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Delete existing links
    await prisma.link.deleteMany({
      where: { qrCodeId: id }
    })

    // Create new links
    if (links && links.length > 0) {
      await prisma.link.createMany({
        data: links.map((link: LinkInput, index: number) => ({
          qrCodeId: id,
          title: link.title,
          url: link.url,
          position: index,
          isActive: true,
        }))
      })
    }

    // Return updated QR code
    const updatedQrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        links: {
          orderBy: { position: 'asc' }
        },
        _count: {
          select: { scans: true }
        }
      }
    })

    return NextResponse.json(updatedQrCode)
  } catch (error) {
    console.error('Error updating links:', error)
    return NextResponse.json(
      { error: 'Failed to update links' },
      { status: 500 }
    )
  }
}