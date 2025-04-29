/*
  Warnings:

  - You are about to drop the `QRToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "QRToken";

-- CreateTable
CREATE TABLE "qRToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenStatus" "TokenStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "qRToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scanLog" (
    "id" SERIAL NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "largeBottles" INTEGER NOT NULL,
    "smallBottles" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qRToken_token_key" ON "qRToken"("token");
