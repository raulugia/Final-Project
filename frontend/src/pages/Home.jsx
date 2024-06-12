import React from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'

const Home = () => {
  const handleClick = () => {
    signOut(auth).then(() => {

    }).catch(e => console.error(e))
  }
  return (
    <div>
      <p>Home</p>
      <p className="cursor-pointer font-semibold" onClick={handleClick}>Log Out</p>
    </div>
  )
}

export default Home