# Migration Safety Plan - Multi-Project Support

## 🛡️ Safety Status: DEVELOPMENT COMPLETE ✅

**Development Environment**: ✅ **SAFE** - Local PostgreSQL database
- Local Database: `qr_generator_dev` 
- Production Data: **PROTECTED** - Saved in `.env.local.production`

## Migration Strategy

### Phase 1: Development & Testing ✅ **COMPLETE**
- ✅ Local PostgreSQL setup complete
- ✅ Development environment isolated from production
- ✅ **COMPLETE**: Project model implementation
- ✅ **COMPLETE**: Multi-project UI with simplified dashboard
- ✅ **COMPLETE**: QR code CRUD operations (Create, Read, Update, Delete)
- ✅ **COMPLETE**: Project management functionality
- ✅ **COMPLETE**: Database migration applied: `20250830025022_add_project_support`

### Phase 2: Production Preparation
- [ ] Create production database backup
- [ ] Test migration on production data copy
- [ ] Verify rollback procedure
- [ ] Schedule maintenance window

### Phase 3: Production Deployment
- [ ] Apply migration during low-traffic period
- [ ] Monitor for issues
- [ ] Verify data integrity
- [ ] Test all functionality

## Rollback Plan

If migration fails in production:
1. **Immediate**: Restore from backup
2. **Code**: Revert to previous deployment
3. **Data**: Verify no data corruption
4. **Communication**: Notify users if necessary

## 🚀 STEP-BY-STEP PRODUCTION MIGRATION GUIDE

### **BEFORE YOU START - READ THIS! 📖**

**This is your first production migration - we'll go slowly and safely!**

**Time needed**: 2-3 hours total
**Best time**: Low traffic period (early morning/weekend)
**Have ready**: 
- Your production database URL
- Access to your hosting platform (Vercel/etc)
- A backup of your current `.env.local` file

---

## **PHASE 1: SAFETY PREPARATION** ⚠️

### **Step 1.1: Create Complete Production Backup**

**🎯 Goal**: Create a full backup of your production database before any changes

```bash
# 1. First, get your production database URL ready
# Look in your .env.local.production file or hosting platform
echo "Your production DATABASE_URL should look like:"
echo "postgresql://username:password@host:5432/database_name"

# 2. Set the production URL as a variable (replace with your actual URL)
export PROD_DB_URL="your_actual_production_database_url_here"

# 3. Create timestamped backup
echo "Creating backup at $(date)..."
pg_dump "$PROD_DB_URL" > "backup_before_projects_$(date +%Y%m%d_%H%M%S).sql"

# 4. Verify backup was created successfully
echo "Backup file size:"
ls -lh backup_before_projects_*.sql

# 5. Verify backup has content (should show thousands of lines)
echo "Backup line count (should be 1000+ lines):"
wc -l backup_before_projects_*.sql
```

**✅ Success criteria**: 
- Backup file exists and is several MB in size
- Line count is 1000+ lines
- No error messages during backup

**❌ If this fails**: STOP! Don't proceed until backup works. Check your DATABASE_URL.

### **Step 1.2: Test Migration on Copy of Production Data**

**🎯 Goal**: Test the entire migration on a copy of your production data

```bash
# 1. Create a test database with production data
echo "Creating test database..."
createdb qr_generator_prod_test

# 2. Import production data to test database
echo "Importing production data to test database..."
psql qr_generator_prod_test < backup_before_projects_$(date +%Y%m%d_%H%M%S).sql

# 3. Set up environment to use test database
echo "Setting up test environment..."
export DATABASE_URL="postgresql://$(whoami)@localhost:5432/qr_generator_prod_test"
export DIRECT_DATABASE_URL="postgresql://$(whoami)@localhost:5432/qr_generator_prod_test"

# 4. Run the migration on test data
echo "Running migration on test data..."
npx prisma migrate deploy

# 5. Run backfill scripts on test data
echo "Running backfill scripts..."
npm run backfill:clients
npm run backfill:projects
```

**✅ Success criteria**: 
- Test database created successfully
- Migration runs without errors
- Backfill scripts complete successfully
- No error messages in output

**❌ If this fails**: STOP! Fix issues in development first.

### **Step 1.3: Verify Test Database**

**🎯 Goal**: Confirm everything looks correct in the test database

```bash
# Connect to test database and run verification queries
psql qr_generator_prod_test << 'EOF'
-- Check that all original QR codes still exist
\echo "=== QR CODES COUNT ==="
SELECT COUNT(*) as total_qr_codes FROM qr_codes WHERE "deletedAt" IS NULL;

-- Check that projects were created
\echo "=== PROJECTS CREATED ==="
SELECT id, name, "isDefault", "createdAt" FROM projects ORDER BY "createdAt";

-- Check that QR codes are assigned to projects
\echo "=== QR CODES BY PROJECT ==="
SELECT 
  p.name as project_name,
  COUNT(q.id) as qr_count
FROM projects p
LEFT JOIN qr_codes q ON q."projectId" = p.id 
WHERE q."deletedAt" IS NULL
GROUP BY p.id, p.name;

-- Check that domains were preserved
\echo "=== DOMAINS PRESERVED ==="
SELECT hostname, type, verified, primary FROM domains ORDER BY "createdAt";

-- Check that QR codes still have their domains
\echo "=== QR CODES WITH DOMAINS ==="
SELECT 
  COUNT(*) as qr_codes_with_domains 
FROM qr_codes q 
JOIN domains d ON q."domainId" = d.id 
WHERE q."deletedAt" IS NULL;

\echo "=== VERIFICATION COMPLETE ==="
\q
EOF
```

**✅ Success criteria**: 
- QR codes count matches your production count
- Projects exist (at least 1 "Default Project" per user)
- All QR codes are assigned to projects (no orphans)
- Your custom domains are present
- QR codes are still assigned to correct domains

**❌ If verification fails**: STOP! Do not proceed to production.

---

## **PHASE 2: PRODUCTION DEPLOYMENT** 🚨

### **Step 2.1: Deploy Code First (Safe)**

**🎯 Goal**: Deploy the new code to your hosting platform without running migration yet

```bash
# 1. Commit all your changes
git add .
git commit -m "Add multi-project support - ready for production deployment"

# 2. Push to your repository
git push origin main

# 3. Deploy to your hosting platform (Vercel/etc)
# The app will show errors temporarily - THIS IS EXPECTED
# The database migration hasn't run yet
```

**✅ Success criteria**: 
- Code deploys successfully to hosting platform
- App may show database errors (this is expected)

### **Step 2.2: Switch to Production Environment**

**🎯 Goal**: Connect to production database for migration

```bash
# 1. Switch to production environment
cp .env.local.production .env.local

# 2. Verify you're connected to production
echo "Verifying production connection..."
npm run verify:env

# 3. Double-check you're connected to the right database
echo "Current DATABASE_URL (should be production):"
echo $DATABASE_URL | sed 's/:[^@]*@/:***@/g'  # Hides password for security
```

**⚠️ CRITICAL CHECKPOINT**: 
- Verify the DATABASE_URL is your production database
- If you're not 100% sure, STOP and double-check

### **Step 2.3: Run Production Migration** 🎯

**🎯 Goal**: Apply database changes to production

⚠️ **THIS IS THE POINT OF NO RETURN** ⚠️

```bash
# 1. Run the migration
echo "Running production migration at $(date)..."
npx prisma migrate deploy

# 2. Run backfill scripts to organize existing data
echo "Running client backfill..."
npm run backfill:clients

echo "Running project backfill..."
npm run backfill:projects

echo "Migration completed at $(date)"
```

**✅ Success criteria**: 
- Migration completes without errors
- Backfill scripts run successfully
- No error messages in output

**❌ If this fails**: Immediately run rollback procedure (see Phase 4)

### **Step 2.4: Immediate Verification** ⏱️

**🎯 Goal**: Verify everything works within 5 minutes of migration

```bash
# Test these URLs in your browser IMMEDIATELY:
echo "TEST THESE URLs RIGHT NOW:"
echo "1. Login: https://yourapp.com/login"
echo "2. Dashboard: https://yourapp.com/dashboard"
echo "3. Test QR redirect: https://links.enigma47.mx/YOUR_EXISTING_SHORTCODE"
echo "4. Test QR redirect: https://links.tovimx.dev/YOUR_EXISTING_SHORTCODE"

# Run this to check database state
psql "$PROD_DB_URL" << 'EOF'
\echo "=== POST-MIGRATION VERIFICATION ==="
SELECT COUNT(*) as total_qr_codes FROM qr_codes WHERE "deletedAt" IS NULL;
SELECT COUNT(*) as total_projects FROM projects;
SELECT hostname FROM domains ORDER BY "createdAt";
\q
EOF
```

**✅ Success criteria**: 
- Login works
- Dashboard loads
- Existing QR codes still redirect properly
- Custom domains still work
- No 500 errors

**❌ If ANY of these fail**: Immediately run rollback (Phase 4)

---

## **PHASE 3: MONITORING** 👀

### **Step 3.1: First Hour Watch**

**🎯 Goal**: Actively monitor for any issues

```bash
# Check error logs (replace with your platform's log command)
# For Vercel: vercel logs
# For other platforms: check your dashboard

# Test random existing QR codes every 15 minutes:
echo "Test these existing QR codes:"
echo "https://links.enigma47.mx/YOUR_SHORTCODE_1"
echo "https://links.enigma47.mx/YOUR_SHORTCODE_2"
echo "https://links.tovimx.dev/YOUR_SHORTCODE_3"

# If everything looks good after 1 hour, you're in good shape!
```

### **Step 3.2: 24 Hour Monitoring**

- Test QR codes periodically
- Monitor error logs
- Watch for user complaints
- Test new functionality (creating QR codes, projects)

---

## **PHASE 4: ROLLBACK PROCEDURE** 🔄

**Use this if anything goes wrong:**

### **Immediate Rollback (Under 5 minutes)**

```bash
# 1. Restore database from backup
echo "ROLLING BACK DATABASE..."
psql "$PROD_DB_URL" < backup_before_projects_YYYYMMDD_HHMMSS.sql

# 2. Revert code deployment
git revert HEAD
git push origin main
# Redeploy to hosting platform

echo "ROLLBACK COMPLETE - verify everything works"
```

### **Emergency Contacts**
- Have your hosting platform support ready
- Know how to quickly access your database
- Keep this document open during migration

---

## **Pre-Flight Checklist** ✈️

**Before starting migration, check all these:**

- [ ] Backup created and verified
- [ ] Migration tested on production data copy
- [ ] Test database verification passed
- [ ] Low traffic time selected
- [ ] All tools installed and working
- [ ] Emergency rollback plan ready
- [ ] 2-3 hours of uninterrupted time available

**Only proceed if ALL boxes are checked!**

## Migration Testing Checklist

### Development Testing ✅ **COMPLETE**:
- ✅ All existing QR codes still work
- ✅ User authentication unaffected
- ✅ Domain management functions properly
- ✅ Analytics data preserved (soft deletion strategy)
- ✅ No performance degradation
- ✅ Multi-project UI functional
- ✅ New QR codes assigned to projects
- ✅ QR code editing (name change) working
- ✅ QR code deletion (soft delete) working
- ✅ Project creation and management
- ✅ All API endpoints working
- ✅ No TypeScript compilation errors
- ✅ Clean UI with proper cursor states and input contrast

### Before Production Deployment:
- [ ] Create production database backup
- [ ] Test migration on production data copy
- [ ] Verify existing production QR codes still functional
- [ ] Test backfill scripts for existing data
- [ ] **CRITICAL**: Domain Preservation Verification
  - [ ] Run `npm run backfill:clients` on production copy to verify existing domains preserved
  - [ ] Verify existing custom domains (`links.enigma47.mx`, `links.tovimx.dev`) remain intact
  - [ ] Confirm existing domains maintain their `primary` and `verified` status
  - [ ] Test that existing QR codes remain assigned to correct domains
  - [ ] Verify domain management UI shows existing domains correctly
- [ ] Verify domain DNS settings remain intact (no changes to DNS records needed)
- [ ] Performance testing with production data volume
- [ ] Security review of new endpoints

### After Production Deployment:
- [ ] Verify existing QR codes redirect properly
- [ ] **CRITICAL**: Test custom domain QR codes still redirect properly
- [ ] Confirm all scan analytics preserved
- [ ] Test domain management tab in new UI
- [ ] Verify domain DNS verification still works
- [ ] Test new project creation
- [ ] Verify QR code CRUD operations
- [ ] Monitor error logs for 24 hours
- [ ] User acceptance testing

## Environment Restoration

To switch back to production environment:
```bash
# Restore production environment
cp .env.local.production .env.local
npm run dev
```

To return to development:
```bash
# Development environment (current setup)
DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_dev"
DIRECT_DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_dev"
```

## Contact Information

**Developer**: tovimx  
**Migration Start**: 2025-08-30  
**Development Completion**: 2025-08-30  
**Production Deployment**: Ready for Phase 2

## Implemented Features

### ✅ Multi-Project Management
- Project creation with validation (max 10 projects per client)
- Project selection via dropdown in header
- Automatic default project creation
- Project statistics (QR count, total scans)

### ✅ Enhanced QR Code Management
- **Create**: Modal dialog asks for QR code name with optional input
- **Read**: Clean grid/list view inspired by Linear/Notion design
- **Update**: Edit QR name via ellipsis menu dropdown
- **Delete**: Soft deletion with confirmation dialog and blurred backdrop

### ✅ UI/UX Improvements
- Simplified dashboard replacing workflow stages
- Proper button cursor states globally
- High contrast input text colors
- Blurred modal backdrops instead of solid overlays
- Search functionality for QR codes
- Responsive grid/list view toggle

### ✅ Database Schema
- `Project` model with client relationship
- `QRCode.projectId` foreign key (optional, nullable)
- Soft deletion support maintained
- Proper cascade relationships
- Migration: `20250830025022_add_project_support`

### ✅ Domain Preservation Strategy
**IMPORTANT**: This migration is **additive only** - it preserves all existing domain functionality:

- **Existing Custom Domains**: All current domains (`links.enigma47.mx`, `links.tovimx.dev`) remain unchanged
- **Domain Settings**: Primary/verified status, DNS configurations remain intact
- **QR Code Assignments**: Existing QR codes maintain their domain associations
- **Backfill Protection**: Script only creates domains if none exist (using `upsert` with `where: { hostname }`)
- **No DNS Changes**: Your existing DNS records continue working as-is
- **Zero Downtime**: Domain redirects work throughout migration process

---

**🎯 STATUS**: Development phase complete and ready for production testing. All core functionality implemented and tested in local environment.