const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors")

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})