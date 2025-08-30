/*
  Warnings:

  - Made the column `projectId` on table `qr_codes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."qr_codes" DROP CONSTRAINT "qr_codes_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."qr_codes" ALTER COLUMN "projectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
