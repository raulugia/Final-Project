import React, { useState, useEffect, useRef } from 'react'
import { MdErrorOutline } from "react-icons/md";

const EditLog = ({mealName, restaurantName, rating, description, id, carbEstimate, picture, createdAt}) => {
    const [logData, setLogData] = useState({mealName, restaurantName, rating, description, carbEstimate, picture, createdAt})
    const [error, setError] = useState()
    const inputRef = useRef(null)

    const handleInputChange = (e, key) => {
        if(key === "carbEstimate" && !Number(e.target.value)){
            setError("Carb estimate must be a number")
            return
        }

        setLogData({...logData, [key]: e.target.value})
        setError()
    }

    //focus the first input when the component renders
    useEffect(() => {
        inputRef.current.focus()
    }, [])

  return (
    <div className='flex flex-col items-center min-h-screen pb-16 bg-slate-200 pt-20'>
        {
            error &&(
                <div className='border border-red-300 flex justify-start items-center gap-1 w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-4 py-1 shadow-sm mt-8 bg-red-200'>
                    <MdErrorOutline size={20} className='text-red-900'/><p className='text-red-900'>Carb estimate must be a number</p>
                </div>
            )
        }
    <div className='border flex justify-start bg-white w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-8 py-7 shadow-md mt-3'>
        <form className='flex md:flex-row flex-col w-full'>

            <div className='md:w-[50%] max-w-[280px] max-h-[280px] overflow-hidden rounded-md mx-auto md:mx-0'>
                <img src={picture} alt={mealName} 
                    className='w-full h-full object-cover hover:cursor-pointer'
                />
            </div>

            <div className='flex flex-col flex-grow md:ml-14 mt-5 md:mt-0 justify-between'>
                <div>
                    <div className='flex flex-col items-start mb-5 gap-2'>
                        <input 
                            type='text' 
                            className='text-slate-800 md:text-2xl font-semibold bg-slate-100 rounded-sm px-3 border' 
                            value={logData.mealName}
                            onChange={(e) => handleInputChange(e, "mealName")}
                            ref={inputRef}
                        >
                        </input>
                        <input 
                            type='text' 
                            className='text-slate-600 md:text-md bg-slate-100 rounded-sm px-3 border' 
                            value={logData.restaurantName}
                            onChange={(e) => handleInputChange(e, "restaurantName")}
                        >
                        </input>
                    </div>
                    <div className='flex flex-col items-start justify-start'>
                        <p className='text-slate-700 font-semibold md:text-lg'>Carb estimate: 
                            <input 
                                type='text' 
                                className="font-normal border max-w-[50px] px-2 bg-slate-100 rounded-sm border mx-2" 
                                value={logData.carbEstimate}
                                onChange={(e) => handleInputChange(e, "carbEstimate")}
                            >
                            </input>
                            <span className='font-normal'>g</span>
                        </p>
                        
                        {/* <Accuracy accuracy={log.rating}/> */}
                        <p className='text-slate-700 font-semibold md:text-lg mt-4 mb-1'>Additional Information</p>
                        <textarea
                            name="description"
                            id="description"
                            rows="4"
                            cols="40"
                            value={logData.description}
                            onChange={(e) => handleInputChange(e, "description")}
                            className="border py-2 px-3 rounded-md text-sm mb-5 leading-[16px]"
                        ></textarea>
                    </div>
                </div>
                <div className='ml-auto mt-8 md:mt-0'>
                    <p className='text-sm text-slate-500'>Created {createdAt}</p>
                </div>
            </div>

        </form>

    </div>
    </div>
  )
}

export default EditLog