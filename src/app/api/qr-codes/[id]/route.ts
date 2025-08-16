import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

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

    const resolvedParams = await params
    const { title } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const qrCode = await prisma.qRCode.update({
      where: { 
        id: resolvedParams.id,
        userId: user.id,
        deletedAt: null
      },
      data: { title: title.trim() },
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
    console.error('Error updating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to update QR code' },
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

    // Check if this is the user's last QR code
    const userQrCount = await prisma.qRCode.count({
      where: { 
        userId: user.id,
        deletedAt: null
      }
    })

    if (userQrCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete your last QR code' },
        { status: 400 }
      )
    }

    // Soft delete the QR code
    await prisma.qRCode.update({
      where: { 
        id: resolvedParams.id,
        userId: user.id,
        deletedAt: null
      },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    )
  }
}