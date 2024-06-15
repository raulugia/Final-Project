//import the Firebase Admin SDK
const admin = require("firebase-admin");
//import the service account key
const serviceAccount = require("./config/final-project-d6c13-firebase-adminsdk-67z7e-a668b6241d.json")

//initialize the Firebase Admin SDK
admin.initializeApp({
    //set the credentials
    credential: admin.credential.cert(serviceAccount),
})

//export the initialized admin instance
module.exports = admin