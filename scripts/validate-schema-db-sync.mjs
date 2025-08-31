#!/usr/bin/env node

/**
 * Validates that database schema matches Prisma schema
 * Run this before deploying to catch field mapping issues
 */

import { PrismaClient } from '@prisma/client'

async function validateSchemaSync() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Validating schema synchronization...\n')
    
    // Test critical models with their expected fields
    const testCases = [
      {
        model: 'qRCode',
        requiredFields: ['themeId', 'primaryColor', 'avatarUrl'],
        optionalFields: ['cardStyle', 'avatarStyle', 'customTitle', 'showTitle']
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`Testing ${testCase.model} model...`)
      
      try {
        // Try to query all required fields to verify they exist
        await prisma[testCase.model].findFirst({
          select: testCase.requiredFields.reduce((acc, field) => {
            acc[field] = true
            return acc
          }, { id: true })
        })
        
        console.log(`✅ Required fields working: ${testCase.requiredFields.join(', ')}`)
        
        // Test optional fields (might be missing in some environments)
        for (const field of testCase.optionalFields) {
          try {
            await prisma[testCase.model].findFirst({
              select: { id: true, [field]: true }
            })
            console.log(`✅ Optional field working: ${field}`)
          } catch (error) {
            console.log(`⚠️  Optional field missing: ${field} (${error.message.split('.')[0]})`)
          }
        }
        
      } catch (error) {
        console.error(`❌ Critical error with ${testCase.model}:`, error.message)
        process.exit(1)
      }
    }
    
    console.log('\n🎉 Schema validation completed!')
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run validation
validateSchemaSync()