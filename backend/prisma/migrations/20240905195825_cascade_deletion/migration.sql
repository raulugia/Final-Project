/*
  Warnings:

  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `surname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiverUid_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_senderUid_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friendUid_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userUid_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_userUid_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverUid_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderUid_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "surname" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(25);

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userUid_fkey" FOREIGN KEY ("userUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendUid_fkey" FOREIGN KEY ("friendUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderUid_fkey" FOREIGN KEY ("senderUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverUid_fkey" FOREIGN KEY ("receiverUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUid_fkey" FOREIGN KEY ("senderUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverUid_fkey" FOREIGN KEY ("receiverUid") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
