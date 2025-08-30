# CLAUDE.md - Development Instructions for Claude Code

## Project Overview

This is a **Dynamic QR Code Application** built with Next.js 15 that allows users to create multiple customized QR codes with Linktree-style pages. The system includes multi-domain support, detailed analytics, and a tabs-based dashboard interface.

### Key Technologies
- **Framework**: Next.js 15.4.5 (App Router, Server Components)
- **Database**: PostgreSQL with Prisma ORM  
- **Authentication**: Supabase Auth with SSR
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel

## Project Structure

**📋 PLAN.md** - Complete project roadmap with implementation phases and feature checklists
**📚 SESSIONS.md** - Historical log of all development sessions with completed work
**🏗️ src/** - Application source code organized by features

## Session Management Protocol

This project uses a structured session management system. Every coding session is documented in SESSIONS.md.

### Starting a New Session
1. **Always start with**: "Check SESSIONS.md for the last session status and continue from there"
2. Read the last session entry in SESSIONS.md
3. Create a new session entry with clear goals
4. Reference previous session's "Next session focus"

### During a Session
- Update the session entry as you progress
- Mark goals as completed with [x]
- Document any blockers immediately
- Note key decisions made

### Ending a Session
1. Update "Completed" section
2. Define clear "Next session focus"
3. Commit all changes including SESSIONS.md
4. Run /clear if context is getting large

### Session Entry Template
Always follow the template structure in SESSIONS.md for consistency.

## Key Architecture Decisions

### Multi-Domain Architecture (IMPORTANT)
- **Dynamic Domain Resolution**: Uses `resolve-tenant.ts` to check Host headers
- **NO hardcoded domains**: Domains are managed through UI, not environment variables
- **Tenant-based**: Each client owns domains, QR codes use selected domain
- **Environment variables**: `NEXT_PUBLIC_APP_URL` is for development only
- **Production URLs**: Generated dynamically based on client's domain selection

**⚠️ NEVER modify environment for domain changes - use Domain Manager UI instead**

## Local Development Setup (IMPORTANT)

### 🛡️ Database Environment Safety

**CRITICAL**: This project uses local PostgreSQL for development to protect production data.

#### **Environment Files:**
- **`.env.local`** → Local development (current setup)
- **`.env.local.production`** → Production backup (never use for development)

#### **Database Configuration:**
```bash
# Local Development Database
DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_dev"
DIRECT_DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_dev"
```

### 🚀 Quick Start Commands

#### **Start Complete Development Environment:**
```bash
npm run dev:full    # Starts PostgreSQL + Next.js dev server
npm run verify:env  # Verify environment setup is correct
```

#### **Individual Commands:**
```bash
# PostgreSQL Management
npm run db:start    # Start PostgreSQL service
npm run db:stop     # Stop PostgreSQL service  
npm run db:status   # Check PostgreSQL status
npm run db:studio   # Open database admin interface

# Database Operations
npm run db:push     # Push schema changes
npm run db:migrate  # Run migrations
npm run db:reset    # Reset database (development only)

# Development Server
npm run dev         # Start Next.js dev server only
npm run verify:env  # Verify environment configuration
```

### 📋 Development Workflow

#### **Daily Development Startup:**
1. **Run development environment:**
   ```bash
   npm run dev:full
   ```
2. **Access application:** http://localhost:3000
3. **Access database admin:** `npx prisma studio`

#### **Database Operations:**
```bash
# View database in browser
npx prisma studio

# Apply schema changes
npx prisma db push

# Run migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset
```

#### **Backfill Scripts (After Migrations):**
```bash
npm run backfill:clients   # Create default clients
npm run backfill:projects  # Create default projects
```

### 🔄 Environment Switching

#### **Switch to Production (Debugging Only):**
```bash
cp .env.local.production .env.local
npm run dev
# ⚠️ WARNING: Now connected to production!
```

#### **Return to Development:**
```bash
git checkout .env.local  # Restore local development
npm run dev
```

### 🛠 PostgreSQL Management

#### **Installation (First Time Only):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb qr_generator_dev
```

#### **Service Management:**
```bash
brew services start postgresql@16   # Start PostgreSQL
brew services stop postgresql@16    # Stop PostgreSQL  
brew services list | grep postgres  # Check status
```

#### **Database Access:**
```bash
# Connect to development database
psql qr_generator_dev

# View tables
psql qr_generator_dev -c "\dt"
```

### 🚨 Safety Guidelines

1. **NEVER modify production database** during development
2. **Always verify** `.env.local` points to local database before starting
3. **Test migrations locally** before applying to production
4. **Use backfill scripts** after applying migrations
5. **Keep production backup** in `.env.local.production`

### 📊 Project Structure Changes (Multi-Project Support)

#### **Database Hierarchy:**
```
User → Client → Project → QRCode → Links
```

#### **New Models:**
- **Project**: Groups QR codes within a client
- **QRCode.projectId**: Optional foreign key to Project

#### **Migration Status:**
- ✅ **Local**: `20250830025022_add_project_support` applied
- 🚀 **Production**: Pending (requires testing completion)

## Development Instructions

When implementing features for this project:

### Testing Guidelines

#### **Development Testing Protocol:**
1. **DO NOT run `npm run dev` in Claude Console** - it wastes time and context
2. **Just tell the user to test locally** after making changes
3. **User will test on their browser** at http://localhost:3001 (or available port)
4. **Focus Claude time on code implementation** rather than runtime testing

#### **UI/UX Standards:**
1. **ALL buttons MUST have `cursor: pointer`** (now handled in global CSS)
2. **ALL inputs MUST have dark text color** for proper contrast (now handled in global CSS)
3. **Placeholders should be gray-500** for visibility
4. **Focus states must be accessible** with proper outline

#### **Global Styles Applied:**
```css
/* These are now automatically applied */
button { cursor: pointer; }
input, textarea, select { color: #1f2937 !important; }
input::placeholder { color: #6b7280 !important; }
```

### Code Quality
1. **Follow the phases** outlined in PLAN.md sequentially
2. **Mark checkboxes** as completed in PLAN.md
3. **Use Next.js 15 features** (App Router, Server Components, Turbopack)
4. **Implement proper error handling** and loading states
5. **Ensure accessibility** (WCAG 2.1 AA compliance)
6. **Write clean, typed code** with proper TypeScript annotations
7. **Follow established folder structure** and naming conventions
8. **Implement tests** for critical paths
9. **Optimize for Core Web Vitals**
10. **Document any deviations** from the plan

## TypeScript Safety Best Practices (2025)

### 🔐 Top 10 TypeScript Safety Tips

#### 1. **Enable Strict Mode (Required)**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedIndexedAccess": true,
    "strictFunctionTypes": true
  }
}
```

#### 2. **Use `unknown` Instead of `any`**
```typescript
// ❌ Avoid
function processData(data: any) { ... }

// ✅ Preferred
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    return data.toUpperCase();
  }
}
```

#### 3. **Implement Type Guards**
```typescript
// Type guard for safe type narrowing
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Usage with control flow analysis
if (isString(data)) {
  // TypeScript knows data is string here
  console.log(data.length);
}
```

#### 4. **Use `as const` Assertions**
```typescript
// ❌ Inferred as string[]
const colors = ['red', 'blue', 'green'];

// ✅ Inferred as readonly ['red', 'blue', 'green']
const colors = ['red', 'blue', 'green'] as const;
```

#### 5. **Leverage Template Literal Types**
```typescript
type EventName = `on${Capitalize<string>}`;
type ValidEvent = 'onClick' | 'onSubmit'; // Valid
type InvalidEvent = 'click'; // TypeScript error
```

#### 6. **Handle Catch Variables Safely**
```typescript
// With useUnknownInCatchVariables: true
try {
  riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

#### 7. **Use Mapped Types for Transformations**
```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type RequiredUser = {
  id: string;
  name: string;
  email: string;
};

type PartialUser = Optional<RequiredUser>; // All properties optional
```

#### 8. **Implement Conditional Types**
```typescript
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends number
  ? { count: T }
  : { data: T };
```

#### 9. **Use `never` Type for Exhaustive Checks**
```typescript
type Status = 'pending' | 'approved' | 'rejected';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      return 'Processing...';
    case 'approved':
      return 'Approved!';
    case 'rejected':
      return 'Rejected.';
    default:
      // TypeScript ensures this is never reached
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled status: ${exhaustiveCheck}`);
  }
}
```

#### 10. **Prefer Type Extractors Over Type Guards**
```typescript
// More maintainable than traditional type guards
type ExtractUser<T> = T extends { user: infer U } ? U : never;

// Compiler will complain if type structure changes
function extractUserData<T extends { user: unknown }>(data: T): ExtractUser<T> {
  return data.user as ExtractUser<T>;
}
```

### 🚫 Common Anti-Patterns to Avoid

- **Using `any`**: Disables all type checking
- **Type assertions without guards**: `data as User` without validation
- **Ignoring strict null checks**: Not handling `null`/`undefined`
- **Implicit returns**: Functions without explicit return types
- **Mutation of readonly types**: Using type assertions to bypass readonly
- **Using `@ts-ignore`**: Silencing legitimate type errors
- **Non-null assertion operator (`!`)**: Should be used sparingly with validation

### 🔧 Essential Compiler Options

```json
{
  "compilerOptions": {
    // Core strict options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    
    // Additional safety options  
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    
    // Code quality options
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 📋 Type Safety Checklist

- [ ] All functions have explicit return types
- [ ] No usage of `any` type (use `unknown` instead)
- [ ] All error handling uses `unknown` in catch clauses
- [ ] Type guards implemented for runtime type checking
- [ ] Strict null checks enabled and handled
- [ ] Array access protected with bounds checking
- [ ] External API responses properly typed and validated
- [ ] Form data and user inputs validated with type guards
- [ ] Database queries return properly typed results
- [ ] Event handlers have correct parameter types

### State Management Architecture
- **Current**: Manual state management with useEffect hooks
- **Next Priority**: Migrate to TanStack Query for server state
- **Problem**: State synchronization issues between components
- **Solution**: Replace router.refresh() with automatic cache invalidation

### Database Changes
- **Always use migrations** - never modify schema directly
- **Use Prisma for schema changes** and generate migrations
- **Test migrations locally** before applying to production
- **Document any breaking changes** in SESSIONS.md

### Multi-QR Support
- **Users can have up to 10 QR codes** (enforced in API)
- **Tabs interface** for switching between QR codes
- **Soft delete** strategy to preserve analytics
- **Position-based ordering** for consistent tabs

### Multi-Domain Support
- **Client/Domain models** for tenant isolation
- **Domain verification** system (Phase 2 - pending)
- **QR codes can encode custom domains**
- **Fallback to platform domain** if custom domain unavailable

## Git Commit Rules

**CRITICAL**: NEVER include the following in git commits:
- ❌ "🤖 Generated with Claude Code"
- ❌ "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ Any mention of Claude or AI assistance
- ✅ Keep commits clean and professional

## Important Instruction Reminders

- **Do what has been asked** - nothing more, nothing less
- **NEVER create files** unless absolutely necessary for the goal
- **ALWAYS prefer editing** an existing file to creating a new one
- **NEVER proactively create** documentation files (*.md) or README files
- **Only create documentation** if explicitly requested by the user

## Current Project Status

### ✅ Recently Completed (Latest Session)
- Multi-QR dashboard with tabs interface
- QR code creation, editing, deletion functionality
- State synchronization between components
- Database schema updates for multiple QR codes
- API endpoints for full CRUD operations

### 🚀 Next Session Priority

1. **TypeScript Issues Resolution** (🔥 **CRITICAL - Must Fix First**)
   - Remove `@ts-expect-error` workaround in ProjectDashboard.tsx
   - Align QRCodeData interface with Prisma QRCode model
   - Fix React Hook dependency warnings in existing components
   - Ensure type safety compliance with 2025 best practices (see TypeScript Safety section above)
   - Eliminate all type assertions and implement proper type guards

2. **TanStack Query Refactor** (High Priority - After TypeScript fixes)
   - Replace manual router.refresh() calls
   - Implement automatic cache invalidation
   - Add optimistic updates for better UX
   - Eliminate state synchronization bugs

### 📅 Future Priorities
See [PLAN.md](./PLAN.md) for complete roadmap including:
- Domain verification (Phase 2)
- Enhanced analytics dashboard
- Advanced QR features and templates
- Performance optimizations

---

**📖 For complete feature roadmap**: See [PLAN.md](./PLAN.md)
**📝 For development history**: See [SESSIONS.md](./SESSIONS.md)