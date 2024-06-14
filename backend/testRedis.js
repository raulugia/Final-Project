require("dotenv").config();
const Redis = require('ioredis')
const { redisConfig } = require('./config')

const redis = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
})

redis.on("connect", () => {
    console.log("Connected")
})

redis.on("error", (err) => {
    console.error("Connection error: ", err)
})