const admin = require("firebase-admin");
const serviceAccount = require("./config/final-project-d6c13-firebase-adminsdk-67z7e-a668b6241d.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

module.exports = admin