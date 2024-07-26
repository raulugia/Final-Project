import React, { useEffect, useState} from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import HomeMealCard from '../components/HomeMealCard';

const Home = () => {
  const user = auth.currentUser
  const [logs, setLogs] = useState([])
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  //method to format the createdAt date
  const formatDate = (dateString) => {
    //create a new Date object
    const date = new Date(dateString)

    //get the day, month and year - padStart(2, "0") ensures that the elements have a least 2 digits (7 => 07)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    //get the hour and minutes
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    //return the combined timestamp
    return `Logged on ${day}/${month}/${year} at ${hours}:${minutes}`
}

  useEffect(() => {
    (async() => {
      try {
        //get the id token
        const token = await user.getIdToken();
        const { data } = await axiosInstance.get("/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        //format date of every log
        const displayData = data.map(log => ({...log, createdAt: formatDate(log.createdAt)}))
        setLogs(displayData)
        console.log(data)
      } catch(err) {
        console.log(err)
      }
    })()
  }, [])

  //method to redirect user to "/" when they click on "log out" button
  // const handleClick = () => {
  //   //sign out user
  //   signOut(auth).then(() => {
  //     //redirect to "/"
  //     navigate("/")
  //   }).catch(e => console.error(e))
  // }
  return (
    // <div className="pt-20">
    //   <p>Welcome Home</p>
    //   <p className="cursor-pointer font-semibold" onClick={handleClick}>Log Out</p>
    // </div>
    <div className='flex justify-between min-h-screen pb-16 gap-4 bg-slate-200'>
      <div className="border bg-red-300 mt-24 flex-grow hidden md:block">
        left
      </div>

        <div className='flex-auto flex-col gap-4 py-3 px-5 mt-24 w-[85%] md:w-[25%]'>
          <h1 className='text-2xl font-bold text-slate-700 mb-5'>Your Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            {   
                loading ? (
                    <SkeletonMealCard />
                ) : (
                  logs.map(log => (
                    <HomeMealCard {...log}/>
                  ))
                )
            }
        </div>
        </div>

        <div className="border bg-red-300 mt-24 flex-grow hidden md:block">
            right
        </div>
    </div>
  )
}

export default Home