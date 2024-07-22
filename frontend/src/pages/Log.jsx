import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import Accuracy from "../components/Accuracy"

const Log = () => {
    const user = auth.currentUser
    const [log, setLog] = useState("")
    const { mealId, logId } = useParams()
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        (
            async() => {
                const token = await user.getIdToken()

                try{
                    const { data } = await axiosInstance.get(`/api/my-meals/${mealId}/log/${logId}`, { 
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        }
                    })

                    const displayData = {...data, createdAt: formatDate(data.createdAt)}
                    console.log(data)
                    setLog(displayData)
                    setLoading(false)
                }catch(err){
                    console.error(err)
                }
            }
        )()
    },[])

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
        return `on ${day}/${month}/${year} at ${hours}:${minutes}`
    }

  return (
    <div className='flex justify-center items-start min-h-screen pb-16 gap-4 bg-slate-200 pt-20'>
        {
            loading ? (
                <div>Loading...</div>
            ) : (
                <div className='border flex justify-start mt-8 bg-white md:w-[75%] max-w-[790px] rounded-lg px-8 py-7'>
                    <div className='flex flex-row w-full'>
                    <div className='w-[50%] max-w-[280px] overflow-hidden rounded-md'>
                        <img src={log.picture} alt="" className='w-full h-full object-cover'/>
                    </div>
                    <div className='flex flex-col flex-grow ml-14 justify-between'>
                        <div>
                            <div className='flex flex-col items-start mb-5'>
                                <h1 className='text-slate-800 md:text-2xl font-semibold'>{log.meal.name}</h1>
                                <h3 className='text-slate-600 md:text-md'>{log.meal.restaurant.name}</h3>
                            </div>
                            <div className='flex flex-col items-start'>
                                <p className='text-slate-700 font-semibold md:text-lg'>Carb estimate: <span className="font-normal">{log.carbEstimate}g</span></p>
                                <Accuracy accuracy={log.rating}/>
                                {
                                    log.description && (
                                        <div className='mt-5'>
                                            <p className='text-slate-700 font-semibold md:text-lg'>Additional Information</p>
                                            <p>{log.description}</p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className='ml-auto'>
                            <p className='text-sm text-slate-500'>Created {log.createdAt}</p>
                        </div>
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default Log