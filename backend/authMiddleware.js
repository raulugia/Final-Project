//import Firebase Admin SDK, initialised in "firebaseAdmin.js"
const admin = require('./firebaseAdmin');

//middleware method to authenticate users based on the token provided in the request header
const authenticateUser = async (req, res, next) => {
    //extract the token from the header
    const token = req.headers.authorization?.split("Bearer ")[1]
    
    //respond with a 401 status code if there is no token
    if(!token) {
        if(res) {
            return res.status(401).send({ error: "No token provided" });
        }else {
            return next(new Error("Authentication failed: no token provided"))
        }
    }

    try {
        //verify the token
        const decodedToken = await admin.auth().verifyIdToken(token)
        //attach the decoded token to the request object
        req.user = decodedToken;
        //console.log("TOKEN WAS DECODED", decodedToken);
        //call the next middleware method
        next()
    } catch(err) {
        console.error("Error verifying token: ")
        if(res) {
            //respond with a 401 status if there was an error
            res.status(401).send({ error: "Invalid token" });
        }else {
            next(new Error("Authentication error: invalid token"))
        }
    }
}

//export the method
module.exports =authenticateUser;