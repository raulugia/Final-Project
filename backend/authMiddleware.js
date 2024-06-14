const admin = require('./firebaseAdmin');

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1]
    
    if(!token) {
        return res.status(401).send({ error: "No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        req.user = decodedToken;
        next()
    } catch(err) {
        console.error("Error verifying token: ")
        res.status(401).send({ error: "Invalid token" });
    }
}

module.exports =authenticateUser;