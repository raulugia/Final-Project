import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom';
import Accuracy from './Accuracy';

//All the code in this file was written without assistance 

//UI component 

const MealLogCard = ({mealId, id, thumbnail, rating, createdAt, carbEstimate, description, picture, mealName, restaurantName, username}) => {
  return (
    <Link 
        to={username ? `/user/${username}/meals/${mealId}/log/${id}` : `/my-meals/${mealId}/log/${id}`}
        state={{thumbnail, rating, createdAt, carbEstimate, description, picture, mealName, restaurantName, id}} 
        className='shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'
    >
        <div className='flex gap-5 md:gap-8 justify-start  items-center'>
            <div className='min-h-24 h-24 w-24 min-w-24 rounded-md overflow-hidden border'>
                <img src={thumbnail} alt="" className='h-full w-full object-cover'/>
            </div>
            <div className='flex flex-col mt-3 gap-2 justify-start items-start'>
                <p className='text-md md:text-md font-semibold leading-[18px]'>Carb estimation: <span className='font-normal'>{carbEstimate}g</span></p>
                <Accuracy accuracy={rating}/>
                <p className='text-sm md:text-md text-gray-400 leading-[18px]'>Created {createdAt}</p>
            </div>
        </div>
        <div>
            <MdKeyboardArrowRight size={40} />
        </div>
    </Link>
  )
}

export default MealLogCard