# Next.js Architecture Safety Framework

## 🎯 **CRITICAL MISSION: PREVENT ARCHITECTURAL VIOLATIONS**

This framework prevents fundamental Next.js architectural violations that can cause production server failures. Based on the systematic analysis of the e499ad7 cascade failure.

## 🚨 **THE FOUR FUNDAMENTAL RULES (NEVER VIOLATE)**

### **RULE 1: Server/Client Boundary Sanctity**

**❌ FORBIDDEN:**
```typescript
// lib/utility.ts
'use client'  // ← NEVER in utilities used by server components

export function serverUtility() {
  // This utility will be called during SSR
}
```

**✅ CORRECT:**
```typescript
// lib/utility.ts (no 'use client')
export function serverUtility() {
  // Safe for both server and client
}

// OR separate files:
// lib/server-utility.ts (server-only)
// lib/client-utility.ts (with 'use client')
```

### **RULE 2: Layout Component Purity**

**❌ FORBIDDEN:**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProvider>  {/* ← NEVER wrap children with client components */}
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}
```

**✅ CORRECT:**
```typescript
// app/layout.tsx (server component)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}  {/* ← Let pages manage their own providers */}
      </body>
    </html>
  )
}

// app/dashboard/page.tsx (where provider is needed)
export default function DashboardPage() {
  return (
    <ClientProvider>
      <DashboardUI />
    </ClientProvider>
  )
}
```

### **RULE 3: Provider Scoping Discipline**

**❌ FORBIDDEN:**
```typescript
// Root-level providers wrapping entire application
<QueryProvider>
  <ThemeProvider>
    <AuthProvider>
      {children} // ← All routes forced to client-side
    </AuthProvider>
  </ThemeProvider>
</QueryProvider>
```

**✅ CORRECT:**
```typescript
// Scope providers to specific features
// app/(dashboard)/layout.tsx
<QueryProvider>
  {children} // ← Only dashboard routes use queries
</QueryProvider>

// app/(public)/layout.tsx  
{children} // ← Public routes remain server-side
```

### **RULE 4: Import Boundary Awareness**

**❌ FORBIDDEN:**
```typescript
// client-component.tsx
'use client'
import { prisma } from '@/lib/db' // ← Server-only import in client
import { cookies } from 'next/headers' // ← Server-only API
```

**✅ CORRECT:**
```typescript
// client-component.tsx
'use client'
import { useQuery } from '@tanstack/react-query' // ← Client-compatible
import { clientApi } from '@/lib/api' // ← Client-side API utility
```

## 🛡️ **AUTOMATED SAFETY SYSTEM**

### **Installation (One-time setup):**

```bash
# Install Git hooks for automatic validation
./scripts/install-git-hooks.sh

# Verify installation
npm run validate:nextjs
```

### **Daily Development Commands:**

```bash
# Before making architectural changes
npm run validate:nextjs    # Architecture validation
npm run validate:all       # Complete safety check
npm run build             # Production build test

# Git hooks automatically run:
# • pre-commit: Architecture validation
# • pre-push: Full validation + build test
```

## 📋 **ARCHITECTURAL DECISION CHECKLIST**

Before making **ANY** architectural change, verify:

- [ ] **Server/Client Boundaries**: Are 'use client' directives placed correctly?
- [ ] **Provider Scoping**: Are providers scoped to specific features, not root?
- [ ] **Import Compatibility**: Do imports match their component context?
- [ ] **SSR Compatibility**: Can server components render without browser APIs?
- [ ] **Bundle Impact**: Does this change force unnecessary client-side code?

## 🔍 **VALIDATION RULES EXPLAINED**

### **Rule 1: Client Directive Validation**
- Scans `lib/` and `utils/` for `'use client'` in utilities
- Checks if server components import these utilities
- **Prevents**: SSR failures when server tries to execute client-only code

### **Rule 2: Layout Structure Validation** 
- Analyzes layout files for client component wrappers
- Detects client components wrapping `{children}`
- **Prevents**: Root-level client components forcing all routes client-side

### **Rule 3: Provider Placement Validation**
- Checks provider components for proper scoping
- Validates provider usage in layouts
- **Prevents**: Over-broad provider application

### **Rule 4: Server/Client Boundary Validation**
- Scans for server-only patterns in client components
- Validates import compatibility
- **Prevents**: Runtime errors from context mismatches

## 🚨 **EMERGENCY RECOVERY PROCEDURES**

If architectural violations cause production failures:

### **Step 1: Immediate Diagnosis**
```bash
npm run validate:nextjs  # Find architectural violations
npm run build           # Test production build
```

### **Step 2: Emergency Rollback**
```bash
git log --oneline -10   # Find last working commit
git revert <bad-commit> # Revert breaking changes
```

### **Step 3: Systematic Fix** 
1. **Identify violation** using validation output
2. **Apply systematic fix** following the four rules
3. **Test all contexts** (build, SSR, client, browser)
4. **Verify with production build** before deployment

## 📚 **NEXT.JS ARCHITECTURE PRINCIPLES**

### **Component Hierarchy:**
```
Server Components (Default)
├─ Database access ✅
├─ File system ✅  
├─ Server-only APIs ✅
├─ Zero client bundle ✅
└─ Cannot use: useState, useEffect, browser APIs

Client Components ('use client')
├─ Interactive state ✅
├─ Browser APIs ✅
├─ Event handlers ✅  
├─ Client-side routing ✅
└─ Cannot use: server-only APIs, file system
```

### **Data Flow Pattern:**
```
Server Components → Fetch data → Pass to Client Components
Client Components → Use data → Handle interactions
```

## 🎯 **SUCCESS METRICS**

**Architecture is healthy when:**
- ✅ `npm run validate:nextjs` passes with zero errors
- ✅ Production build completes without warnings
- ✅ SSR works for all routes (test with `npm run test:ssr`)
- ✅ Client-side hydration works without mismatches
- ✅ No server-only code executes in browser

## 🚀 **ADVANCED PATTERNS**

### **Safe Provider Patterns:**
```typescript
// Pattern 1: Feature-scoped providers
// app/(feature)/layout.tsx
<FeatureProvider>
  {children}
</FeatureProvider>

// Pattern 2: Page-level providers  
// app/specific-page/page.tsx
<PageProvider>
  <PageContent />
</PageProvider>

// Pattern 3: Component-level providers
<ComponentProvider>
  <SpecificComponent />
</ComponentProvider>
```

### **Safe Utility Patterns:**
```typescript
// Pattern 1: Universal utilities (no 'use client')
export function formatDate(date: Date) {
  return date.toISOString()
}

// Pattern 2: Server-only utilities
// lib/server-utils.ts
import { prisma } from './db'
export async function getServerData() {
  return await prisma.data.findMany()
}

// Pattern 3: Client-only utilities  
// lib/client-utils.ts
'use client'
export function getBrowserData() {
  return localStorage.getItem('data')
}
```

---

**🎯 MISSION**: Keep Next.js architecture violations at **ZERO** to prevent production failures.

**⚡ MOTTO**: "Respect the boundaries, respect the architecture."