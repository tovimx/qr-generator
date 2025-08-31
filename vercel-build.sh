#!/bin/bash

# Exit on any error
set -e

echo "🔍 Checking GitHub PR status..."

# Check if we're on a PR branch (Vercel sets VERCEL_GIT_COMMIT_REF to the branch name)
if [ "$VERCEL_ENV" = "preview" ]; then
  echo "📋 Preview deployment detected for branch: $VERCEL_GIT_COMMIT_REF"
  
  # Get PR number if available
  if [ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
    echo "🔍 Checking PR #$VERCEL_GIT_PULL_REQUEST_ID status..."
    
    # Use GitHub API to check PR status
    PR_STATUS=$(curl -s -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID/commits/$VERCEL_GIT_COMMIT_SHA/status" \
      | jq -r '.state // "pending"')
    
    echo "📊 PR Status: $PR_STATUS"
    
    if [ "$PR_STATUS" = "failure" ]; then
      echo "❌ GitHub checks are failing. Skipping deployment."
      echo "To deploy anyway, push a new commit or re-run the checks."
      exit 0  # Exit successfully but skip build
    elif [ "$PR_STATUS" = "pending" ]; then
      echo "⏳ GitHub checks are still pending. Skipping deployment."
      echo "Deployment will retry automatically when checks complete."
      exit 0  # Exit successfully but skip build
    fi
    
    echo "✅ GitHub checks passed. Proceeding with deployment."
  else
    echo "⚠️  No PR detected, proceeding with deployment."
  fi
else
  echo "🚀 Production deployment detected, proceeding."
fi

echo "🏗️  Starting build process..."
npm run build