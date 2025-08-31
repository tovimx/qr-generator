import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { APIResponse } from '@/types/api'
import { DesignSettings } from '@/types/design'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as APIResponse,
        { status: 401 }
      )
    }

    const customThemes = await prisma.customTheme.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: customThemes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        category: 'custom',
        description: theme.description || `Custom theme created ${theme.createdAt.toLocaleDateString()}`,
        isPremium: false,
        styles: {
          themeId: theme.themeId,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          backgroundType: theme.backgroundType as DesignSettings['backgroundType'],
          backgroundValue: theme.backgroundValue,
          buttonStyle: theme.buttonStyle as DesignSettings['buttonStyle'],
          cardStyle: (theme.cardStyle as DesignSettings['cardStyle']) || 'floating',
          fontFamily: theme.fontFamily,
        },
        customCss: theme.customCss,
        avatarUrl: theme.avatarUrl,
        avatarStyle: (theme.avatarStyle as 'circle' | 'banner') || 'circle',
        socialLinks: theme.socialLinks ? JSON.parse(JSON.stringify(theme.socialLinks)) : null,
        customTitle: theme.customTitle,
        showTitle: theme.showTitle,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt,
      })),
    } as APIResponse)

  } catch (error) {
    console.error('Error fetching custom themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom themes' } as APIResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as APIResponse,
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, design } = body as {
      name: string
      design: DesignSettings
    }

    if (!name || !design) {
      return NextResponse.json(
        { error: 'Name and design are required' } as APIResponse,
        { status: 400 }
      )
    }

    // Check if theme name already exists for this user
    const existingTheme = await prisma.customTheme.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: name,
        },
      },
    })

    if (existingTheme) {
      return NextResponse.json(
        { error: 'A theme with this name already exists' } as APIResponse,
        { status: 409 }
      )
    }

    const customTheme = await prisma.customTheme.create({
      data: {
        name: name,
        userId: user.id,
        themeId: design.themeId || 'custom',
        primaryColor: design.primaryColor || '#6366f1',
        secondaryColor: design.secondaryColor || '#8b5cf6',
        backgroundType: design.backgroundType || 'gradient',
        backgroundValue: design.backgroundValue,
        buttonStyle: design.buttonStyle || 'rounded',
        cardStyle: design.cardStyle || 'floating',
        fontFamily: design.fontFamily || 'inter',
        customCss: design.customCss,
        avatarUrl: design.avatarUrl,
        avatarStyle: design.avatarStyle || 'circle',
        description: design.description,
        socialLinks: design.socialLinks ? JSON.parse(JSON.stringify(design.socialLinks)) : null,
        customTitle: design.customTitle,
        showTitle: design.showTitle ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: customTheme.id,
        name: customTheme.name,
        category: 'custom',
        description: customTheme.description || `Custom theme created ${customTheme.createdAt.toLocaleDateString()}`,
        isPremium: false,
        styles: {
          themeId: customTheme.themeId,
          primaryColor: customTheme.primaryColor,
          secondaryColor: customTheme.secondaryColor,
          backgroundType: customTheme.backgroundType as DesignSettings['backgroundType'],
          backgroundValue: customTheme.backgroundValue,
          buttonStyle: customTheme.buttonStyle as DesignSettings['buttonStyle'],
          cardStyle: (customTheme.cardStyle as DesignSettings['cardStyle']) || 'floating',
          fontFamily: customTheme.fontFamily,
        },
        customCss: customTheme.customCss,
        avatarUrl: customTheme.avatarUrl,
        avatarStyle: (customTheme.avatarStyle as 'circle' | 'banner') || 'circle',
        socialLinks: customTheme.socialLinks ? JSON.parse(JSON.stringify(customTheme.socialLinks)) : null,
        customTitle: customTheme.customTitle,
        showTitle: customTheme.showTitle,
        createdAt: customTheme.createdAt,
        updatedAt: customTheme.updatedAt,
      },
    } as APIResponse)

  } catch (error) {
    console.error('Error creating custom theme:', error)
    return NextResponse.json(
      { error: 'Failed to create custom theme' } as APIResponse,
      { status: 500 }
    )
  }
}