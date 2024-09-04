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

const request = require("supertest")
const { PrismaClient } = require("@prisma/client")
const { app, server } = require("../server")


//mock the Prisma Client instance
jest.mock("@prisma/client", () => {
    const mockPrisma = {
        user: {
            findUnique: jest.fn()
        },
        mealLog: {
            findMany: jest.fn()
        },
        meal : {
            findMany: jest.fn()
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


//close the server after all the tests are finished
afterAll(async() => {
    server.close()
})