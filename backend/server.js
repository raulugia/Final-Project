const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const multer = require("multer");
const { imageQueue } = require("./queue");
const authenticateUser = require("./authMiddleware");
require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/register", async (req, res) => {
  console.log("running");
  const { email, name, surname } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        surname,
      },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/log-meal", authenticateUser, upload.single("picture"), async (req, res) => {
    console.log("Request received at /api/log-meal");
    console.log("Authenticated user: ", req.user)
    const { mealName, restaurantName, carbEstimate, description, rating } = req.body;
    const picture = req.file;

    console.log("Requested body: ", req.body)
    console.log("Uploaded picture: ", picture)

    try {
      //check if the restaurant already exists
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
        where: {
            name_restaurantId: {
                name: mealName,
                restaurantId: restaurant.id
            },
        },
        update: {},
        create: {
            name: mealName,
            restaurant: { connect: {id: restaurant.id}}
        }

      })

      //get the user's id from the database
      const user = await prisma.user.findUnique({
        where : { email: req.user.email }
      })

      if(!user) {
        throw new Error("User not found")
      }

      //create the meal log entry
      const mealLog = await prisma.mealLog.create({
        data: {
          meal: { connect:{ id: meal.id }},
          //log the carb estimate, description and rating
          carbEstimate: parseInt(carbEstimate),
          description,
          rating,
          //Associate the log with the authenticated user
          user: { connect: { id: user.id } },
          picture: "",
          thumbnail:"",
        },
      });

      //add job to queue for image processing
      await imageQueue.add({
        filePath: picture.path,
        mealId: mealLog.id,
      });

      res.json(mealLog);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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
