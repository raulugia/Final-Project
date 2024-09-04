//Load environment variables from .env
require("dotenv").config();

//import modules
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const multer = require("multer");
const { imageQueue, imageUpdateQueue, profilePictureQueue } = require("./queue");
const authenticateUser = require("./authMiddleware");
const { types } = require("pg");
const http = require("http");
const { initializeSocket, notifyUserNewReq} = require("./socket");

//initialize the Prisma client
const prisma = new PrismaClient();

//create an express application
const app = express();

//create HTTP server
const server = http.createServer(app);

//initialize socket.io
initializeSocket(server);

//establish the port for the server
const PORT = process.env.PORT || 5000;

//use cors middleware
app.use(cors());
//use JSON middleware
app.use(express.json());

//configure multer for file uploads using "uploads/" as the destination directory
const upload = multer({ dest: "uploads/" });

//method to check if current user and other user are friends
const isFriend = async(currentUserUid, otherUserUsername) => {
    try{
        //get the other user
        const otherUser = await prisma.user.findUnique({
            where: {
                username: otherUserUsername
            },
            select: {
                uid: true,
                name: true,
                surname: true
            }
        })

        //case the other user exists
        if(otherUser) {
            //get the friendship between current user and other user
            const friendship = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        {
                            userUid: currentUserUid,
                            friendUid: otherUser.uid
                        },
                        {
                            userUid: otherUser.uid,
                            friendUid: currentUserUid
                        }
                    ]
                }
            })
            
            //case users are friends
            if(friendship) {
                return { areFriends: true, otherUserUid: otherUser.uid }
            //case users are not friends
            }else{
                return { areFriends: false, otherUserUid: otherUser.uid, name: otherUser.name, surname: otherUser.surname}
            }
        //case other user is not found    
        }else{
            return { areFriends: false, otherUserUid: null}
        }
        
    }catch(err){
        console.log("error in isFriend" , err)
        throw new Error("Internal server error in isFriend")
    }
    
}

//
app.get("/api/home", authenticateUser, async(req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const offset = (page - 1) * limit


        const logs = await prisma.mealLog.findMany({
            where: { 
                userUid: req.user.uid
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit,
            skip: offset,
            include: {
                meal: {
                    include: {
                        restaurant: true
                    }
                },
            }

        })

        const userData = await prisma.user.findUnique({
            where: {
                uid: req.user.uid
            },
            select: {
                name: true,
                surname: true,
                username: true,
                profilePicUrl: true,
                profileThumbnailUrl: true
            }
        })

        console.log("user data: ", userData)

        const responseLogs = logs.map(log => ({
            logId: log.id,
            mealId: log.meal.id,
            mealName: log.meal.name,
            restaurantName: log.meal.restaurant.name,
            picture: log.picture,
            carbEstimate: log.carbEstimate,
            createdAt: log.createdAt,
            rating: log.rating,
            description: log.description,
            user: userData
        }))

        const response = {logs: responseLogs, user: userData}

        res.json(response)
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for displaying data linked to a certain user
app.get("/api/user/:username", authenticateUser, async(req, res) => {
    try{
        const { username } = req.params
        //find out if users are friends and get the other user's uid
        const { areFriends, otherUserUid, name, surname } = await isFriend(req.user.uid, username)

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5
        const offset = (page - 1) * limit

        if(areFriends){
            console.log("users are friends")
            const otherUserAndMeals = await prisma.user.findUnique({
                where: {
                    username: username
                },
                include: {
                    meals: {
                        orderBy: {
                            createdAt: "desc"
                        },
                        take: limit,
                        skip: offset,
                        include: {
                            meal: {
                                include: {
                                    restaurant: true
                                }
                            }
                        }
                    },
                }
            })

            //get current user meals to find common restaurants
            const currentUserMeals = await prisma.mealLog.findMany({
                where: {
                    userUid: req.user.uid
                },
                include: {
                    meal: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            })

            //create a set of restaurant ids discarding duplicated ids (sets do not allow duplicates)
            const currentUserRestaurantIds = new Set(currentUserMeals.map(log => log.meal.restaurant.id))

            //get common restaurants
            const commonRestaurants = otherUserAndMeals.meals
                //create an array with the other user's restaurants
                .map(log => log.meal.restaurant)
                //create an array of the restaurants that both users have in common
                .filter(restaurant => currentUserRestaurantIds.has(restaurant.id))

                console.log(otherUserAndMeals.meals)
            //create the response object    
            const response = {
                user: {
                    name: otherUserAndMeals.name,
                    surname: otherUserAndMeals.surname,
                    username: otherUserAndMeals.username,
                    profilePicUrl: otherUserAndMeals.profilePicUrl,
                    uid: otherUserAndMeals.uid,
                },
                logs: otherUserAndMeals.meals,
                commonRestaurants,
            }    

            //send response to client
            res.json(response)
        }else{
            console.log("Not friends")
            const isRequestPending = await prisma.friendRequest.findFirst({
                where: {
                    OR: [
                        {
                            senderUid: req.user.uid,
                            receiverUid: otherUserUid,
                            status: "PENDING" || "REJECTED"
                        },
                        {
                            senderUid: otherUserUid,
                            receiverUid: req.user.uid,
                            status: "PENDING" || "REJECTED"
                        }
                    ]
                }
            })
            console.log("current user", req.user)
            let requestStatus = ""
            if(isRequestPending){
                if(isRequestPending.senderUid === req.user.uid){
                    requestStatus = "pending"
                }else if(isRequestPending.receiverUid === req.user.uid){
                    requestStatus = isRequestPending.status === "PENDING" ? "action" : "rejected"
                }
            }

            console.log(isRequestPending)

            res.json({ error: "Users are not friends", name, surname, otherUserUid, requestStatus, requestId: isRequestPending?.id })
        }
    }catch(err){
        console.error(err)
        return res.status(500).json({error: "Internal server error"})
    }
    

})

//endpoint for displaying other users' meals
app.get("/api/user/:username/meals", authenticateUser, async(req, res) => {
    //get the other user's username
    const { username } = req.params
    
    try{
        //find out if users are friends and get the other user's uid
        const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

        //case users are friends
        if(areFriends){
            //get the most recent meal logs avoiding duplicates
            const latestLogs = await prisma.mealLog.findMany({
                where: {
                    userUid: otherUserUid
                },
                //make sure only one entry per meal is returned
                distinct: ["mealId"],
                //order results by createdAt in descending order
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id: true,
                    mealId: true
                }
            })

            //get the details needed by the client to display all the other user's meals
            const mealLogs = await prisma.mealLog.findMany({
                where: {
                    id: { in: latestLogs.map(log => log.id)}
                },
                select: {
                    meal: {
                        include: {
                            restaurant: true
                        }
                    },
                    thumbnail: true,
                    id: true,
                }
            })

            //send meals to the client
            res.json(mealLogs)
            }
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for displaying other user's logs linked to a specific meal
app.get("/api/user/:username/meals/:mealId", authenticateUser, async(req, res) => {
    try{
        //extract username, meal id and log id
        const { username, mealId } = req.params
        //find out of users are friends and the other user uid
        const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

        //case users are friends
        if(areFriends){
            const logs = await prisma.mealLog.findMany({
                where: {
                    mealId: Number(mealId),
                    userUid: otherUserUid
                },
                include: {
                    meal: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            })

            res.json(logs)
        } else {
            return res.json( {error: "Users are not friends"})
        }
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for displaying other user's log details
app.get("/api/user/:username/meals/:mealId/log/:logId", authenticateUser, async(req, res) => {
    try{
        //extract username, meal id and log id
        const { username, mealId, logId } = req.params
        //find out of users are friends and the other user uid
        const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

        //case users are friends
        if(areFriends){
            //find the log
            const log = await prisma.mealLog.findUnique({
                where: {
                    id: Number(logId),
                    userUid: otherUserUid
                },
                include: {
                    meal: {
                        select: {
                            name: true,
                            restaurant: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })
            
            //return log to the client
            res.json(log)
        }
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for displaying other users' restaurants
app.get("/api/user/:username/restaurants", authenticateUser, async(req, res) => {
     //get the other user's username
     const { username } = req.params

    try{
        //find out if users are friends and get the other user's uid
        const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

        //case users are friends
        if(areFriends){
            //get the meal logs logged by other user
            const mealLogs = await prisma.mealLog.findMany({
                where: {
                    userUid: otherUserUid
                },
                include: {
                    meal: {
                        include: {
                            restaurant: true
                        }
                    }
                }
            })
    
            //create a new map
            const restaurantsMap = new Map()
            
            //add the restaurants to the map avoiding duplicates
            mealLogs.forEach(log => {
                restaurantsMap.set(log.meal.restaurant.id, log.meal.restaurant)
            })
            
            //convert map into an array
            const uniqueRestaurants = Array.from(restaurantsMap.values())
            
            //return array with other user's restaurants
            res.json(uniqueRestaurants)
        }

    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for displaying other users' friends
app.get("/api/user/:username/friends", authenticateUser, async(req, res) => {
    //get the other user's username
    const { username } = req.params

    try{
        //find out if users are friends and get the other user's uid
        const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

        //case users are friends
        if(areFriends){
            const otherUserFriends = await prisma.user.findUnique({
                where : { 
                    uid: otherUserUid,
                },
                select: {
                    friends: {
                        include: {
                            friend: {
                                //only return id, name, surname and username - email should not be returned
                                select: {
                                    id: true,
                                    name: true,
                                    surname: true,
                                    username: true,
                                },
                            },
                        },
                    },
                    friendOf: {
                        include: {
                            user: {
                                //only return id, name and surname
                                select: {
                                    id: true,
                                    name: true,
                                    surname: true,
                                    username: true,
                                },
                            },
                        },
                    },
                },
            })
    
            if(!otherUserFriends) {
                return res.status(404).json({ error: "User not found" })
            }

            //combine friends and friendsOf
            const friends = [
                ...otherUserFriends.friends.map(data => data.friend),
                ...otherUserFriends.friendOf.map(data => data.user),
            ]
            
            //return array containing other user's friends
            res.json(friends)
        }
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for user registration
app.post("/api/register", upload.single("profilePicUrl"),async (req, res) => {
  //extract email, name and surname from the request body
  const { email, name, surname, username, uid } = req.body;

  try {
    //create a new user in the database with the extracted data
    const user = await prisma.user.create({
      data: {
        email,
        name,
        surname,
        username,
        uid,
        profilePicUrl: "",
        profileThumbnailUrl: "",
      },
    });

    if(req.file) {
        const file  = req.file
        
        await profilePictureQueue.add({
            filePath: file.path,
            userUid: user.uid,
        });
    }

    
    //respond with the new user object
    res.json(user);
  } catch (err) {
    console.log(err)
    //respond with a 400 status code if there was an error
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/update-user/is-unique", authenticateUser,async(req, res) => {
    const { email, username} = req.body

    try{
        if(email){
            const uniqueEmail = await prisma.user.findFirst({
                where: {
                    email: email,
                    NOT: {
                        uid: req.user.uid
                    }
                },
                select: {
                    uid: true
                }
            })

            if(!uniqueEmail){
                return res.status(200).json({ email: "Email is available"})
            }

            return res.status(400).json({emailError: "Email is not available"})
        }

        if(username){
            const uniqueUsername = await prisma.user.findFirst({
                where: {
                    username: username,
                    NOT: {
                        uid: req.user.uid
                    }
                },
                select: {
                    uid: true
                }
            })
            console.log("uniquesuername: ", uniqueUsername)
            if(!uniqueUsername){
                console.log("username unique")
                return res.status(200).json({ username: "Username is available"})
            }

            return res.status(400).json({ usernameError: "Username is not available"})
        }
    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for updating user's data
app.put("/api/update-user", authenticateUser, upload.single("picture"), async(req, res) => {
    try{
        const { name, surname, username, email, profileThumbnailUrl, profilePicUrl} = req.body;
        

        //store only the fields that need updating
        const dataToUpdate = {}
        if(name !== undefined) dataToUpdate.name = name
        if(surname !== undefined) dataToUpdate.surname = surname
        if(username !== undefined) dataToUpdate.username = username
        if(email !== undefined) dataToUpdate.email = email

        //case the user uploaded a new profile picture
        if(req.file) {
            //get the file
            const { file } = req
            
            //trigger the task to process it and update the database
            await profilePictureQueue.add({
                filePath: file.path,
                userUid: req.user.uid,
                oldPictureUrl: profilePicUrl,
                oldThumbnailUrl: profileThumbnailUrl
            //retry up to 3 times if it fails with a 5-second interval. Job must be completed within 2 minutes.
            }, {attempts: 3, backoff: 5000, timeout: 120000})

            //ensure pre-existing urls are deleted
            dataToUpdate.profilePicUrl = ""
            dataToUpdate.profileThumbnailUrl = ""
        }
        
        //update user details in the database
        const updatedUser = await prisma.user.update({
            where: {
                uid: req.user.uid
            },
            data: dataToUpdate,
        })

        //return the updated user
        res.json(updatedUser);
    }catch(err){
        res.status(500).json({ error: "Failed to update user details"})
    }
})

//endpoint for logging a meal
app.post("/api/log-meal", authenticateUser, upload.single("picture"), async (req, res) => {
    //extract the meal information from the request body
    const { mealName, restaurantName, carbEstimate, description } = req.body;
    //extract the picture uploaded by the user
    const picture = req.file;

    try {
      //check if the restaurant already exists in the database using the restaurant name
      let restaurant = await prisma.restaurant.findUnique({
        where: { name: restaurantName },
      });

      //create a new restaurant if it is new
      if (!restaurant) {
        restaurant = await prisma.restaurant.create({
          data: { name: restaurantName },
        });
      }

      //update or create meal based on unique combination name and restaurantId
      const meal = await prisma.meal.upsert({
        //find the meal using the meal name and restaurant id
        where: {
            name_restaurantId: {
                name: mealName,
                restaurantId: restaurant.id
            },
        },
        //update{} is empty as we do not need to do anything if the meal already exists. 
        //Duplicated meals are not allowed
        update: {},
        //create a new meal if it does not exist
        create: {
            name: mealName,
            restaurant: { connect: {id: restaurant.id}}
        }

      })

      //create the meal log entry
      const mealLog = await prisma.mealLog.create({
        data: {
          //associate the meal log with the existing meal   
          meal: { connect:{ id: meal.id }},
          //log the carb estimate, description and rating
          carbEstimate: parseInt(carbEstimate),
          description,
          //associate the meal log with the authenticated user
          user: { connect: { uid: req.user.uid } },
          rating: "PENDING",
          //placeholders - picture and thumbnail will be added in worker.js once 
          //they have been processed
          picture: "",
          thumbnail:"",
        },
      });
      
      //send the response to the client
      res.json(mealLog);

      //add job to queue for image processing
      //as a result, a thumbnail will be created and both the original image and thumbnail will be uploaded to
      //Clodinary and their URLs will be added to the database in Railway
      await imageQueue.add({
        filePath: picture.path,
        mealId: mealLog.id,
        userUid: req.user.uid,
        //retry up to 3 times if it fails with a 5-second interval. Job must be completed within 2 minutes.
      }, {attempts: 3, backoff: 5000, timeout: 120000})

      

    } catch (err) {
        console.log(err)
      //respond with a 400 status code if there was an error  
      res.status(400).json({ error: "There was a problem logging your meal. Please, try again." });
    }
  }
);

//endpoint for updating a log
app.put("/api/my-meals/:mealId/log/:logId", authenticateUser, upload.single("picture"),async(req, res) => {
    console.log("updating...")
    const { mealId, logId } = req.params;
    console.log("params", req.params)
    console.log("body", req.body)
    const { mealName, restaurantName, carbEstimate, description, rating} = req.body
    const picture = req.file
    console.log(picture)

    try{
        //find the existing meal log
        const existingLog = await prisma.mealLog.findUnique({
            where: {
                id: Number(logId),
            },
            include: {
                meal: {
                    include: {
                        restaurant: true
                    }
                }
            }
        })

        if(!existingLog){
            return res.status(404).json({ error: "Meal log not found" })
        }
        console.log("log found: ", existingLog)
        const updatedData = {}

        //case the new meal name is different or the new restaurant is different
        if((mealName && mealName !== existingLog.meal.name) || (restaurantName && restaurantName !== existingLog.meal.restaurant.name)){
            console.log("new meal name: ", mealName)
            //find the restaurant by name or create a new one
            let restaurant = await prisma.restaurant.upsert({
                where: {
                    name: restaurantName
                },
                update: {},
                create: { name: restaurantName }
            })

            console.log("restaurant: ", restaurant)

            //find the meal by name and restaurant id or create a new one
            const meal = await prisma.meal.upsert({
                where: {
                    name_restaurantId: {
                        name: mealName,
                        restaurantId: restaurant.id
                    }
                },
                update: {},
                create: {
                    name: mealName,
                    restaurantId: restaurant.id
                }
            })

            //add the meal id to updatedData
            updatedData.mealId = meal.id
            console.log("updated meal: ", updatedData)
        }

        //case the new carb estimate is different
        if(carbEstimate && carbEstimate !== existingLog.carbEstimate.toString()) {
            console.log("new carb estimate")
            //add the new carb estimate to updatedData
            updatedData.carbEstimate = Number(carbEstimate)
        }

        //case the new description is different
        if(description && description !== existingLog.description.toString()) {
            //add the new description to updatedData
            updatedData.description = description
        }

        //case the new rating is different
        if(rating && rating !== existingLog.rating.toString()) {
            //add the new rating to updatedData
            updatedData.rating = rating
        }

        //case the user uploaded a new picture
        if(picture) {
            console.log("PICTURE IS NEW")
            //set the new picture and thumbnail placeholders
            updatedData.picture = ""
            updatedData.thumbnail = ""
        }

        //update the existing log using the data that was changed
        const updatedLog = await prisma.mealLog.update({
            where: {
                id: Number(logId)
            },
            data: updatedData
        })

        //case the user uploaded a new picture - log has already been updated
        if(picture) {
            console.log("PICTURE IS NEW")
            //add job to queue so a thumbnail is created, picture and thumbnail uploaded to cloudinary and database updated
            await imageUpdateQueue.add({
                filePath: picture.path,
                newLogId: updatedLog.id,
                oldLogId: existingLog.id,
                oldPictureUrl: existingLog.picture,
                oldThumbnailUrl: existingLog.thumbnail,
                //retry up to 3 times if it fails with a 5-second interval. Job must be completed within 2 minutes.
            }, {attempts: 3, backoff: 5000, timeout: 120000})
        }

        const remainingLogs = await prisma.mealLog.findMany({
            where: {
                mealId: Number(existingLog.mealId)
            }
        })

        if(remainingLogs.length === 0) {
            await prisma.meal.delete({
                where: {
                    id: Number(existingLog.mealId)
                }
            })
            console.log("meal deleted", existingLog)
        }

        res.json(updatedLog)
        console.log("response sent")
    }catch(err) {
        return res.status(500).json({ error: "Log could not be updated" })
    }
})

//endpoint for getting the user's account details
app.get("/api/user-data", authenticateUser, async (req, res) => {
    try {
        //get the user's details
        const user = await prisma.user.findUnique({
            where: {
                uid: req.user.uid
            }
        })

        //return an error if the user is not found
        if(!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json(user)

    } catch(err) {
        res.status(500).json({error: "An error occurred while getting your details. Please try again."})
    }
})

//endpoint for getting the user's friends
app.get("/api/friends", authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where : { uid: req.user.uid },
            include: {
                friends: {
                    include: {
                        friend: {
                            //only return id, name, surname, username and profilePicUrl - email should not be returned
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                username: true,
                                profilePicUrl: true,
                                uid: true,
                            },
                        },
                    },
                },
                friendOf: {
                    include: {
                        user: {
                            //only return id, name,  surname, username and profilePicUrl
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                username: true,
                                profilePicUrl: true,
                                uid: true,
                            },
                        },
                    },
                },
            },
        })

        //current user not found
        if(!user) {
            return res.status(404).json({ error: "User not found" })
        }

        //combine friends and friendsOf
        const friends = [
            ...user.friends.map(data => data.friend),
            ...user.friendOf.map(data => data.user),
        ]

        res.json(friends)

    } catch(err) {
        res.status(500).json({error: "An error occurred while getting your friends. Please try again."})
    }
})

//endpoint for getting the user's restaurants
app.get("/api/restaurants", authenticateUser, async(req, res,) => {
    try {
        //get the user's restaurants
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userUid: req.user.uid
            },
            include: {
                meal: {
                    include: {
                        restaurant: true
                    }
                }
            }
        })

        //create a new map
        const restaurantsMap = new Map()
        
        //
        mealLogs.forEach(log => {
            restaurantsMap.set(log.meal.restaurant.id, log.meal.restaurant)
        })
        const uniqueRestaurants = Array.from(restaurantsMap.values())
        
        res.json(uniqueRestaurants)

    } catch(err) {
        res.status(500).json({error: "An error occurred while getting the data. Please try again."})
    }
})

//endpoint for returning all the meals linked to a certain restaurant
app.get("/api/my-restaurants/:restaurantId", authenticateUser, async(req, res) => {
    const { restaurantId } = req.params

    try{
        //get the meals logged by current user and linked to a certain restaurant id - include thumbnail of latest meal log
        const meals = await prisma.meal.findMany({
            where: {
                restaurantId: Number(restaurantId),
                logs: {
                    some: {
                        userUid: req.user.uid
                    }
                }
            },
            //include restaurant and the thumbnail of the most recent log
            include: {
                logs: {
                    where: {
                        userUid: req.user.uid
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1,
                    select: {
                        thumbnail: true
                    }
                },
                restaurant: {
                    select: {
                        name: true
                    }
                }
            }
        })

        //case no meals were found 
        if(meals.length === 0){
            return res.status(404).json({error: "No meals were found for the specified restaurant."})
        }

        //object that will be returned to the client
        const result = meals.map(meal => ({
            mealId: meal.id,
            mealName: meal.name,
            thumbnail: meal.logs[0]?.thumbnail || "",
            restaurantName: meal.restaurant.name,
        }))


        //send response to client
        res.json(result)
    }catch(err){
        //return an error
        res.status(500).json({error: "An error occurred while getting the data. Please try again."})
    }
})

app.get("/api/meals", authenticateUser, async(req, res,) => {
    try{
        //get the most recent meal logs avoiding duplicates
        const latestLogs = await prisma.mealLog.findMany({
            where: {
                userUid: req.user.uid
            },
            //make sure only one entry per meal is returned
            distinct: ["mealId"],
            //order results by createdAt in descending order
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                mealId: true
            }
        })

        //get the details needed by the client to display all the user's meals
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                id: { in: latestLogs.map(log => log.id)}
            },
            select: {
                meal: {
                    include: {
                        restaurant: true
                    }
                },
                thumbnail: true,
                id: true,
            }
        })

        res.json(mealLogs)
    } catch(err) {
        res.status(500).json({error: "An error occurred while getting the data. Please try again."})
    }
})

//endpoint for returning the logs linked to a meal
app.get("/api/meals/:mealId", authenticateUser, async(req, res,) => {
    const { mealId } = req.params;

    try{
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userUid: req.user.uid,
                mealId: Number(mealId)
            },
            include: {
                meal: {
                    include: {
                        restaurant: true
                    }
                }
            }

        })

        //case no logs were found
        if(mealLogs.length === 0) {
            return res.status(404).json({error: "No logs found for the specified meal."})
        }

        //return logs
        res.json(mealLogs)
    } catch(err) {
        console.log(err)
        res.status(500).json({error: "An error occurred while getting the data. Please try again."})
    }
})

//endpoint for getting the details og a meal log submitted by the current user
app.get("/api/my-meals/:mealId/log/:logId", authenticateUser, async(req, res) => {
    const { logId } = req.params

    try{
        //get the log using the provided id and the user's uid
        const log = await prisma.mealLog.findUnique({
            where: {
                id: Number(logId),
                userUid: req.user.uid
            },
            include: {
                user: {
                    select: {
                        name: true,
                        surname: true,
                        username: true,
                        profilePicUrl: true,
                        uid: true
                    }
                },
                meal: {
                    select: {
                        name: true,
                        restaurant: {
                            select: {
                                name: true
                            }
                        },
                        id: true
                    }
                }
            }
        })

        //case log was not found - return an error
        if(!log){
            return res.status(404).json({error: "The specified log could not be found"})
        }

        //return the log details
        res.json(log)
    }catch(err){
        console.error(err)
        return res.status(500).json({error: "The specified log could not be found"})
    }
})

//endpoint to get the restaurants and meals requested by the user
app.get("/api/search", authenticateUser, async(req, res) => {
    const { query } = req.query

    try{
        const meals = await prisma.meal.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive"
                },
                logs: {
                    some: {
                        userUid: req.user.uid
                    },
                },
            },
            include: {
                restaurant: true,
                logs: {
                    where: {
                        userUid: req.user.uid
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    //get only the latest log
                    take: 1,
                }
            }
        })

        //get the restaurants that match the query and have at least one log from the current user
        //this means that the user has been to that restaurant
        const restaurants = await prisma.restaurant.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive"
                },
                meals: {
                    some: {
                        logs: {
                            some: {
                                userUid: req.user.uid
                            },
                        },
                    },
                },
            },
            include: {
                meals: {
                    include: {
                        logs: true
                    }
                }
            }
        })

        const users =  await prisma.user.findMany({
            where : {
                OR: [ {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
                {
                    surname: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
                {
                    username: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
            ]
            },
            //this is needed to know if users are friends 
            include: {
                friends: {
                    where: {
                        friendUid: req.user.uid
                    },
                    select: {
                        id: true
                    }
                },
                friendOf: {
                    where: {
                        userUid: req.user.uid,
                    },
                    select: {
                        id: true,
                    }
                },
                sentRequests: {
                    where: {
                        receiverUid: req.user.uid,
                        status: {in: ["PENDING", "REJECTED"]}
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        senderUid: true,
                        receiverUid: true,
                    }
                },
                receivedRequests: {
                    where: {
                        senderUid: req.user.uid,
                        status: {in: ["PENDING", "REJECTED"]}
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        senderUid: true,
                        receiverUid: true,
                    }
                },
            }
        })

        console.log("USERS: ", users.friendOf)

        const mealResults = [
            ...meals.map(meal => {
                const latestLog = meal.logs[0];
                return {
                    id: meal.id, 
                    mealName: meal.name, 
                    type: "meal", 
                    restaurantName: meal.restaurant.name,
                    carbs: latestLog?.carbEstimate,
                    accuracy: latestLog?.rating,
                    date: latestLog?.createdAt,
                    imgUrl: latestLog?.picture,
                    totalLogs: meal.logs.length
                }
            })
        ]

        const restaurantResults = [
            ...restaurants.map(restaurant => {
                //get the total number of meal logs linked to a restaurant 
                const totalLogs = restaurant.meals.reduce((acc, meal) => acc + meal.logs.length, 0)
                return {
                    id: restaurant.id, 
                    restaurantName: restaurant.name, 
                    type: "restaurant",
                    totalLogs: totalLogs,
                }
            })
        ]

        const userResults = users.map(user => {
            //console.log(`User name: ${user.name} friends of ${JSON.stringify(user)}`)
            //if the length of friends or friendsOf is < 0, users are not friends
            const isFriend = user.friends.length > 0 || user.friendOf.length > 0
            
            //console.log(`User name: ${user.name} received requests ${JSON.stringify(user.receivedRequests)}`)
            let friendRequestStatus = ""
            let requestId = ""

            const combinedRequests = [...user.sentRequests, ...user.receivedRequests].sort((a,b) => b.createdAt - a.createdAt)

            if(combinedRequests.length > 0) {
                const latestRequest = combinedRequests[0]
                console.log("latest req: ", latestRequest)

                if(latestRequest.senderUid === req.user.uid) {
                    friendRequestStatus = "pending"
                    requestId = latestRequest.id
                } else if(latestRequest.receiverUid === req.user.uid) {
                    friendRequestStatus = latestRequest.status === "PENDING" ? "action" : "rejected"
                    requestId = latestRequest.id 
                }
            }
            // //case user sent current user a friend request
            // if(user.sentRequests.length > 0) {
            //     const request = user.sentRequests[0]
            //     //if the status is pending, the friend request will have to be actioned in the client
            //     friendRequestStatus = request.status === "PENDING" ? "action" : "rejected"
            //     requestId = request.id
            // }
            
            // //case current user sent user a friend request
            // if(user.receivedRequests.length > 0) {
            //     const request = user.receivedRequests[0]
            //     //users will not be notified when a friend request is rejected, it will be shown as pending in the client
            //     if(request.status === "PENDING" || request.status === "REJECTED"){
            //         friendRequestStatus = "pending"
            //     }
            //     requestId = request.id
            // }

            return {
                id: user.id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                uid: user.uid,
                type: "user",
                isFriend,
                friendRequestStatus,
                requestId,
            }
        })
        
        const results = [{meals: mealResults}, {restaurants: restaurantResults}, {users: userResults}]

        res.json(results)
    } catch(err) {
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

//endpoint to handle friend requests
app.post("/api/friend-request", authenticateUser, async(req, res) => {
    //get the uid of the user who is receiving the friend request
    const { recipientUid } = req.body;

    try{
        //fetch the user who is sending the friend request
        const sender = await prisma.user.findUnique({
            where: {
                uid: req.user.uid
            }
        });

        //fetch the user who is receiving the friend request
        const recipient = await prisma.user.findUnique({
            where: {
                uid: recipientUid
            }
        });

        //case user who receives the friend request does not exist
        if( !recipient) {
            return res.status(404).json({error: "Recipient user not found"})
        }

        //find existing friend request with the same sender and receiver with a pending or rejected status
        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                senderUid: sender.uid,
                receiverUid: recipient.uid,
                status: "PENDING" || "REJECTED"
            }
        })

        //prevent the creation of duplicated requests by returning an error
        if(existingRequest) {
            return res.status(400).json({ error: "Friend request already sent." })
        }

        //create a new friend request
        const friendRequest = await prisma.friendRequest.create({
            data: {
                sender: { connect: { uid: sender.uid }},
                receiver: {connect: { uid: recipient.uid }},
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

        //send a notification to the recipient
        notifyUserNewReq(recipient.uid, friendRequest)

        //send the response to the client
        res.json(friendRequest)
    } catch(err) {
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for accepting a friend request - update existing friend request status
app.post("/api/friend-request/accept/:requestId", authenticateUser, async(req, res) => {
    const { requestId } = req.params;

    try{
        //fetch the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: Number(requestId) },
            include: {sender: true, receiver: true},
        })

        //return an error if the request does not exist or it is not pending
        if(!friendRequest || friendRequest.status !== "PENDING") {
            return res.status(400).json({ error: "Invalid or already processed request."})
        }

        //await the friend request status to accepted
        await prisma.friendRequest.update({
            where: {id: Number(requestId)},
            data: {status: "ACCEPTED"}
        })

        //create a new friendship
        await prisma.friendship.create({
            data: {
                userUid: friendRequest.receiver.uid,
                friendUid: friendRequest.sender.uid,
            }
        })

        //return a message confirming the friend request has been created
        res.json({ message: "Friend request accepted."})
    } catch(err) {
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for rejecting a friend request
app.post("/api/friend-request/reject/:requestId", authenticateUser, async(req, res) => {
    //extract the friend request id
    const { requestId } = req.params;

    try{
        //fetch the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: Number(requestId) },
        })

        //return an error if the request does not exist or it is not pending
        if(!friendRequest || friendRequest.status !== "PENDING") {
            return res.status(400).json({ error: "Invalid or already processed request."})
        }

        //update the friend request status to rejected - it will always be displayed as pending to the user who sent it
        await prisma.friendRequest.update({
            where: {id: Number(requestId)},
            data: {status: "REJECTED"}
        })

        //return a message to the client indicating that the friend request was rejected
        res.json({ message: "Friend request rejected,"})
    } catch(err) {
        return res.status(500).json({error: "Internal server error"})
    }
})

//endpoint for getting the chat messages between current user and another user indicated by their username
app.get("/api/chat/:username/messages", authenticateUser, async(req, res) => {
    //extract the other user's username
    const { username } = req.params
    
    //extract the elements needed to fetch the right data - infinite scrolling implemented in the client
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20
    //calculate the offset to avoid retrieving messages that the client has already
    const offset = (page - 1) * limit

    //check if the users are friends 
    const { areFriends, otherUserUid } = await isFriend(req.user.uid, username)

    try{
        //case users are friends
        if(areFriends){
            //get the messages between both users
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        {
                            senderUid: req.user.uid,
                            receiverUid: otherUserUid,
                        },
                        {
                            receiverUid: req.user.uid,
                            senderUid: otherUserUid,
                        }
                    ],
                    },
                    orderBy: {
                        timestamp: "desc"
                    },
                    //only take the right number of messages
                    take: limit,
                    //skip the messages the client already has
                    skip: offset,
            })

            //return all the messages between current user and other user
            res.json(messages)
        //case users are not friends
        }else{
            return res.status(403).json({ error: "Users are not friends"})
        }

    }catch(err){
        return res.status(500).json({error: "Internal server error"})
    }
})

// //start express server
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

if(process.env.NODE_ENV !== 'test') {
    //start express server
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { app, server, isFriend}
