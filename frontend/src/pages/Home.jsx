import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import HomeMealCard from '../components/HomeMealCard';
import SkeletonHomeMealCard from '../components/SkeletonHomeMealCard';

const Home = () => {
  //get current user
  const user = auth.currentUser
  //stated used to hold the logs returned by the server
  const [logs, setLogs] = useState([])
  const navigate = useNavigate();
  //state used to display Loading component when data is being fetched
  const [loading, setLoading] = useState(true)
  //state needed to trigger data fetching (useEffect dependency)
  //this state will be increase by 1 each time the last HomeMealCard intersects with the viewport (infinite scrolling) 
  const [page, setPage] = useState(1)
  //ref to keep the intersection observer instance
  const observer = useRef()
  //ref to keep a reference to the last HomeMealCard
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

    //fetch meal logs and update states
    (async() => {
      try {
        //get the id token
        const token = await user.getIdToken();

        //fetch first 5 meal logs - page is needed to calculate the offset in the server
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
          //update logs state with formatted logs
          setLogs(prevLogs => [...prevLogs, ...displayData])
          //hide loading component
          setLoading(false)
        }
      } catch(err) {
        console.log(err)
        //hide loading component
        setLoading(false)
      }
    })()

    //cleanup function used to ignore the response when fetching is duplicated (strict mode)
    return () => {
      ignore = true
    }
  }, [page])

  //set up intersection observer and track last HomeMealCard
  useEffect(() => {
    if(loading) return
    if(observer.current) observer.current.disconnect()
    
    //create a new intersection observer that will increase the page state 
    //when the last HomeMealCard intersects with the viewport
    observer.current = new IntersectionObserver(entries => {
      //case last HomeMealCard is intersecting with the viewport
      if(entries[0].isIntersecting) {
        //update state
        setPage(prevPage => prevPage + 1)
      }
    })

    //make the observer watch the last HomeMealCard, referenced by lastLogRef
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
                  <SkeletonHomeMealCard />
                ) : (
                  logs.map((log, index) => (
                    //ref will be assigned when the last HomeMealCard is rendered
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