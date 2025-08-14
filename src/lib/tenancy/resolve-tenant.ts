import { headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'

export interface TenantContext {
  host: string
  domain?: {
    id: string
    hostname: string
    clientId: string
    verified: boolean
    primary: boolean
    type: string
  } | null
  clientId?: string | null
}

// Resolve tenant information based on the Host header.
// Note: Do not call from middleware (edge). Use in server components/routes.
export async function resolveTenant(): Promise<TenantContext> {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  if (!host) return { host, domain: null, clientId: null }

  const domain = await prisma.domain.findUnique({
    where: { hostname: host },
    select: {
      id: true,
      hostname: true,
      clientId: true,
      verified: true,
      primary: true,
      type: true,
    },
  })

  return { host, domain, clientId: domain?.clientId ?? null }
}

