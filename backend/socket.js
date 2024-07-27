const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client")
const authenticateUser = require("./authMiddleware");
const prisma = new PrismaClient();

let io;

const initializeSocket = server => {
    console.log("running-1")
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });
    console.log("running-2")
    io.use((socket, next) => {
        //retrieve the token from the client's request
        const token = socket.handshake.auth.token

        //case token exists
        if(token) {
            //verify the token
            authenticateUser({ headers: { authorization: `Bearer ${token}`}}, null, next)
                .then(() => {
                    //if the token is valid, the user information is attached to socket.request.user
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
            console.log("running-3")
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
                console.log("requests", pendingRequests)
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
//
module.exports = { initializeSocket, io}