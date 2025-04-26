-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('unused', 'used', 'expired');

-- CreateTable
CREATE TABLE "QRToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenStatus" "TokenStatus" NOT NULL DEFAULT 'unused',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRToken_token_key" ON "QRToken"("token");
