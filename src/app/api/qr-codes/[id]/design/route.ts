import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'
import { mapQRCodeToDesignSettings, validateDesignUpdates } from '@/lib/design/fields'

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

    const { id } = await params

    // Get QR code design settings
    console.log('Fetching QR code with id:', id, 'for user:', user.id)
    
    const qrCode = await prisma.qRCode.findUnique({
      where: { 
        id,
        userId: user.id,
        deletedAt: null
      }
    })
    
    console.log('Found QR code:', qrCode ? 'yes' : 'no')
    
    if (qrCode) {
      console.log('QR code has design fields:', {
        themeId: qrCode.themeId,
        primaryColor: qrCode.primaryColor,
        secondaryColor: qrCode.secondaryColor
      })
    }

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Use centralized mapping to ensure consistency
    const designSettings = mapQRCodeToDesignSettings(qrCode)

    return NextResponse.json(designSettings)
  } catch (error) {
    console.error('Error fetching QR code design:', error)
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR code design', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const { id } = await params
    const updates = await request.json() as Record<string, unknown>
    
    console.log('PUT design request:', { id, userId: user.id, updates })

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { 
        id,
        userId: user.id,
        deletedAt: null
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Use centralized validation
    const validation = validateDesignUpdates(updates)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors.join(', ') 
        }, 
        { status: 400 }
      )
    }

    // All fields that passed validation can be updated
    const updateData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateData[key] = value
      }
    }

    console.log('Updating QR code with data:', updateData)
    
    // Update the QR code
    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: updateData
    })
    
    console.log('Successfully updated QR code')

    return NextResponse.json(updatedQrCode)
  } catch (error) {
    console.error('Error updating QR code design:', error)
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to update QR code design', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}