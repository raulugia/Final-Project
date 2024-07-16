/*
  Warnings:

  - You are about to drop the column `receiverId` on the `FriendRequest` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `FriendRequest` table. All the data in the column will be lost.
  - You are about to drop the column `friendId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `MealLog` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userUid,friendUid]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverUid` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUid` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `friendUid` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userUid` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userUid` to the `MealLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverUid` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUid` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropIndex
DROP INDEX "Friendship_userId_friendId_key";

-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "receiverUid" TEXT NOT NULL,
ADD COLUMN     "senderUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "friendId",
DROP COLUMN "userId",
ADD COLUMN     "friendUid" TEXT NOT NULL,
ADD COLUMN     "userUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MealLog" DROP COLUMN "userId",
ADD COLUMN     "userUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "receiverUid" TEXT NOT NULL,
ADD COLUMN     "senderUid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userUid_friendUid_key" ON "Friendship"("userUid", "friendUid");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendUid_fkey" FOREIGN KEY ("friendUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderUid_fkey" FOREIGN KEY ("senderUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverUid_fkey" FOREIGN KEY ("receiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUid_fkey" FOREIGN KEY ("senderUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverUid_fkey" FOREIGN KEY ("receiverUid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
