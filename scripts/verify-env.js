#!/usr/bin/env node

/**
 * Environment Verification Script
 * Ensures development environment is properly configured
 */

const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  console.log('🔍 Verifying Development Environment...\n');

  // Check .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Missing .env.local file');
    process.exit(1);
  }

  // Read environment file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check database URL
  const dbUrl = envContent.match(/DATABASE_URL="(.+)"/);
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  const url = dbUrl[1];
  
  // Verify it's pointing to local database
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.log('✅ Database: Local PostgreSQL detected');
    console.log(`   URL: ${url.replace(/\/\/.*@/, '//***@')}`);
  } else if (url.includes('supabase.com')) {
    console.warn('⚠️  WARNING: Connected to Supabase (Production?)');
    console.warn('   Consider switching to local development database');
    console.warn('   Run: git checkout .env.local');
  } else {
    console.warn('⚠️  Unknown database configuration');
  }

  // Check if PostgreSQL is running
  const { execSync } = require('child_process');
  try {
    execSync('brew services list | grep postgresql@16', { stdio: 'pipe' });
    console.log('✅ PostgreSQL: Service installed');
  } catch (error) {
    console.warn('⚠️  PostgreSQL: Service not found (may not be installed)');
  }

  // Check production backup
  const prodBackupPath = path.join(process.cwd(), '.env.local.production');
  if (fs.existsSync(prodBackupPath)) {
    console.log('✅ Production backup: .env.local.production exists');
  } else {
    console.warn('⚠️  Production backup: .env.local.production missing');
  }

  console.log('\n🎉 Environment verification complete!');
  console.log('💡 Quick commands:');
  console.log('   npm run dev:full    # Start database + dev server');
  console.log('   npm run db:studio   # Open database admin');
  console.log('   npm run db:status   # Check PostgreSQL status');
}

checkEnvironment();