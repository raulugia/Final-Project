const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json())

app.post("api/register", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})