//import the Firebase Admin SDK
const admin = require("firebase-admin");
//import the service account key -
const serviceAccount = require("./config/PASTE FILE NAME HERE.json")

//initialize the Firebase Admin SDK
admin.initializeApp({
    //set the credentials
    credential: admin.credential.cert(serviceAccount),
})

//export the initialized admin instance
module.exports = admin