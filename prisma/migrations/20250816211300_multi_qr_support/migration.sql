-- Migration for multi-QR support
-- This removes the unique constraint on userId and adds new fields

-- First, backup existing data relationship
-- Note: This migration assumes existing single QR per user will become the first QR

-- Remove unique constraint on userId (this is done by recreating the index)
DROP INDEX IF EXISTS "qr_codes_userId_key";

-- Add new columns to qr_codes table
ALTER TABLE "qr_codes" 
  ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Update existing QR codes to have a default title if null
UPDATE "qr_codes" SET "title" = 'My QR Code' WHERE "title" IS NULL;

-- Make title non-nullable with default
ALTER TABLE "qr_codes" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "qr_codes" ALTER COLUMN "title" SET DEFAULT 'My QR Code';

-- Create new indexes for multi-QR queries
CREATE INDEX "qr_codes_userId_deletedAt_idx" ON "qr_codes"("userId", "deletedAt");
CREATE INDEX "qr_codes_userId_position_idx" ON "qr_codes"("userId", "position");