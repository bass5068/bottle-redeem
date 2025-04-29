/*
  Warnings:

  - You are about to drop the `qRToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scanLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "qRToken";

-- DropTable
DROP TABLE "scanLog";

-- CreateTable
CREATE TABLE "QRToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenStatus" "TokenStatus" NOT NULL DEFAULT 'unused',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_token_key" ON "QRToken"("token");
