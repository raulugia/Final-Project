// require("dotenv").config();
// const Redis = require('ioredis')
// const { redisConfig } = require('./config')

// const redis = new Redis({
//     host: redisConfig.host,
//     port: redisConfig.port,
//     password: redisConfig.password,
// })

// redis.on("connect", () => {
//     console.log("Connected")
// })

// redis.on("error", (err) => {
//     console.error("Connection error: ", err)
// })
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetData() {
    try {
        // await prisma.mealLog.deleteMany({});
        // await prisma.meal.deleteMany({});
        // await prisma.restaurant.deleteMany({});
        // await prisma.message.deleteMany({});
        // await prisma.friendship.deleteMany({});
        // await prisma.user.deleteMany({});

        await prisma.$executeRaw`TRUNCATE TABLE "MealLog", "Meal", "Restaurant", "Message", "Friendship", "User" RESTART IDENTITY CASCADE`

    console.log("All tables have been reset.");
    } catch (err) {
        console.log(err)
    } finally {
        await prisma.$disconnect();
    }
}

resetData()
