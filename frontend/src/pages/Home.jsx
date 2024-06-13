import React from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'

const Home = () => {
  const user = auth.currentUser
  const handleClick = () => {
    signOut(auth).then(() => {

    }).catch(e => console.error(e))
  }
  return (
    <div>
      <p>Welcome Home, {user.displayName}</p>
      <p className="cursor-pointer font-semibold" onClick={handleClick}>Log Out</p>
    </div>
  )
}

export default Home