import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import LogMeal from './pages/LogMeal'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import { auth } from '../utils/firebase'
import {Routes, Route} from 'react-router-dom'
import ProtectedRoute from './pages/ProtectedRoute'


function App() {
  //state to store the current user
  const [user, setUser] = useState(null)

  //get the current user once when the component mounts
  useEffect(() => {
    //set up a listener to check for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      //update the state with current user
      setUser(user)
    })

    //cleanup method to prevent memory leaks
    return () => unsubscribe()
  }, [])

  //set up the different routes users can access
  //components rendered by protected routes will be wrapped by ProtectedRoute to ensure the user is authenticated
  return (
    <div className="h-screen">
     <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/register' element={<Register />}/>

      <Route element={ <Navbar /> }>
      <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>}/>
      <Route path='/friends/:id' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
      <Route path='/log-meal' element={<ProtectedRoute><LogMeal /></ProtectedRoute>}/>
      </Route>
     </Routes>
    </div>
  )
}

export default App
