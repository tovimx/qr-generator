#!/bin/bash

# Vercel Ignore Script - determines if a build should be skipped
# Exit 1 = Skip build, Exit 0 = Proceed with build

echo "🔍 Vercel ignore script running..."
echo "Environment: $VERCEL_ENV"
echo "Branch: $VERCEL_GIT_COMMIT_REF"

# Always build main/master branch (production)
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ] || [ "$VERCEL_GIT_COMMIT_REF" = "master" ]; then
  echo "✅ Building main/master branch"
  exit 0
fi

# For preview deployments, check PR status
if [ "$VERCEL_ENV" = "preview" ] && [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
  echo "🔍 Checking PR #$VERCEL_GIT_PULL_REQUEST_ID status..."
  
  # Check GitHub API for commit status (requires no auth for public repos)
  STATUS_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/commits/$VERCEL_GIT_COMMIT_SHA/status"
  
  echo "📡 Checking: $STATUS_URL"
  
  # Get status state
  STATUS_STATE=$(curl -s "$STATUS_URL" | jq -r '.state // "pending"')
  
  echo "📊 Status: $STATUS_STATE"
  
  case "$STATUS_STATE" in
    "success")
      echo "✅ All checks passed - proceeding with deployment"
      exit 0
      ;;
    "failure" | "error")
      echo "❌ Checks failed - skipping deployment"
      echo "Push a new commit after fixing issues to trigger new deployment"
      exit 1
      ;;
    "pending" | "null")
      echo "⏳ Checks pending - skipping deployment"
      echo "Deployment will be triggered automatically when checks complete"
      exit 1
      ;;
    *)
      echo "❓ Unknown status ($STATUS_STATE) - proceeding with caution"
      exit 0
      ;;
  esac
else
  echo "✅ No PR context or direct branch push - proceeding"
  exit 0
fi