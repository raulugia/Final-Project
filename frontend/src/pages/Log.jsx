import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useFetcher } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import Accuracy from "../components/Accuracy"

const Log = () => {
    const user = auth.currentUser
    const logLocation = useLocation()
    const [log, setLog] = useState(logLocation.state || {})
    const { mealId, logId } = useParams()
    const [loading, setLoading] = useState(!logLocation.state)
    const [displayOverlay, setDisplayOverlay] = useState(true)
    
    useEffect(() => {
        //    
        const fetchLog = async() => {
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

        //
        if(!logLocation.state){
            console.log("no location")
            fetchLog()
        }

    },[logLocation])

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
    <>
    <div className='flex justify-center items-start min-h-screen pb-16 gap-4 bg-slate-200 pt-20'>
        {
            loading ? (
                <div>Loading...</div>
            ) : (
                <div className='border flex justify-start mt-8 bg-white w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-8 py-7 shadow-md'>
                    <div className='flex md:flex-row flex-col w-full'>

                        <div className='md:w-[50%] max-w-[280px] overflow-hidden rounded-md mx-auto md:mx-0'>
                            <img src={log.picture} alt="" className='w-full h-full object-cover'/>
                        </div>

                        <div className='flex flex-col flex-grow md:ml-14 mt-5 md:mt-0 justify-between'>
                            <div>
                                <div className='flex flex-col items-start mb-5'>
                                    <h1 className='text-slate-800 md:text-2xl font-semibold'>{log.mealName || log.meal?.name}</h1>
                                    <h3 className='text-slate-600 md:text-md'>{log.restaurantName || log.meal?.restaurant?.name}</h3>
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
                            <div className='ml-auto mt-8 md:mt-0'>
                                <p className='text-sm text-slate-500'>Created {log.createdAt}</p>
                            </div>
                        </div>

                    </div>

                </div>
            )
        }
    </div>
    {
        displayOverlay && (
            <div className='flex justify-center items-center h-full bg-black/80 absolute z-100 inset-0'>
                <div className='w-[50%] rounded-lg overflow-hidden relative'>
                    <img src={log.picture} alt="" />
                    <button className='bg-blue-300 px-2 rounded-full absolute'>X</button>
                </div>
            </div>
        )
        }
    </>
  )
}

export default Log