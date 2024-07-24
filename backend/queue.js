//import the bull library which will be used for creating and managing queues
const Queue = require("bull")
//import redis configuration settings
const { redisConfig } = require("./config")

//create a new job called "image-processing"
const imageQueue = new Queue("image-processing", { redis: redisConfig })
//
const imageUpdateQueue = new Queue("image-update", { redis: redisConfig })

//export the imageQueue instance
module.exports = { imageQueue, imageUpdateQueue }


