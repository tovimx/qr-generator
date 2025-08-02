# GitHub Actions CI/CD Setup

This repository includes comprehensive GitHub Actions workflows for automated testing, building, and deployment.

## Workflows Overview

### 🔄 CI/CD Pipeline (`ci.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests to `main`

**What it does**:
- ✅ Tests on Node.js 20.x and 22.x
- ✅ Installs dependencies and generates Prisma Client
- ✅ Runs ESLint and TypeScript checks
- ✅ Builds the application with mock environment variables
- ✅ Runs full Playwright test suite
- ✅ Security audit with `npm audit`
- ✅ Uploads test artifacts on failure

### 🚀 Production Deploy (`deploy.yml`)
**Triggers**: After successful CI on `main` branch

**What it does**:
- ✅ Validates production build
- ✅ Deploys to Vercel (requires secrets setup)
- ✅ Updates commit status with deployment results
- ✅ Notifies on deployment success/failure

### 🔍 PR Quality Checks (`pr-checks.yml`)
**Triggers**: Pull Requests to `main`/`develop`

**What it does**:
- ✅ Validates commit message format (conventional commits)
- ✅ Scans for potential secrets in code
- ✅ Runs lint checks on changed files only
- ✅ Analyzes bundle size impact
- ✅ Runs accessibility tests
- ✅ Comments PR with quality check results

## Required GitHub Secrets

For full functionality, add these secrets to your repository:

### Vercel Deployment Secrets
```
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
```

### Database Secrets (for integration tests)
```
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/test
TEST_SUPABASE_URL=https://test.supabase.co
TEST_SUPABASE_ANON_KEY=test-anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
```

## How to Get Vercel Secrets

1. **VERCEL_TOKEN**: 
   - Go to Vercel Dashboard → Settings → Tokens
   - Create new token with appropriate scope

2. **ORG_ID & PROJECT_ID**:
   - Run `npx vercel` in your project
   - Check `.vercel/project.json` for the IDs

## Commit Message Format

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

**Examples**:
- `feat: add QR code customization`
- `fix: resolve Prisma client generation issue`
- `docs: update deployment instructions`
- `test: add authentication flow tests`

## Branch Protection Rules

Recommended branch protection for `main`:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Require pull request reviews (1 reviewer minimum)
- ✅ Dismiss stale reviews when new commits are pushed

## Workflow Status Badges

Add these to your main README.md:

```markdown
![CI/CD Pipeline](https://github.com/tovimx/qr-generator/workflows/CI%2FCD%20Pipeline/badge.svg)
![Deploy to Production](https://github.com/tovimx/qr-generator/workflows/Deploy%20to%20Production/badge.svg)
![PR Quality Checks](https://github.com/tovimx/qr-generator/workflows/PR%20Quality%20Checks/badge.svg)
```

## Benefits

✅ **Catch build errors before deployment**
✅ **Automated testing on every PR**
✅ **Security scanning for secrets and vulnerabilities**
✅ **Consistent code quality enforcement**
✅ **Automated Vercel deployments**
✅ **Cross-platform testing (Node.js versions)**
✅ **Bundle size monitoring**
✅ **Accessibility validation**

## Troubleshooting

### Build Failures
- Check environment variables are properly mocked
- Ensure Prisma Client generation is working
- Verify all dependencies are correctly installed

### Test Failures
- Review Playwright test artifacts in Actions
- Check if tests are compatible with CI environment
- Verify mock data and environment setup

### Deployment Issues
- Verify Vercel secrets are correctly set
- Check Vercel project configuration
- Ensure environment variables are set in Vercel dashboard