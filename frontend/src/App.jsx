import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Home from './pages/Home'
import { auth } from '../utils/firebase'
import {Routes, Route} from 'react-router-dom'
import ProtectedRoute from './pages/ProtectedRoute'


function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="h-screen">
     <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>}/>
     </Routes>
    </div>
  )
}

export default App
