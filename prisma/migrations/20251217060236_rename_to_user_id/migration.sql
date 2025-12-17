/*
  Warnings:

  - You are about to drop the column `userId` on the `bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,user_id]` on the table `tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "bookmark" DROP CONSTRAINT "bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_userId_fkey";

-- DropIndex
DROP INDEX "tag_name_userId_key";

-- AlterTable
ALTER TABLE "bookmark" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_user_id_key" ON "tag"("name", "user_id");

-- AddForeignKey
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
