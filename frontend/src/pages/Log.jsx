import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useFetcher } from 'react-router-dom'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import Accuracy from "../components/Accuracy"
import { IoMdClose } from "react-icons/io";
import EditLog from '../components/EditLog'
import Error from '../components/Error'

//this component renders all the data linked to a particular meal log
//in order to avoid redundant database queries, the data will only be fetched if it is not in the location object

const Log = () => {
    //get current user
    const user = auth.currentUser
    //get location object
    const logLocation = useLocation()
    //state to store the meal log data
    const [log, setLog] = useState(logLocation.state || {})
    //get username, meal id and log id
    const { username, mealId, logId } = useParams()
    //states to control when loading element and overlay should be displayed
    const [loading, setLoading] = useState(!logLocation.state)
    const [displayOverlay, setDisplayOverlay] = useState(false)
    const [edit, setEdit] = useState(false)
    const [error, setError] = useState("")
    
    //request data from the server only if it was not passed in the location object
    useEffect(() => {
        //method to send a get request to fetch log data    
        const fetchLog = async() => {
            setLog({})
            setLoading(true)
            //get user's id token for authorization in the server
            const token = await user.getIdToken()
            try{
                //send a get request and store data from the request object
                //route will vary based on whose data the system is fetching (current user vs other user)
                const { data } = await axiosInstance.get(username ? `/api/user/${username}/meals/${mealId}/log/${logId}` : `/api/my-meals/${mealId}/log/${logId}`, { 
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                })

                if(data){
                    //format and store the date of the log
                    const displayData = {...data, createdAt: formatDate(data.createdAt)}

                    //update state so the log data is displayed
                    setLog(displayData)
    
                    if(displayData.rating === "PENDING"){
                        setEdit(true)
                    }
                    //hide loading element
                    setLoading(false)
                }
            }catch(err){
                console.error(err)
                if(err.response && err.response.data && err.response.data.error){
                    setError(err.response.data.error)
                } else {
                    setError("Failed to load meal logs. Please try again later.")
                }
            } finally {
                setLoading(false)
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
    <div className='flex flex-col justify-start items-center min-h-screen pb-16 gap-4 bg-slate-200 pt-20'>
        {
            loading ? (
                <div>Loading...</div>
            ) : (
                    error ? (
                        error && (
                            <div className="mt-5">
                                <Error message={error}/>
                            </div>
                        )
                    ) : (
                        <>
                {
                    log.rating !== "PENDING" && (
                        <div className="md:mr-auto md:pl-14">
                            <h1 className="text-3xl font-semibold mb-3">Log Details</h1>
                            <p>Click on <span className="border border-slate-400 px-1 bg-slate-100 rounded-sm">Edit Log</span> to update the log details</p>
                        </div>
                    ) 
                }
                <div className='border flex justify-start mt-8 bg-white w-[85%] md:w-[80%] max-w-[790px] rounded-lg px-8 py-7 shadow-md'>
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
                                        {
                                            !username && (
                                                <button 
                                                    onClick={() => setEdit(true)}
                                                    className='text-sm border border-slate-300 px-2 rounded-sm bg-slate-50 hover:cursor-pointer hover:bg-slate-200 hover:shadow-sm'
                                                >
                                                    Edit Log
                                                </button>
                                            )
                                        }
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
                </>
                    )
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