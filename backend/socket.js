const { Server } = require("socket.io");

let io;

const initializeSocket = server => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", socket => {
        console.log("USER CONNECTED")


        socket.on("disconnect", () => {
            console.log("user disconnected")
        })
    })
}

module.exports = { initializeSocket, io}