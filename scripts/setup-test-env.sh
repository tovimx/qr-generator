#!/bin/bash

# Setup script for E2E testing environment
# This script sets up the test database and environment variables needed for E2E tests

echo "🧪 Setting up E2E testing environment..."

# Check if PostgreSQL is running
if ! brew services list | grep -q "postgresql@16.*started"; then
    echo "⚠️  PostgreSQL is not running. Starting PostgreSQL..."
    npm run db:start
    sleep 3
fi

# Create test database if it doesn't exist
echo "📊 Setting up test database..."
createdb -h localhost -p 5432 qr_generator_test 2>/dev/null || echo "Database qr_generator_test already exists"

# Create .env.local for testing if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local for testing..."
    cat > .env.local << EOF
# Test environment variables for E2E testing
NEXT_PUBLIC_SUPABASE_URL="https://test.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="test-anon-key"
DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test"
DIRECT_DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test"
EOF
fi

# Push database schema
echo "🏗️  Setting up database schema..."
DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test" DIRECT_DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test" npx prisma db push

echo "✅ E2E testing environment setup complete!"
echo "🧪 You can now run tests with: npm test"