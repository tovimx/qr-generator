/**
 * Backfill script for Project support
 * 
 * This script creates a default project for each existing client
 * and assigns all existing QR codes to these default projects.
 * 
 * SAFETY: Run this immediately after the add_project_support migration
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function backfillProjects() {
  console.log('🚀 Starting Project backfill...')

  try {
    // Get all clients
    const clients = await prisma.client.findMany({
      include: {
        projects: true,
        qrCodes: {
          where: { projectId: null }
        }
      }
    })

    console.log(`Found ${clients.length} clients to process`)

    for (const client of clients) {
      console.log(`\n📂 Processing client ${client.id}`)

      // Check if client already has a default project
      let defaultProject = client.projects.find(p => p.isDefault)

      if (!defaultProject) {
        // Create default project
        defaultProject = await prisma.project.create({
          data: {
            clientId: client.id,
            name: 'Default Project',
            isDefault: true
          }
        })
        console.log(`  ✅ Created default project: ${defaultProject.id}`)
      } else {
        console.log(`  ♻️ Default project already exists: ${defaultProject.id}`)
      }

      // Assign orphaned QR codes to default project
      const orphanedQRCodes = client.qrCodes.filter(qr => !qr.projectId)
      if (orphanedQRCodes.length > 0) {
        await prisma.qRCode.updateMany({
          where: {
            clientId: client.id,
            projectId: null
          },
          data: {
            projectId: defaultProject.id
          }
        })
        console.log(`  📱 Assigned ${orphanedQRCodes.length} QR codes to default project`)
      } else {
        console.log(`  📱 No orphaned QR codes found`)
      }
    }

    // Verify backfill
    const orphanedQRCount = await prisma.qRCode.count({
      where: { projectId: null }
    })

    console.log(`\n✅ Backfill complete!`)
    console.log(`📊 Summary:`)
    console.log(`  - Processed ${clients.length} clients`)
    console.log(`  - Remaining orphaned QR codes: ${orphanedQRCount}`)

    if (orphanedQRCount > 0) {
      console.warn(`⚠️ WARNING: ${orphanedQRCount} QR codes still have no project!`)
    }

  } catch (error) {
    console.error('❌ Backfill failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run backfill
backfillProjects()
  .then(() => {
    console.log('🎉 Backfill completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Backfill failed:', error)
    process.exit(1)
  })