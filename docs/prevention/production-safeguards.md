# Production Change Prevention Safeguards

## Automated Detection Systems

### 1. SSR Compatibility Testing
```bash
# Add to package.json scripts
"test:ssr": "next build && node scripts/test-ssr.js"
"test:production": "npm run build && npm run test:ssr"
```

### 2. Pre-commit Hooks (Husky + Lint-staged)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:ssr"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "npm run checkerrors",
      "npm run test:production"
    ]
  }
}
```

### 3. High-Risk File Monitoring
Files that require extra validation:
- `src/app/layout.tsx` - Root layout changes
- `src/lib/query-client.ts` - Query setup
- `src/providers/**` - Provider components
- `src/middleware.ts` - Edge runtime code

## CI/CD Pipeline Enhancements

### 1. Deployment Gates
```yaml
# .github/workflows/production-safety.yml
name: Production Safety Checks
on: [push]
jobs:
  ssr-compatibility:
    runs-on: ubuntu-latest
    steps:
      - name: Build & Test SSR
        run: |
          npm run build
          npm run test:ssr
          npm run test:production-simulation
```

### 2. Staging Environment Testing
- Deploy to staging first
- Run SSR compatibility tests
- Require manual approval for production

## Claude Code Guidelines

### 1. High-Risk Change Detection
Claude Code should flag these patterns:
- Adding `'use client'` to utility files
- Modifying root layout.tsx
- Changing provider setup
- Adding new dependencies to core files

### 2. Mandatory Testing for Architectural Changes
When detecting patterns like:
```typescript
// HIGH RISK: Adding client directive to utilities
'use client'
export const utilityFunction = () => {}

// HIGH RISK: Root layout provider changes  
<NewProvider>
  {children}
</NewProvider>
```

Claude Code should:
1. STOP implementation
2. Warn about production risks
3. Require explicit user confirmation
4. Run comprehensive tests before proceeding

### 3. Production Change Checklist
Before architectural changes:
- [ ] SSR compatibility verified
- [ ] Edge runtime compatibility checked  
- [ ] Build process tested
- [ ] Staging deployment successful
- [ ] User explicitly approved high-risk changes