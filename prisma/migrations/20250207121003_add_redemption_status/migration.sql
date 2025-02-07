-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Redemption" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
