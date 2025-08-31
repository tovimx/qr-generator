-- Add missing design fields to QRCode model
ALTER TABLE "qr_codes" ADD COLUMN "card_style" VARCHAR(20) NOT NULL DEFAULT 'floating';
ALTER TABLE "qr_codes" ADD COLUMN "avatar_style" VARCHAR(20) NOT NULL DEFAULT 'circle';
ALTER TABLE "qr_codes" ADD COLUMN "custom_title" TEXT;
ALTER TABLE "qr_codes" ADD COLUMN "show_title" BOOLEAN NOT NULL DEFAULT true;