const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client")
const authenticateUser = require("./authMiddleware");
const prisma = new PrismaClient();
//import Firebase Admin SDK, initialised in "firebaseAdmin.js"
const admin = require('./firebaseAdmin');

let io;

//All the code in this file was written without assistance 

//method to initialize the socket 
const initializeSocket = server => {
    //create a new server instance
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    //middleware to authenticate users
    io.use(async(socket, next) => {
        //retrieve the token from the client's request
        const token = socket.handshake.auth.token
        try{
            //case token exists
            if(token) {
                const decodedToken = await admin.auth().verifyIdToken(token)
                //store the decoded token (user)
                socket.request.user = decodedToken
                //establish connection
                next()
            }else{
                next(new Error("Authentication failed"))
            }
        }catch(err){
            //log errors
            console.log(err)
        }
        
    });

    //set up event listeners for the socket connection
    io.on("connection", socket => {
        //get the authenticated user
        const user = socket.request.user;

        //join user to a room
        socket.join(user.uid)

        //event listener for joining a chat room
        socket.on("joinRoom", roomId => {
            //join the room with the provided room id
            socket.join(roomId)
        })

        //event listener for sending messages to another user
        socket.on("sendMessage", async(message) => {
            try{
                //create message in the database
                const newMessage = await prisma.message.create({
                    data: {
                        senderUid: user.uid,
                        receiverUid: message.receiverUid,
                        content: message.content,
                    }
                })

                //emit message to the receiver's room
                io.to(message.receiverUid).emit("receiveMessage", newMessage)
                //emit message to the sender's room
                io.to(user.uid).emit("receiverMessage", newMessage)
            }catch(err){
                //log errors
                console.log(err)
            }
        })

        //event listener to fetch pending friend requests
        socket.on("getPendingFriendRequests", async() => {
            try{
                //fetch pending friend requests
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
                                profileThumbnailUrl: true,
                            }
                        }
                    }
                })
                //send pending friend requests to the client
                socket.emit("pendingFriendRequests", pendingRequests)
            } catch(err) {
                //log errors
                console.log(err)
            }
        })

        //event listener to notify that the accuracy of a meal log is ready to be reviewed
        socket.on("accuracyReviewNotification", ({mealLogId, userUid}) => {
            //send notification to the user
            io.to(userUid).emit("notifyAccuracyReview", {
                message: "A new meal log is available to be reviewed.",
                mealLogId
            })
        })

        //event listener to get the meal logs with a pending accuracy review
        socket.on("getPendingMealLogs", async() => {
            try{
                //fetch logs that have not been reviewed yet
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
                
                //calculate time left before the log can be reviewed - set to 1 min so web app can be tested by marker
                const notReadyToReview = mealLogs.map(log => {
                    const timeElapsed = Date.now() - new Date(log.createdAt).getTime();
                    //subtract the time elapsed from 1 minute (for testing purposes, users can set the accuracy rating after 1 minute instead of 4 hours)
                    const timeLeft = 60000 - timeElapsed
                    
                    //return the log data
                    return {
                        id: log.id,
                        mealName: log.meal.name,
                        mealId: log.mealId,
                        timeLeft: timeLeft > 0 ? timeLeft : 0,
                        reviewAvailable: timeLeft <= 0,
                    }
                })
                
                //send the pending meal logs to the client
                socket.emit("pendingMealLogs", notReadyToReview)
            }catch(err){
                //log errors
                console.log(err)
            }
        })

        socket.on("disconnect", () => {
            //console.log("user disconnected")
        })
    })
}

//method to send a notification to a user when a friend request is created
const notifyUserNewReq = (recipientUid, friendRequest) => {
    //loop through all the connected sockets
    for(let [id, socket] of io.of("/").sockets) {
        //check if the socket's user matches the recipient of the friend request
        if(socket.request.user && socket.request.user.uid === recipientUid ) {
            //send a notification to recipient
            socket.emit("newFriendRequest", friendRequest);
            break
        }
    }
}


//
module.exports = { initializeSocket, notifyUserNewReq,io}