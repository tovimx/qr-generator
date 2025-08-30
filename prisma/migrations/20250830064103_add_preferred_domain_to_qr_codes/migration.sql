-- AlterTable
ALTER TABLE "public"."qr_codes" ADD COLUMN     "preferredDomainId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_preferredDomainId_fkey" FOREIGN KEY ("preferredDomainId") REFERENCES "public"."domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
