-- AlterTable
ALTER TABLE "public"."qr_codes" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Project',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_clientId_idx" ON "public"."projects"("clientId");

-- CreateIndex
CREATE INDEX "qr_codes_projectId_deletedAt_idx" ON "public"."qr_codes"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "qr_codes_projectId_position_idx" ON "public"."qr_codes"("projectId", "position");

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
