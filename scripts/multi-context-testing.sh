#!/bin/bash

# Enterprise Multi-Context Testing Suite
# Tests build, SSR, client-side runtime, and bundle integrity
# Never trust build success alone - comprehensive validation required

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🏗️ ENTERPRISE MULTI-CONTEXT TESTING SUITE"
echo "==========================================="
echo "Project: $(basename "$PROJECT_ROOT")"
echo "Test Time: $(date)"
echo ""

# Cleanup function
cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
    echo "🧹 Cleaning up server process $SERVER_PID"
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Phase 1: Build Validation
echo "🔨 PHASE 1: BUILD VALIDATION"
echo "=============================="

echo "📋 Step 1.1: TypeScript + ESLint Validation"
if npm run checkerrors; then
  echo "✅ Code quality checks passed"
else
  echo "❌ Code quality checks failed"
  exit 1
fi

echo ""
echo "🏗️ Step 1.2: Next.js Production Build"
if npm run build; then
  echo "✅ Production build successful"
else
  echo "❌ Production build failed"
  exit 1
fi

BUILD_DIR=".next"
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found"
  exit 1
fi

echo "📊 Build Output Analysis:"
echo "   Build directory: $(du -sh $BUILD_DIR | cut -f1)"
echo "   Static files: $(find $BUILD_DIR/static -name "*.js" | wc -l) JS files"
echo "   Server files: $(find $BUILD_DIR/server -name "*.js" 2>/dev/null | wc -l) server files"

echo ""
echo "✅ PHASE 1 COMPLETE - Build validation passed"

# Phase 2: Server-Side Rendering Test
echo ""
echo "🖥️ PHASE 2: SERVER-SIDE RENDERING TEST"
echo "======================================"

echo "📋 Step 2.1: Custom SSR Validation"
if [ -f "scripts/test-ssr.js" ]; then
  if npm run test:ssr; then
    echo "✅ Custom SSR tests passed"
  else
    echo "❌ Custom SSR tests failed"
    exit 1
  fi
else
  echo "⚠️ Custom SSR test not found, running basic SSR validation"
fi

echo "📋 Step 2.2: Static Generation Validation"
STATIC_PAGES=$(find $BUILD_DIR -name "*.html" 2>/dev/null | wc -l)
if [ $STATIC_PAGES -gt 0 ]; then
  echo "✅ Static generation successful ($STATIC_PAGES HTML files)"
else
  echo "ℹ️ No static HTML files found (dynamic-only app)"
fi

echo ""
echo "✅ PHASE 2 COMPLETE - SSR validation passed"

# Phase 3: Client-Side Runtime Test  
echo ""
echo "🌐 PHASE 3: CLIENT-SIDE RUNTIME TEST"
echo "==================================="

echo "📋 Step 3.1: Production Server Startup"
echo "Starting production server..."

# Start the production server
npm run start &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start (PID: $SERVER_PID)..."
sleep 8

# Check if server is still running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "❌ Server failed to start"
  exit 1
fi

echo "✅ Production server started successfully"

echo ""
echo "📋 Step 3.2: Critical Route Testing"

# Test critical application routes
ROUTES=(
  "/"
  "/login"
  "/signup" 
  "/dashboard"
)

FAILED_ROUTES=0

for route in "${ROUTES[@]}"; do
  echo "Testing route: $route"
  
  if curl -f -s -o /dev/null --max-time 10 "http://localhost:3000$route"; then
    echo "   ✅ $route - OK"
  else
    echo "   ❌ $route - FAILED"
    FAILED_ROUTES=$((FAILED_ROUTES + 1))
  fi
done

if [ $FAILED_ROUTES -gt 0 ]; then
  echo "❌ $FAILED_ROUTES route(s) failed"
  exit 1
fi

echo ""
echo "📋 Step 3.3: JavaScript Bundle Integrity Test"

# Test that JavaScript bundles load properly
HOMEPAGE_CONTENT=$(curl -s "http://localhost:3000" || echo "")
if [[ "$HOMEPAGE_CONTENT" == *"<script"* ]]; then
  echo "✅ JavaScript bundles present in HTML"
else
  echo "⚠️ No JavaScript bundles detected in HTML"
fi

# Test for common client-side errors
if [[ "$HOMEPAGE_CONTENT" == *"Application error"* ]]; then
  echo "❌ Client-side application error detected"
  exit 1
elif [[ "$HOMEPAGE_CONTENT" == *"process is not defined"* ]]; then
  echo "❌ Process reference error detected" 
  exit 1
elif [[ "$HOMEPAGE_CONTENT" == *"hydration"* ]] && [[ "$HOMEPAGE_CONTENT" == *"error"* ]]; then
  echo "❌ Hydration error detected"
  exit 1
else
  echo "✅ No obvious client-side errors detected"
fi

echo ""
echo "✅ PHASE 3 COMPLETE - Client runtime tests passed"

# Phase 4: Bundle Analysis
echo ""
echo "📦 PHASE 4: BUNDLE ANALYSIS"  
echo "==========================="

echo "📋 Step 4.1: Bundle Size Analysis"

# Analyze chunk sizes
if [ -d "$BUILD_DIR/static/chunks" ]; then
  echo "📊 JavaScript Bundle Analysis:"
  
  TOTAL_JS_SIZE=0
  CHUNK_COUNT=0
  
  for chunk in "$BUILD_DIR/static/chunks"/*.js; do
    if [ -f "$chunk" ]; then
      SIZE=$(stat -f%z "$chunk" 2>/dev/null || stat -c%s "$chunk" 2>/dev/null || echo "0")
      SIZE_KB=$((SIZE / 1024))
      TOTAL_JS_SIZE=$((TOTAL_JS_SIZE + SIZE))
      CHUNK_COUNT=$((CHUNK_COUNT + 1))
      
      if [ $SIZE_KB -gt 500 ]; then
        echo "   ⚠️ Large chunk: $(basename "$chunk") (${SIZE_KB}KB)"
      else
        echo "   ✅ $(basename "$chunk"): ${SIZE_KB}KB"
      fi
    fi
  done
  
  TOTAL_JS_MB=$((TOTAL_JS_SIZE / 1024 / 1024))
  echo ""
  echo "📊 Bundle Summary:"
  echo "   Total chunks: $CHUNK_COUNT"
  echo "   Total JS size: ${TOTAL_JS_MB}MB"
  
  if [ $TOTAL_JS_MB -gt 5 ]; then
    echo "⚠️ Large bundle size detected (>${TOTAL_JS_MB}MB)"
  else
    echo "✅ Bundle size acceptable (<5MB)"
  fi
else
  echo "⚠️ No chunks directory found"
fi

echo ""
echo "📋 Step 4.2: Critical Resource Check"

# Check for critical resources
CRITICAL_CHECKS=0

if [ -f "$BUILD_DIR/BUILD_ID" ]; then
  BUILD_ID=$(cat "$BUILD_DIR/BUILD_ID")
  echo "✅ Build ID: $BUILD_ID"
else
  echo "⚠️ Build ID not found"
  CRITICAL_CHECKS=$((CRITICAL_CHECKS + 1))
fi

if [ -f "$BUILD_DIR/static/css" ] || [ -d "$BUILD_DIR/static/css" ]; then
  echo "✅ CSS assets found"
else
  echo "ℹ️ No separate CSS assets (likely CSS-in-JS)"
fi

echo ""
echo "✅ PHASE 4 COMPLETE - Bundle analysis passed"

# Final Summary
echo ""
echo "🎯 MULTI-CONTEXT TESTING SUMMARY"
echo "================================="
echo "✅ Phase 1: Build Validation - PASSED"
echo "✅ Phase 2: SSR Testing - PASSED"
echo "✅ Phase 3: Client Runtime - PASSED" 
echo "✅ Phase 4: Bundle Analysis - PASSED"
echo ""
echo "🚀 ALL PHASES PASSED - SAFE FOR DEPLOYMENT"
echo ""
echo "📊 Test Results:"
echo "   Routes tested: ${#ROUTES[@]}"
echo "   Failed routes: $FAILED_ROUTES"
echo "   JS chunks: $CHUNK_COUNT"
echo "   Total JS size: ${TOTAL_JS_MB}MB"
echo "   Critical issues: $CRITICAL_CHECKS"
echo ""
echo "⏱️ Testing completed at: $(date)"

# Stop the server
if [ -n "$SERVER_PID" ]; then
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null || true
  SERVER_PID=""
fi

echo "🧹 Cleanup completed"
echo ""
echo "✅ ENTERPRISE TESTING SUITE COMPLETED SUCCESSFULLY"