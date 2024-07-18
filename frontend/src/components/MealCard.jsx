import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom';

const MealCard = ({id, mealName, restaurantName, thumbnailUrl}) => {
  return (
    <Link to={`/my-meals/${id}`} className='shadow-md bg-slate-50 text-slate-800 w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
        <div className='flex gap-10 justify-start'>
            <div className='border h-24 w-24 rounded-md overflow-hidden'>
                <img src={thumbnailUrl} alt="" className='h-full'/>
            </div>
            <div className='flex flex-col mt-3'>
                <p className='text-lg font-semibold'>{mealName}</p>
                <p className='text-md text-gray-400'>{restaurantName}</p>
            </div>
        </div>
        <MdKeyboardArrowRight size={40} />
    </Link>
  )
}

export default MealCard