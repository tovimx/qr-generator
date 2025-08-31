#!/usr/bin/env node

/**
 * Next.js Architecture Validation Script
 * Prevents fundamental architectural violations that can cause SSR failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Next.js Architecture Validation Starting...\n');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const errors = [];
const warnings = [];

/**
 * RULE 1: Detect 'use client' in utilities used by Server Components
 */
function validateClientDirectiveUsage() {
  console.log(`${colors.blue}📋 RULE 1: Validating 'use client' directive usage${colors.reset}`);
  
  const libFiles = [];
  const utilFiles = [];
  
  // Find all files in lib/ and utils/ directories
  function findUtilityFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findUtilityFiles(filePath, fileList);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }
  
  findUtilityFiles('./src/lib', libFiles);
  findUtilityFiles('./src/utils', utilFiles);
  
  const utilityFiles = [...libFiles, ...utilFiles];
  
  utilityFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.trim().includes("'use client'") || line.trim().includes('"use client"')) {
          // Check if this file is imported by server components
          const fileName = path.basename(filePath, path.extname(filePath));
          const importPattern = new RegExp(`from.*['"].*${fileName}['"]`, 'g');
          
          // Check app directory for server component imports
          const serverComponents = findUtilityFiles('./src/app');
          let isImportedByServer = false;
          
          serverComponents.forEach(serverFile => {
            if (fs.existsSync(serverFile) && serverFile !== filePath) {
              const serverContent = fs.readFileSync(serverFile, 'utf8');
              if (!serverContent.includes("'use client'") && 
                  !serverContent.includes('"use client"') &&
                  importPattern.test(serverContent)) {
                isImportedByServer = true;
              }
            }
          });
          
          if (isImportedByServer) {
            errors.push(`🚨 CRITICAL: ${filePath}:${index + 1} has 'use client' but is imported by server components`);
          } else {
            console.log(`  ✅ ${filePath} has 'use client' (client-only utility)`);
          }
        }
      });
    }
  });
}

/**
 * RULE 2: Detect Client Components wrapping Server Components in layouts
 */
function validateLayoutComponentStructure() {
  console.log(`\n${colors.blue}📋 RULE 2: Validating layout component structure${colors.reset}`);
  
  const layoutFiles = [
    './src/app/layout.tsx',
    './src/app/(auth)/layout.tsx', 
    './src/app/(public)/layout.tsx'
  ];
  
  layoutFiles.forEach(layoutPath => {
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      // Check if layout has 'use client' directive
      if (content.includes("'use client'") || content.includes('"use client"')) {
        errors.push(`🚨 CRITICAL: ${layoutPath} should NOT have 'use client' - layouts must be server components`);
        return;
      }
      
      // Check for client component imports that wrap {children}
      const lines = content.split('\n');
      const clientComponentImports = [];
      
      lines.forEach(line => {
        // Find imports from components directories
        const importMatch = line.match(/import.*from.*['"](.*(components|providers).*)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          const resolvedPath = path.resolve('./src', importPath + '.tsx');
          
          if (fs.existsSync(resolvedPath)) {
            const componentContent = fs.readFileSync(resolvedPath, 'utf8');
            if (componentContent.includes("'use client'") || componentContent.includes('"use client"')) {
              const componentName = path.basename(importPath);
              clientComponentImports.push(componentName);
            }
          }
        }
      });
      
      // Check if any client components wrap {children}
      clientComponentImports.forEach(componentName => {
        const wrappingPattern = new RegExp(`<${componentName}[^>]*>.*\{children\}.*<\/${componentName}>`, 's');
        if (wrappingPattern.test(content)) {
          errors.push(`🚨 CRITICAL: ${layoutPath} wraps {children} with client component <${componentName}> - this breaks SSR`);
        } else {
          console.log(`  ✅ ${layoutPath} properly uses client component <${componentName}>`);
        }
      });
      
      if (clientComponentImports.length === 0) {
        console.log(`  ✅ ${layoutPath} contains only server components`);
      }
    }
  });
}

/**
 * RULE 3: Validate Provider Component Placement  
 */
function validateProviderPlacement() {
  console.log(`\n${colors.blue}📋 RULE 3: Validating provider component placement${colors.reset}`);
  
  const providerFiles = [];
  findUtilityFiles('./src/providers', providerFiles);
  
  providerFiles.forEach(providerPath => {
    if (fs.existsSync(providerPath)) {
      const content = fs.readFileSync(providerPath, 'utf8');
      
      // Providers should have 'use client'
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        warnings.push(`⚠️  ${providerPath} should have 'use client' directive - providers are typically client components`);
      }
      
      // Check if provider is used in root layout
      const layoutPath = './src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        const providerName = path.basename(providerPath, path.extname(providerPath));
        
        if (layoutContent.includes(providerName) && 
            layoutContent.includes('{children}') &&
            layoutContent.includes(`<${providerName}`)) {
          errors.push(`🚨 CRITICAL: ${providerName} wraps entire app in root layout - should be scoped to specific pages`);
        } else {
          console.log(`  ✅ ${providerName} is properly scoped`);
        }
      }
    }
  });
  
  function findUtilityFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findUtilityFiles(filePath, fileList);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }
}

/**
 * RULE 4: Check for Server-Only Code in Client Components
 */
function validateServerClientBoundaries() {
  console.log(`\n${colors.blue}📋 RULE 4: Validating server/client boundaries${colors.reset}`);
  
  const allFiles = [];
  findUtilityFiles('./src', allFiles);
  
  allFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
      
      if (isClientComponent) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          // Check for server-only patterns in client components
          const serverOnlyPatterns = [
            'await prisma\\.',
            'import.*prisma',
            'createClient.*server',
            'process\\.env\\.[A-Z_]+[^P]', // Not NEXT_PUBLIC_
            'fs\\.',
            'path\\.',
            'require\\(',
            'import.*fs',
            'import.*path'
          ];
          
          serverOnlyPatterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'g');
            if (regex.test(line) && !line.includes('//') && !line.includes('/*')) {
              warnings.push(`⚠️  ${filePath}:${index + 1} uses server-only pattern "${line.trim()}" in client component`);
            }
          });
        });
      }
    }
  });
  
  function findUtilityFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findUtilityFiles(filePath, fileList);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }
}

// Run all validation rules
validateClientDirectiveUsage();
validateLayoutComponentStructure();
validateProviderPlacement();
validateServerClientBoundaries();

// Report results
console.log(`\n${colors.blue}📊 VALIDATION RESULTS${colors.reset}`);
console.log(`${colors.green}✅ Checks completed${colors.reset}`);

if (errors.length > 0) {
  console.log(`\n${colors.red}🚨 CRITICAL ERRORS (${errors.length}):${colors.reset}`);
  errors.forEach(error => console.log(`  ${error}`));
}

if (warnings.length > 0) {
  console.log(`\n${colors.yellow}⚠️  WARNINGS (${warnings.length}):${colors.reset}`);
  warnings.forEach(warning => console.log(`  ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`\n${colors.green}🎉 All Next.js architectural rules validated successfully!${colors.reset}`);
} else if (errors.length === 0) {
  console.log(`\n${colors.green}✅ No critical errors found${colors.reset}`);
}

// Exit with error code if critical issues found
process.exit(errors.length > 0 ? 1 : 0);