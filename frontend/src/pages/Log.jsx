import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useFetcher } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import Accuracy from "../components/Accuracy"
import { IoMdClose } from "react-icons/io";
import EditLog from '../components/EditLog'

//this component renders all the data linked to a particular meal log
//in order to avoid redundant database queries, the data will only be fetched if it is not in the location object

const Log = () => {
    //get current user
    const user = auth.currentUser
    //get location object
    const logLocation = useLocation()
    console.log("location", logLocation)
    //state to store the meal log data
    const [log, setLog] = useState(logLocation.state || {})
    //get meal id and log id
    const { mealId, logId } = useParams()

    //states to control when loading element and overlay should be displayed
    const [loading, setLoading] = useState(!logLocation.state)
    const [displayOverlay, setDisplayOverlay] = useState(false)
    const [edit, setEdit] = useState(false)
    
    //request data from the server only if it was not passed in the location object
    useEffect(() => {
        //method to send a get request to fetch log data    
        const fetchLog = async() => {
            //get user's id token for authorization in the server
            const token = await user.getIdToken()
            try{
                console.log("getting data for: ", `/api/my-meals/${mealId}/log/${logId}`)
                //send a get request and store data from the request object
                const { data } = await axiosInstance.get(`/api/my-meals/${mealId}/log/${logId}`, { 
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                })

                //format and store the date of the log
                const displayData = {...data, createdAt: formatDate(data.createdAt)}
                console.log(`log has been fetched: ${displayData}`)
                //update state so the log data is displayed
                setLog(displayData)
                //hide loading element
                setLoading(false)
            }catch(err){
                console.error(err)
            }
        }

        //case location object does not have a state property with log data
        if(!logLocation.state){
            //fetch data from the database
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

    if(edit) {
        return <EditLog mealName={log.mealName || log.meal?.name} restaurantName={log.restaurantName || log.meal?.restaurant?.name} {...log} mealId={mealId} logId={logId} setEdit={setEdit}/>
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
                            <img src={log.picture} alt={log.mealName || log.meal?.name} 
                                onClick={() => setDisplayOverlay(true)}
                                className='w-full h-full object-cover hover:cursor-pointer'
                            />
                        </div>

                        <div className='flex flex-col flex-grow md:ml-14 mt-5 md:mt-0 justify-between'>
                            <div>
                                <div className='flex flex-col items-start mb-5'>
                                    <div className='flex justify-between items-center w-full'>
                                        <h1 className='text-slate-800 md:text-2xl font-semibold'>{log.mealName || log.meal?.name}</h1>
                                        <p 
                                            onClick={() => setEdit(true)}
                                            className='text-sm border border-slate-300 px-2 rounded-sm bg-slate-50 hover:cursor-pointer hover:bg-slate-200 hover:shadow-sm'
                                        >
                                            Edit Log
                                        </p>
                                    </div>
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
            <div className='flex justify-center items-center h-full bg-black/80 fixed z-50 inset-0'>
                <div className='w-[80%] md:w-[60%] lg:w-[50%] max-w-[500px] relative'>
                    <img src={log.picture} alt="" className='rounded-lg'/>
                    <button
                        onClick={() => setDisplayOverlay(false)} 
                        className='bg-slate-400 px-1 py-1 hover:bg-slate-500 rounded-full absolute z-60 top-[-14px] right-[-10px]  text-2xl'
                    >
                        <IoMdClose />
                    </button>
                </div>
            </div>
        )
        }
    </>
  )
}

export default Log