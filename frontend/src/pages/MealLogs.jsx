import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import { useParams } from 'react-router-dom'
import MealLogCard from '../components/MealLogCard';
import SkeletonMealLogCard from '../components/SkeletonMealLogCard';
import Error from '../components/Error';

//All the code in this file was written without assistance 

const MealLogs = () => {
    //get current user
    const user = auth.currentUser
    //state to store meal logs
    const [logs, setLogs] = useState([])
    //state to show/hide loading skeleton
    const [loading, setLoading] = useState(true)
    //get params from url
    const { username, mealId }= useParams()
    //state to show errors
    const [error, setError] = useState("")

    //fetch logs linked to a meal
    useEffect(() => {
        (
            async() => {
                try{
                    setError("")
                    //get token for backend authentication
                    const token = await user.getIdToken()
                    //send a get request to get logs
                    const { data } = await axiosInstance.get(username ? `/api/user/${username}/meals/${mealId}` : `/api/meals/${mealId}`, { 
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    //format the date of every log
                    const displayData = data.map(log => ({...log, createdAt: formatDate(log.createdAt)}))
                    
                    //update states
                    setLogs(displayData)
                    setLoading(false)
                } catch(err) {
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to load meal logs. Please try again later.")
                    }
                } finally {
                    setLoading(false)
                }
            }
        )()
    }, [])

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
        return `on ${day}/${month}/${year} at ${hours}:${minutes}`
    }

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        {
            loading ? (
                <div className='flex flex-col gap-4'>
                    <div className="flex flex-col mt-20 animate-pulse-fast bg-slate-800 ml-[5%]  h-6 w-44"></div>
                    <div className="flex flex-col animate-pulse-fast bg-slate-600 ml-[5%]  h-5 w-36"></div>
                </div>
            ) : (
                <div className='mt-20'>
                    <h1 className='text-2xl font-semibold  ml-[5%] text-slate-800'>
                        { error ? "No Logs Found" : `Logs for ${logs[0]?.meal.name}`}
                    </h1>
                    <h3 className='text-lg font-semibold ml-[5%] text-slate-600'>{logs[0]?.meal.restaurant.name}</h3>
                </div>
            )
        }
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] md:min-h-[180px] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            {   
                loading ? (
                    <SkeletonMealLogCard />
                ) : (
                    logs.map(log => (
                        <MealLogCard key={log.id} {...log} mealName={log.meal.name} restaurantName={log.meal.restaurant.name} username={ username}/>
                    ))
                )   
            }
            {
                error && (
                    <div className="px-10 my-auto">
                        <Error message={error} />
                    </div>
                )
            }
        </div>
    </div>
  )
}

export default MealLogs