# CLAUDE.md - Dynamic QR Code Application with Next.js 15

## Project Overview

This application allows users to create customized and dynamic QR codes that can be edited after creation. QR codes can redirect to Linktree-style pages with multiple links. The system includes detailed analytics, complete visual customization, and an administrative dashboard.

### Key Feature: Multi-Client Support

The application supports multiple client integration types:

- **Standalone Clients**: Use the app directly at yourapp.com/username
- **Integrated Clients**: API integration with their existing websites
- **Hybrid Clients**: Combination of both approaches

This allows the system to serve both clients who need a simple link page and those who require deep integration with their existing web properties.

## Technology Stack

- **Node.js Version**: 24.2.0 (using nodenv)
- **Frontend Framework**: Next.js 15.4.5 (App Router, Server Components, Turbopack)
- **UI Framework**: React 19.1.0 with Server Components and Suspense
- **Styling**: Tailwind CSS v4 (zero-config)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with SSR
- **QR Generation**: qrcode.js + react-qr-code
- **State Management**: Zustand (if needed)
- **Validation**: Zod + React Hook Form
- **Analytics**: Plausible/Posthog or custom implementation
- **Hosting**: Vercel (Edge Functions, ISR)
- **CDN**: Cloudflare for assets
- **Monitoring**: Sentry for error tracking
- **Testing**: Vitest + Playwright

## Implementation Phases

### Phase 1: Initial Setup

#### 1.1 Development Environment Preparation

- [ ] Verify Node.js v20+ installed
- [ ] Configure npm/yarn/pnpm (prefer pnpm for better performance)
- [ ] Install recommended VS Code extensions:
  - [ ] Prisma
  - [ ] Tailwind CSS IntelliSense
  - [ ] ESLint
  - [ ] Prettier
  - [ ] GitLens
  - [ ] Error Lens
- [ ] Configure Git with conventional commits
- [ ] Prepare GitHub/GitLab account

#### 1.2 Project Creation

- [x] Run create-next-app with TypeScript configuration
- [x] Enable Turbopack for development
- [x] Configure App Router (not Pages Router)
- [x] Enable Tailwind CSS v4
- [x] Configure src/ directory for better organization
- [x] Configure import aliases (@/\*)
- [x] Verify project starts correctly

#### 1.3 Scalable Folder Structure

- [x] Create modular structure by features
- [x] Clearly separate server/client components
- [x] Organize routes with route groups (auth), (dashboard), (public)
- [x] Create lib/ folder for utilities
- [x] Create hooks/ folder for custom hooks
- [x] Create types/ folder for TypeScript
- [x] Configure services/ folder for business logic
- [x] Establish consistent naming convention

#### 1.4 TypeScript Configuration

- [ ] Configure tsconfig.json with strict mode
- [ ] Enable all strict checks
- [ ] Configure paths for absolute imports
- [ ] Configure baseUrl
- [ ] Add types for libraries without types
- [ ] Configure CSS module declarations

#### 1.5 Linting and Formatting Configuration

- [ ] Configure ESLint with Next.js 15 rules
- [ ] Add accessibility plugins
- [ ] Configure Prettier with tailwind plugin
- [ ] Create .editorconfig for consistency
- [ ] Configure husky for pre-commit hooks
- [ ] Add lint-staged to optimize checks
- [ ] Configure commitlint for consistent messages

#### 1.6 Environment Variables

- [ ] Create .env.local for development
- [ ] Create .env.example with all necessary variables
- [ ] Document each environment variable
- [ ] Configure validation with zod
- [ ] Create TypeScript types for process.env
- [ ] Add .env.local to .gitignore

### Phase 2: Database Configuration

#### 2.1 PostgreSQL Setup

- [x] Create account on Supabase/Neon/Railway
- [x] Create new PostgreSQL database
- [x] Get connection string
- [x] Configure connection pooling
- [ ] Enable SSL for connections
- [ ] Configure pgBouncer if necessary
- [ ] Document credentials securely

#### 2.2 Prisma Configuration

- [x] Install Prisma CLI and client
- [x] Initialize Prisma with PostgreSQL
- [x] Configure schema.prisma with best practices:
  - [x] Use UUID instead of autoincrement
  - [x] Add appropriate indexes
  - [x] Configure cascades correctly
  - [x] Use @map for table names
  - [x] Configure automatic @updatedAt
- [ ] Enable necessary preview features
- [x] Configure client generator

#### 2.3 Database Schema Design

- [x] Design complete User model
- [x] Design QRCode model with all fields
- [x] Design Link model for Linktree-style pages
- [x] Design Analytics models (QRScan, LinkClick)
- [ ] Add models for plans/subscriptions
- [ ] Implement soft deletes if necessary
- [ ] Add audit fields

#### 2.4 Migrations and Seeders

- [x] Create initial migration
- [ ] Verify generated SQL
- [ ] Create seed.ts file with test data
- [ ] Configure npm scripts for migrations
- [ ] Document migration process
- [ ] Create backup before production migrations

#### 2.5 Database Client

- [x] Create PrismaClient singleton
- [ ] Configure appropriate logging
- [ ] Implement reconnection handling
- [ ] Add Prisma middleware if necessary
- [ ] Configure performance metrics
- [ ] Implement connection pooling

### Phase 3: Authentication System

#### 3.1 Supabase Auth Setup

- [x] Create Supabase project
- [x] Get URL and anon key
- [x] Configure authentication providers:
  - [x] Email/Password
  - [ ] OAuth (Google, GitHub)
  - [ ] Magic Links
- [ ] Configure password policies
- [ ] Enable email confirmation
- [ ] Customize email templates

#### 3.2 Next.js Integration

- [x] Install @supabase/ssr
- [x] Create server and browser clients
- [x] Configure cookies correctly
- [x] Implement authentication middleware
- [x] Protect private routes
- [ ] Handle refresh tokens
- [ ] Implement global logout

#### 3.3 Authentication Flows

- [x] Implement registration with validation
- [x] Implement login with remember me
- [ ] Implement password recovery
- [ ] Implement email verification
- [ ] Implement password change
- [ ] Implement profile update
- [ ] Handle expired sessions

#### 3.4 Security

- [ ] Implement rate limiting
- [ ] Add CAPTCHA to forms
- [ ] Configure CORS appropriately
- [ ] Implement CSP headers
- [ ] Sanitize user inputs
- [ ] Prevent SQL injection (Prisma handles this)
- [ ] Implement 2FA (optional)

### Phase 4: QR Code Generation

#### 4.1 Generation Library

- [x] Evaluate libraries (qrcode vs others)
- [x] Implement basic generation
- [ ] Support different error correction levels
- [x] Implement different output formats:
  - [ ] PNG
  - [x] SVG
  - [ ] Data URL
  - [ ] Canvas
- [ ] Optimize output size

#### 4.2 Visual Customization

- [ ] Implement color changes (foreground/background)
- [ ] Add support for center logos
- [ ] Implement different patterns:
  - [ ] Classic squares
  - [ ] Circles
  - [ ] Dots
  - [ ] Rounded
- [ ] Add decorative frames
- [ ] Implement gradients
- [ ] Real-time preview

#### 4.3 Advanced Features

- [ ] Generate batch QR codes
- [ ] Implement reusable templates
- [ ] Add optional watermark
- [ ] Support different data types:
  - [ ] URLs
  - [ ] WiFi
  - [ ] vCard
  - [ ] SMS
  - [ ] Email
- [ ] QR content validation

#### 4.4 Storage and CDN

- [ ] Configure Supabase Storage bucket
- [ ] Implement QR image upload
- [ ] Configure CDN to serve images
- [ ] Implement image caching
- [ ] Optimize images on the fly
- [ ] Implement orphaned file cleanup

### Phase 5: Dynamic QR System

#### 5.1 Redirect Architecture

- [ ] Design unique short code system
- [ ] Implement shortcode generator
- [ ] Create redirect endpoint
- [ ] Handle expired QR codes
- [ ] Implement fallback URLs
- [ ] Cache frequent redirects

#### 5.2 Admin Panel

- [ ] Create QR code listing with filters
- [ ] Implement destination URL editing
- [ ] Add activation/deactivation
- [ ] Implement QR duplication
- [ ] Add bulk actions
- [ ] Implement advanced search
- [ ] Export QR codes

#### 5.3 Advanced Features

- [ ] Schedule URL changes
- [ ] A/B testing for destinations
- [ ] Conditional redirection by:
  - [ ] Device
  - [ ] Country
  - [ ] Time of day
  - [ ] Language
- [ ] Scan limits
- [ ] Password protection

#### 5.4 API for Dynamic QR

- [ ] Design RESTful API
- [ ] Implement API authentication
- [ ] Rate limiting per API key
- [ ] Document with OpenAPI/Swagger
- [ ] Implement webhooks
- [ ] API versioning

### Phase 6: Analytics and Statistics

#### 6.1 Data Collection

- [ ] Capture scan information:
  - [ ] IP (hashed for privacy)
  - [ ] User Agent parsing
  - [ ] Geolocation
  - [ ] Referrer
  - [ ] Timestamp
- [ ] Implement pixel tracking
- [ ] Respect Do Not Track
- [ ] GDPR compliance

#### 6.2 Analytics Processing

- [ ] Aggregate real-time data
- [ ] Implement aggregation jobs
- [ ] Calculate derived metrics
- [ ] Detect and filter bots
- [ ] Implement fraud detection
- [ ] Archive old data

#### 6.3 Analytics Dashboard

- [ ] Show real-time metrics
- [ ] Interactive charts with Recharts
- [ ] Geographic heat maps
- [ ] Device analysis
- [ ] Temporal trends
- [ ] Period-over-period comparisons
- [ ] Export reports

#### 6.4 Alerts and Notifications

- [ ] Configure alert thresholds
- [ ] Email notifications
- [ ] Webhooks for events
- [ ] Slack integration
- [ ] Alert dashboard
- [ ] Notification history

### Phase 7: User Interface

#### 7.1 Design System

- [ ] Define color palette
- [ ] Establish typography
- [ ] Create base components
- [ ] Document in Storybook
- [ ] Implement light/dark themes
- [ ] Create style guide

#### 7.2 Reusable Components

- [ ] Buttons with variants
- [ ] Accessible forms
- [ ] Modals and dialogs
- [ ] Tables with sorting/filtering
- [ ] Cards and layouts
- [ ] Navigation components
- [ ] Loading states

#### 7.3 Public Pages

- [ ] Optimized landing page
- [ ] Features page
- [ ] Pricing/plans
- [ ] Blog/resources
- [ ] Custom 404 page
- [ ] Error pages

#### 7.4 User Dashboard

- [ ] Overview with metrics
- [ ] QR code management
- [ ] Linktree page editor
- [ ] Account settings
- [ ] Billing and subscription
- [ ] Support/help

#### 7.5 Mobile Experience

- [ ] Mobile-first design
- [ ] Optimized touch navigation
- [ ] Native gestures
- [ ] PWA capabilities
- [ ] App-like animations
- [ ] Offline support

### Phase 8: Optimization and Testing

#### 8.1 Performance

- [ ] Implement code splitting
- [ ] Component lazy loading
- [ ] Image optimization with next/image
- [ ] Implement ISR where appropriate
- [ ] Configure cache headers
- [ ] Minify assets
- [ ] Automatic tree shaking

#### 8.2 SEO

- [ ] Implement dynamic metadata
- [ ] Generate sitemaps
- [ ] Configure robots.txt
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Schema.org markup
- [ ] Canonical URLs

#### 8.3 Testing

- [ ] Unit tests with Vitest
- [x] Integration tests
- [x] E2E tests with Playwright
- [ ] Visual regression tests
- [x] Performance testing
- [ ] Load testing
- [ ] Security testing

#### 8.4 Monitoring

- [ ] Configure Sentry
- [ ] Real User Monitoring
- [ ] Synthetic monitoring
- [ ] Downtime alerts
- [ ] Performance metrics
- [ ] Custom error boundaries

### Phase 9: Multi-Client Support & Integration

#### 9.1 Client Type Architecture

- [ ] Design database schema for client types (standalone, integrated, hybrid)
- [ ] Create Integration model with website URLs and settings
- [ ] Add API key generation system for integrated clients
- [ ] Implement client type detection logic
- [ ] Create middleware for client-specific routing
- [ ] Design fallback strategies for each client type

#### 9.2 API Development for Integrated Clients

- [ ] Design RESTful API endpoints for external consumption
- [ ] Create comprehensive API documentation with examples
- [ ] Build TypeScript SDK for client websites
- [ ] Implement webhook system for real-time updates
- [ ] Create API versioning strategy (v1, v2, etc.)
- [ ] Add request/response logging
- [ ] Implement idempotency for critical operations
- [ ] Create standardized error responses

#### 9.3 Authentication & Security for Integrations

- [ ] Implement API key management system
- [ ] Add OAuth2 for advanced integrations
- [ ] Create scoped permissions per API key
- [ ] Implement request signing for security
- [ ] Add IP whitelist option per client
- [ ] Create audit logs for all API calls
- [ ] Implement API key rotation mechanism
- [ ] Add request throttling per client

#### 9.4 Client Website Integration Tools

- [ ] Create Next.js integration package
- [ ] Build React component library for links display
- [ ] Develop vanilla JavaScript widget
- [ ] Create server-side SDK for Node.js
- [ ] Build PHP SDK for WordPress sites
- [ ] Implement embed code generator
- [ ] Create integration testing tools
- [ ] Build migration tools for existing data

#### 9.5 Smart Routing System

- [ ] Implement QR code redirect logic based on client type
- [ ] Create fallback URLs for integrated clients
- [ ] Add custom domain support per client
- [ ] Implement path-based routing options
- [ ] Create redirect analytics tracking
- [ ] Add A/B testing for redirect paths
- [ ] Implement geo-based routing rules
- [ ] Create device-specific redirects

#### 9.6 Unified Analytics System

- [ ] Design analytics schema supporting all client types
- [ ] Create real-time analytics pipeline
- [ ] Implement cross-domain tracking
- [ ] Build analytics API endpoints
- [ ] Create analytics aggregation jobs
- [ ] Implement custom event tracking
- [ ] Add conversion tracking support
- [ ] Create exportable reports system

#### 9.7 Developer Experience (DX)

- [ ] Create comprehensive integration docs
- [ ] Build interactive API playground
- [ ] Develop example implementations
- [ ] Create video tutorials for common integrations
- [ ] Build CLI tool for integration management
- [ ] Implement error tracking for integrations
- [ ] Create health check endpoints
- [ ] Build integration diagnostic tools

#### 9.8 Performance Optimization for Integrations

- [ ] Implement response caching strategies
- [ ] Add CDN support for API responses
- [ ] Create batch API endpoints for bulk operations
- [ ] Add database query optimization
- [ ] Create connection pooling for high traffic
- [ ] Implement edge caching for frequently accessed data
- [ ] Add compression for API responses
- [ ] Use pagination for list endpoints

### Phase 10: Production Deployment

#### 10.1 Pre-deployment Preparation

- [ ] Security audit
- [ ] Review environment variables
- [ ] Build optimization
- [ ] Verify all integrations
- [ ] Database backup
- [ ] Prepare rollback plan

#### 10.2 Vercel Configuration

- [ ] Connect repository
- [ ] Configure environment variables
- [ ] Configure custom domains
- [ ] Enable analytics
- [ ] Configure edge regions
- [ ] Preview deployments

#### 10.3 Post-deployment

- [ ] Verify all features
- [ ] Monitor errors
- [ ] Verify performance
- [ ] Configure automatic backups
- [ ] Document processes
- [ ] Train team

#### 10.4 Continuous Maintenance

- [ ] Security updates
- [ ] Continuous optimization
- [ ] Cost monitoring
- [ ] Planned scalability
- [ ] Feature flags for new features
- [ ] A/B testing in production

## Session Management Protocol

This project uses a structured session management system. Every coding session is documented in SESSIONS.md.

### Starting a New Session
1. Read the last session entry in SESSIONS.md
2. Create a new session entry with clear goals
3. Reference previous session's "Next session focus"

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

### Important: When starting any new Claude Code instance
Always start with: "Check SESSIONS.md for the last session status and continue from there"

## Development Instructions for Claude

When implementing this project:

1. Follow the phases sequentially
2. Mark each checkbox as completed
3. Use the latest Next.js 15 features (App Router, Server Components)
4. Implement proper error handling and loading states
5. Ensure all components are accessible (WCAG 2.1 AA)
6. Write clean, typed, and documented code
7. Follow the established folder structure
8. Implement tests for critical paths
9. Optimize for Core Web Vitals
10. Document any deviations from the plan
