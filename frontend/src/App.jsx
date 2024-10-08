import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Login from './components/auth/Login'
import ResetPassword from './components/auth/ResetPassword'
import Register from './components/auth/Register'
import LogMeal from './pages/LogMeal'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Restaurants from './pages/Restaurants'
import RestaurantMeals from './pages/RestaurantMeals'
import Meals from './pages/Meals'
import MealLogs from './pages/MealLogs'
import Log from './pages/Log'
import SearchResults from './pages/SearchResults'
import Chat from './pages/Chat'
import Account from './pages/Account'
import { auth } from '../utils/firebase'
import {Routes, Route, useLocation} from 'react-router-dom'
import ProtectedRoute from './pages/ProtectedRoute'
import socket from "../utils/socket"
import { Outlet } from 'react-router-dom'
import { useStateContext } from './context/ContextProvider'


function App() {
  //state to store the current user
  const [user, setUser] = useState(null)
  //const [pendingRequests, setPendingRequests] = useState([])
  const { pendingRequests, setPendingRequests } = useStateContext()
  const location = useLocation()

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

    //listener to display the pending friend requests in Home
    //event emitted when the user signs in
    socket.on("pendingFriendRequests", requests => {
      setPendingRequests(requests)
    })

    //listener to notify the user that they received a new friend request
    //this event is emitted on the server when a friend request is created
    socket.on("newFriendRequest", request => {
      setPendingRequests(prevRequests => [...prevRequests, request])
    })

    //listener to notify the user a new log can be reviewed now 
    socket.on("notifyAccuracyReview", ({ message, mealLogId}) => {
      alert(message)
    } )

    return () => {
      socket.off("connect");
      socket.off("disconnect")
      socket.off("pendingFriendRequests")
      socket.off("newFriendRequest")
    }
  }, [])

  //set up the different routes users can access
  //components rendered by protected routes will be wrapped by ProtectedRoute to ensure the user is authenticated
  return (
    <div className='bg-slate-200'>
      {
        location.pathname !== "/" && location.pathname !== "/register" && location.pathname !== "/reset-password"   && <Navbar name={user?.displayName}/>
      }
    <div className='max-w-[1200px] mx-auto'>
     <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/register' element={<Register />}/>
      <Route path='/reset-password' element={<ResetPassword />}/>

      <Route element={ <ProtectedRoute><Outlet /></ProtectedRoute> }>
        <Route path='/home' element={<Home />}/>
        <Route path='/friends' element={<Friends />}/>

        <Route path='/user/:username' element={<Profile />}/>
        <Route path='/user/:username/meals' element={<Meals />}/>
        <Route path='/user/:username/meals/:mealId' element={<MealLogs />}/>
        <Route path='/user/:username/meals/:mealId/log/:logId' element={<Log />}/>
        <Route path='/user/:username/restaurants' element={<Restaurants />}/>
        <Route path='/user/:username/restaurants/:restaurantId' element={<RestaurantMeals />}/>
        <Route path='/user/:username/friends' element={<Friends />}/>

        <Route path='/log-meal' element={<LogMeal />}/>
        <Route path='/my-restaurants' element={<Restaurants />}/>
        <Route path='/my-restaurants/:restaurantId' element={<RestaurantMeals />}/>
        <Route path='/my-meals' element={<Meals />}/>
        <Route path='/my-meals/:mealId' element={<MealLogs />}/>
        <Route path='/my-meals/:mealId/log/:logId' element={<Log />}/>
        <Route path='/search' element={<SearchResults />}/>
        <Route path='/chats' element={<Chat />}/>
        <Route path='/account' element={<Account />}/>
      </Route>

     </Routes>
    </div>
    </div>
  )
}

export default App
