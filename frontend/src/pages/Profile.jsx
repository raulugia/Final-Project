import React, { useEffect, useState, useRef } from 'react'
import {auth} from '../../utils/firebase'
import CommonRestaurantCard from '../components/CommonRestaurantCard'
import axiosInstance from '../../utils/axiosInstance';
import { useParams, Link } from 'react-router-dom'
import HomeMealCard from '../components/HomeMealCard';

const Profile = () => {
  const user = auth.currentUser
  const [otherUser, setOtherUser] = useState({})
  //state used to hold the logs returned by the server
  const [logs, setLogs] = useState([])
  //state to hold the restaurants in common between current user and user
  const [restaurantsInCommon, setRestaurantsInCommon] = useState([])
  //state used to display Loading component when data is being fetched
  const [loading, setLoading] = useState(true)
  //state needed to trigger data fetching (useEffect dependency)
  //this state will be increase by 1 each time the last HomeMealCard intersects with the viewport (infinite scrolling) 
  const [page, setPage] = useState(1)
  //
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  //ref to keep the intersection observer instance
  const observer = useRef()
  //ref to keep a reference to the last HomeMealCard
  const lastLogRef = useRef()
  //
  const { username } = useParams()

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
        const { data } = await axiosInstance.get(`/api/user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 5
          }
        })
        console.log("DATA", data)
        //only update states if ignore is false
        if(!ignore){
          setOtherUser({name: data.user.name, surname: data.user.surname, username: data.user.username, profilePicUrl: data.user.profilePicUrl})
          //format date of every log
          const displayData = data.logs.map(log => ({...log, createdAt: formatDate(log.createdAt)}))

          //update logs state with formatted logs
          setLogs(prevLogs => [...prevLogs, ...displayData])
          setRestaurantsInCommon([...data.commonRestaurants])
          //hide loading component
          setLoading(false)

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
      //case last HomeMealCard is intersecting with the viewport
      if(entries[0].isIntersecting && hasMoreLogs) {
        //update state
        setPage(prevPage => prevPage + 1)
      }
    })

    //make the observer watch the last HomeMealCard, referenced by lastLogRef
    if(lastLogRef.current) observer.current.observe(lastLogRef.current)
  }, [loading, hasMoreLogs])

  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="md:flex md:flex-col border hidden">

        <div className='flex flex-col bg-white py-5 sticky px-5 top-[138px] rounded-lg'>
          <div className='flex gap-10 items-center'>
          <div className='bg-slate-700 w-24 h-24 rounded-full'>
          </div>
          <div>
            <p className='text-2xl text-slate-700 font-semibold'>{otherUser.name} {otherUser.surname}</p>
            <p className='text-slate-400'>@{otherUser.username}</p>
          </div>
          </div>

          <div className='flex flex-col gap-3 mt-16 text-xl'>
            <div>
              <Link>Meals</Link>
            </div>
            <div>
              <Link>Restaurants</Link>
            </div>
            <div>
              <Link>Friends</Link>
            </div>
          </div>

          <div className='mt-16 w-full'>
              <div className='w-full flex justify-center items-center border rounded-md bg-blue-600 py-1'>
                <p className='text-xl text-white font-semibold'>Message</p>
              </div>
          </div>
        </div>

      </div>

        <div className='flex flex-col gap-4 px-5 mt-20'>
          <h1 className='text-2xl font-bold text-slate-700 mb-2'>Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            {   
                loading ? (
                  <div>Loading...</div>
                ) : (
                  logs.map((log, index) => (
                    //ref will be assigned when the last HomeMealCard is rendered
                    <HomeMealCard key={log.logId} {...log} ref={index === logs.length - 1 ? lastLogRef: null}/>
                  ))
                )
            }
        </div>
        </div>

        <div className="hidden md:block">
          {
            restaurantsInCommon.length > 0 && (

              <div className='bg-white pt-1 sticky top-[138px] rounded-md shadow-md overflow-hidden'>
                <div className='flex gap-2 items-center px-3'>
                  <h1 className='text-lg text-slate-700 font-semibold mb-2 mt-1'>Restaurants in common</h1>
                </div>
                {
                  restaurantsInCommon.map(restaurant => (
                    <CommonRestaurantCard key={restaurant.id} {...restaurant} />
                  ))
                }
              </div>
            )
          }
      </div>
    </div>
  )
}

export default Profile