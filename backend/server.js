//Load environment variables from .env
require("dotenv").config();

//import modules
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const multer = require("multer");
const { imageQueue } = require("./queue");
const authenticateUser = require("./authMiddleware");
const { types } = require("pg");
const http = require("http");
const { initializeSocket } = require("./socket");

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

//endpoint for user registration
app.post("/api/register", async (req, res) => {
  //extract email, name and surname from the request body
  const { email, name, surname, username, uid, profilePicUrl } = req.body;

  try {
    //create a new user in the database with the extracted data
    const user = await prisma.user.create({
      data: {
        email,
        name,
        surname,
        username,
        uid,
        profilePicUrl,
      },
    });
    
    //respond with the new user object
    res.json(user);
  } catch (err) {
    //respond with a 400 status code if there was an error
    res.status(400).json({ error: err.message });
  }
});

//endpoint for logging a meal
app.post("/api/log-meal", authenticateUser, upload.single("picture"), async (req, res) => {
    //extract the meal information from the request body
    const { mealName, restaurantName, carbEstimate, description, rating } = req.body;
    //extract the picture uploaded by the user
    const picture = req.file;

    // //find the user in the database and store it
    // const user = await prisma.user.findUnique({
    //     where : { email: req.user.email }
    //   })

    // //throw an error if the user does not exist
    // if(!user) {
    // throw new Error("User not found")
    // }

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
          rating,
          //associate the meal log with the authenticated user
          user: { connect: { uid: req.user.uid } },
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
      });

    } catch (err) {
      //respond with a 400 status code if there was an error  
      res.status(400).json({ error: err.message });
    }
  }
);


app.get("/api/user-data", authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.user.email },
            include: {
               //include all the meal log records logged by the user 
               meals: {
                include: {
                    meal: {
                        include: {
                            restaurant: true
                        }
                    }
                }
               },
               friends: true,
               friendOf: true,
               chatsSent: true,
               chatsReceived: true
            }
        })

        if(!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json(user)

    } catch(err) {
        console.log(err)
    }
})

app.get("/api/friends", authenticateUser, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where : { uid: req.user.uid },
            include: {
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
                                surname: true
                            },
                        },
                    },
                },
            },
        })

        if(!user) {
            return res.status(404).json({ error: "User not found" })
        }

        //combine friends and friendsOf
        const friends = [
            ...user.friends.map(data => data.friend),
            ...user.friendOf.map(data => data.friendOf),
        ]

        res.json(friends)

    } catch(err) {
        console.log(err)
    }
})


app.get("/api/restaurants", authenticateUser, async(req, res,) => {
    try {
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

        
        const restaurantsMap = new Map()
        
        mealLogs.forEach(log => {
            restaurantsMap.set(log.meal.restaurant.id, log.meal.restaurant)
        })
        const uniqueRestaurants = Array.from(restaurantsMap.values())
        
        res.json(uniqueRestaurants)

    } catch(err) {
        console.log(err)
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
                    select: {
                        id: true
                    }
                },
                receivedRequests: {
                    where: {
                        senderUid: req.user.uid,
                        status: "PENDING"
                    },
                    select: {
                        id: true
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
            console.log(`User name: ${user.name} friends of ${JSON.stringify(user)}`)
            //if the length of friends or friendsOf is < 0, users are not friends
            const isFriend = user.friends.length > 0 || user.friendOf.length > 0
            
            console.log(`User name: ${user.name} received requests ${JSON.stringify(user.receivedRequests)}`)
            let friendRequestStatus = ""
            let requestId = ""
            if(user.sentRequests.length > 0) {
                friendRequestStatus = "action"
                requestId = user.sentRequests[0].id
            } else if(user.receivedRequests.length > 0) {
                friendRequestStatus = "pending"
                requestId = user.sentRequests[0].id
            }

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
    
    const { recipientUid } = req.body;

    try{
        const sender = await prisma.user.findUnique({
            where: {
                email: req.user.email
            }
        });

        const recipient = await prisma.user.findUnique({
            where: {
                uid: recipientUid
            }
        });

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

        const friendRequest = await prisma.friendRequest.create({
            data: {
                sender: { connect: { uid: sender.uid }},
                receiver: {connect: { uid: recipient.uid }},
                status: "PENDING"
            }
        })

        res.json(friendRequest)
    } catch(err) {
        console.log(err)
        res.status(400).json({error: err.message})
    }
})

app.post("/api/friend-request/accept/:requestId", authenticateUser, async(req, res) => {
    const { requestId } = req.params;

    try{
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: Number(requestId) },
            include: {sender: true, receiver: true},
        })

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

        res.json({ message: "Friend request accepted,"})
    } catch(err) {
        console.log(err)
        res.json({ error: err.message})
    }
})

app.post("/api/friend-request/reject/:requestId", authenticateUser, async(req, res) => {
    const { requestId } = req.params;

    try{
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: Number(requestId) },
        })

        if(!friendRequest || friendRequest.status !== "PENDING") {
            return res.status(400).json({ error: "Invalid or already processed request."})
        }

        //await the friend request status to accepted
        await prisma.friendRequest.update({
            where: {id: Number(requestId)},
            data: {status: "REJECTED"}
        })

        res.json({ message: "Friend request rejected,"})
    } catch(err) {
        console.log(err)
        res.json({ error: err.message})
    }
})

//start express server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
