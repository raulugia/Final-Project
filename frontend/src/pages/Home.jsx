import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import HomeMealCard from '../components/HomeMealCard';

const Home = () => {
  const user = auth.currentUser
  const [logs, setLogs] = useState([])
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const observer = useRef()
  const lastLogRef = useRef()

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
    //flag to avoid updating data twice on render due to strict mode
    let ignore = false;
    (async() => {
      try {
        console.log("fetching data...", page)
        //get the id token
        const token = await user.getIdToken();
        const { data } = await axiosInstance.get("/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 5
          }
        })

        //only update states if ignore is false
        if(!ignore){
          //format date of every log
          const displayData = data.map(log => ({...log, createdAt: formatDate(log.createdAt)}))
          setLogs(prevLogs => [...prevLogs, ...displayData])
          console.log(data)
          setLoading(false)
        }
      } catch(err) {
        console.log(err)
        setLoading(false)
      }
    })()

    //cleanup function used to ignore the response when fetching is duplicated (strict mode)
    return () => {
      ignore = true
    }
  }, [page])

  
  useEffect(() => {
    if(loading) return
    if(observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting) {
        setPage(prevPage => prevPage + 1)
      }
    })

    if(lastLogRef.current) observer.current.observe(lastLogRef.current)
  }, [loading])

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
    // <div className='flex justify-between min-h-screen pb-16 gap-4 bg-slate-200'>
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="border bg-red-300 mt-20 md:sticky top-0 hidden md:block">
        left
      </div>

        <div className='flex flex-col gap-4 px-5 mt-20'>
          <h1 className='text-2xl font-bold text-slate-700 mb-2'>Your Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            {   
                loading ? (
                    <div>Loading...</div>
                ) : (
                  logs.map((log, index) => (
                    <HomeMealCard key={log.logId} {...log} ref={index === logs.length - 1 ? lastLogRef: null}/>
                  ))
                )
            }
        </div>
        </div>

        <div className="border bg-red-300 mt-20 flex-grow hidden md:block">
            right
        </div>
    </div>
  )
}

export default Home