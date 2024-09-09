//import the Firebase Admin SDK
const admin = require("firebase-admin");
//import the service account key
const serviceAccount = require("./config/diamate-5f379-firebase-adminsdk-u5mzj-e0154d8fa2.json")

//initialize the Firebase Admin SDK
admin.initializeApp({
    //set the credentials
    credential: admin.credential.cert(serviceAccount),
})

//export the initialized admin instance
module.exports = admin