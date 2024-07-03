import React from 'react'

const SearchResultCard = ({ mealName, restaurantName, carbs, accuracy, date, totalLogs }) => {
  return (
    <div className="border border-black w-[50%] mx-auto py-4 px-4 flex gap-10 rounded-lg">
        <div className="w-[30%]">
            <img src="https://res.cloudinary.com/doqhgaraq/image/upload/v1720009719/co2sroorgnuznhwjf2ju.jpg" alt=""  className='rounded-md'/>
        </div>
        <div className='flex flex-col justify-between'>
            <div className='flex flex-col justify-start items-start'>
                <p className='text-xl font-semibold'>{mealName}</p>
                <p className='text-sm'>{restaurantName}</p>
            </div>
            <div className='flex flex-col justify-start items-start'>
                <p className='text-md'>Carb estimation: {carbs}g</p>
                <p className='border rounded-sm px-1 text-sm'>{accuracy}</p>
            </div>
            <div className='flex flex-col justify-start items-start'>
                <p className='mt-2 text-xs'>Last log: {date}</p>
                <p className='text-xs'>Number of logs: {totalLogs}</p>
            </div>
        </div>
    </div>
  )
}

export default SearchResultCard