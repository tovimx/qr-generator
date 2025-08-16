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

## Development Instructions

When implementing features for this project:

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
1. **TanStack Query Refactor** (High Priority)
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