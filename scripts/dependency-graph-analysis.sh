#!/bin/bash

# Enterprise-Level Dependency Graph Analysis
# Implements Google/Netflix/Microsoft-level change impact analysis

set -e

TARGET_FILE="$1"

if [ -z "$TARGET_FILE" ]; then
  echo "Usage: $0 <target-file>"
  echo "Example: $0 src/lib/query-client.ts"
  exit 1
fi

if [ ! -f "$TARGET_FILE" ]; then
  echo "❌ File not found: $TARGET_FILE"
  exit 1
fi

echo "🏗️ ENTERPRISE DEPENDENCY GRAPH ANALYSIS"
echo "========================================"
echo "Target: $TARGET_FILE"
echo "Analysis Time: $(date)"
echo ""

# Extract basename for pattern matching
BASENAME=$(basename "$TARGET_FILE" .ts)
BASENAME=${BASENAME%.tsx}

# 1. WHO IMPORTS THIS FILE?
echo "📥 DIRECT IMPORT ANALYSIS"
echo "-------------------------"
DIRECT_IMPORTS=()
while IFS= read -r line; do
  [[ -n "$line" ]] && DIRECT_IMPORTS+=("$line")
done < <(grep -l "$BASENAME" src/**/*.{ts,tsx} 2>/dev/null | grep -v "$TARGET_FILE")

if [ ${#DIRECT_IMPORTS[@]} -eq 0 ]; then
  echo "✅ No direct imports found - Safe to modify"
else
  echo "📁 Files directly importing this:"
  for file in "${DIRECT_IMPORTS[@]}"; do
    echo "   $file"
  done
  echo "   Total: ${#DIRECT_IMPORTS[@]} files"
fi

# 2. WHAT DOES THIS FILE IMPORT?
echo ""
echo "📤 OUTBOUND DEPENDENCY ANALYSIS" 
echo "-------------------------------"
if [ -f "$TARGET_FILE" ]; then
  OUTBOUND_DEPS=$(grep -E "^import.*from|^from.*import" "$TARGET_FILE" 2>/dev/null || true)
  if [ -n "$OUTBOUND_DEPS" ]; then
    echo "📦 This file imports:"
    echo "$OUTBOUND_DEPS" | while read -r line; do
      echo "   $line"
    done
  else
    echo "✅ No outbound dependencies"
  fi
else
  echo "❌ Cannot read target file"
fi

# 3. CLIENT/SERVER CONTEXT ANALYSIS
echo ""
echo "🔄 CLIENT/SERVER BOUNDARY ANALYSIS"
echo "-----------------------------------"
CLIENT_FILES=0
SERVER_FILES=0
UNIVERSAL_FILES=0

for file in "${DIRECT_IMPORTS[@]}"; do
  if grep -q "'use client'" "$file" 2>/dev/null; then
    echo "   🔴 CLIENT: $file"
    CLIENT_FILES=$((CLIENT_FILES + 1))
  elif grep -q "'use server'" "$file" 2>/dev/null; then
    echo "   🔵 SERVER: $file"  
    SERVER_FILES=$((SERVER_FILES + 1))
  else
    echo "   ⚪ UNIVERSAL: $file"
    UNIVERSAL_FILES=$((UNIVERSAL_FILES + 1))
  fi
done

echo ""
echo "📊 Context Summary:"
echo "   Client files: $CLIENT_FILES"
echo "   Server files: $SERVER_FILES"
echo "   Universal files: $UNIVERSAL_FILES"

# 4. TRANSITIVE DEPENDENCY CHAIN (3 levels)
echo ""
echo "🔗 TRANSITIVE DEPENDENCY CHAIN"
echo "-------------------------------"
LEVEL2_COUNT=0
LEVEL3_COUNT=0

for file in "${DIRECT_IMPORTS[@]}"; do
  BASENAME_L1=$(basename "$file" .ts)
  BASENAME_L1=${BASENAME_L1%.tsx}
  
  # Find Level 2 dependencies
  LEVEL2_FILES=()
  while IFS= read -r line; do
    [[ -n "$line" ]] && LEVEL2_FILES+=("$line")
  done < <(grep -l "$BASENAME_L1" src/**/*.{ts,tsx} 2>/dev/null | grep -v "$file" | head -3)
  
  if [ ${#LEVEL2_FILES[@]} -gt 0 ]; then
    echo "   📁 $file affects:"
    LEVEL2_COUNT=$((LEVEL2_COUNT + ${#LEVEL2_FILES[@]}))
    
    for l2file in "${LEVEL2_FILES[@]}"; do
      echo "      🔗 $l2file"
      
      # Find Level 3 dependencies  
      BASENAME_L2=$(basename "$l2file" .ts)
      BASENAME_L2=${BASENAME_L2%.tsx}
      
      LEVEL3_FILES=()
      while IFS= read -r line; do
        [[ -n "$line" ]] && LEVEL3_FILES+=("$line")
      done < <(grep -l "$BASENAME_L2" src/**/*.{ts,tsx} 2>/dev/null | grep -v "$l2file" | head -2)
      
      if [ ${#LEVEL3_FILES[@]} -gt 0 ]; then
        LEVEL3_COUNT=$((LEVEL3_COUNT + ${#LEVEL3_FILES[@]}))
        for l3file in "${LEVEL3_FILES[@]}"; do
          echo "         🔗🔗 $l3file"
        done
      fi
    done
  fi
done

# 5. CRITICAL PATH DETECTION
echo ""
echo "🚨 CRITICAL PATH DETECTION"
echo "--------------------------"
CRITICAL_ISSUES=0

# Check if used in layout
for file in "${DIRECT_IMPORTS[@]}"; do
  if [[ "$file" == *"layout.tsx"* ]]; then
    echo "   ❌ CRITICAL: Used in app layout ($file)"
    echo "      Impact: ALL APPLICATION ROUTES"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
  fi
done

# Check if used in providers
for file in "${DIRECT_IMPORTS[@]}"; do
  if [[ "$file" == *"Provider"* ]] || grep -q "Provider" "$file" 2>/dev/null; then
    echo "   ❌ CRITICAL: Used in provider component ($file)"
    echo "      Impact: ENTIRE COMPONENT TREE"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
  fi
done

# Check if used in middleware
for file in "${DIRECT_IMPORTS[@]}"; do
  if [[ "$file" == *"middleware"* ]]; then
    echo "   ❌ CRITICAL: Used in middleware ($file)"
    echo "      Impact: EDGE RUNTIME COMPATIBILITY"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
  fi
done

if [ $CRITICAL_ISSUES -eq 0 ]; then
  echo "   ✅ No critical path issues detected"
fi

# 6. BLAST RADIUS CALCULATION
echo ""
echo "💥 BLAST RADIUS ASSESSMENT"
echo "-------------------------"
TOTAL_AFFECTED=$((${#DIRECT_IMPORTS[@]} + LEVEL2_COUNT + LEVEL3_COUNT))

echo "📊 Impact Metrics:"
echo "   Direct impact: ${#DIRECT_IMPORTS[@]} files"
echo "   Level 2 impact: $LEVEL2_COUNT files"  
echo "   Level 3 impact: $LEVEL3_COUNT files"
echo "   Total affected: $TOTAL_AFFECTED files"

# 7. RISK ASSESSMENT
echo ""
echo "⚠️ RISK ASSESSMENT"
echo "-------------------"

RISK_SCORE=0

# Base risk from direct imports
if [ ${#DIRECT_IMPORTS[@]} -gt 10 ]; then
  RISK_SCORE=$((RISK_SCORE + 3))
elif [ ${#DIRECT_IMPORTS[@]} -gt 5 ]; then
  RISK_SCORE=$((RISK_SCORE + 2))
elif [ ${#DIRECT_IMPORTS[@]} -gt 2 ]; then
  RISK_SCORE=$((RISK_SCORE + 1))
fi

# Mixed context usage risk
if [ $CLIENT_FILES -gt 0 ] && [ $SERVER_FILES -gt 0 ]; then
  echo "🚨 MIXED CLIENT/SERVER USAGE DETECTED"
  RISK_SCORE=$((RISK_SCORE + 3))
fi

# Critical path risk
RISK_SCORE=$((RISK_SCORE + CRITICAL_ISSUES * 2))

# Transitive impact risk
if [ $TOTAL_AFFECTED -gt 20 ]; then
  RISK_SCORE=$((RISK_SCORE + 2))
elif [ $TOTAL_AFFECTED -gt 10 ]; then
  RISK_SCORE=$((RISK_SCORE + 1))
fi

# Risk classification
if [ $RISK_SCORE -ge 7 ]; then
  RISK_LEVEL="🔴 CRITICAL"
  APPROVAL_REQUIRED="SENIOR ARCHITECT + STAGING DEPLOYMENT"
elif [ $RISK_SCORE -ge 4 ]; then
  RISK_LEVEL="🟡 HIGH"
  APPROVAL_REQUIRED="EXPLICIT USER APPROVAL"
elif [ $RISK_SCORE -ge 2 ]; then
  RISK_LEVEL="🟠 MEDIUM"
  APPROVAL_REQUIRED="COMPREHENSIVE TESTING"
else
  RISK_LEVEL="🟢 LOW"
  APPROVAL_REQUIRED="STANDARD TESTING"
fi

echo "🎯 Risk Level: $RISK_LEVEL (Score: $RISK_SCORE)"
echo "📋 Required Approval: $APPROVAL_REQUIRED"

# 8. RECOMMENDATIONS
echo ""
echo "💡 RECOMMENDATIONS"
echo "------------------"

if [ $RISK_SCORE -ge 7 ]; then
  echo "🚫 STOP - Do not proceed without:"
  echo "   1. Senior architect review of this analysis"
  echo "   2. Staging environment deployment and testing"
  echo "   3. Explicit user approval with risk acknowledgment"
  echo "   4. Rollback plan preparation"
elif [ $RISK_SCORE -ge 4 ]; then
  echo "⚠️ PROCEED WITH EXTREME CAUTION:"
  echo "   1. Present this analysis to user for approval"
  echo "   2. Run full multi-context testing suite"
  echo "   3. Consider feature flag for gradual rollout"
elif [ $RISK_SCORE -ge 2 ]; then
  echo "✅ PROCEED WITH CAUTION:"
  echo "   1. Run comprehensive testing (build + SSR + client)"
  echo "   2. Monitor deployment carefully"
else
  echo "✅ SAFE TO PROCEED:"
  echo "   1. Run standard testing protocols"
  echo "   2. Standard deployment process"
fi

echo ""
echo "📊 ANALYSIS COMPLETE"
echo "===================="
echo "Summary: Analyzed $TARGET_FILE with $TOTAL_AFFECTED total file impact"
echo "Risk Level: $RISK_LEVEL"
echo "Next Action: $APPROVAL_REQUIRED"