import React, { useState, useEffect } from 'react'

const EditLog = ({mealName, restaurantName, rating, description, id, carbEstimate, picture, createdAt}) => {
    const [logData, setLogData] = useState({mealName, restaurantName, rating, description, carbEstimate, picture, createdAt})
  return (
    <div className='flex justify-center items-start min-h-screen pb-16 gap-4 bg-slate-200 pt-20'>
    <div className='border flex justify-start bg-white w-[85%] md:w-[75%] max-w-[790px] rounded-lg px-8 py-7 shadow-md'>
        <form className='flex md:flex-row flex-col w-full'>

            <div className='md:w-[50%] max-w-[280px] overflow-hidden rounded-md mx-auto md:mx-0'>
                <img src={picture} alt={mealName} 
                    className='w-full h-full object-cover hover:cursor-pointer'
                />
            </div>

            <div className='flex flex-col flex-grow md:ml-14 mt-5 md:mt-0 justify-between'>
                <div>
                    <div className='flex flex-col items-start mb-5'>
                        <input type='text' className='text-slate-800 md:text-2xl font-semibold' value={logData.mealName}></input>
                        <input type='text' className='text-slate-600 md:text-md' value={logData.restaurantName}></input>
                    </div>
                    <div className='flex flex-col items-start'>
                        <p className='text-slate-700 font-semibold md:text-lg'>Carb estimate: </p>
                        <input type='text' className="font-normal" value={logData.carbEstimate}></input>
                        {/* <Accuracy accuracy={log.rating}/> */}
                        <p className='text-slate-700 font-semibold md:text-lg'>Additional Information</p>
                        <textarea
                            name="description"
                            id="description"
                            rows="4"
                            cols="30"
                            value={logData.description}
                            // onChange={handleChange}
                            className="border py-2 px-3 rounded-md"
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