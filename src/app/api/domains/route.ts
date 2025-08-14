import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure client exists for this user
    let client = await prisma.client.findUnique({ where: { ownerUserId: user.id } })
    if (!client) {
      client = await prisma.client.create({ data: { ownerUserId: user.id } })
    }

    const domains = await prisma.domain.findMany({
      where: { clientId: client.id },
      orderBy: [{ primary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ domains })
  } catch (e) {
    console.error('GET /api/domains error', e)
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const rawHostname: string | undefined = body?.hostname
    const type: string = body?.type || 'custom'

    if (!rawHostname || typeof rawHostname !== 'string') {
      return NextResponse.json({ error: 'hostname is required' }, { status: 400 })
    }

    // Normalize hostname: lower-case, strip protocol and trailing slash
    const hostname = rawHostname
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')

    if (!hostname || hostname.includes('/') || hostname.includes(' ')) {
      return NextResponse.json({ error: 'Invalid hostname' }, { status: 400 })
    }

    // Ensure client exists
    let client = await prisma.client.findUnique({ where: { ownerUserId: user.id } })
    if (!client) {
      client = await prisma.client.create({ data: { ownerUserId: user.id } })
    }

    // If this is the first domain for client, mark as primary
    const existingCount = await prisma.domain.count({ where: { clientId: client.id } })

    const domain = await prisma.domain.create({
      data: {
        clientId: client.id,
        hostname,
        type,
        verified: false,
        primary: existingCount === 0,
      },
    })

    return NextResponse.json({ domain })
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Hostname already in use' }, { status: 409 })
    }
    console.error('POST /api/domains error', e)
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
  }
}
