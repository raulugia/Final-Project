import React from 'react'
import Accuracy from './Accuracy'

const HomeMealCard = ({mealName, restaurantName, logId, mealId, createdAt, rating, picture}) => {
  return (
    <div className='py-4 px-5 rounded-md border shadow-sm max-w-[456px] bg-slate-200'>
        <div className='min-w-full max-w-[415px] min-h-[300px] border'>
            <img className='w-full' src={picture} alt={mealName} />
        </div>
        
        <div>
            <div className='flex justify-between items-center mt-2'>
            <div className='leading-[18px]'>
                <p className='text-md md:text-lg font-semibold'>{mealName}</p>
                <p className='text-sm md:text-md text-gray-400'>{restaurantName}</p>
            </div>
            <div>
                {
                    rating === "ACCURATE" || rating === "INACCURATE" || rating === "SLIGHTLY_INACCURATE" ? (
                        <Accuracy accuracy={rating}/>
                    ) : rating === "waiting" ? (
                        <div>Not available yet</div>
                    ) : (
                        <div>Rate your meal</div>
                    )
                }
            </div>
            </div>
        </div>

        <div className='flex justify-end'>
            <p className='text-sm text-gray-400'>Created at on</p>
        </div>

        </div>
  )
}

export default HomeMealCard