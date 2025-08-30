# TanStack Query SSR Compatibility Issue

**Issue ID**: PROD-2025-001  
**Severity**: Critical  
**Component**: State Management / TanStack Query  
**Environment**: Production (Vercel Edge Runtime)  
**Date Identified**: 2025-08-30  

## Summary

Production deployment failure caused by Server-Side Rendering (SSR) incompatibility in TanStack Query implementation, resulting in runtime exception Digest: 4033081611.

## Root Cause Analysis

### Technical Details

**Issue**: TanStack Query client instantiation marked as client-side only but executed during server-side rendering.

**Affected Files**:
- `src/lib/query-client.ts` - Contains `'use client'` directive
- `src/providers/QueryProvider.tsx` - Client-only provider
- `src/app/layout.tsx` - Root layout wrapping entire app

**Error Sequence**:
1. Next.js attempts server-side rendering of root layout
2. Layout instantiates `QueryProvider` component
3. `QueryProvider` calls `getQueryClient()` from `query-client.ts`
4. `query-client.ts` marked with `'use client'` directive
5. Server attempts to execute client-only code → Runtime Exception

### Code Analysis

**Problematic Implementation** (commit `e499ad7`):

```typescript
// src/lib/query-client.ts
'use client' // ← This directive prevents server execution

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return createQueryClient() // ← Never executes due to 'use client'
  }
  // ...client logic
}
```

```jsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider> {/* ← Instantiated during SSR */}
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

## Impact Assessment

- **Production Downtime**: Application inaccessible due to server exceptions
- **User Experience**: Complete service disruption
- **SEO Impact**: Server-side rendering failure affects search engine indexing
- **Business Impact**: All QR code generation and management functionality offline

## Technical Solution

### Approach 1: Remove 'use client' from query-client.ts (Recommended)

Remove the `'use client'` directive from the query client utility to allow server-side execution:

```typescript
// src/lib/query-client.ts
// Remove: 'use client'

import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () => {
  return new QueryClient({
    // ... configuration
  })
}

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always create new client
    return createQueryClient()
  } else {
    // Client: reuse singleton
    return getOrCreateClient()
  }
}
```

### Approach 2: Move QueryProvider to Client Component

Alternative: Keep query-client.ts client-only and move QueryProvider instantiation to a separate client component:

```jsx
// src/components/providers/ClientQueryProvider.tsx
'use client'
export default function ClientQueryProvider({ children }) {
  // Query provider logic here
}

// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientQueryProvider>
          {children}
        </ClientQueryProvider>
      </body>
    </html>
  )
}
```

## Prevention Measures

1. **SSR Testing**: Implement automated tests for server-side rendering compatibility
2. **Code Review Guidelines**: Establish rules for `'use client'` directive usage
3. **CI/CD Checks**: Add build-time validation for SSR compatibility
4. **Documentation**: Create SSR best practices guide for team

## Resolution Status

- [x] Root cause identified
- [x] Solution designed
- [ ] Fix implemented
- [ ] Testing completed
- [ ] Production deployment verified

---

**Next Steps**: Implement Approach 1 (remove 'use client' directive) and verify SSR compatibility.