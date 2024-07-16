const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client")
const authenticateUser = require("./authMiddleware");
const prisma = new PrismaClient();

let io;

const initializeSocket = server => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token
        if(token) {
            authenticateUser({ headers: { authorization: `Bearer ${token}`}}, null, next)
                .then(() => {
                    socket.request.user = socket.request.user || {};
                    socket.request.user = socket.request.user;
                    next()
                })
                .catch(err => next(err))
        }else{
            next(new Error("Authentication failed"))
        }
    });

    io.on("connection", socket => {
        console.log("USER CONNECTED")

        const user = socket.request.user;

        socket.on("getPendingFriendRequests", async() => {
            try{
                const pendingRequests = await prisma.friendRequest.findMany({
                    where: { 
                        receiverUid: user.uid,
                        status: "PENDING"
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                username: true,
                            }
                        }
                    }
                })

                socket.emit("pendingFriendRequests", pendingRequests)
            } catch(err) {
                console.log(err)
            }
        })

        socket.on("disconnect", () => {
            console.log("user disconnected")
        })
    })
}

module.exports = { initializeSocket, io}