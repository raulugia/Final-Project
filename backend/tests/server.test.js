//mock firebase admin sdk - successful verification
jest.mock("../firebaseAdmin", () => ({
    auth: () => ({
        //mock verifyIdToken to always resolve successfully 
        verifyIdToken: jest.fn(() => Promise.resolve({ uid: "test-uid" }))
    })
}))

//mock authenticateUser middleware
jest.mock("../authMiddleware", () => jest.fn((req, res, next) => {
    //simulate a decoded token
    req.user = { uid: "test-uid"}
    next()
}))

//socket
jest.mock("../socket", () => ({
    //mock initialization
    initializeSocket: jest.fn(),
    //mock method to send notifications
    notifyUserNewReq: jest.fn()
}))

//mock the isFriend method
jest.mock("../server", () => ({
    ...jest.requireActual("../server"),
    isFriend: jest.fn(),
}))

//mock the image queue
jest.mock("../queue", () => ({
    imageQueue: {
        add: jest.fn(),
    },
}))

const request = require("supertest")
const { PrismaClient } = require("@prisma/client")
const { app, server } = require("../server")
const { notifyUserNewReq, initializeSocket } = require("../socket")
const { imageQueue } = require("../queue")
const fs = require("fs")
const path = require("path")


//mock the Prisma Client instance
jest.mock("@prisma/client", () => {
    const mockPrisma = {
        user: {
            findUnique: jest.fn()
        },
        mealLog: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        meal : {
            findMany: jest.fn(),
            upsert: jest.fn()
        },
        friendRequest: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        friendship: {
            create: jest.fn(),
            findFirst: jest.fn(),
        },
        message: {
            findMany: jest.fn(),
        },
        restaurant: {
            findUnique: jest.fn(),
            create: jest.fn(),
        }
    }
    return { PrismaClient: jest.fn(() => mockPrisma) }
})

const prisma = new PrismaClient()


describe("GET /api/home", () => {
    it("should return the user's data and logs", async() => {
        //mock user data to be returned by user.findUnique
        prisma.user.findUnique.mockResolvedValue({
            name: "Paul",
            surname: "Martin",
            username: "paul.martin",
            profilePicUrl: "https://fake.com/me.jpg",
            profileThumbnailUrl: "https://fake.com/thumbnail_me.jpg"
        })

        //mock log data to be returned by mealLog.findMany
        prisma.mealLog.findMany.mockResolvedValue([
            {
                id: 1,
                meal: {
                    id: 1,
                    name: "Pizza",
                    restaurant: {
                        name: "Italian Restaurant"
                    }
                },
                picture: "",
                carbEstimate: 50,
                createdAt: new Date(),
                rating: "ACCURATE",
                description: "Example description"
            }
        ]);

        const response = await request(app).get("/api/home").set("Authorization", "Bearer faketoken").expect(200)

        expect(response.body.user.name).toBe("Paul")
        expect(response.body.logs[0].mealName).toBe("Pizza")
    })
})


describe("GET /api/user-data", () => {
    it("should return the current user's details", async() => {
        //mock the returned value for user.findUnique
        prisma.user.findUnique.mockResolvedValue({
            uid: "test-uid",
            name: "Paul",
            surname: "Martin",
            email: "paul.martin@hotmail.com",
            username: "paul.martin",
            profilePicUrl: "https://fake.com/me.jpg",
            profileThumbnailUrl: "https://fake.com/thumbnail_me.jpg"
        })

        //send a get request to the api endpoint
        const response = await request(app).get("/api/user-data").set("Authorization", "Bearer faketoken").expect(200)

        //assert that the response contains the user's data
        expect(response.body.name).toBe("Paul")
        expect(response.body.surname).toBe("Martin")
        expect(response.body.email).toBe("paul.martin@hotmail.com")
        expect(response.body.username).toBe("paul.martin")
        expect(response.body.profileThumbnailUrl).toBe("https://fake.com/thumbnail_me.jpg")
    })


    it("should return 404 if the user is not found", async() => {
        //mock findUnique to return null - user not found
        prisma.user.findUnique.mockResolvedValue(null)

        //send a get request to the api endpoint
        const response = await request(app).get("/api/user-data").set("Authorization", "Bearer faketoken").expect(404)

        //assert that the response contains the error message
        expect(response.body.error).toBe("User not found")
    })
})


describe("GET /api/friends", () => {
    it("should return the user's friends", async() => {
        //mock the returned value for user.findUnique
        prisma.user.findUnique.mockResolvedValue({
            uid: "test-uid",
            friends: [
                {
                    friend: {
                        id: 1,
                        name: "Paul",
                        surname: "Martin",
                        username: "paul.martin",
                        profilePicUrl: "https://fake.com/me.jpg",
                        uid: "paul-uid"
                    }
                }
            ],
            friendOf: [ 
                {
                    user: {
                        id: 2,
                        name: "Mike",
                        surname: "Smith",
                        username: "mike.smith",
                        profilePicUrl: "https://fake.com/mike.jpg",
                        uid: "mike-uid"
                    }
                }
            ]
        });

        //send a get request to the api endpoint
        const response = await request(app).get("/api/friends").set("Authorization", "Bearer faketoken").expect(200)

        //ensure that the response contains all the user's friends - 2
        expect(response.body.length).toBe(2)

        //ensure the details fo the first friend are correct
        expect(response.body[0].name).toBe("Paul")
        expect(response.body[0].surname).toBe("Martin")
        expect(response.body[0].username).toBe("paul.martin")

        //ensure the details fo the second friend are correct
        expect(response.body[1].name).toBe("Mike")
        expect(response.body[1].surname).toBe("Smith")
        expect(response.body[1].username).toBe("mike.smith")
    })

    it("should return 404 if the user is not found", async() => {
        //mock findUnique to return null - user not found
        prisma.user.findUnique.mockResolvedValue(null)

        //send a get request to the api endpoint
        const response = await request(app).get("/api/user-data").set("Authorization", "Bearer faketoken").expect(404)

        //assert that the response contains the error message
        expect(response.body.error).toBe("User not found")
    })
})


describe("GET /api/restaurants", () => {
    it("should return the user's unique restaurants", async() => {
        //mock the return value for mealLog.findMany
        prisma.mealLog.findMany.mockResolvedValue([
            {
                meal: {
                    restaurant: {
                        id: 1,
                        name: "Restaurant A"
                    }
                }
            },
            {
                meal: {
                    restaurant: {
                        id: 2,
                        name: "Restaurant B"
                    }
                }
            },
        ])

        //send a get request to the api endpoint
        const response = await request(app).get("/api/restaurants").set("Authorization", "Bearer faketoken").expect(200)

        //ensure that both restaurants are returned
        expect(response.body.length).toBe(2)
        expect(response.body[0].name).toBe("Restaurant A")
        expect(response.body[1].name).toBe("Restaurant B")
    })
})


describe("GET /api/my-restaurants/:restaurantId", () => {
    it("should return the meals linked to a certain restaurant and created by the current user", async() => {
        //mock the return value for meal.findMany
        prisma.meal.findMany.mockResolvedValue([
            {
                id: 1,
                name: "Meal 1",
                logs: [
                    {
                        thumbnail: "https://fake.com/thumbnail1.jpg"
                    }
                ],
                restaurant: {
                    name: "Restaurant A"
                }
            },
            {
                id: 2,
                name: "Meal 2",
                logs: [
                    {
                        thumbnail: "https://fake.com/thumbnail2.jpg"
                    }
                ],
                restaurant: {
                    name: "Restaurant A"
                }
            },
        ]);

        //send a get request to the api endpoint
        const response = await request(app).get("/api/my-restaurants/1").set("Authorization", "Bearer faketoken").expect(200)

        //ensure that both meals are returned
        expect(response.body.length).toBe(2)

        //ensure that the meals details are correct
        expect(response.body[0].mealName).toBe("Meal 1")
        expect(response.body[0].thumbnail).toBe("https://fake.com/thumbnail1.jpg")
        expect(response.body[0].restaurantName).toBe("Restaurant A")
        
        expect(response.body[1].mealName).toBe("Meal 2")
        expect(response.body[1].thumbnail).toBe("https://fake.com/thumbnail2.jpg")
        expect(response.body[1].restaurantName).toBe("Restaurant A")
    })
})


describe("GET /api/meals/:mealId", () => {
    it("should return the logs linked to a specific meal for the current user", async() => {
        //mock the return value for mealLog.findMany
        prisma.mealLog.findMany.mockResolvedValue([
            {
                id: 1,
                mealId: 1,
                userUid: "test-uid",
                meal: {
                    name: "Meal 1",
                    restaurant: {
                        name: "Restaurant A"
                    }
                },
                carbEstimate: 50,
                description: "Description 1",
                createdAt: new Date(),
            },
            {
                id: 2,
                mealId: 1,
                userUid: "test-uid",
                meal: {
                    name: "Meal 1",
                    restaurant: {
                        name: "Restaurant A"
                    }
                },
                carbEstimate: 40,
                description: "Description 2",
                createdAt: new Date(),
            }
        ])

        //send a get request to the api endpoint
        const response = await request(app).get("/api/meals/1").set("Authorization", "Bearer faketoken").expect(200)

        //ensure that both logs are returned
        expect(response.body.length).toBe(2)

        //ensure that the logs data is correct
        expect(response.body[0].meal.name).toBe("Meal 1")
        expect(response.body[1].meal.name).toBe("Meal 1")

        expect(response.body[0].meal.restaurant.name).toBe("Restaurant A")
        expect(response.body[1].meal.restaurant.name).toBe("Restaurant A")

        expect(response.body[0].carbEstimate).toBe(50)
        expect(response.body[1].carbEstimate).toBe(40)
    })

    
    it("should return 404 if no logs are found for the specified meal", async() => {
        //mock findUnique to return null - user not found
        prisma.mealLog.findMany.mockResolvedValue([])

        //send a get request to the api endpoint
        const response = await request(app).get("/api/meals/1").set("Authorization", "Bearer faketoken").expect(404)

        //assert that the response contains the error message
        expect(response.body.error).toBe("No logs found for the specified meal.")
    })
})


describe("POST /api/log-meal", () => {
    beforeEach(() => {
        //mock the imageQueue
        require("../queue").imageQueue.add.mockResolvedValue()

        //mock the restaurant lookup to return null implying that the restaurant is new
        prisma.restaurant.findUnique.mockResolvedValue(null)

        //mock the creation of a new restaurant
        prisma.restaurant.create.mockResolvedValue({
            id: 1,
            name: "Test Restaurant"
        })

        //mock the meal upsert
        prisma.meal.upsert.mockResolvedValue({
            id: 1,
            name: "Test Meal",
            restaurantId: 1
        })

        //mock the meal log creation
        prisma.mealLog.create.mockResolvedValue({
            id: 1,
            mealId: 1,
            userUid: "test-uid",
            carbEstimate: 50,
            description: "Test Description",
            rating: "PENDING",
            picture: "",
            thumbnail: "",
        })
    })

    it("should log a meal and add a job to the image processing queue", async () => {
        const fakeImagePath = path.join(__dirname, "fake-image.jpg")
        //create a temp mock image file
        fs.writeFileSync(fakeImagePath, "")

        //send post request to create a log
        const response = await request(app)
            .post("/api/log-meal")
            .set("Authorization", "Bearer faketoken")
            .field("mealName", "Test Meal")
            .field("mealName", "Test Meal")
            .field("restaurantName", "Test Restaurant")
            .field("carbEstimate", 50)
            .field("description", "Test Description")
            .attach("picture", fakeImagePath)
            .expect(200)

        //ensue that the response contains the meal log
        expect(response.body.mealId).toBe(1)
        expect(response.body.userUid).toBe("test-uid")

        //ensure that the imageQueue.add method was called with the right data
        expect(imageQueue.add).toHaveBeenCalledTimes(1)
        expect(imageQueue.add).toHaveBeenCalledWith({
            filePath: expect.any(String),
            mealId: 1,
            userUid: "test-uid"
        }, {"attempts": 3, "backoff": 5000, "timeout": 120000}),

        //clean the mock file
        fs.unlinkSync(fakeImagePath)
    })
})


describe("POST /api/friend-request", () => {
    it("should create a new friend request if one does not exist already", async () => {
        //mock user.findUnique to return sender and recipient
        prisma.user.findUnique
            .mockResolvedValue({uid: "test-uid"})
            .mockResolvedValue({uid: "recipient-uid"})
        
        //mock findRequest.findFirst so there is no pre-existing friend request
        prisma.friendRequest.findFirst.mockResolvedValue(null)

        //mock friendRequest.create to simulate the creation of a new friend request
        prisma.friendRequest.create.mockResolvedValue({
            id: 1,
            senderUid: "test-uid",
            receiverUid: "recipient-uid",
            status: "PENDING",
            sender: {
                id: 1,
                name: "Sender",
                surname: "User",
                username: "sender.user"
            }
        });

        //send a post request to the api endpoint
        const response = await request(app).post("/api/friend-request").send({ recipientUid: "recipient-uid"}).set("Authorization", "Bearer faketoken").expect(200)

        //check if the friend request has been created correctly
        expect(response.body.sender.name).toBe("Sender")
        expect(response.body.sender.surname).toBe("User")
        expect(response.body.receiverUid).toBe("recipient-uid")
        expect(response.body.status).toBe("PENDING")

        //check that the method to send a notification to the receiver was called
        expect(require("../socket").notifyUserNewReq).toHaveBeenCalledWith("recipient-uid", expect.anything())
    })


    it("should return 400 if there is an existing pending/rejected friend request", async () => {
        //mock user.findUnique to return sender and recipient
        prisma.user.findUnique
            .mockResolvedValue({uid: "test-uid"})
            .mockResolvedValue({uid: "recipient-uid"})
        
        //mock findRequest.findFirst so there is a pre-existing pending friend request
        prisma.friendRequest.findFirst.mockResolvedValue({
            id: 1,
            senderUid: "test-uid",
            receiverUid: "recipient-uid",
            status: "PENDING"
        })

        //send a post request to the api endpoint
        const response = await request(app).post("/api/friend-request").send({ recipientUid: "recipient-uid"}).set("Authorization", "Bearer faketoken").expect(400)

        //ensure that the response contains the error message
        expect(response.body.error).toBe("Friend request already sent.")
    })
})


describe("POST /api/friend-request-/accept/:requestId", () => {
    it("should accept a pending friend request and create a friendship", async() => {
        //mock friendRequest.findUnique to return a pending friend request
        prisma.friendRequest.findUnique.mockResolvedValue({
            id: 1,
            sender: { uid: "sender-uid"},
            receiver: { uid: "recipient-uid"},
            status: "PENDING"
        });

        //mock friendRequest.update to simulate accepting the request
        prisma.friendRequest.update.mockResolvedValue({
            id: 1,
            status: "ACCEPTED"
        });

        //mock prisma.friendShip.create to simulate the creation of a new friendship:
        prisma.friendship.create.mockResolvedValue({
            id: 1,
            userUid: "receiver-uid",
            friendUid: "sender-uid"
        })

        //send a post request to the api endpoint
        const response = await request(app).post("/api/friend-request/accept/1").set("Authorization", "Bearer faketoken").expect(200)

        //check if the response contains the correct message
        expect(response.body.message).toBe("Friend request accepted.")
    })
})


describe("GET /api/chat/:username/messages", () => {
    beforeEach(() => {
        //mock isFriend to return that users are friends
        require("../server").isFriend.mockResolvedValue({
            areFriends: true,
            otherUserUid: "other-user-uid"
        })

        //mock friendship.findFirst to simulate that users are friends
        prisma.friendship.findFirst.mockResolvedValue({
            id: 1,
            userUid: "test-uid",
            friendUid: "other-user-uid"
        })
    })

    it("should return the chat messages between current user and another user if they are friends", async () => {
        //mock the messages returned by prisma
        prisma.message.findMany.mockResolvedValue([
            {
                id: 1,
                senderUid: "test-uid",
                receiverUid: "other-user-uid",
                content: "Hello",
                timestamp: new Date(),
            },
            {
                id: 2,
                senderUid: "other-user-uid",
                receiverUid: "test-uid",
                content: "Hi",
                timestamp: new Date(),
            },
        ]);

        //send a get request to the api endpoint
        const response = await request(app).get("/api/chat/other.user/messages").set("Authorization", "Bearer faketoken").expect(200)

        //ensure the response contains the messages
        expect(response.body.length).toBe(2)
        expect(response.body[0].content).toBe("Hello")
        expect(response.body[1].content).toBe("Hi")
    })
})


describe("GET /api/user/:username/restaurants", () => {
    beforeEach(() => {
        //mock isFriend to return that users are friends
        require("../server").isFriend.mockResolvedValue({
            areFriends: true,
            otherUserUid: "other-user-uid"
        })

        //mock friendship.findFirst to simulate that users are friends
        prisma.friendship.findFirst.mockResolvedValue({
            id: 1,
            userUid: "test-uid",
            friendUid: "other-user-uid"
        })

        //mock the meal logs returned by prisma
        prisma.mealLog.findMany.mockResolvedValue([
            {
                id: 1,
                meal: {
                    id: 1,
                    name: "Pizza",
                    restaurant: {
                        id: 1,
                        name: "Italian Restaurant"
                    }
                }
            },
            {
                id: 2,
                meal: {
                    id: 2,
                    name: "Burger",
                    restaurant: {
                        id: 2,
                        name: "Burger Restaurant"
                    }
                }
            },
        ])
    })


    it("should return the restaurants logged by another user if users are friends", async () => {
        //send a get request to the api endpoint
        const response = await request(app).get("/api/user/other.user/restaurants").set("Authorization", "Bearer faketoken").expect(200)

        //ensure that the response contains all the restaurants
        expect(response.body.length).toBe(2)
        expect(response.body[0].name).toBe("Italian Restaurant")
        expect(response.body[1].name).toBe("Burger Restaurant")
    })
})

//close the server after all the tests are finished
afterAll(async() => {
    server.close()
})