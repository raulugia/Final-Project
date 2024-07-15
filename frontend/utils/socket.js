import { io } from "socket.io-client"

//connect to the server
const socket = io("http://localhost:5000");

export default socket