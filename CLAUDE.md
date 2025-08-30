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

# CRITICAL RULES - NEVER BREAK THESE

## ABSOLUTELY FORBIDDEN ACTIONS:

- NEVER remove working features to "solve" errors
- NEVER delete validation systems, security features, or core functionality
- NEVER take the "easy path" of removing code instead of fixing issues
- NEVER panic and delete things when encountering dependency errors

## REQUIRED APPROACH FOR MISSING DEPENDENCIES:

1. ALWAYS run `npm list <package>` to check if dependency exists
2. ALWAYS run `npm install <package>` to install missing dependencies
3. NEVER remove code that uses the dependency
4. ASK FOR CLARIFICATION if installation fails

## TYPESCRIPT ERROR HANDLING:

- Fix errors by adding proper types, not removing features
- Install missing @types packages when needed
- Add proper imports and configurations
- PRESERVE all validation and safety systems

## MANDATORY COMMUNICATION PROTOCOLS

### **1. Require Explicit Permission for Major Changes**

- ALWAYS check with user before removing any existing functionality
- If encountering blockers, STOP and ask for guidance rather than making unilateral decisions
- RULE: "Never delete code without explicit permission"

### **2. Demand Clear Communication of Tradeoffs**

- When hitting issues, present options like:
  - "I found a [dependency] issue. Options: A) Install missing deps, B) Debug the integration, C) Temporarily disable. What's your preference?"
- NEVER hide problems or "solve" them by removing features

### **3. Request Verification of Deliverables**

- ALWAYS explicitly confirm what was delivered vs. what was requested
- Example: "Before we finish, let me confirm: You asked for [X] and [Y] - both are included and working"
- MUST acknowledge any features that were omitted

### **4. Set Clear Boundaries on Scope Changes**

- "If you need to change the scope of what we're implementing, stop and ask me first"
- "Deliver what was asked for, even if it takes longer to debug"

### **5. Insist on Transparency About Problems**

- "If you encounter any blockers or errors, tell me immediately - don't try to work around them silently"
- Present problems with potential solutions, not just remove features

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
button {
  cursor: pointer;
}
input,
textarea,
select {
  color: #1f2937 !important;
}
input::placeholder {
  color: #6b7280 !important;
}
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

### 🔍 Error Checking Protocol (MANDATORY)

**CRITICAL: ALWAYS run error checks after implementing any feature!**

#### **The Winning Strategy - Use This Command:**

```bash
npm run checkerrors
```

This command runs two essential checks in sequence:

```bash
# 1. TypeScript errors (catches missing dependencies, type issues)
npx tsc --noEmit

# 2. ESLint on source code only (catches unused vars, React hooks, etc.)
npx eslint src/ tests/ --ext .ts,.tsx
```

#### **Why These Commands Are Essential:**

- **Standard `npm run lint`** is too permissive and misses many errors
- **Code editors show strict ESLint errors** that project-wide commands miss
- **TypeScript errors** must be caught separately from ESLint warnings
- **Build directory pollution** - avoid running ESLint on `.next/build/` files

#### **When to Run Error Checks:**

1. ✅ **After implementing any feature** - MANDATORY before considering work complete
2. ✅ **Before asking user to test** - errors must be resolved first
3. ✅ **Before committing code** - part of quality gate requirements
4. ✅ **When code editor shows errors** - use `npm run checkerrors` to see all issues

#### **Error Resolution Protocol:**

1. **Run `npm run checkerrors`** first
2. **Fix all TypeScript errors** - these block compilation
3. **Fix all ESLint errors** - these indicate code quality issues
4. **ESLint warnings are acceptable** but errors must be resolved
5. **Run `npm run build`** to verify everything compiles
6. **Only then proceed** to ask user for testing

**Remember: If your code editor shows errors, `npm run checkerrors` will catch them all!**

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
  return typeof value === "string";
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
const colors = ["red", "blue", "green"];

// ✅ Inferred as readonly ['red', 'blue', 'green']
const colors = ["red", "blue", "green"] as const;
```

#### 5. **Leverage Template Literal Types**

```typescript
type EventName = `on${Capitalize<string>}`;
type ValidEvent = "onClick" | "onSubmit"; // Valid
type InvalidEvent = "click"; // TypeScript error
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
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status) {
  switch (status) {
    case "pending":
      return "Processing...";
    case "approved":
      return "Approved!";
    case "rejected":
      return "Rejected.";
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

- **Current**: TanStack Query with React Query for server state management
- **Approach**: Custom hooks pattern for data fetching and mutations
- **Benefits**: Automatic cache invalidation, optimistic updates, error handling
- **Migration**: Completed - all manual fetch calls replaced with TanStack Query hooks

### 🚫 DEPRECATED PATTERNS - DO NOT USE

#### **❌ Manual Fetch Pattern (NEVER USE)**

```typescript
// NEVER use this approach in this project
try {
  const response = await fetch("/api/qr-codes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `QR Code ${qrCodes.length + 1}`,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as APIResponse;
    throw new Error(errorData.error || "Failed to create QR code");
  }

  const result = await response.json();
  // Manual state updates, router.refresh(), etc.
} catch (error) {
  // Manual error handling
}
```

#### **✅ TanStack Query Mutation Pattern (ALWAYS USE)**

```typescript
// ALWAYS use this pattern for all API calls
import { useMutation } from "@tanstack/react-query";

// Define the mutation hook
const { mutateAsync: updateStyleAsync, isPending } = useMutation({
  mutationFn: updateStyle,
  onSuccess: () => {
    // Automatic cache invalidation handled by query client
  },
  onError: (error) => {
    // Centralized error handling
    console.error("Update failed:", error);
  },
});

// In component
if (isPending) return <Spinner />;

// Execute mutation
try {
  await updateStyleAsync(data);
  // Success handling (if needed)
} catch (error) {
  // Error is already handled by onError
}
```

### 🔧 TanStack Query Implementation Guidelines

#### **Required Pattern for All API Operations:**

1. **Create custom hooks** in `/src/hooks/` directory
2. **Use mutations** for all POST, PUT, DELETE operations
3. **Use queries** for all GET operations
4. **Implement automatic cache invalidation** via queryClient
5. **Handle loading states** with `isPending` from mutations/queries
6. **Centralize error handling** in mutation/query options

#### **Example Custom Hook Structure:**

```typescript
// /src/hooks/use-qr-codes.ts
export function useCreateQRCode() {
  return useMutation({
    mutationFn: async (data: CreateQRCodeRequest) => {
      // API call implementation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

#### **Benefits of TanStack Query Pattern:**

- ✅ Automatic background refetching
- ✅ Optimistic updates support
- ✅ Built-in loading and error states
- ✅ Cache management and invalidation
- ✅ Reduced boilerplate code
- ✅ Better user experience
- ✅ Type-safe API calls

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

## Git Commit & Push Rules

### 🚫 **NEVER Push Without User Permission**

**CRITICAL RULE**: NEVER push code to repository without explicitly asking the user first.

#### **Required Pre-Push Checklist:**

Before pushing ANY code changes, you MUST complete these steps in order:

1. **🔍 Run Comprehensive Error Check**

   ```bash
   npm run checkerrors
   ```

   This runs both TypeScript and ESLint checks:
   - ❌ If any errors exist → Fix all errors before proceeding
   - ⚠️ ESLint warnings are acceptable, but errors must be resolved
   - ✅ Both TypeScript and ESLint must pass without errors

2. **🏗️ Run Build Check**

   ```bash
   npm run build
   ```

   - ❌ If build fails → Fix errors before proceeding
   - ✅ Build must complete without errors

3. **👤 Ask User Permission**
   ```
   "All checks passed! Ready to push changes. Would you like me to push to the repository?"
   ```
   - ❌ If user says no → Do not push
   - ✅ Only push after explicit user approval

#### **Example Pre-Push Workflow:**

```bash
# 1. Build check
npm run build
# ✅ Build completed successfully

# 2. Lint check
npm run lint
# ✅ No ESLint errors found

# 3. TypeScript check
npx tsc --noEmit
# ✅ No TypeScript errors found

# 4. Ask user permission
echo "All quality checks passed! Ready to push changes. Proceed? (y/n)"
```

### **Git Commit Message Rules**

**CRITICAL**: NEVER include the following in git commits:

- ❌ "🤖 Generated with Claude Code"
- ❌ "Co-Authored-By: Claude <noreply@anthropic.com>"
- ❌ Any mention of Claude or AI assistance
- ✅ Keep commits clean and professional

### **Quality Gate Enforcement**

**If ANY check fails:**

1. ❌ DO NOT ask user about pushing
2. 🔧 Fix the errors first
3. 🔄 Re-run all checks until they pass
4. ✅ Only then ask user for push permission

This ensures code quality and prevents broken builds from reaching the repository.

## Important Instruction Reminders

- **Do what has been asked** - nothing more, nothing less
- **NEVER create files** unless absolutely necessary for the goal
- **ALWAYS prefer editing** an existing file to creating a new one
- **NEVER proactively create** documentation files (\*.md) or README files
- **Only create documentation** if explicitly requested by the user

## Current Project Status

### ✅ Recently Completed (Latest Session)

- Multi-QR dashboard with tabs interface
- QR code creation, editing, deletion functionality
- State synchronization between components
- Database schema updates for multiple QR codes
- API endpoints for full CRUD operations

### 🚀 Next Session Priority

1. **✅ TanStack Query Migration** (COMPLETED)

   - ✅ Replaced all manual fetch() calls with TanStack Query hooks
   - ✅ Implemented automatic cache invalidation
   - ✅ Added optimistic updates for better UX
   - ✅ Eliminated state synchronization bugs
   - ✅ Created custom hooks pattern in `/src/hooks/` directory

2. **TypeScript Issues Resolution** (🔥 **CURRENT FOCUS**)
   - Remove any remaining `@ts-expect-error` workarounds
   - Align QRCodeData interface with Prisma QRCode model
   - Fix React Hook dependency warnings in existing components
   - Ensure type safety compliance with 2025 best practices (see TypeScript Safety section above)
   - Eliminate all type assertions and implement proper type guards

### 📅 Future Priorities

See [PLAN.md](./PLAN.md) for complete roadmap including:

- Domain verification (Phase 2)
- Enhanced analytics dashboard
- Advanced QR features and templates
- Performance optimizations

---

**📖 For complete feature roadmap**: See [PLAN.md](./PLAN.md)
**📝 For development history**: See [SESSIONS.md](./SESSIONS.md)
