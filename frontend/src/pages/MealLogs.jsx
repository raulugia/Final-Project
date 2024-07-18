import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import { useParams } from 'react-router-dom'
import { MdKeyboardArrowRight } from "react-icons/md";
import MealLogCard from '../components/MealLogCard';

const MealLogs = () => {
    const user = auth.currentUser
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const { mealId }= useParams()

    useEffect(() => {
        (
            async() => {
                try{
                    const token = await user.getIdToken()

                    const { data } = await axiosInstance.get(`/api/meals/${mealId}`, { 
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    //format the date of every log
                    const displayData = data.map(log => ({...log, createdAt: formatDate(log.createdAt)}))
                    console.log(displayData)
                    setLogs(displayData)
                    setLoading(false)
                } catch(err) {
                    console.error(err)
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
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            {   
                loading ? (
                    <div>Skeleton here</div>
                ) : (
                    logs.map(log => (
                        <MealLogCard key={log.id} {...log}/>
                    ))
                )   
            }
        </div>
    </div>
  )
}

export default MealLogs