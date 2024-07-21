import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import LogMeal from './pages/LogMeal'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Restaurants from './pages/Restaurants'
import Meals from './pages/Meals'
import MealLogs from './pages/MealLogs'
import SearchResults from './pages/SearchResults'
import { auth } from '../utils/firebase'
import {Routes, Route} from 'react-router-dom'
import ProtectedRoute from './pages/ProtectedRoute'
import socket from "../utils/socket"


function App() {
  //state to store the current user
  const [user, setUser] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])

  //get the current user once when the component mounts
  useEffect(() => {
    //set up a listener to check for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(async user => {
      //update the state with current user
      setUser(user)

      //case user exists
      if(user) {
        //get the token
        const token = await user.getIdToken()
        //set the token in the socket authentication object
        socket.auth = { token }
        //connect to the WebSocket
        socket.connect()
        //send a request ti get the pending friend requests
        socket.emit("getPendingFriendRequests")
      }
    })

    //cleanup method to prevent memory leaks
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("disconnect", () => {
      console.log("disconnected from server")
    })

    socket.on("pendingFriendRequests", requests => {
      setPendingRequests(requests)
    })

    return () => {
      socket.off("connect");
      socket.off("disconnect")
      socket.off("pendingFriendRequests")
    }
  }, [])

  //set up the different routes users can access
  //components rendered by protected routes will be wrapped by ProtectedRoute to ensure the user is authenticated
  return (
    <div>
     <Routes>

      <Route path='/' element={<Login />}/>
      <Route path='/register' element={<Register />}/>

      <Route element={ <Navbar name={user?.displayName}/> }>
        <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
        <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>}/>
        <Route path='/friends/:id' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path='/log-meal' element={<ProtectedRoute><LogMeal /></ProtectedRoute>}/>
        <Route path='/my-restaurants' element={<ProtectedRoute><Restaurants /></ProtectedRoute>}/>
        <Route path='/my-meals' element={<ProtectedRoute><Meals /></ProtectedRoute>}/>
        <Route path='/my-meals/:mealId' element={<ProtectedRoute><MealLogs /></ProtectedRoute>}/>
        <Route path='/search' element={<ProtectedRoute><SearchResults /></ProtectedRoute>}/>
      </Route>

     </Routes>
    </div>
  )
}

export default App
