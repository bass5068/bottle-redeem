/*
  Warnings:

  - You are about to drop the column `tokenStatus` on the `QRToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QRToken" DROP COLUMN "tokenStatus";

-- DropEnum
DROP TYPE "TokenStatus";
