const { PrismaClient } = require("@prisma/client");

//All the code in this file was written without assistance 

const prisma = new PrismaClient();

async function resetData() {
    try {
        await prisma.$executeRaw`TRUNCATE TABLE "MealLog", "Meal", "Restaurant", "Message", "Friendship", "User" RESTART IDENTITY CASCADE`

    } catch (err) {
        console.log(err)
    } finally {
        await prisma.$disconnect();
    }
}

resetData()
