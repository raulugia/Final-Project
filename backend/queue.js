const Queue = require("bull")
const IORedis = require("ioredis")


const redisConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    path: process.env.REDIS_PASSWORD,
}

const imageQueue = new Queue("image-processing", { redis: redisConfig })

module.exports = { imageQueue }