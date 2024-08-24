const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client")
const authenticateUser = require("./authMiddleware");
const prisma = new PrismaClient();
//import Firebase Admin SDK, initialised in "firebaseAdmin.js"
const admin = require('./firebaseAdmin');

let io;

const initializeSocket = server => {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.use(async(socket, next) => {
        //retrieve the token from the client's request
        const token = socket.handshake.auth.token
        // console.log("LOGGING TOKEN SERVER...")
        // console.log("SERVER TOKEN: ", token);
        // console.log("TOKEN LOGGED SERVER...")
        try{
            //case token exists
            if(token) {
                const decodedToken = await admin.auth().verifyIdToken(token)
                //console.log("here token", token)
                socket.request.user = decodedToken
                //console.log("socker req user", socket.request.user)
                next()
            }else{
                next(new Error("Authentication failed"))
            }
        }catch(err){
            console.log(err)
        }
        
    });

    io.on("connection", socket => {
        //console.log("USER CONNECTED")

        const user = socket.request.user;

        //join user to a room
        socket.join(user.uid)

        socket.on("joinRoom", roomId => {
            socket.join(roomId)
            console.log("room joined", roomId)
        })

        socket.on("sendMessage", async(message) => {
            try{
                const newMessage = await prisma.message.create({
                    data: {
                        senderUid: user.uid,
                        receiverUid: message.receiverUid,
                        content: message.content,
                    }
                })

                io.to(message.receiverUid).emit("receiveMessage", newMessage)
                io.to(user.uid).emit("receiverMessage", newMessage)
            }catch(err){
                console.log(err)
            }
        })

        socket.on("getPendingFriendRequests", async() => {
            //console.log("running-3")
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
                //console.log("requests", pendingRequests)
                socket.emit("pendingFriendRequests", pendingRequests)
            } catch(err) {
                console.log(err)
            }
        })

        socket.on("accuracyReviewNotification", ({mealLogId, userUid}) => {
            io.to(userUid).emit("notifyAccuracyReview", {
                message: "A new meal log is available to be reviewed.",
                mealLogId
            })
        })

        socket.on("getPendingMealLogs", async() => {
            try{

                const mealLogs = await prisma.mealLog.findMany({
                    where: {
                        userUid: user.uid,
                        rating: "PENDING"
                    },
                    select: {
                        id: true,
                        mealId: true,
                        meal: {
                            select:{
                                name: true,
                            }
                        },
                        createdAt: true
                    }
                })
                console.log("returned meals: ", mealLogs)
                const notReadyToReview = mealLogs.map(log => {
                    const timeElapsed = Date.now() - new Date(log.createdAt).getTime();
                    //subtract the time elapsed from 1 minute (for testing purposes, users can set the accuracy rating after 1 minute instead of 4 hours)
                    const timeLeft = 60000 - timeElapsed
                    
                    return {
                        id: log.id,
                        mealName: log.meal.name,
                        mealId: log.mealId,
                        timeLeft: timeLeft > 0 ? timeLeft : 0,
                        reviewAvailable: timeLeft <= 0,
                    }
                })
    
                socket.emit("pendingMealLogs", notReadyToReview)
            }catch(err){
                console.log(err)
            }
        })

        socket.on("disconnect", () => {
            console.log("user disconnected")
        })
    })
}

const notifyUserNewReq = (recipientUid, friendRequest) => {
    //console.log("notifying user...", recipientUid, friendRequest)
    //loop through all the connected sockets
    for(let [id, socket] of io.of("/").sockets) {
        //console.log(`Socket id: ${id}, user id: ${socket.request.user} and rest: ${socket.request.user.uid}`)
        //check if the socket's user matches the recipient of the friend request
        if(socket.request.user && socket.request.user.uid === recipientUid ) {
            //console.log("socket found")
            //send a notification to recipient
            socket.emit("newFriendRequest", friendRequest);
            break
        }
    }
}


//
module.exports = { initializeSocket, notifyUserNewReq, io}