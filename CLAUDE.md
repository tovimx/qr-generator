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

## CRITICAL ERROR HANDLING PROTOCOLS

### **🚨 ERROR MESSAGE ANALYSIS (MANDATORY)**

**NEVER react to error messages without proper analysis. Follow this protocol:**

#### **Step 1: PAUSE and Analyze**
Before making ANY changes when encountering errors:
1. **Read the FULL error message** - don't just scan keywords
2. **Identify the ROOT CAUSE** - what is the actual problem?
3. **Consider multiple solutions** - don't jump to the first fix
4. **Ask: "What is the user trying to achieve?"** - preserve their intent

#### **Step 2: Solution Hierarchy**
Always prefer solutions in this order:
1. **Fix the configuration** (update dependencies, settings)
2. **Add missing dependencies** (install what's needed) 
3. **Modify code minimally** (small targeted changes)
4. **NEVER downgrade working versions** without explicit permission

#### **Step 3: Common Anti-Patterns to AVOID**
- ❌ **Reactive downgrading**: "Error says <5.9.0, so downgrade to 5.8.x"
- ❌ **Removing features**: "Error in component, so delete the component"
- ❌ **Assumptions**: "User probably doesn't need this version"
- ❌ **Silent changes**: Making major changes without explanation

#### **Step 4: Required Communication**
When encountering errors:
1. **Explain what you found**: "The error shows X, which means Y"
2. **Present options**: "We can either A, B, or C - which do you prefer?"
3. **Justify your recommendation**: "I recommend A because..."
4. **Get confirmation**: "Does this approach work for you?"

#### **Example: TypeScript Version Conflicts**
**❌ Wrong approach**: 
"ESLint plugin requires <5.9.0, so I'll downgrade TypeScript to 5.8.4"

**✅ Correct approach**:
"ESLint plugin is outdated and doesn't support TypeScript 5.9.2. Options:
1. Update ESLint plugin to newer version that supports 5.9.2
2. Override ESLint configuration 
3. Downgrade TypeScript (not recommended)
I recommend option 1 - keep your current TS version and update ESLint."

**Remember: Your role is to SOLVE problems, not create new ones by downgrading working systems.**

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

### **🚨 ARCHITECTURAL CHANGE DETECTION (CRITICAL)**

**BEFORE making ANY changes to these file types, STOP and run impact analysis:**

- Files with `'use client'` directives
- Provider components (`*Provider.tsx`)  
- Root layout (`layout.tsx`)
- Environment utilities (`env.ts`, `**/env/*`)
- Core libraries (`lib/**/*.ts`)
- Authentication setup (`auth/**/*`)

**MANDATORY PROTOCOL:**
```bash
# 1. Run impact analysis first
npm run impact-analysis <target-file> <change-type>

# 2. If HIGH RISK detected, ask user permission before proceeding
# 3. Run comprehensive tests before any commit
npm run checkerrors && npm run build && npm run test:ssr
```

**NEVER proceed with HIGH RISK changes without explicit user approval!**

---

## 🏗️ ENTERPRISE-LEVEL ARCHITECTURAL CHANGE PROTOCOLS

*Following practices from Google, Netflix, and Microsoft senior engineering teams*

### **🧠 MAXIMUM REASONING POWER MANDATE**

**CRITICAL DIRECTIVE**: Claude Code MUST use maximum analytical depth for ALL error investigation. The failure patterns from the 2025-08-30 production deployment crisis are NEVER to be repeated.

#### **🚨 THE FOUR COGNITIVE FAILURES (NEVER REPEAT)**

Based on the systematic analysis failure during Digest: 4033081611 → 3130368227 → 2257328419 cascading production errors:

**FAILURE #1: Linear Problem-Solving Bias**
- ❌ **What happened**: Treated each error as isolated incident instead of systemic issue
- ❌ **Symptom**: Fixed `'use client'` → process.env → ENV utility → Prisma without seeing pattern
- ✅ **Required approach**: Always ask "What is the systematic architectural violation causing all these?"

**FAILURE #2: Surface-Level Analysis** 
- ❌ **What happened**: Made code changes without understanding Next.js App Router architecture
- ❌ **Symptom**: Removed `'use client'` without analyzing client/server boundary implications  
- ✅ **Required approach**: Demonstrate deep framework knowledge before touching architectural files

**FAILURE #3: Confirmation Bias**
- ❌ **What happened**: Assumed build success = runtime success, ignored context boundary violations
- ❌ **Symptom**: Multiple "fixed" PRs that still caused production errors
- ✅ **Required approach**: Test all contexts (build, SSR, client runtime, browser) before claiming success

**FAILURE #4: Lack of Holistic Thinking**
- ❌ **What happened**: Fixed symptoms without identifying QueryProvider at root layout as root cause
- ❌ **Symptom**: 5 cascading error cycles before finding the systematic architectural problem
- ✅ **Required approach**: Map component tree, trace data flow, identify architectural violations first

### **🎯 SYSTEMATIC FAILURE PREVENTION FRAMEWORK**

**MANDATORY PROTOCOL**: Before touching ANY architectural file, complete this systematic analysis:

#### **PHASE 1: ARCHITECTURAL UNDERSTANDING (MANDATORY)**

```bash
echo "🎯 PHASE 1: SYSTEMATIC ARCHITECTURAL ANALYSIS"
echo "=============================================="

# 1. Framework Knowledge Verification
echo "📚 FRAMEWORK KNOWLEDGE CHECK:"
echo "- Next.js App Router SSR/Client boundary rules?"
echo "- React component tree rendering order in SSR?"  
echo "- TanStack Query client/server instantiation patterns?"
echo "- Environment variable bundling behavior?"
echo "- Provider component placement implications?"

# 2. Component Tree Mapping
echo "🌳 COMPONENT TREE ANALYSIS:"
find src -name "layout.tsx" -o -name "*Provider*" -o -name "*Client*" | while read file; do
  echo "ARCHITECTURAL FILE: $file"
  if grep -q "use client" "$file"; then
    echo "  └─ CLIENT BOUNDARY: Forces client-side rendering"
  fi
  if grep -q "Provider" "$file"; then
    echo "  └─ PROVIDER COMPONENT: Affects component tree"
  fi
  if grep -q "layout.tsx" "$file"; then
    echo "  └─ LAYOUT COMPONENT: Affects all routes"
  fi
done

# 3. Data Flow Analysis
echo "🔄 DATA FLOW MAPPING:"
grep -r "QueryClient\|createQueryClient\|getQueryClient" src/ --include="*.ts" --include="*.tsx" | while read line; do
  echo "QUERY CLIENT USAGE: $line"
done

# 4. Environment Variable Analysis  
echo "🌍 ENVIRONMENT VARIABLE USAGE:"
grep -r "process\.env\|ENV\." src/ --include="*.ts" --include="*.tsx" | head -10 | while read line; do
  echo "ENV ACCESS: $line"
done
```

**🚫 DO NOT PROCEED** without completing Phase 1 analysis and demonstrating architectural understanding.

#### **PHASE 2: ROOT CAUSE HYPOTHESIS (REQUIRED)**

```bash
echo "🔍 PHASE 2: ROOT CAUSE HYPOTHESIS GENERATION"
echo "============================================="

# Must answer these questions before making changes:
echo "REQUIRED ANALYSIS:"
echo "1. What is the FUNDAMENTAL architectural violation?"
echo "2. How does this violation cause cascading errors?"
echo "3. What is the systematic pattern across all error messages?"
echo "4. Which component in the tree is violating SSR/Client boundaries?"
echo "5. How will fixing THIS root cause eliminate ALL symptoms?"

# Systematic Hypothesis Formation
echo ""
echo "HYPOTHESIS REQUIREMENTS:"
echo "✅ Explains ALL observed error patterns"
echo "✅ Identifies single systematic architectural violation"  
echo "✅ Predicts what will break if not fixed properly"
echo "✅ Addresses framework-level design principles"
```

#### **PHASE 3: COMPREHENSIVE TESTING STRATEGY (MANDATORY)**

```bash
echo "🧪 PHASE 3: COMPREHENSIVE TESTING PROTOCOL"
echo "========================================="

# All contexts must be tested - no exceptions
echo "MANDATORY TEST SEQUENCE:"

echo "1️⃣  BUILD CONTEXT:"
npm run checkerrors
npm run build

echo "2️⃣  SSR CONTEXT:" 
npm run test:ssr

echo "3️⃣  CLIENT RUNTIME CONTEXT:"
npm start &
SERVER_PID=$!
sleep 5
curl -f http://localhost:3000 || echo "❌ CLIENT RUNTIME FAILED"
curl -f http://localhost:3000/dashboard || echo "❌ DASHBOARD RUNTIME FAILED"
kill $SERVER_PID

echo "4️⃣  BROWSER CONTEXT:"
echo "Manual browser testing required for:"
echo "- JavaScript console errors"
echo "- Network request failures"
echo "- Hydration mismatches"
echo "- Client-side navigation"

echo "✅ ALL 4 CONTEXTS MUST PASS - NO EXCEPTIONS"
```

### **⚡ ARCHITECTURE-FIRST ERROR PROTOCOL**

When encountering ANY error, follow this systematic approach:

**STEP 1: PAUSE AND THINK SYSTEMATICALLY**
- ❌ Do not immediately fix the symptom 
- ✅ Ask: "What architectural principle is being violated?"
- ✅ Map the component tree and identify boundaries
- ✅ Trace data flow from root to error location

**STEP 2: GENERATE ARCHITECTURAL HYPOTHESIS**
- ✅ "The root cause is [architectural violation] because [framework principle]"
- ✅ "This causes cascading errors because [explain chain reaction]"
- ✅ "Fixing [root cause] will eliminate symptoms [A, B, C]"

**STEP 3: VERIFY HYPOTHESIS BEFORE IMPLEMENTING**
- ✅ Test hypothesis against all observed symptoms
- ✅ Predict what else might break
- ✅ Identify any assumptions that need validation

**STEP 4: IMPLEMENT SYSTEMATIC FIX**
- ✅ Address the architectural violation, not the symptoms
- ✅ Make minimal changes that restore architectural integrity
- ✅ Test all contexts before claiming success

**STEP 5: VALIDATE SYSTEMATIC RESOLUTION**
- ✅ Confirm ALL previous symptoms are eliminated
- ✅ Ensure no new symptoms emerged
- ✅ Verify architectural integrity is restored

### **🎯 SYSTEMATIC FAILURE PREVENTION**

**PROBLEM**: Claude Code historically fails at detecting cascading architectural errors due to four critical blindness patterns. This section provides enterprise-level protocols to eliminate these failures.

#### **1. MANDATORY DEPENDENCY GRAPH ANALYSIS**

**❌ FAILURE PATTERN**: Making changes without understanding import chains and downstream effects.

**✅ SENIOR DEV PROTOCOL**:
```bash
# BEFORE touching ANY architectural file, run complete dependency analysis:

# 1. Map all imports OF the target file
echo "=== WHO IMPORTS THIS FILE? ==="
grep -r "from.*$(basename $TARGET_FILE .ts)" src/ --include="*.ts" --include="*.tsx"
grep -r "import.*$(basename $TARGET_FILE .ts)" src/ --include="*.ts" --include="*.tsx"

# 2. Map all imports BY the target file  
echo "=== WHAT DOES THIS FILE IMPORT? ==="
grep -E "^import.*from|^from.*import" $TARGET_FILE

# 3. Trace the full dependency chain (3 levels deep)
echo "=== DEPENDENCY CHAIN ANALYSIS ==="
for file in $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); do
  echo "LEVEL 1: $file imports target"
  grep -l "$(basename $file .tsx .ts)" src/**/*.{ts,tsx} | head -3 | while read level2; do
    echo "  LEVEL 2: $level2 imports $file"
    grep -l "$(basename $level2 .tsx .ts)" src/**/*.{ts,tsx} | head -2 | while read level3; do
      echo "    LEVEL 3: $level3 imports $level2"
    done
  done
done

# 4. Client/Server boundary analysis
echo "=== CLIENT/SERVER BOUNDARY ANALYSIS ==="
for file in $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); do
  if grep -q "'use client'" "$file"; then
    echo "🔴 CLIENT CONTEXT: $file"
  elif grep -q "'use server'" "$file"; then
    echo "🔵 SERVER CONTEXT: $file"  
  else
    echo "⚪ UNIVERSAL CONTEXT: $file"
  fi
done
```

**🚫 NEVER PROCEED** if you cannot answer:
- What files import this?
- What contexts (client/server/universal) use this?
- What will break if I change this directive/pattern?

#### **2. MULTI-CONTEXT TESTING STRATEGY**

**❌ FAILURE PATTERN**: Only running `npm run build` which misses runtime client-side errors.

**✅ SENIOR DEV PROTOCOL**:
```bash
# MANDATORY TESTING SEQUENCE - ALL MUST PASS

echo "🏗️  PHASE 1: BUILD VALIDATION"
npm run checkerrors    # TypeScript + ESLint
npm run build          # Next.js compilation
echo "✅ Build phase passed"

echo "🖥️  PHASE 2: SERVER-SIDE RENDERING TEST"  
npm run test:ssr       # Custom SSR validation
echo "✅ SSR phase passed"

echo "🌐 PHASE 3: CLIENT-SIDE RUNTIME TEST"
# Start production server
npm run build && npm start &
SERVER_PID=$!
sleep 5

# Test actual browser requests
curl -f http://localhost:3000 > /dev/null || (echo "❌ Homepage failed"; kill $SERVER_PID; exit 1)
curl -f http://localhost:3000/dashboard > /dev/null || (echo "❌ Dashboard failed"; kill $SERVER_PID; exit 1)
curl -f http://localhost:3000/login > /dev/null || (echo "❌ Login failed"; kill $SERVER_PID; exit 1)

kill $SERVER_PID
echo "✅ Client runtime phase passed"

echo "📦 PHASE 4: BUNDLE ANALYSIS"
npm run build -- --analyze  # Check bundle composition
echo "✅ Bundle analysis phase passed"

echo "🎯 ALL PHASES PASSED - SAFE TO PROCEED"
```

**🚫 NEVER COMMIT** without passing all 4 phases.

#### **3. ARCHITECTURAL DEPTH UNDERSTANDING**

**❌ FAILURE PATTERN**: Surface-level file editing without understanding framework implications.

**✅ SENIOR DEV PROTOCOL**:

Before changing ANY architectural pattern, demonstrate understanding by explaining:

**For `'use client'` changes:**
```
REQUIRED KNOWLEDGE CHECK:
- What is the Next.js client/server boundary?
- How does bundler treat 'use client' vs universal code?
- What happens to process.env in client vs server contexts?
- How does SSR hydration work with client components?
- What are the bundling implications?

MANDATORY RESEARCH: If you cannot explain these concepts in detail, 
STOP and research Next.js App Router architecture first.
```

**For Provider component changes:**
```
REQUIRED KNOWLEDGE CHECK:  
- What is the React component tree rendering order in SSR?
- How do providers affect server-side vs client-side rendering?
- What happens during hydration mismatch?
- How does query client instantiation differ in SSR vs client?

MANDATORY RESEARCH: If uncertain about any concept, research React SSR patterns.
```

**For Environment utility changes:**
```
REQUIRED KNOWLEDGE CHECK:
- When is process.env available vs undefined?
- How do bundlers handle environment variables?
- What's the difference between NEXT_PUBLIC_ vars and server-only vars?
- How does client-side bundling affect process references?

MANDATORY RESEARCH: Study Next.js environment variable documentation.
```

#### **4. COMPREHENSIVE IMPACT ANALYSIS**

**❌ FAILURE PATTERN**: Changing files in isolation without considering cascading effects.

**✅ SENIOR DEV PROTOCOL**:

```bash
# ENTERPRISE IMPACT ANALYSIS CHECKLIST

echo "📊 CHANGE IMPACT ANALYSIS REPORT"
echo "================================"

TARGET_FILE="$1"
CHANGE_TYPE="$2"

# 1. Blast Radius Calculation
echo "🎯 BLAST RADIUS:"
DIRECT_IMPORTS=$(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx} | wc -l)
echo "  Direct imports: $DIRECT_IMPORTS files"

TRANSITIVE_IMPORTS=$(for f in $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); do 
  grep -l "$(basename $f .tsx .ts)" src/**/*.{ts,tsx}; 
done | sort -u | wc -l)
echo "  Transitive imports: $TRANSITIVE_IMPORTS files"

if [ $DIRECT_IMPORTS -gt 5 ] || [ $TRANSITIVE_IMPORTS -gt 10 ]; then
  echo "🚨 HIGH BLAST RADIUS - REQUIRE SENIOR APPROVAL"
fi

# 2. Context Boundary Analysis  
echo "🔄 CONTEXT BOUNDARIES:"
CLIENT_USAGE=0
SERVER_USAGE=0
for file in $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); do
  if grep -q "'use client'" "$file"; then
    CLIENT_USAGE=$((CLIENT_USAGE + 1))
  else
    SERVER_USAGE=$((SERVER_USAGE + 1))
  fi
done

echo "  Client context usage: $CLIENT_USAGE files"
echo "  Server context usage: $SERVER_USAGE files"

if [ $CLIENT_USAGE -gt 0 ] && [ $SERVER_USAGE -gt 0 ]; then
  echo "🚨 MIXED CONTEXT USAGE - HIGH RISK"
fi

# 3. Critical Path Analysis
echo "🛣️  CRITICAL PATHS:"
if grep -q "layout.tsx" <<< $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); then
  echo "  ❌ CRITICAL: Used in app layout (affects all routes)"
fi

if grep -q "Provider" <<< $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); then
  echo "  ❌ CRITICAL: Used in provider components"
fi

if grep -q "middleware" <<< $(grep -l "$(basename $TARGET_FILE .ts)" src/**/*.{ts,tsx}); then
  echo "  ❌ CRITICAL: Used in middleware (Edge Runtime)"
fi

# 4. Risk Assessment
echo "⚠️  RISK ASSESSMENT:"
case "$CHANGE_TYPE" in
  "use-client-removal"|"provider-change"|"middleware-change")
    echo "  🔴 CRITICAL RISK - Mandatory senior review + staging deployment"
    ;;
  "env-utility"|"auth-change")
    echo "  🟡 HIGH RISK - Mandatory impact testing"
    ;;
  *)
    echo "  🟢 LOW RISK - Standard testing required"
    ;;
esac

echo ""
echo "📋 REQUIRED APPROVALS:"
if [ $DIRECT_IMPORTS -gt 5 ] || [ $CLIENT_USAGE -gt 0 ] && [ $SERVER_USAGE -gt 0 ]; then
  echo "  ✋ STOP - Explicit user approval required"
  echo "  📞 Present this analysis to user first"
else
  echo "  ✅ Standard change - proceed with testing"
fi
```

### **🛡️ MANDATORY IMPLEMENTATION RULES**

1. **DEPENDENCY ANALYSIS FIRST**: Always run dependency analysis before any architectural change
2. **MULTI-CONTEXT TESTING**: Never trust build success - test in browser + SSR + server contexts  
3. **FRAMEWORK EXPERTISE REQUIRED**: Demonstrate deep understanding of patterns being modified
4. **IMPACT ANALYSIS**: Calculate blast radius and context boundaries before changes
5. **SENIOR APPROVAL**: High-risk changes require explicit user approval with analysis presentation

**VIOLATION OF THESE PROTOCOLS = IMMEDIATE HALT OF WORK**

These protocols eliminate the systematic failures that caused the recent SSR/client cascade issues.

### **1. Require Explicit Permission for Major Changes**

- ALWAYS check with user before removing any existing functionality
- If encountering blockers, STOP and ask for guidance rather than making unilateral decisions  
- RULE: "Never delete code without explicit permission"
- **NEW**: NEVER make architectural changes without impact analysis

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

#### **🚨 CRITICAL: Dev Server Restart Protocol**

**MANDATORY**: After any database schema changes, Prisma operations, or client generation, you **MUST** restart the development server to avoid "Unknown argument" errors.

**When to restart `npm run dev:full`:**
- ✅ After `npx prisma db push`
- ✅ After `npx prisma migrate dev`  
- ✅ After `npx prisma generate`
- ✅ After adding/modifying Prisma schema fields
- ✅ After any database model changes

**Why**: The running dev server uses a cached Prisma client. Schema changes require a fresh Prisma client generation, which only takes effect after server restart.

**ALWAYS tell the user**: "Now restart your dev server with `npm run dev:full` to pick up the new Prisma client."

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
5. **ALL modals MUST follow the established blur backdrop pattern** (see Modal Standards below)

#### **Modal Standards:**

**MANDATORY**: All modals/dialogs must use the consistent blur backdrop pattern for visual cohesion.

**Required Modal Pattern:**
```tsx
{/* Modal/Dialog */}
{showModal && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
      {/* Modal content */}
    </div>
  </div>
)}
```

**Key Requirements:**
- ✅ `bg-black/20` - Semi-transparent dark overlay (NOT `bg-black bg-opacity-50`)
- ✅ `backdrop-blur-sm` - Blur effect that shows app content behind
- ✅ `rounded-xl` - Consistent rounded corners (NOT `rounded-lg`)
- ✅ `mx-4` - Horizontal margin for mobile responsiveness
- ✅ `z-50` - Proper stacking order

**Examples in codebase:**
- Delete confirmation modals in `SimpleProjectDashboard.tsx`
- Custom theme save modal in `DesignPanel.tsx`

#### **🔄 Design Fields Synchronization (CRITICAL)**

**PROBLEM**: Adding new design fields requires updating multiple files manually, leading to sync issues between live pages, APIs, and preview components.

**SOLUTION**: Centralized design field configuration ensures automatic synchronization.

**MANDATORY**: Always use the centralized design utilities instead of manual field mapping.

```tsx
// ❌ NEVER DO THIS - Manual field mapping
const designSettings: DesignSettings = {
  themeId: qrCode.themeId || 'default',
  primaryColor: qrCode.primaryColor || '#6366f1',
  // ... manually listing all fields
}

// ✅ ALWAYS DO THIS - Use centralized utility
import { mapQRCodeToDesignSettings, getDesignFieldsSelect } from '@/lib/design/fields'

// For database queries
const qrCode = await prisma.qRCode.findUnique({
  select: {
    id: true,
    title: true,
    ...getDesignFieldsSelect(), // Automatically includes all design fields
  }
})

// For mapping database to DesignSettings
const designSettings = mapQRCodeToDesignSettings(qrCode)
```

**Key Benefits:**
- ✅ **Automatic sync**: New design fields are automatically available everywhere
- ✅ **Type safety**: Compile-time checks ensure no fields are missed
- ✅ **Centralized validation**: Single source of truth for field validation
- ✅ **Zero maintenance**: No need to update multiple files when adding fields

**Files that use centralized design utilities:**
- `/src/lib/design/fields.ts` - Central configuration
- `/src/app/(public)/q/[shortCode]/page.tsx` - Live page
- `/src/app/api/qr-codes/[id]/design/route.ts` - Design API
- `/src/app/api/custom-themes/route.ts` - Custom themes API

#### **🖼️ Avatar Style System**

**Feature**: Users can choose between two avatar display styles for their QR code pages.

**Avatar Styles Available:**
1. **Circle** (default): Traditional rounded avatar with shadow, positioned inside the card
2. **Banner**: Full-width rectangular image (4:1 aspect ratio) positioned above the card content

**Implementation:**
- Added `avatarStyle?: 'circle' | 'banner'` to `DesignSettings` interface
- Database field: `avatarStyle` with default `'circle'`
- UI: Avatar Style selector in Design Customizer → Layout tab
- Renderer: Conditional avatar positioning in `ThemeRenderer`

**Usage in DesignCustomizer:**
```tsx
// Located in Layout tab after Avatar URL field
<div>
  <label>Avatar Style</label>
  <div className="grid grid-cols-2 gap-2">
    <button onClick={() => onChange({ avatarStyle: 'circle' })}>
      Circle
      <p>Round avatar with shadow</p>
    </button>
    <button onClick={() => onChange({ avatarStyle: 'banner' })}>
      Banner  
      <p>Full-width image banner</p>
    </button>
  </div>
</div>
```

**Rendering Logic:**
```tsx
// Banner avatar - positioned outside card
{avatarUrl && design.avatarStyle === 'banner' && (
  <div className="max-w-md mx-auto mb-8">
    <img src={avatarUrl} className="w-full h-24 object-cover rounded-lg shadow-lg" />
  </div>
)}

// Circle avatar - positioned inside card  
{avatarUrl && (design.avatarStyle || 'circle') === 'circle' && (
  <div className="flex justify-center mb-6">
    <img src={avatarUrl} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
  </div>
)}
```

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
