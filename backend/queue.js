const Queue = require("bull")
const { redisConfig } = require("./config")


// const redisConfig = {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     path: process.env.REDIS_PASSWORD,
// }

const imageQueue = new Queue("image-processing", { redis: redisConfig })

module.exports = { imageQueue }