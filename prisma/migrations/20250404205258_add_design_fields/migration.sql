/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `originalImage` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `resultImage` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreditPurchase" DROP CONSTRAINT "CreditPurchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_userId_fkey";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "completedAt",
DROP COLUMN "error",
DROP COLUMN "name",
DROP COLUMN "originalImage",
DROP COLUMN "resultImage",
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "predictionId" TEXT,
ADD COLUMN     "resultUrl" TEXT,
ADD COLUMN     "roomType" TEXT,
ALTER COLUMN "style" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
