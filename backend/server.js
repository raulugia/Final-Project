const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors")
const multer = require("multer")
const { imageQueue } = require("./queue")
require("dotenv").config()

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/"})

app.post("/api/register", async (req, res) => {
    console.log("running")
    const { email, name, surname } = req.body

    try {
        const user = await prisma.user.create({
            data: {
                email, name, surname
            }
        })
        res.json(user)
    } catch(err){
        res.status(400).json({error: err.message})
    }
})

app.post("/api/log-meal", upload.single("picture"), async(req, res,) => {
    const { mealName, restaurantName, carbEstimate, description, rating } = req.body
    const picture = req.file

    try {
        //check if the restaurant already exists
        let restaurant = await prisma.restaurant.findUnique({
            where : { name : restaurantName }
        })

        //case restaurant is new
        if(!restaurant) {
            restaurant = await prisma.restaurant.create({
                data: { name: restaurantName}
            })
        }

        //create the meal log entry
        const mealLog = await prisma.mealLog.create({
            data: {
                meal: {
                    connectOrCreate: {
                        where: { name: mealName },
                        create: { name: mealName, restaurant: { connect: { id: restaurant.id }}},
                    },
                },
                carbEstimate: parseInt(carbEstimate),
                description,
                rating,
                user: { connect: { id: req.user.id } },
            },
        });

        //add job to queue for image processing
        await imageQueue.add({
            filePath: picture.path,
            mealId: mealLog.id,
        });

        res.json(mealLog)
    } catch(err) {
        res.status(400).json({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


// app.post("/api/login", async (req, res) => {
//     const { email, name, surname } = req.body

//     try {
//         let user = await prisma.user.findUnique({
//             where: { email }
//         })

//         if(!user){
//             user = await prisma.user.create({
//                 data: {
//                     email, name, surname
//                 }
//             })
//         }

//         res.json(user)
//     } catch(err) {
//         res.status(400).json({error: err.message})
//     }
// })
