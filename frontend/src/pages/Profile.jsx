import React, { useEffect, useState, useRef } from 'react'
import {auth} from '../../utils/firebase'
import CommonRestaurantCard from '../components/CommonRestaurantCard'
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom'
import HomeMealCard from '../components/HomeMealCard';
import ProfileCard from '../components/ProfileCard';
import NotFriendsProfile from '../components/NotFriendsProfile';
import SkeletonProfile from '../components/SkeletonProfile';
import Error from '../components/Error'

//All the code in this file was written without assistance 

const Profile = () => {
  //get current user
  const user = auth.currentUser
  //state to store other user's data
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
  //state to detect if there are any logs left to fetch
  //since the system fetches 5 logs every time te infinite scrolling logic is triggered,
  //if the length of the returned logs is < 5, there are no more logs to fetch
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  //ref to keep the intersection observer instance
  const observer = useRef()
  //ref to keep a reference to the last HomeMealCard
  const lastLogRef = useRef()
  //flag to render a different component if users are not friends
  const [displayPartialProfile, setDisplayPartialProfile] = useState(false)
  //extract the username
  const { username } = useParams()
  //state to store an error message
  const [error, setError] = useState("")


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

//fetch other user's data
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

        //case there is an error
        if(data.error) {
          //case users are not friends
          if(data.error === "Users are not friends"){
            //store other user's data and display a limited profile view component
            setOtherUser({name: data.name, surname: data.surname, otherUserUid: data.otherUserUid, requestStatus: data.requestStatus, requestId: data.requestId, profilePicUrl: data.profilePicUrl})
            setDisplayPartialProfile(true)
          }
        }

        //only update states if ignore is false
        if(!ignore){
          setOtherUser({name: data.user.name, surname: data.user.surname, username: data.user.username, profilePicUrl: data.user.profilePicUrl})
          //format date of every log
          const displayData = data.logs.map(log => ({...log, createdAt: formatDate(log.createdAt)}))

          //update logs state with formatted logs
          setLogs(prevLogs => [...prevLogs, ...displayData])
          setRestaurantsInCommon([...data.commonRestaurants])

          //update state if there are no more logs left to fetch
          if(data.logs.length < 5) {
            setHasMoreLogs(false)
          }

          //hide loading component
          setLoading(false)
        }
      } catch(err) {
          //update state to display an error message
          if(err.response && err.response.data && err.response.data.error){
              setError(err.response.data.error)
          } else {
              setError("Failed to load profile. Please try again later.")
          }
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

  return (
    <>
      {
        //case loading is true
        loading ? (
          
          <SkeletonProfile />
        //case users are not friends  
        ) :  displayPartialProfile ? (
            <NotFriendsProfile {...otherUser}/>
        //case users are friends - render profile  
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
            <div className="md:flex md:flex-col border hidden">
              {
                otherUser && !error && (
                  <ProfileCard {...otherUser} />
                )
              }
            </div>

              <div className='flex flex-col gap-4 px-5 mt-20'>
                {
                  !error && (
                    <h1 className='text-2xl font-bold text-sky-900 mb-2'>Recent Logs</h1>
                  )
                }
                <div className='flex flex-col gap-5'>
                  { 
                    logs.length > 0 ? (

                      logs.map((log, index) => (
                        //ref will be assigned when the last HomeMealCard is rendered
                        <HomeMealCard 
                          key={log.logId} mealName={log.meal.name} 
                          isOtherUser={true} user={otherUser} logId={log.id}
                          restaurantName={log.meal.restaurant.name} {...log} 
                          ref={index === logs.length - 1 ? lastLogRef: null}
                        />
                      ))
                    ) : (
                      error ? (
                        <div className="mx-8 mt-5">
                          <Error message={error} />
                        </div>
                      ) : (
                        <div className='flex justify-center items-center bg-white rounded-lg h-[445px] shadow-md'>
                          <p className='text-lg text-slate-700'>{otherUser.name} has not logged any meals yet</p>
                        </div>
                      )
                    ) 
                  }
              </div>
              </div>

              <div className="hidden md:flex md:flex-col md:items-end">
                <div className='bg-white sticky top-[138px] rounded-md shadow-md overflow-hidden border w-[280px] border-sky-700'>
                  <div className='flex gap-2 items-center px-3 bg-sky-900 text-white'>
                    <h1 className='text-lg font-semibold mb-2 mt-1'>Restaurants in common</h1>
                  </div>
                    {
                      restaurantsInCommon.map(restaurant => (
                        <CommonRestaurantCard key={restaurant.id} {...restaurant} />
                      ))
                    }
                    {
                      restaurantsInCommon.length === 0 && (
                        <div className="px-3 py-3 bg-white text-sky-900">
                          <p>No restaurants in common</p>  
                        </div>
                      )
                    }
                </div>
            </div>
          </div>
        )
      }
    </>
  )
}

export default Profile