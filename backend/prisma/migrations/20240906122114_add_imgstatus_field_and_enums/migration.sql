-- CreateEnum
CREATE TYPE "ImgStatus" AS ENUM ('PROCESSING', 'FAILED', 'COMPLETED');

-- AlterTable
ALTER TABLE "MealLog" ADD COLUMN     "imgStatus" "ImgStatus" NOT NULL DEFAULT 'COMPLETED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imgStatus" "ImgStatus" DEFAULT 'COMPLETED';
