#!/usr/bin/env node

/**
 * SSR Compatibility Test Script
 * Tests server-side rendering to catch issues before production deployment
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HIGH_RISK_PATTERNS = [
  {
    pattern: /'use client'/,
    files: ['src/lib/**/*.ts', 'src/utils/**/*.ts'],
    description: "'use client' in utility files (SSR incompatible)"
  },
  {
    pattern: /QueryClientProvider|QueryClient/,
    files: ['src/app/layout.tsx'],
    description: "Query client setup in root layout"
  },
  {
    pattern: /getQueryClient\(\)/,
    files: ['src/**/*.tsx'],
    description: "Query client usage in components"
  }
];

async function testSSRCompatibility() {
  console.log('🧪 Running SSR Compatibility Tests...\n');
  
  // 1. Check for high-risk patterns
  console.log('1. Scanning for high-risk patterns...');
  const risks = await scanHighRiskPatterns();
  
  if (risks.length > 0) {
    console.log('⚠️  HIGH-RISK PATTERNS DETECTED:');
    risks.forEach(risk => {
      console.log(`   ❌ ${risk.file}: ${risk.description}`);
    });
    console.log('');
  }
  
  // 2. Test build process
  console.log('2. Testing production build...');
  const buildSuccess = await testBuild();
  
  if (!buildSuccess) {
    console.log('❌ Build failed - SSR compatibility issue detected');
    process.exit(1);
  }
  
  // 3. Test static generation (catches SSR issues)
  console.log('3. Testing static generation...');
  const staticGenSuccess = await testStaticGeneration();
  
  if (!staticGenSuccess) {
    console.log('❌ Static generation failed - SSR issue detected');
    process.exit(1);
  }
  
  console.log('✅ All SSR compatibility tests passed!\n');
}

async function scanHighRiskPatterns() {
  const risks = [];
  const glob = require('glob');
  
  for (const riskPattern of HIGH_RISK_PATTERNS) {
    for (const filePattern of riskPattern.files) {
      const files = glob.sync(filePattern);
      
      for (const file of files) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (riskPattern.pattern.test(content)) {
            risks.push({
              file,
              description: riskPattern.description
            });
          }
        }
      }
    }
  }
  
  return risks;
}

async function testBuild() {
  return new Promise((resolve) => {
    const build = spawn('npm', ['run', 'build'], { stdio: 'pipe' });
    
    let output = '';
    build.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    build.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    build.on('close', (code) => {
      if (code === 0 && output.includes('✓ Compiled successfully')) {
        console.log('   ✅ Build successful');
        resolve(true);
      } else {
        console.log('   ❌ Build failed');
        console.log('   Output:', output.slice(-200));
        resolve(false);
      }
    });
  });
}

async function testStaticGeneration() {
  // Check if build output contains successful static generation
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('   ❌ No build output found');
    return false;
  }
  
  // Check for static pages generation
  const staticDir = path.join(buildDir, 'server', 'pages');
  if (fs.existsSync(staticDir)) {
    console.log('   ✅ Static generation successful');
    return true;
  }
  
  // For App Router, check different structure
  const appDir = path.join(buildDir, 'server', 'app');
  if (fs.existsSync(appDir)) {
    console.log('   ✅ App Router static generation successful');
    return true;
  }
  
  console.log('   ❌ Static generation structure not found');
  return false;
}

// Run if called directly
if (require.main === module) {
  testSSRCompatibility().catch(error => {
    console.error('❌ SSR test failed:', error);
    process.exit(1);
  });
}

module.exports = { testSSRCompatibility, scanHighRiskPatterns };