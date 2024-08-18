import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import HomeMealCard from '../components/HomeMealCard';
import SkeletonHomeMealCard from '../components/SkeletonHomeMealCard';
import HomeFriendReqCard from '../components/HomeFriendReqCard';
import { FaUserFriends } from "react-icons/fa";
import { useStateContext } from '../context/ContextProvider'
import socket from '../../utils/socket';

const Home = () => {
  //get current user
  const user = auth.currentUser
  //state used to hold the logs returned by the server
  const [logs, setLogs] = useState([])
  const navigate = useNavigate();
  //state used to display Loading component when data is being fetched
  const [loading, setLoading] = useState(true)
  //state needed to trigger data fetching (useEffect dependency)
  //this state will be increase by 1 each time the last HomeMealCard intersects with the viewport (infinite scrolling) 
  const [page, setPage] = useState(1)
  //
  const [pendingMealLogs, setPendingMealLogs] = useState([])
  const [mealCountdowns, setMealCountdowns] = useState([])
  //ref to keep the intersection observer instance
  const observer = useRef()
  //ref to keep a reference to the last HomeMealCard
  const lastLogRef = useRef()
  //state to detect if there are any logs left to fetch
  //since the system fetches 5 logs every time te infinite scrolling logic is triggered,
  //if the length of the returned logs is < 5, there are no more logs to fetch
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  //get pending requests from context
  const { pendingRequests } = useStateContext()
  
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

          //update state if there are no more logs left to fetch
          if(data.logs.length < 5) {
            setHasMoreLogs(false)
          }
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
      //case last HomeMealCard is intersecting with the viewport and there are more logs to fetch
      if(entries[0].isIntersecting && hasMoreLogs) {
        //update state
        setPage(prevPage => prevPage + 1)
      }
    })

    //make the observer watch the last HomeMealCard, referenced by lastLogRef
    if(lastLogRef.current) observer.current.observe(lastLogRef.current)
  }, [loading, hasMoreLogs])

  //get pending meal logs and update states to display them
  useEffect(() => {
    socket.emit("getPendingMealLogs")

    socket.on("pendingMealLogs", (logs) => {
      const readyToReview = logs.filter(log => log.reviewAvailable)
      const notReadyToReview = logs.filter(log => !log.reviewAvailable)
      console.log("readyyyyy: ", readyToReview)
      console.log("notttt readyyyyy: ", notReadyToReview)
      if (readyToReview.length > 0) setPendingMealLogs(readyToReview)
      if (notReadyToReview.length > 0) setMealCountdowns(notReadyToReview)
    })

    return () => {
      socket.off("pendingMealLogs")
    }

  },[])

  //update countdowns every second
  useEffect(() => {
    const interval = setInterval(() =>{
      if(mealCountdowns.length > 0){
        console.log("here")
        //update countdown every second
        setMealCountdowns(prevMealCountdowns => {
          const updatedCountDowns = []
          const readyToReview = []
          //iterate over the meals that are not ready to be reviewed
          prevMealCountdowns.forEach((log )=> {
            console.log(log)

            //reduce the time left by 1 second
            const newTimeLeft = log.timeLeft - 1000

            if(newTimeLeft <= 0){
              readyToReview.push({...log, reviewAvailable: true, timeLeft: 0})
            }else{
              const hours = Math.floor((newTimeLeft) / (1000 * 60 * 60) % 24)
              const minutes = Math.floor((newTimeLeft) / (1000 * 60) % 60)
              const seconds = Math.floor((newTimeLeft / 1000) % 60)
  
              const formattedSeconds = String(seconds).padStart(2, "0")
              const formattedHours = String(hours).padStart(2, "0")
              const formattedMinutes = String(minutes).padStart(2, "0")
  
              const formattedTimeLeft = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
              updatedCountDowns.push({...log, timeLeft: newTimeLeft, formattedTimeLeft})
            }

            // if(formattedTimeLeft === "00:00:00"){
            //   setPendingMealLogs([...pendingMealLogs, {...log, reviewAvailable: true, timeLeft: 0}])
            //   return
            // }

            })
            
            if(readyToReview.length > 0){
              setPendingMealLogs(prevPendingMealLogs => [...prevPendingMealLogs, ...readyToReview])
            }

            return updatedCountDowns
        })
      }
    }, 1000)
    //clear interval
    return () => clearInterval(interval)

  }, [pendingMealLogs])

  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="border bg-red-300 hidden md:block">
        <div className='bg-white py-5 sticky top-32'>
          <p>This is goig to be updates</p>
        </div>
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
                    <HomeMealCard 
                      key={log.logId} {...log} 
                      isOtherUser={false} 
                      ref={index === logs.length - 1 ? lastLogRef: null}
                    />
                  ))
                )
            }
        </div>
        </div>

        <div className="hidden md:flex md:flex-col md:items-end md:gap-8 mt-32 pr-4">
          {
            pendingRequests.length > 0 && (

              <div className='bg-white pt-1 sticky top-[138px] rounded-md shadow-md overflow-hidden w-[230px]'>
                <div className='flex gap-2 items-center px-3'>
                  <FaUserFriends size={20} className='text-slate-800'/>
                  <h1 className='text-lg text-slate-700 font-semibold mb-2 mt-1'>Friend Requests</h1>
                </div>
                {
                  pendingRequests.map(request => (
                    <HomeFriendReqCard key={request.id} name={request.sender.name} surname={request.sender.surname} username={request.sender.username} userId={request.sender.id} requestId={request.id}/>
                  ))
                }
              </div>
            )
          }
          
          <div className="border border-slate-700 rounded-md overflow-hidden shadow-sm w-[230px]">
            <h4 className="px-3 bg-slate-700 text-white py-1 text-lg">Meal Logs To Be Scored</h4>
            <div className="flex flex-col bg-white min-h-[60px]">
              {
                pendingMealLogs.length > 0 ? (
                  pendingMealLogs.map((log, index) => (
                    <div key={log+index} className={`px-3 py-1 ${index === pendingMealLogs.length - 1 ? "" : "border-b border-slate-700"}`}>
                      <a href={`/my-meals/${log.mealId}/log/${log.id}`} className="hover:underline">{log.mealName}</a>
                    </div>
                  ))
                ):(
                  <p className="mx-auto my-auto text-slate-400">No pending meal logs</p>
                )
              }
            </div>
          </div>

          <div className="border border-slate-700 rounded-md overflow-hidden shadow-sm md:w-[230px] ">
            <h4 className="px-3 bg-slate-700 text-white py-1 text-lg">Meal Logs Countdown</h4>
            <div className="flex flex-col bg-white min-h-[60px]">
            {
                mealCountdowns.length > 0 ? (
                  mealCountdowns.map((log, index) => (
                    <div key={log+index} className={`px-3 py-1 flex justify-between ${index === mealCountdowns.length - 1 ? "" : "border-b border-slate-700"}`}>
                      <p href={`/my-meals/${log.mealId}/log/${log.id}`} className="hover:underline">{log.mealName}</p>
                      <p>{log.formattedTimeLeft}</p>
                      <p>A</p>
                    </div>
                  ))
                ):(
                  <p className="mx-auto my-auto text-slate-400">No pending meal logs</p>
                )
              }
            </div>
          </div>
      </div>
    </div>
  )
}

export default Home