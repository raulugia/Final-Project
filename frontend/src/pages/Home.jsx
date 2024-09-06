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

//All the code in this file was written without assistance 

const Home = () => {
  //get current user
  const user = auth.currentUser
  //state used to hold the logs returned by the server
  const [logs, setLogs] = useState([])
  const [userData, setUserData] = useState({})
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
  //state to needed to fetch the image of the meal log that is still being processed by tasks
  const [pendingPic, setPendingPic] = useState({logId: "", mealId: "", url: ""})
  
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
          const displayData = data.logs.map(log => {
            //case the image is not ready
            if(!log.picture){
              //update state with the log details so the image can be fetched - Polling mechanism
              setPendingPic({logId: log.logId, mealId: log.mealId, url: ""})
            }

            return {...log, createdAt: formatDate(log.createdAt)}
          })
          //update logs state with formatted logs
          setLogs(prevLogs => [...prevLogs, ...displayData])
          setUserData(data.user)
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

  //polling mechanism to get the image of a log being processed by tasks
  useEffect(() => {
    //case image is being processed
    if(!pendingPic.url && pendingPic.logId && pendingPic.mealId){

      const intervalId = setInterval(async() =>{
        console.log("Inside interval")
        try{
          //get the id token
          const token = await user.getIdToken();

          //fetch first 5 meal logs - page is needed to calculate the offset in the server
          const { data } = await axiosInstance.get(`/api/my-meals/${pendingPic.mealId}/log/${pendingPic.logId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }

            })

          if(data.picture && !pendingPic.url){
            setPendingPic(prevPendingPic => ({...prevPendingPic, url: data.picture}))

            setLogs(prevLogs => prevLogs.map(log => {
              if(log.logId === pendingPic.logId) {
                return {...log, picture: data.picture}
              }

              return log
            }))

            setPendingPic({logId: "", mealId: "", url: ""})
          }
        }catch(err){
          alert(err.message)
        }
      }, 5000)

      return () => clearInterval(intervalId)
    }
  },[pendingPic])

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
      //store logs that are ready to be reviewed
      const readyToReview = logs.filter(log => log.reviewAvailable)
      //store logs that are not ready to be reviewed
      const notReadyToReview = logs.filter(log => !log.reviewAvailable)
      
      //case there are logs ready to be reviewed - update state
      if (readyToReview.length > 0) setPendingMealLogs(readyToReview)
        //case there are logs not ready to be reviewed - update state
      if (notReadyToReview.length > 0) setMealCountdowns(notReadyToReview)
    })

    return () => {
      socket.off("pendingMealLogs")
    }

  },[])

  //update countdowns every second
  useEffect(() => {
    if(mealCountdowns.length > 0){
      const interval = setInterval(() =>{
        if(mealCountdowns.length > 0){
          //update countdown every second
          setMealCountdowns(prevMealCountdowns => {
            //array of logs that are ready to be reviewed
            const updatedCountDowns = []
            //array of logs that are not ready to be reviewed
            const readyToReview = []

            //iterate over the meals that are not ready to be reviewed
            prevMealCountdowns.forEach((log )=> {
              //reduce the time left by 1 second
              const newTimeLeft = log.timeLeft - 1000

              //case countdown has reached 00:00:00 and is ready to be reviewed
              if(newTimeLeft <= 0){
                //add log to the array of logs ready to be reviewed
                readyToReview.push({...log, reviewAvailable: true, timeLeft: 0})
              
              //case log is not ready to be reviewed
              }else{
                //get formatted time left
                const formattedTimeLeft = formatTime(newTimeLeft)
                //add log to the array of logs that are not ready to be reviewed
                updatedCountDowns.push({...log, timeLeft: newTimeLeft, formattedTimeLeft})
              }

            })
            
            //case a log was added to the array of logs ready to be reviewed
            if(readyToReview.length > 0){
              //update state containing logs that are ready to be reviewed - trigger rerender
              setPendingMealLogs(prevPendingMealLogs => [...prevPendingMealLogs, ...readyToReview])
            }

            //return the log with the updated countdown
            return updatedCountDowns
          })
        }
      }, 1000)
      
    //clear interval
    return () => clearInterval(interval)
  }

  }, [mealCountdowns])

  //method to format the time left for a log to be reviewed
  const formatTime = (newTimeLeft) => {
    //format time to hh:mm:ss
    const hours = Math.floor((newTimeLeft) / (1000 * 60 * 60) % 24)
    const minutes = Math.floor((newTimeLeft) / (1000 * 60) % 60)
    const seconds = Math.floor((newTimeLeft / 1000) % 60)

    //ensure hours, minutes and seconds have 2 digits
    const formattedSeconds = String(seconds).padStart(2, "0")
    const formattedHours = String(hours).padStart(2, "0")
    const formattedMinutes = String(minutes).padStart(2, "0")

    //construct the time left string
    const formattedTimeLeft = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`

    //return formatted time left
    return formattedTimeLeft
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      {/* //Left */}
      <div className="border hidden md:block mt-[100px] pl-4">

        <div className='bg-white py-5 sticky top-56 w-[270px] h-[160px] rounded-lg shadow-md z-20 '>
          
          <div className="rounded-full w-[160px] h-[160px] absolute z-21 inset-0 top-[-100px] overflow-hidden mx-auto shadow-md outline outline-1 outline-slate-300">
            <img src={userData.profileThumbnailUrl} alt="" />
          </div>
          <div className="px-6 mt-14 w-full relative">
            {
              !loading &&(
                <div className="flex flex-col items-center">
                  <h4 className="text-2xl font-semibold mx-auto">{userData.name} {userData.surname}</h4>
                  <p>@{userData.username}</p>
                </div>
              )
            }
          </div>
        </div>

      </div>

      {/* Middle */}
      <div className='flex flex-col gap-4 px-5 mt-20'>
        <h1 className='text-2xl font-bold text-sky-900 mb-2'>Your Recent Logs</h1>
        <div className='flex flex-col gap-6'>
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
          {/* Right */}
      <div className="mt-[135px] pr-4 md:flex md:justify-end">
        <div className="hidden md:flex md:flex-col md:items-end md:gap-8  md:fixed">
          {
            pendingRequests.length > 0 && (

              <div className='bg-white border border-sky-700 sticky top-[138px] rounded-md shadow-md overflow-hidden w-[260px]'>
                <div className='flex gap-2 items-center px-3 bg-sky-900 text-white'>
                  <FaUserFriends size={20} className='text-white'/>
                  <h1 className='text-lg font-semibold mb-2 mt-1'>Friend Requests</h1>
                </div>
                {
                  pendingRequests.map(request => (
                    <HomeFriendReqCard key={request.id} name={request.sender.name} surname={request.sender.surname} username={request.sender.username} userId={request.sender.id} requestId={request.id} profile_pic={request.sender.profileThumbnailUrl}/>
                  ))
                }
              </div>
            )
          }
          
          <div className="border border-sky-700 rounded-md overflow-hidden shadow-sm w-[260px]">
              <h4 className="px-3 bg-sky-900 text-white py-1 text-lg">Meal Logs To Be Scored</h4>
              <div className="flex flex-col bg-white min-h-[60px] justify-center">
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

          <div className="border border-sky-700 rounded-md overflow-hidden shadow-sm md:w-[260px]">
            <h4 className="px-3 bg-sky-900 text-white py-1 text-lg">Meal Logs Countdown</h4>
            <div className="flex flex-col bg-white min-h-[60px]">
            {
                mealCountdowns.length > 0 ? (
                  mealCountdowns.map((log, index) => (
                    <div key={log+index} className={`px-3 py-1 flex justify-between ${index === mealCountdowns.length - 1 ? "" : "border-b border-slate-700"}`}>
                      <p href={`/my-meals/${log.mealId}/log/${log.id}`} className="hover:underline">{log.mealName}</p>
                      <p>{log.formattedTimeLeft}</p>
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
    </div>
  )
}

export default Home