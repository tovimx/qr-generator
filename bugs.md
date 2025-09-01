# Known Issues and Bugs

## Critical Issues

### GitHub Actions Failing - PR #5 (2025-09-01)

**Status**: Active
**Severity**: High
**Impact**: All PR checks failing, Vercel deployments skipped

#### Issue Description
All GitHub Actions workflows are consistently failing on the `e2e-testing` branch, causing:
- PR #5 unable to merge due to failing checks
- Vercel deployments being skipped via `vercel-ignore.sh`
- CI/CD pipeline completely broken

#### Root Cause Analysis
**Primary Issue**: Playwright webServer timeout
```
Error: Timed out waiting 60000ms from config.webServer.
```

The Playwright test suite tries to start a Next.js development server but fails within the 60-second timeout because:

1. **Missing Environment Variables**: CI environment lacks required database and Supabase credentials
2. **Database Unavailability**: No PostgreSQL instance available in GitHub Actions runners  
3. **Configuration Issues**: `npm run dev` command fails to start properly in CI environment

#### Affected Workflows
- ❌ **Simple E2E Tests**: Timeout starting webServer
- ❌ **CI/CD Pipeline**: Dependent on working tests
- ❌ **PR Quality Checks**: Permission errors (secondary issue)
- ❌ **Vercel Deployment Control**: Skipped due to failing checks

#### Investigation Details
- **Playwright Config**: Uses `webServer` with 60s timeout on `http://localhost:3004`
- **Dev Command**: `next dev --turbopack` requires database connection
- **Environment**: Missing `DATABASE_URL`, Supabase keys in CI
- **Logs**: Available at https://github.com/tovimx/qr-generator/actions

#### Potential Solutions

**Option 1: Fix CI Environment** (Recommended)
- [ ] Add required environment variables to GitHub Actions secrets
- [ ] Set up test database service (PostgreSQL container)
- [ ] Configure mock/test Supabase environment
- [ ] Update workflow to use test environment variables

**Option 2: Modify Test Strategy**
- [ ] Skip webServer startup in CI environment
- [ ] Use different Playwright configuration for CI
- [ ] Implement headless/mock testing approach
- [ ] Separate unit tests from E2E tests

**Option 3: Infrastructure Changes**
- [ ] Move E2E tests to dedicated workflow with proper setup
- [ ] Use GitHub Actions services for database
- [ ] Implement Docker-based testing environment

#### Secondary Issues
- GitHub Actions permission errors when commenting on PRs
- TypeScript version conflicts (warnings, not blocking)
- ESLint peer dependency warnings (non-critical)

#### Timeline
- **Discovered**: 2025-09-01
- **First Failure**: Multiple runs failing consistently
- **Impact Duration**: Ongoing since branch creation

#### Next Steps
1. Choose solution approach based on project priorities
2. Implement environment variable management
3. Test fix in CI environment
4. Update documentation for future developers

---

*Last Updated: 2025-09-01*
*Reporter: Analysis via GitHub MCP tools*