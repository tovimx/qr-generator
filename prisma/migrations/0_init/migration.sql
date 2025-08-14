-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."links" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qr_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "redirectType" TEXT NOT NULL DEFAULT 'links',
    "redirectUrl" TEXT,
    "logoSize" INTEGER NOT NULL DEFAULT 30,
    "logoUrl" TEXT,
    "cornerRadius" INTEGER NOT NULL DEFAULT 0,
    "fgColor" TEXT NOT NULL DEFAULT '#000000',
    "logoShape" TEXT NOT NULL DEFAULT 'square',

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scans" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON "public"."qr_codes"("shortCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_userId_key" ON "public"."qr_codes"("userId" ASC);

-- CreateIndex
CREATE INDEX "scans_qrCodeId_createdAt_idx" ON "public"."scans"("qrCodeId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "public"."qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scans" ADD CONSTRAINT "scans_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "public"."qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

