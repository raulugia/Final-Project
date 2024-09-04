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

//mock method to know if two users are friends
jest.mock("../isFriend", () => jest.fn())

const request = require("supertest")
const { PrismaClient } = require("@prisma/client")
const { app, isFriend } = require("../server")

//mock the Prisma Client instance
jest.mock("@prisma/client", () => {
    const mockPrisma = {
        user: {
            findUnique: jest.fn()
        },
        mealLog: {
            findMany: jest.fn()
        },
        friendRequest: {
            findFirst: jest.fn()
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