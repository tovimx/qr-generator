import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/auth/supabase/server'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Load domain and ensure it belongs to current user's client
    let client = await prisma.client.findUnique({ where: { ownerUserId: user.id } })
    if (!client) {
      client = await prisma.client.create({ data: { ownerUserId: user.id } })
    }

    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain || domain.clientId !== client.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Set this as primary and unset others for this client
    await prisma.$transaction([
      prisma.domain.updateMany({ data: { primary: false }, where: { clientId: client.id } }),
      prisma.domain.update({ data: { primary: true }, where: { id: domain.id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('PATCH /api/domains/:id/primary error', e)
    return NextResponse.json({ error: 'Failed to set primary domain' }, { status: 500 })
  }
}

