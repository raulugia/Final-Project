import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import { useParams } from 'react-router-dom'

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
                    console.log(data)
                    setLogs(data)
                    setLoading(false)
                } catch(err) {
                    console.error(err)
                }
            }
        )()
    }, [])

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            {   
                loading ? (
                    <div>Skeleton here</div>
                ) : (

                    <div>Logs here</div>
                )
            }
        </div>
    </div>
  )
}

export default MealLogs