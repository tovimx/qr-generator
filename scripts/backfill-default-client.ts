import { prisma } from '../src/lib/db/prisma'

function normalizeHost(url: string | undefined | null): string {
  const raw = (url || '').trim()
  if (!raw) return 'localhost:3000'
  try {
    const u = new URL(raw)
    return u.host
  } catch {
    return raw.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'localhost:3000'
  }
}

async function main() {
  const platformHost = normalizeHost(process.env.NEXT_PUBLIC_APP_URL)
  console.log(`Using platform host: ${platformHost}`)

  const users = await prisma.user.findMany({ select: { id: true } })
  console.log(`Found ${users.length} users`)

  for (const user of users) {
    // Ensure client
    let client = await prisma.client.findUnique({ where: { ownerUserId: user.id } })
    if (!client) {
      client = await prisma.client.create({ data: { ownerUserId: user.id } })
      console.log(`Created client for user ${user.id}`)
    }

    // Ensure a primary platform domain exists
    const existingDomains = await prisma.domain.findMany({ where: { clientId: client.id } })
    let primary = existingDomains.find(d => d.primary)
    if (!primary) {
      primary = await prisma.domain.upsert({
        where: { hostname: platformHost },
        update: { clientId: client.id, type: 'platform', verified: true, primary: true },
        create: { clientId: client.id, hostname: platformHost, type: 'platform', verified: true, primary: true },
      })
      console.log(`Ensured primary platform domain for client ${client.id}`)
    }

    // Backfill QR codes
    const qrs = await prisma.qRCode.findMany({ where: { userId: user.id } })
    for (const qr of qrs) {
      const update: { clientId?: string | null; domainId?: string | null } = {}
      if (!qr.clientId) update.clientId = client.id
      if (!qr.domainId) update.domainId = primary.id
      if (Object.keys(update).length > 0) {
        await prisma.qRCode.update({ where: { id: qr.id }, data: update })
        console.log(`Backfilled QR ${qr.id}`)
      }
    }
  }

  console.log('Backfill complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
