const Queue = require("bull")
const { redisConfig } = require("./config")

const imageQueue = new Queue("image-processing", { redis: redisConfig })

module.exports = { imageQueue }


