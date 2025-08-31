import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { APIResponse } from '@/types/api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as APIResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' } as APIResponse,
        { status: 400 }
      )
    }

    // Verify the theme exists and belongs to the user
    const customTheme = await prisma.customTheme.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!customTheme) {
      return NextResponse.json(
        { error: 'Theme not found or does not belong to you' } as APIResponse,
        { status: 404 }
      )
    }

    await prisma.customTheme.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Custom theme deleted successfully',
    } as APIResponse)

  } catch (error) {
    console.error('Error deleting custom theme:', error)
    return NextResponse.json(
      { error: 'Failed to delete custom theme' } as APIResponse,
      { status: 500 }
    )
  }
}