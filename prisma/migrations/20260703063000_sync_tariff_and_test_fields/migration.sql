-- CreateEnum
CREATE TYPE "Tariff" AS ENUM ('XAVASKOR', 'AMATEUR', 'ERKATOY');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('FREE', 'PREDICTED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "instruction" TEXT;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "passageCategory" INTEGER,
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tariff" "Tariff" NOT NULL DEFAULT 'XAVASKOR',
ADD COLUMN     "tariffExpiresAt" TIMESTAMP(3);

