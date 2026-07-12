-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('maker', 'hunter');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pinnedPosition" INTEGER,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "linkedin" TEXT;

-- CreateTable
CREATE TABLE "ProductMaker" (
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'maker',

    CONSTRAINT "ProductMaker_pkey" PRIMARY KEY ("productId","userId")
);

-- AddForeignKey
ALTER TABLE "ProductMaker" ADD CONSTRAINT "ProductMaker_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMaker" ADD CONSTRAINT "ProductMaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
