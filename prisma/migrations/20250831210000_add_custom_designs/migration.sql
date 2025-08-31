-- Add custom design fields to QRCode model
ALTER TABLE "qr_codes" ADD COLUMN "theme_id" VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE "qr_codes" ADD COLUMN "primary_color" VARCHAR(7) NOT NULL DEFAULT '#6366f1';
ALTER TABLE "qr_codes" ADD COLUMN "secondary_color" VARCHAR(7) NOT NULL DEFAULT '#8b5cf6';
ALTER TABLE "qr_codes" ADD COLUMN "background_type" VARCHAR(20) NOT NULL DEFAULT 'gradient';
ALTER TABLE "qr_codes" ADD COLUMN "background_value" TEXT;
ALTER TABLE "qr_codes" ADD COLUMN "button_style" VARCHAR(20) NOT NULL DEFAULT 'rounded';
ALTER TABLE "qr_codes" ADD COLUMN "font_family" VARCHAR(50) NOT NULL DEFAULT 'inter';
ALTER TABLE "qr_codes" ADD COLUMN "custom_css" TEXT;
ALTER TABLE "qr_codes" ADD COLUMN "avatar_url" VARCHAR(500);
ALTER TABLE "qr_codes" ADD COLUMN "description" TEXT;
ALTER TABLE "qr_codes" ADD COLUMN "social_links" JSONB;