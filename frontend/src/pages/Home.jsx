import React, { useEffect, useState} from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const Home = () => {
  const user = auth.currentUser
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    (async() => {
      try {
        //get the id token
        const token = await user.getIdToken();
        const { data } = await axiosInstance.get("/api/user-data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserData(data)
        console.log(data)
      } catch(err) {
        console.log(err)
      }
    })()
  }, [])

  //method to redirect user to "/" when they click on "log out" button
  const handleClick = () => {
    //sign out user
    signOut(auth).then(() => {
      //redirect to "/"
      navigate("/")
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