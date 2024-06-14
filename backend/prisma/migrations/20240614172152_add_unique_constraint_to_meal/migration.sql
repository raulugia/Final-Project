/*
  Warnings:

  - A unique constraint covering the columns `[name,restaurantId]` on the table `Meal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Meal_name_restaurantId_key" ON "Meal"("name", "restaurantId");
