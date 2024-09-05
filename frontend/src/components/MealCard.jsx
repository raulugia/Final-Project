import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom';

const MealCard = ({id, mealName, restaurantName, thumbnailUrl, username}) => {
  return (
    <Link 
      to={`${username ? `/user/${username}/meals/${id}` : `/my-meals/${id}`}`} 
      className='shadow-md bg-slate-50 text-slate-900 w-[88%] md:w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between rounded-lg'
    >
        <div className='flex gap-3 md:gap-10 justify-start items-center w-full'>
            <div className='min-h-24 h-24 w-24 min-w-24 rounded-md overflow-hidden border'>
                <img src={thumbnailUrl} alt={mealName} className='h-full w-full object-cover'/>
            </div>
            <div className='flex flex-col justify-center gap-2'>
                <p className='text-md md:text-lg font-semibold leading-[18px]'>{mealName}</p>
                {
                  restaurantName&&(
                    <p className='text-sm md:text-md text-gray-400 leading-[18px]'>{restaurantName}</p>
                  )
                }
            </div>
        </div>
        <div className='flex items-center'>
          <MdKeyboardArrowRight size={40} />
        </div>
    </Link>
  )
}

export default MealCard