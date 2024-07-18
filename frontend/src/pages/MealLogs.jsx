import React, {useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'

const MealLogs = () => {
  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Meals</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            {   
                loading ? (
                    <SkeletonMealCard />
                ) : (

                    filteredMeals.map(item => (
                        <MealCard key={item.meal.id} id={item.id} mealName={item.meal.name} restaurantName={item.meal.restaurant.name} thumbnailUrl={item.thumbnail}/>
                    ))
                )
            }
        </div>
    </div>
  )
}

export default MealLogs