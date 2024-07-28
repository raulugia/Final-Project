const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client")
const authenticateUser = require("./authMiddleware");
const prisma = new PrismaClient();
//import Firebase Admin SDK, initialised in "firebaseAdmin.js"
const admin = require('./firebaseAdmin');

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
    io.use(async(socket, next) => {
        //retrieve the token from the client's request
        const token = socket.handshake.auth.token

        //case token exists
        if(token) {
            const decodedToken = await admin.auth().verifyIdToken(token)
            socket.request.user = decodedToken
            console.log("socker req user", socket.request.user)
            next()
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

const notifyUserNewReq = (recipientUid, friendRequest) => {
    console.log("notifying user...", recipientUid, friendRequest)
    //loop through all the connected sockets
    for(let [id, socket] of io.of("/").sockets) {
        console.log(`Socket id: ${id}, user id: ${socket.request.user} and rest: ${socket.request.user.uid}`)
        //check if the socket's user matches the recipient of the friend request
        if(socket.request.user && socket.request.user.uid === recipientUid ) {
            console.log("socket found")
            //send a notification to recipient
            socket.emit("newFriendRequest", friendRequest);
            break
        }
    }
}
//
module.exports = { initializeSocket, notifyUserNewReq,io}