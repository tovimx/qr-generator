#!/bin/bash

# Install Git Hooks for Next.js Architectural Safety
# Run this script once to set up automatic validation

echo "🔧 Installing Git Hooks for Next.js Architecture Safety..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Running Next.js Architecture Validation (pre-commit)..."

# Run architectural validation
npm run validate:nextjs

if [ $? -ne 0 ]; then
    echo ""
    echo "🚨 COMMIT BLOCKED: Next.js architectural violations detected!"
    echo "❌ Fix the violations above before committing."
    echo "💡 Run 'npm run validate:nextjs' to see detailed errors."
    echo ""
    exit 1
fi

echo "✅ Next.js architecture validation passed!"
exit 0
EOF

# Make pre-commit hook executable
chmod +x .git/hooks/pre-commit

# Create pre-push hook for comprehensive validation
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🔍 Running Comprehensive Validation (pre-push)..."

# Run full validation suite
npm run validate:all
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
    echo ""
    echo "🚨 PUSH BLOCKED: Critical validation errors detected!"
    echo "❌ Fix all errors before pushing to remote."
    echo ""
    exit 1
fi

# Run production build test
echo "🏗️ Testing production build..."
npm run build > /dev/null 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
    echo ""
    echo "🚨 PUSH BLOCKED: Production build failed!"
    echo "❌ Run 'npm run build' to see build errors."
    echo ""
    exit 1
fi

echo "✅ All validations passed! Safe to push."
exit 0
EOF

# Make pre-push hook executable  
chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 Installed hooks:"
echo "  • pre-commit: Validates Next.js architecture"
echo "  • pre-push: Full validation + production build test"
echo ""
echo "🔧 To test the hooks manually:"
echo "  npm run validate:nextjs  # Architecture validation"
echo "  npm run validate:all     # Complete validation suite"