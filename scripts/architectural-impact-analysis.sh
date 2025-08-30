#!/bin/bash

# Architectural Impact Analysis Script
# Analyzes the potential impact of changes before implementation

set -e

TARGET_FILE="$1"
CHANGE_TYPE="$2"

if [ -z "$TARGET_FILE" ] || [ -z "$CHANGE_TYPE" ]; then
  echo "Usage: $0 <target-file> <change-type>"
  echo "Change types: use-client-removal, provider-change, env-utility, core-library"
  exit 1
fi

echo "🔍 ARCHITECTURAL IMPACT ANALYSIS"
echo "Target: $TARGET_FILE"
echo "Change Type: $CHANGE_TYPE"
echo "=================================="

# 1. Dependency Analysis
echo ""
echo "1. DEPENDENCY ANALYSIS"
echo "----------------------"

echo "📁 Files importing target:"
grep -r "from.*$(basename "$TARGET_FILE" .ts)\|import.*$(basename "$TARGET_FILE" .ts)" src/ || echo "  No imports found"

echo ""
echo "📦 What target imports:"
if [ -f "$TARGET_FILE" ]; then
  grep -E "^import|^from" "$TARGET_FILE" || echo "  No imports found"
else
  echo "  File not found: $TARGET_FILE"
fi

# 2. High-Risk Pattern Detection
echo ""
echo "2. HIGH-RISK PATTERN DETECTION"
echo "------------------------------"

case "$CHANGE_TYPE" in
  "use-client-removal")
    echo "⚠️  'use client' removal detected - HIGH RISK"
    echo "   Checking for client-side dependencies..."
    
    # Check if any imports use process.env
    echo "   Process.env usage in imports:"
    if [ -f "$TARGET_FILE" ]; then
      grep -E "import.*from.*env|process\.env" "$TARGET_FILE" || echo "     None found"
    fi
    
    # Check what imports this file and if they're client components
    echo "   Client components importing this:"
    for file in $(grep -l "from.*$(basename "$TARGET_FILE" .ts)\|import.*$(basename "$TARGET_FILE" .ts)" src/**/*.tsx 2>/dev/null || true); do
      if grep -q "'use client'" "$file"; then
        echo "     🔴 CLIENT: $file"
      else
        echo "     🟡 SERVER: $file"
      fi
    done
    ;;
    
  "provider-change")
    echo "⚠️  Provider change detected - HIGH RISK"
    echo "   Checking layout.tsx impact..."
    if grep -q "$(basename "$TARGET_FILE" .ts)" src/app/layout.tsx; then
      echo "     🔴 CRITICAL: Used in root layout"
    fi
    ;;
    
  "env-utility")
    echo "⚠️  Environment utility change - MEDIUM RISK"
    echo "   Checking client-side usage..."
    for file in $(grep -l "ENV\|getEnvVar" src/**/*.ts src/**/*.tsx 2>/dev/null || true); do
      if grep -q "'use client'" "$file"; then
        echo "     🔴 CLIENT USAGE: $file"
      fi
    done
    ;;
esac

# 3. Testing Recommendations
echo ""
echo "3. TESTING RECOMMENDATIONS"
echo "--------------------------"

case "$CHANGE_TYPE" in
  "use-client-removal")
    echo "📋 Required tests:"
    echo "   - npm run build (build compatibility)"
    echo "   - node scripts/test-ssr.js (SSR compatibility)" 
    echo "   - Browser test of all pages using this component"
    echo "   - Check client/server boundary violations"
    ;;
  "provider-change")
    echo "📋 Required tests:"
    echo "   - npm run build"
    echo "   - Full SSR testing"
    echo "   - Browser automation testing"
    echo "   - Performance impact analysis"
    ;;
esac

# 4. Bundle Analysis
echo ""
echo "4. BUNDLE IMPACT ANALYSIS"
echo "------------------------"
if [ -d ".next" ]; then
  echo "📊 Current bundle sizes:"
  du -sh .next/static/chunks/* | head -5
else
  echo "   No build found - run 'npm run build' first"
fi

echo ""
echo "🚨 RISK ASSESSMENT: $(case "$CHANGE_TYPE" in 
  "use-client-removal") echo "HIGH - SSR/Client boundary violation possible" ;;
  "provider-change") echo "HIGH - Root layout architectural change" ;;
  "env-utility") echo "MEDIUM - Environment access pattern change" ;;
  *) echo "UNKNOWN - Manual analysis required" ;;
esac)"

echo ""
echo "⚡ RECOMMENDATION: $(case "$CHANGE_TYPE" in
  "use-client-removal") echo "STOP - Run comprehensive dependency analysis first" ;;
  "provider-change") echo "STOP - Test in staging environment first" ;;
  "env-utility") echo "PROCEED WITH CAUTION - Test client/server contexts" ;;
  *) echo "ANALYZE MANUALLY" ;;
esac)"